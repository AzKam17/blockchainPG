const crypto = require('crypto'), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");
const {Transaction} = require('./Transaction');
const EC = require("elliptic").ec, ec = new EC("secp256k1");

const MINT_KEY_PAIR = ec.genKeyPair();
const MINT_PUBLIC_ADDRESS = MINT_KEY_PAIR.getPublic("hex");

class Block {
    constructor(timestamp = "", data = []) {
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.getHash();
        this.prevHash = "";
        this.nonce = 0;
    }

    getHash(){
        return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce);
    }

    mine(difficulty) {
        // Basically, it loops until our hash starts with
        // the string 0...000 with length of <difficulty>.
        while (!this.hash.startsWith(Array(difficulty + 1).join("0"))) {
            // We increases our nonce so that we can get a whole different hash.
            this.nonce++;
            // Update our new hash with the new nonce value.
            this.hash = this.getHash();
        }
    }

    hasValidTransactions(chain) {
        return this.data.every(transaction => transaction.isValid(transaction, chain));
    }
}

class Blockchain{
    constructor(holderKeyPair) {
        this.transactions = [];
        this.difficulty = 1;

        // We will release 100000 coin
        const initalCoinRelease = new Transaction(MINT_PUBLIC_ADDRESS, holderKeyPair.getPublic("hex"), 100000);
        this.chain = [new Block(Date.now().toString(), [initalCoinRelease])];
    }

    addTransaction(transaction) {
        if (transaction.isValid(transaction, this)) {
            this.transactions.push(transaction);
        }
    }

    mineTransactions() {
        this.addBlock(new Block(Date.now().toString(), this.transactions));
        this.transactions = [];
    }

    getBalance(address) {
        let balance = 0;

        this.chain.forEach(block => {
            block.data.forEach(transaction => {
                // Because if you are the sender, you are sending money away, so your balance will be decremented.
                if (transaction.from === address) {
                    balance -= transaction.amount;
                }

                // But if you are the receiver, you are receiving money, so your balance will be incremented.
                if (transaction.to === address) {
                    balance += transaction.amount;
                }
            })
        });

        if(balance === 0){
            this.addTransaction(new Transaction(MINT_PUBLIC_ADDRESS, address, 100))
        }

        return balance;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        block.prevHash = this.getLastBlock().hash;
        block.hash = block.getHash();
        block.mine(this.difficulty);
        this.chain.push(Object.freeze(block));
    }

    isValid(blockchain = this) {
        // Iterate over the chain, we need to set i to 1 because there are nothing before the genesis block, so we start at the second block.
        for (let i = 1; i < blockchain.chain.length; i++) {
            const currentBlock = blockchain.chain[i];
            const prevBlock = blockchain.chain[i-1];

            // Check validation
            if (
                currentBlock.hash !== currentBlock.getHash() ||
                prevBlock.hash !== currentBlock.prevHash ||
                !currentBlock.hasValidTransactions(blockchain)
            ) {
                return false;
            }
        }

        return true;
    }
}

module.exports = { Block, Blockchain };