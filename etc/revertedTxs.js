var Rpc = require('isomorphic-rpc')
var rpc = new Rpc('http://localhost:8545')
// var rpc = new Rpc('https://etc-parity.0xinfra.com')
// var getcRpc = new Rpc('https://etc-geth.0xinfra.com')
// var rpc = new Rpc('http://web3.gastracker.io')
// var gasTracker = new Rpc('https://web3.gastracker.io')
var rlp = require('rlp')
var json = require("./data/final_data_with_txs.json");
var { toHex, keccak } = require('eth-util-lite')
// var checkNetworkHealth = require('./ethSync')
console.log("json.length = ", json.length)
console.log(rpc.provider)



// const sender = "0x4830DDf0cB309944B39633e97E673f81FB20a798"
// const numParallelTxs = 3

// var startTime
// var startNonce
var reverted = []

async function find(){
  // console.log("\nSERVING SIGNED TRANSACTIONS from", sender)
  // var lastTxCount = await rpc.eth_getTransactionCount(sender, "latest")
  // var lastSendTime = Date.now();
  // startTime = lastSendTime
  // startNonce = lastTxCount

  var jsonKeys = Object.keys(json)
  // for (var i = 0; i < 2; i++) {
  // for (var i = 0; i < jsonKeys.length; i++) {
  // for (var i = 18; i < 13592; i++) {
  for (var i = 13592; i < 27172; i++) {
  // for (var i = 13592; i < jsonKeys.length; i++) {
    // var key = jsonKeys[i]

    // console.log(key)

    var txHash = json[i]['txHash']
    // var txHash = json[i]['txHash']
    // console.log("TXHAS", txHash)
    let receipt = await rpc.eth_getTransactionReceipt(txHash)

    if(receipt == null || receipt['status'] != "0x1"){
    // if(receipt['status'] != "0x1"){
      json[i]['receipt'] = receipt
      reverted.push(json[i])
      console.log("receipt ", receipt)
      console.log(json[i]['txHash'], " ", i)
    }

  }
  console.log("LLLL", reverted.length)
  var fs = require("fs");
  // fs.writeFile("./data/reverted.json", JSON.stringify(reverted), (err) => {
  //     if (err) {
  //         console.error(err);
  //         return;
  //     };
  //     console.log("File has been created");
  // });
}

find()




