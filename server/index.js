const {secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes , toHex} = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x319762949e3a9044bd13a28e920edd5c9bff91bd" : 500,
  "0x7d508d731e75af8028eb08c9f7216f4974cbcfae" : 400,
  "0xbefa7ff136d1c4887568854ba5b0d2b335c804af" : 300,
  "0x6c829a88aac311a032266f835de888be232521da" : 200,
  "0x57b0583b32187c3825e363e9a47469ff41286f4e" : 100
};

function getAddress(publicKey) {
  let pk = publicKey.slice(1)
  let hash = keccak256(pk)
  let address = hash.slice(12)
  return address
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recovery} = req.body;

  //Hash the transaction and extract address from signature 
  let bytes = utf8ToBytes(sender, parseInt(amount), recipient)
  let txHash = keccak256(bytes)
  let txHashHex = toHex(txHash) 
  const sig = secp256k1.Signature.fromCompact(signature);
  sig.recovery = recovery
  let senderPublicKey = sig.recoverPublicKey(txHashHex)
  let recoveredSenderAddress = '0x' + toHex(getAddress(  senderPublicKey.toRawBytes() ))

  setInitialBalance(sender);
  setInitialBalance(recipient);

  //Don't let the transaction pass if public key in signature is different from sender 
  if(recoveredSenderAddress !== sender){
    res.status(400).send({ message: "Invalid signature!" });
  }
  else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
