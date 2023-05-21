import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import * as keccak from 'ethereum-cryptography/keccak';
import * as utils  from 'ethereum-cryptography/utils'

function Wallet({privateKey, setPrivateKey, address, setAddress, balance, setBalance }) {
  
  function getAddress(publicKey) {
    let pk = publicKey.slice(1)
    let hash = keccak.keccak256(pk)
    let address = hash.slice(12)
    return '0x' + utils.toHex(address)
  }

  async function onChange(evt) {
    const pk = evt.target.value;
    setPrivateKey(pk)

    try {
      let publicKey = secp.secp256k1.getPublicKey(pk)
      address = getAddress(publicKey)
  
      if (address) {
        setAddress(address);
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      } 
    } catch (error) {
      setAddress('');
      setBalance(0);
    }

  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Private Key
        <input placeholder="Put your Private key here 100% legit" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Wallet Address
        <input placeholder="Your address will pop up" value={address}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
