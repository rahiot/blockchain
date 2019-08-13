const Blockchain = require('./blockchain');
const rahul = new Blockchain();

const bc1={//....{
"chain": [
{
"index": 1,
"timestamp": 1565546808107,
"transactions": [],
"nonce": 0,
"hash": "IM THE GENISIS BLOCK leggo!!",
"previousBlockHash": "0"
}
],
"pendingTransactions": [],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
}

console.log('VALID:',rahul.chainIsValid(bc1.chain));