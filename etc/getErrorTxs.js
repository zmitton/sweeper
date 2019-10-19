// worked flawlessly as is. Ran overnight (approx. 30 minutes)

var Rpc = require('isomorphic-rpc')
var rpc = new Rpc()

var fs = require("fs");

// let histogram = {}
let keys = []
let data = []
let total = 0
let start = Date.now()

async function run(){
  // for (var currBlockNum = 2420438; currBlockNum < 2421438; currBlockNum++) {
  for (var currBlockNum = 8885343; currBlockNum < 8959579; currBlockNum++) {
  // for (var currBlockNum8885001; currBlockNum < 8885601; currBlockNum++) {


    let currBlock = await rpc.eth_getBlockByNumber('0x'+currBlockNum.toString(16), false)

    for (var i = 0; i < currBlock.transactions.length; i++) {
      let tx = await rpc.eth_getTransactionByHash(currBlock['transactions'][i])
      // let from = tx['from']
      if(tx){
      // if(data[from] == undefined ) { data[from] = [] }

      // console.log("receipt", tx)
        if (tx['from']== "0x4830ddf0cb309944b39633e97e673f81fb20a798"){
          var receipt = await rpc.eth_getTransactionReceipt(tx['hash'])
          if (receipt['status']!= "0x1"){
          // console.log("receipt", receipt)
            data.push(tx['hash'])
          }

        }


        // keys.push(from)

        // histogram[from] = histogram[from] == undefined ? 1 : histogram[from] + 1

        total++
      }
    }
  }

  console.log("\n\n\n\ntotal", total)
  console.log("\n\n\n\ntime", (Date.now() - start)/1000)

  // histogramFloor(histogram, 100)
  // console.log("\n\n\n\n\nhistogram", histogram)

  // dataFloor(data, 100)
  console.log("\n\n\n\n\ndata\n\n", data)



  fs.writeFile("./data/errors.json", JSON.stringify(data), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      console.log("Data file has been created too");
  });
}


// function histogramFloor(h, floor){
//   let keys = Object.keys(h)
//   for (var i = 0; i < keys.length; i++) {
//     if(h[keys[i]] < floor){
//       delete h[keys[i]]
//     }
//   }
//   return h
// }

// function dataFloor(d, floor){
//   let keys = Object.keys(d)
//   // console.log(keys)
//   for (var i = 0; i < keys.length; i++) {
//     if(d[keys[i]].length < floor){
//       delete d[keys[i]]
//     }
//   }
//   return d
// }

var rlp = require('rlp')
var txs = require('./data/final_data_with_txs')
var thing = []
var stuff = []
keys = Object.keys(txs)
for (var i = 0; i < keys.length; i++) {
  var input = rlp.decode(txs[keys[i]]['signedTx'])[5]
  if(input.length != 68){
    thing.push(txs[keys[i]])
    stuff.push(txs[keys[i]]['txHash'])
  }
}
console.log(thing.length)
console.log(stuff)
// run()
