
const secureRandom = require('secure-random');
const max = Buffer.from("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140", 'hex');  
let isInvalid = true;  
let privateKey;  
while (isInvalid) {    
  privateKey = secureRandom.randomBuffer(32);
  if (Buffer.compare(max, privateKey) === 1)     
    isInvalid = false;     
   }
console.log('> Private key: ', privateKey.toString('hex'));


const ec = require('elliptic').ec;
const ecdsa = new ec('secp256k1');
const keys = ecdsa.keyFromPrivate(privateKey);  
const publicKey = keys.getPublic('hex');  
console.log('> Public key created: ', publicKey);

const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
let hash = sha256(Buffer.from(publicKey, 'hex'));
let publicKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
console.log('publickeyhash:',publicKeyHash.toString('hex'));


  // step 1 - add prefix "00" in hex
  const step1 = Buffer.from("00" + publicKeyHash.toString('hex'), 'hex');
  // step 2 - create SHA256 hash of step 1
  const step2 = sha256(step1);
  // step 3 - create SHA256 hash of step 2
  const step3 = sha256(Buffer.from(step2, 'hex'));
  // step 4 - find the 1st byte of step 3 - save as "checksum"
  const checksum = step3.substring(0, 8);
const base58 = require('bs58');
  // step 5 - add step 1 + checksum
  const step4 = step1.toString('hex') + checksum;
  // return base 58 encoding of step 5

  const address = base58.encode(Buffer.from(step4, 'hex'));
  
 console.log('address:',address);




const tep1 = Buffer.from("80" + privateKey.toString('hex'), 'hex');
  const tep2 = sha256(tep1);
  const tep3 = sha256(Buffer.from(tep2, 'hex'));
  const checksum2 = tep3.substring(0, 8);
  const tep4 = tep1.toString('hex') + checksum2;
  const privateKeyWIF = base58.encode(Buffer.from(tep4, 'hex'));

console.log('WIF:',privateKeyWIF);
