from flask import Flask, request, jsonify
import time

app = Flask(__name__)

# In-memory blockchain
blockchain = []
transactions = []

# Create the genesis block
def create_genesis_block():
    return {
        "index": 0,
        "timestamp": time.time(),
        "transactions": [],
        "previous_hash": "0"
    }

if not blockchain:
    blockchain.append(create_genesis_block())

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🌱 Blockchain API is running",
        "endpoints": ["/transaction/crop", "/transaction/voice", "/mine", "/chain"]
    })

# Add crop transaction
@app.route("/transaction/crop", methods=["POST"])
def add_crop_transaction():
    data = request.get_json()
    transactions.append({
        "type": "crop",
        "data": data,
        "timestamp": time.time()
    })
    return jsonify({"message": "🌾 Crop transaction added", "transaction": data}), 201

# Add voice transaction
@app.route("/transaction/voice", methods=["POST"])
def add_voice_transaction():
    data = request.get_json()
    transactions.append({
        "type": "voice",
        "data": data,
        "timestamp": time.time()
    })
    return jsonify({"message": "🎤 Voice transaction added", "transaction": data}), 201

# Mine a new block
@app.route("/mine", methods=["GET"])
def mine_block():
    block = {
        "index": len(blockchain),
        "timestamp": time.time(),
        "transactions": transactions.copy(),
        "previous_hash": blockchain[-1]["previous_hash"] if blockchain else "0"
    }
    blockchain.append(block)
    transactions.clear()
    return jsonify({"message": "⛏️ New block mined", "block": block}), 200

# Get full blockchain
@app.route("/chain", methods=["GET"])
def get_chain():
    return jsonify({
        "length": len(blockchain),
        "chain": blockchain
    }), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
