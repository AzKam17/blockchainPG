const EC = require("elliptic").ec, ec = new EC("secp256k1");
const crypto = require('crypto'), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    sign(keyPair) {
        // Check if the public key matches the "from" address of the transaction
        if (keyPair.getPublic("hex") === this.from) {
            // Sign the transaction
            this.signature = keyPair.sign(SHA256(this.from + this.to + this.amount), "base64").toDER("hex");
        }
    }

    isValid(tx, chain) {
        return (
            tx.from &&
            tx.to &&
            tx.amount &&
            chain.getBalance(tx.from) >= tx.amount &&
            ec.keyFromPublic(tx.from, "hex").verify(SHA256(tx.from + tx.to + tx.amount), tx.signature)
        );
    }
}
module.exports = { Transaction };