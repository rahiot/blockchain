install node. js 
npm install --save sha256
npm i sha256
npm i express
npm i express --save
npm i nodemon --save
install postman
npm i body-parser --save
install chrome ext JSON formatter chrome web store
npm i uuid --save
npm install request-promise --save
npm install request --save


Run the project--
1.
TO RUN MULTIPLE NODES----
npm run node_1
npm run node_2
npm run node_3 
and so on, depending upon package.json
2.
Testing all of the network endpoints
From what we have learned in the preceding section,  we know that our register-node route and that the register-nodes-bulk route are both working correctly. So, in this section, let's put it all together and test our register-and-broadcast-node route, which uses the both the register-node route and the register-nodes-bulk route.

The register-and-broadcast-node endpoint will allow us to build a decentralized blockchain network by allowing us to create a network and add new nodes to it. Let's jump right into our first example to get a better understanding of it. To understand how the register-and-broadcast-node route works, we'll make use of  Postman.

In the Postman application, we want to make a post request to register and broadcast the node on localhost:3001. However, before we do that, just make sure that all four nodes are running so that we can test the routes.

At this point, we have no network at all; we just have five individual nodes running, but they are not connected in any way. Therefore, the first call that we're going to make is simply going to connect two nodes together to form the beginnings of our network. We will now register a node with our node that's hosted on port 3001. When we hit the register-and-broadcast-node endpoint, we must send in a newNodeUrl that we want to register. In Postman, add the following code:

{
    "newNodeUrl": ""
}
For this first test, we want to register our second node hosted on port 3002 with our first node. To do that, we will add the following highlighted code:

{
    "newNodeUrl": "http://localhost:3002"
}
Now, when we make this request, it should register our node that's hosted on localhost:3002 with our node that's hosted on localhost:3001. Let's verify this by clicking the Send button. You will see an output similar to what's shown in the following screenshot:58% e-book viewer

3