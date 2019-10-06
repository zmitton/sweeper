var Rpc = require('isomorphic-rpc')
// var rpc = new Rpc('http://localhost:8545')
var rpc = new Rpc('https://etc-parity.0xinfra.com')
var getcRpc = new Rpc('https://etc-geth.0xinfra.com')
// var rpc = new Rpc('http://web3.gastracker.io')
var gasTracker = new Rpc('https://web3.gastracker.io')
var rlp = require('rlp')
var json = require("./data/final_data_with_txs.json");
var { toHex, keccak } = require('eth-util-lite')
var checkNetworkHealth = require('./ethSync')
// console.log("json.length = ", json)
console.log(rpc.provider)


const sender = "0x4830DDf0cB309944B39633e97E673f81FB20a798"
const numParallelTxs = 3

var startTime
var startNonce

async function serve(){
  console.log("\nSERVING SIGNED TRANSACTIONS from", sender)
  var lastTxCount = await rpc.eth_getTransactionCount(sender, "latest")
  var lastSendTime = Date.now();
  startTime = lastSendTime
  startNonce = lastTxCount

  while(parseInt(lastTxCount) <= 28266){ // until final nonce
    if(await checkNetworkHealth(3, rpc.provider, getcRpc.provider)){

      lastTxCount = await rpc.eth_getTransactionCount(sender, "latest")
      pending = await rpc.eth_getTransactionCount(sender, "pending")

      if(parseInt(pending) < parseInt(lastTxCount) + numParallelTxs){
        lastSendTime = await submitTx(pending)
      }else if(Date.now() > lastSendTime + 300000){ //its been over 5 minutes
        console.log("Txs stuck in mempool for 5 minutes")
        lastSendTime = Date.now()
      }
    }else{
      console.log("Out of Sync")
    }
    await wait(5)
  }
}

async function submitTx(nonce) {
  try{
    let txHash = await rpc.eth_sendRawTransaction(json[parseInt(nonce)]['signedTx'])
    if(parseInt(nonce)%10==0){
      await printRate()
    }
    console.log("Sent Tx: ", txHash, "\tNonce: ", nonce, "\tTime: ", new Date().toLocaleTimeString())
    return Date.now()
  }catch(e){
    console.log("Error during submitTx")
  }
}
async function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds*1000))
}

async function printRate(){
  let latestNonce = await rpc.eth_getTransactionCount(sender, "latest")
  let nonceDiff = parseInt(latestNonce) - parseInt(startNonce)
  let timeDiff = (Date.now() - startTime)/1000/60
  console.log("Tx Speed: ", nonceDiff / timeDiff, " per minute")
}


serve()



// gas price 400 Mwei is getting mined right now almost right away. 
// blocks are only 5% full at best. at that price this will cost:
// its a little less then 1000 gas per iteration (a single account erase)
// so for 13785000 accounts, thats 13,785,000,000
