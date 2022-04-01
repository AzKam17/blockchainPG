const crypto = require('crypto'), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

const {Block, Blockchain} = require('./Block');
const {Transaction} = require('./Transaction');
const EC = require("elliptic").ec, ec = new EC("secp256k1");

// Your original balance is 100000
const holderKeyPair = ec.genKeyPair();
let JeChain = new Blockchain(holderKeyPair);

const express = require('express')
const app = express()

app.use(express.json());

app.get('/', (req, res) => {
    res.send(JSON.stringify(JeChain.chain))
});

app.post('/transaction/new', (req, res) => {
    let obj = JSON.parse(req.body)
    let transaction = new Transaction(obj.from, obj.to, obj.amount);

    JeChain.addTransaction(transaction);
    res.status(201).json({
        message: JeChain.chain[-1]
    });
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running`)
})
