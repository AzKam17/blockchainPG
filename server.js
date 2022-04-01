const crypto = require('crypto'), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

const {Block, Blockchain} = require('./Block');
const {Transaction} = require('./Transaction');
const EC = require("elliptic").ec, ec = new EC("secp256k1");

// Your original balance is 100000
const holderKeyPair = ec.genKeyPair();
let JeChain = new Blockchain(holderKeyPair);

const express = require('express')
const app = express()

const port = 3000

app.get('/', (req, res) => {
    res.send(JSON.stringify(JeChain.chain))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
