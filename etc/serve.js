var Rpc = require('isomorphic-rpc')
var rpc = new Rpc('http://localhost:8545')
var getcRpc = new Rpc('https://etc-geth.0xinfra.com')
var rlp = require('rlp')
var json = require("./data/final_data_with_txs.json");
var { toHex, keccak } = require('eth-util-lite')
// console.log("json.length = ", json)


const sender = "0x4830DDf0cB309944B39633e97E673f81FB20a798"

var startTime
var startNonce

async function serve(){
  console.log("\nSERVING SIGNED TRANSACTIONS from", sender)
  var lastTxCount = await rpc.eth_getTransactionCount(sender, "latest")
  var lastSendTime = Date.now();
  startTime = lastSendTime
  startNonce = lastTxCount

  while(parseInt(lastTxCount) <= 28266){ // until final nonce
    await checkNetworkHealth()
    await wait()

    lastTxCount = await rpc.eth_getTransactionCount(sender, "latest")
    pending = await rpc.eth_getTransactionCount(sender, "pending")

    if(parseInt(pending) < parseInt(lastTxCount) + 2){
      lastSendTime = await submitTx(pending)
    }else if(Date.now() > lastSendTime + 300000){ //its been over 5 minutes
      console.log("Txs stuck in mempool for 5 minutes")
      lastSendTime = Date.now()
    }
  }
}

async function submitTx(nonce) {
  let txHash = await rpc.eth_sendRawTransaction(json[parseInt(nonce)]['signedTx'])
  if(parseInt(nonce)%10==0){
    await printRate()
  }
  console.log("Sent Tx: ", txHash, "\tNonce: ", nonce, "\tTime: ", new Date().toLocaleTimeString())
  return Date.now()
}
async function wait() {
  return new Promise((resolve) => setTimeout(resolve, 5000))
}

async function printRate(){
  let latestNonce = await rpc.eth_getTransactionCount(sender, "latest")
  let nonceDiff = parseInt(latestNonce) - parseInt(startNonce)
  let timeDiff = (Date.now() - startTime)/1000/60
  console.log("Tx Speed: ", nonceDiff / timeDiff, " per minute")
}

async function checkNetworkHealth(){
  var getcB = await getcRpc.eth_getBlockByNumber("latest", false)
  var localB = await rpc.eth_getBlockByNumber("latest", false)

  var pastBlkNum, lateClient;
  if(parseInt(getcB['number']) < parseInt(localB['number'])){
    lateClient = 'getc'
    pastBlkNum = parseInt(getcB['number']) - 1
  }else{
    lateClient = 'local'
    pastBlkNum = parseInt(localB['number']) - 1
  }

  var getcPrev = await getcRpc.eth_getBlockByNumber('0x'+pastBlkNum.toString(16), false)
  var localPrev = await rpc.eth_getBlockByNumber('0x'+pastBlkNum.toString(16), false)

  if(getcPrev.hash != localPrev.hash){
    console.log(localPrev, getcPrev, lateClient)
    throw new Error("fork exists \n")
  }

  if(Math.abs(parseInt(getcB['number']) - parseInt(localB['number'])) > 2){
    throw new Error('getc out of sync by at least 2 blocks')
  }
}

serve()



// gas price 400 Mwei is getting mined right now almost right away. 
// blocks are only 5% full at best. at that price this will cost:
// its a little less then 1000 gas per iteration (a single account erase)
// so for 13785000 accounts, thats 13,785,000,000
