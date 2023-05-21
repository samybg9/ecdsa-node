import { useState } from "react";
import server from "./server";
import * as keccak from 'ethereum-cryptography/keccak';
import * as utils  from 'ethereum-cryptography/utils'
import * as secp from 'ethereum-cryptography/secp256k1';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      if(privateKey){
        let bytes = utils.utf8ToBytes(address,parseInt(sendAmount),recipient)

        //Send a signature of the transaction 
        let txHash = keccak.keccak256(bytes)
        let txHashHex = utils.toHex(txHash) 
        let signature = await secp.secp256k1.sign(txHashHex, utils.hexToBytes(privateKey))
        let signatureHex = signature.toCompactHex()

        const {
          data: { balance },
        } = await server.post(`send`, {
          sender: address,
          amount: parseInt(sendAmount),
          recipient: recipient,
          signature: signatureHex,
          recovery: signature.recovery
        });
        setBalance(balance);
      }
      
    } catch (ex) {
      alert(ex);
      if(ex.response.data){
        alert(ex.response.data.message);
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
