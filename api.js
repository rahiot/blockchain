const rp = require('request-promise');
const port = process.argv[2];
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');
const Blockchain = require('./blockchain');
const rahul= new Blockchain();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));




app.get('/blockchain', function (req, res) { 
	res.send(rahul);
});


app.post('/transaction', function(req, res){
   const newTransaction = req.body; 
   const blockIndex = rahul.addTransactionToPendingTransactions(newTransaction);

	res.json({ note: `Transaction will be added in block ${blockIndex}.` });


});




app.post('/transaction/broadcast', function(req, res) {

	const newTransaction = rahul.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

	rahul.addTransactionToPendingTransactions(newTransaction);



	const requestPromises = [];

	rahul.networkNodes.forEach(networkNodeUrl => {

		const requestOptions = {

			uri: networkNodeUrl + '/transaction',

			method: 'POST',

			body: newTransaction,

			json: true
		};
		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)

	.then(data => {

res.json({ note: 'Transaction created and broadcast successfully.' });

	});

});




app.get('/mine', function(req, res){
	  const lastBlock = rahul.getLastBlock();
	  const previousBlockHash = lastBlock['hash'];

	  const currentBlockData ={
		transactions: rahul.pendingTransactions,
		index: lastBlock['index'] + 1
};
const nonce = rahul.proofOfWork(previousBlockHash, currentBlockData);
const blockHash = rahul.hashBlock(previousBlockHash, currentBlockData, nonce);
const newBlock = rahul.createNewBlock(nonce, previousBlockHash, blockHash);

const requestPromises=[];
rahul.networkNodes.forEach(networkNodeUrl => {
          const requestOptions = {
                uri:networkNodeUrl + '/receive-new-block',
                method:'POST',
                body: {newBlock:newBlock},
                json:true
            }; 
          requestPromises.push(rp(requestOptions));
});
  Promise.all(requestPromises)
  .then(data=>{
     const requestOptions = {
        uri: rahul.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body:{ 
           amount:7,
           sender:"miningReward",
           recipient:nodeAddress
             },
       json:true
      };
     return rp(requestOptions);
   })
.then(data=>{


res.json({
	note:"MINED A BLOCK!",
	block:newBlock
        });

   });
});








app.post('/receive-new-block', function(req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = rahul.getLastBlock(); 
  const correctHash =lastBlock.hash === newBlock.previousBlockHash; 
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
if (correctHash && correctIndex) {
    rahul.chain.push(newBlock);
    rahul.pendingTransaction =[];
res.json({
    note: 'New block received and accepted.',
    newBlock: newBlock});
}
else {
res.json({
      note:'New block rejected.',
      newBlock: newBlock});  
}
});










app.post('/register-node-broadcast',function(req,res){

const newNodeUrl = req.body.newNodeUrl;

if(rahul.networkNodes.indexOf(newNodeUrl)==-1)
rahul.networkNodes.push(newNodeUrl);

const regNodesPromises =[];

rahul.networkNodes.forEach(networkNodeUrl=>
{
  const requestOptions ={
      uri: networkNodeUrl + '/register-node',
      method:'POST',
      body:{newNodeUrl:newNodeUrl},
      json: true
     };
    regNodesPromises.push(rp(requestOptions));
});

Promise.all(regNodesPromises)
.then(data =>{
  const bulkRegisterOptions ={
        uri:newNodeUrl + '/register-bulk',
        method: 'POST',
        body: {allNetworkNodes:[...rahul.networkNodes,
        rahul.currentNodeUrl]},
        json:true
     };
 
 return rp(bulkRegisterOptions);
})
 .then(data =>{
    res.json({note:'new node registered wid da network'});
      
    });

});



 app.post('/register-node',function(req,res){
     const newNodeUrl = req.body.newNodeUrl;
     const nodeNotAlreadyPresent = rahul.networkNodes.indexOf(newNodeUrl)==-1;
     const notCurrentNode = rahul.currentNodeUrl !==newNodeUrl;
   if(nodeNotAlreadyPresent&&notCurrentNode) 
    rahul.networkNodes.push(newNodeUrl);
    res.json({note: 'new node registered successfully'});

});


app.post('/register-bulk',function(req,res){
   const allNetworkNodes = req.body.allNetworkNodes;
     allNetworkNodes.forEach(networkNodeUrl =>{
        const nodeNotAlreadyPresent = rahul.networkNodes.indexOf(networkNodeUrl)== -1;
        const notCurrentNode = rahul.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode)
        rahul.networkNodes.push(networkNodeUrl);

    });
 res.json({note:'bluk registered successfully'});
});



app.get('/consensus', function(req, res) { 
const requestPromises=[];
rahul.networkNodes.forEach(networkNodeUrl => {
         const requestOptions = {
                        uri: networkNodeUrl + '/blockchain',
                        method: 'GET',
                        json: true 
                        }
requestPromises.push(rp(requestOptions));

        });
Promise.all(requestPromises)
.then(blockchains => {
        const currentChainLength = rahul.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        blockchains.forEach(blockchain => {                
            if (blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
            };
});
if (!newLongestChain || (newLongestChain &&
    !rahul.chainIsValid(newLongestChain))) 
{
         res.json({
             note: 'Current chain has not been replaced.',
             chain: rahul.chain
         });
}


else {
         rahul.chain = newLongestChain;
         rahul.pendingTransactions = newPendingTransactions;
         res.json({
                       note: 'This chain has been replaced.',
                       chain: rahul.chain
         });
}


  });
      
});



app.get('/block/:blockHash', function(req, res) { 

const blockHash = req.params.blockHash;
const correctBlock = rahul.getBlock(blockHash);
res.json({
          block: correctBlock
        });
});



app.get('/transaction/:transactionId', function(req, res) {
const transactionId = req.params.transactionId;
         const trasactionData=rahul.getTransaction(transactionId);

res.json({
    transaction: trasactionData.transaction,
    block: trasactionData.block
         });  
});




app.get('/address/:address', function(req, res) {
       const address = req.params.address;
       const addressData = rahul.getAddressData(address);
       res.json({
                addressData: addressData
       });   
});



app.get('/block-explorer', function(req, res) {
    res.sendFile('./block-explorer/index.html', { 
root: __dirname });
});




app.listen(port, function(){

	console.log(`port ${port} now active`);
});

















