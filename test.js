const crypto = require('crypto'), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

const {Block, Blockchain} = require('./Block');
const {Transaction} = require('./Transaction');
const EC = require("elliptic").ec, ec = new EC("secp256k1");

// Your original balance is 100000
const holderKeyPair = ec.genKeyPair();

let JeChain = new Blockchain(holderKeyPair);

const girlfriendWallet = ec.genKeyPair();

// Create a transaction
const transaction = new Transaction(holderKeyPair.getPublic("hex"), girlfriendWallet.getPublic("hex"), 100);
// Sign the transaction
transaction.sign(holderKeyPair);
// Add transaction to pool
JeChain.addTransaction(transaction);
// Mine transaction
JeChain.mineTransactions(holderKeyPair.getPublic("hex"));

// Prints out balance of both address
console.log("Your balance:", JeChain.getBalance(holderKeyPair.getPublic("hex")));
console.log("Your girlfriend's balance:", JeChain.getBalance(girlfriendWallet.getPublic("hex")));