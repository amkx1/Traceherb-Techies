# Develop a blockchain-based system for botanical traceability of Ayurvedic herbs, including geo-tagging from the point of collection (farmers/wild collectors) to the final Ayurvedic formulation label. - 25027
# TraceHerb Techies
## Team
1. Priyangshu Ghosh
2. Ankita M. Kumar
3. Amrendra Pratap Singh
4. Shreyansh
5. Priyanshu P Behera
6. Dhruv Sivan

## Description
This project develops a blockchain-based traceability system to ensure the authenticity, quality, and sustainability of Ayurvedic herbs. Using a permissioned blockchain, every stage—from geo-tagged harvesting and processing to testing and packaging—is securely recorded. Smart contracts enforce sustainability and quality standards, while QR codes on products let consumers trace origin, view lab results, and verify ethical sourcing. By integrating blockchain, IoT, and geo-tagging, the system brings transparency, trust, and accountability to the Ayurvedic herbal supply chain.

## How to execute
This project currently works on dummy blockchain built with python.

### 1. Clone the repository.
Open any code editor and in your bash or terminal, clone this repository.
```bash
git clone https://github.com/amkx1/Traceherb-Techies.git
cd Traceherb-Techies
```

### 2. Running the code
Open 2 terminal tabs and go to the following directory on both of them- `Traceherb-Techies\backend2\backend`
Run the following command on each of the tabs
```bash
python blockchain.py
```
```bash
node server.js
```

### 3. Telegram Bot
Open telegram and send **Hi** to our **Sahayak** bot. You'll recieve an OTP. Send that OTP again to the bot to verify yourself.

### 4. Recieving crop info
Now that you're verified, share your crop details to the bot in the following format- `CROP <crop> QTY <quantity> LOC <location>`

For example, `CROP Rice QTY 500 kg LOC Odisha`

You'll see the following on your terminal screen after doing so
```bash
# On the terminal running blockchain.py
127.0.0.1 - - [11/Oct/2025 20:03:18] "POST /transaction/crop HTTP/1.1" 201 -
```
```bash
# On the terminal running server.js
🌾 Crop Info Received: {
  farmer: 2013295824,
  crop: 'Rice',
  quantity: '500',
  location: 'Odisha',
  timestamp: '2025-10-11T14:33:18.219Z'
}
✅ Crop added to blockchain: { message: 'Crop transaction added' }
```
