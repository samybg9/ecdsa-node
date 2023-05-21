const {secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes , toHex} = require("ethereum-cryptography/utils");
 
function getAddress(publicKey) {
    let pk = publicKey.slice(1)
    let hash = keccak256(pk)
    let address = hash.slice(12)
    return address
}

function generateAddress(){
    let randPrivateKey = secp256k1.utils.randomPrivateKey()
    let publicKey = secp256k1.getPublicKey(randPrivateKey)
    let address = '0x' + toHex(getAddress(publicKey))
    let privateKeyHex = toHex(randPrivateKey)
    console.log(address);
    console.log(privateKeyHex);
}

//generate some addresses 
generateAddress()
generateAddress()
generateAddress()
generateAddress()
generateAddress()

