import hashlib
import json
import time
import os
from flask import Flask, jsonify, request


class Blockchain:
    def __init__(self, num_files=5):
        self.chain = []
        self.current_transactions = []
        self.num_files = num_files
        self.files = [f"blockchain_{i+1}.json" for i in range(num_files)]

        # Ensure files exist
        for f in self.files:
            if not os.path.exists(f):
                with open(f, "w") as file:
                    json.dump([], file)

        # Load existing data from files
        all_blocks = self.load_all_chains()
        if all_blocks:
            self.chain = sorted(all_blocks, key=lambda x: x["index"])
        else:
            # If no blocks anywhere, create genesis block
            print("🟢 Creating genesis block...")
            self.new_block(previous_hash="0")

    def new_block(self, previous_hash=None):
        block = {
            "index": len(self.chain),
            "timestamp": time.time(),
            "transactions": self.current_transactions,
            "previous_hash": previous_hash or (self.hash(self.chain[-1]) if self.chain else "0"),
        }
        block["hash"] = self.hash(block)

        self.chain.append(block)
        self.current_transactions = []

        self.save_block(block)
        return block

    def new_transaction(self, transaction):
        self.current_transactions.append(transaction)
        return self.last_block["index"] + 1

    @staticmethod
    def hash(block):
        block_copy = dict(block)
        block_copy.pop("hash", None)
        block_string = json.dumps(block_copy, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    @property
    def last_block(self):
        return self.chain[-1]

    def save_block(self, block):
        """Save block into one of the N files using round robin"""
        file_index = block["index"] % self.num_files
        filename = self.files[file_index]

        data = self.load_chain(filename)
        data.append(block)
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)

    def load_chain(self, filename):
        with open(filename, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []

    def load_all_chains(self):
        """Merge all block files and sort by index"""
        all_blocks = []
        for f in self.files:
            all_blocks.extend(self.load_chain(f))
        return all_blocks


# ===== Flask API =====
app = Flask(__name__)
blockchain = Blockchain()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🌱 Blockchain API is running",
        "endpoints": ["/transaction/crop", "/transaction/voice", "/mine", "/chain", "/chain/all"]
    })


@app.route("/transaction/crop", methods=["POST"])
def add_crop_transaction():
    values = request.get_json()
    required = ["farmer", "crop", "quantity", "location", "timestamp"]
    if not all(k in values for k in required):
        return "Missing values", 400

    blockchain.new_transaction(values)
    return jsonify({"message": "Crop transaction added"}), 201


@app.route("/transaction/voice", methods=["POST"])
def add_voice_transaction():
    values = request.get_json()
    required = ["farmer", "recording", "timestamp"]
    if not all(k in values for k in required):
        return "Missing values", 400

    blockchain.new_transaction(values)
    return jsonify({"message": "Voice transaction added"}), 201


@app.route("/mine", methods=["GET"])
def mine():
    if not blockchain.current_transactions:
        return jsonify({"message": "No transactions to mine"}), 400

    block = blockchain.new_block()
    return jsonify({
        "message": "New Block Forged",
        "index": block["index"],
        "transactions": block["transactions"],
        "hash": block["hash"]
    })


@app.route("/chain", methods=["GET"])
def full_chain():
    # Just return the in-memory chain
    return jsonify({"chain": blockchain.chain, "length": len(blockchain.chain)})


@app.route("/chain/all", methods=["GET"])
def all_chains():
    # Return merged data from all N files
    data = blockchain.load_all_chains()
    return jsonify({"chain": sorted(data, key=lambda x: x["index"]), "length": len(data)})


if __name__ == "__main__":
    app.run(port=5000, debug=True)
