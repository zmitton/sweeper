var Rpc = require('isomorphic-rpc')
// var rpc = new Rpc('http://etc-parity.0xinfra.com')
var rpc = new Rpc('http://localhost:8545')
var rlp = require('rlp')
var final_data = require('./snipe1.json');
var snipeTxs = {}
// var final_data = require('../data/final_data.json');

console.log("final_data.length = ", final_data.length)

var { toHex, keccak, toBuffer } = require('eth-util-lite')

const EthereumTx = require('ethereumjs-tx')
const privateKey = Buffer.from(
  // 'e331b6d69882b4cb4ea581d88e0b604039afde5967688d3d1ffdd2370d0fe109',
  'd88e0b6040fd1083456194702935367638756198764039846575763810197478',
  'hex',
)

// Buffer.concat([Buffer.alloc(12),toBuffer("0x0021a2c532ca32535813e84e6752fb8c609a261a")])
// gasLimit should be (num * 1000) + 25000


function makeTx(finalDataElem, nonce){

  // nonce++
  // var funcSig = "53f11cb3" //asm_clean
  // var funcSig = "39846a67" //sol_clean
  var funcSig = "ced27ca3" // snipe(address[])
  // var num = toHex(finalDataElem['num']).slice(2).toString(16).padStart(64, '0')
  // var seed = toHex(finalDataElem['seed']).slice(2).toString(16).padStart(64, '0')
  var forSomeReason ='0000000000000000000000000000000000000000000000000000000000000020'
  var length = '0000000000000000000000000000000000000000000000000000000000000020'
  var len = 32
  var addresses = ''
  for (var i = 0; i < finalDataElem.length; i++) {
    addresses += '000000000000000000000000' + finalDataElem[i].slice(2)
    // Buffer.concat([Buffer.alloc(12),toBuffer("0x0021a2c532ca32535813e84e6752fb8c609a261a")])
  }

  var input = '0x'+funcSig+forSomeReason+length+addresses
  // console.log(input)

  var gas = toHex( (5000 * len) + 50000)

  var txParams = {
    nonce: toHex(nonce),
    gasPrice: '0x00184e7200',
    gasLimit: gas,
    to: '0xAe02E6d8AEeD663b44e5F06F23D20c2D38835BB5',
    value: '0x00',
    data: input,
  }

  var tx = new EthereumTx(txParams)
  tx.sign(privateKey)
  var serializedTx = tx.serialize()
  // console.log("TX: ", tx.from)
  let hexTx = '0x'+serializedTx.toString('hex')
  // 0x4830ddf0cb309944b39633e97e673f81fb20a798
  // 0xc447cc12fe65e94915651b9132a643aa81999959
  // console.log("obj ", rlp.decode(hexTx))
  // console.log("HEX ", hexTx)

  return {hexTx: hexTx, txParams: txParams, tx: tx}
}

nonce = 0x6e71
var final_data_with_txs = {}
// for (var i = 0; i < final_data.length; i = i + 2) {
for (var i = 0; i < final_data.length; i = i + 32) {
  // var finalTxData = final_data[i]
  batch = {}
  batch['batchAddys'] = final_data.slice(i,i+32)
  theTx = makeTx(batch['batchAddys'], nonce)
  batch['theTx'] = theTx['hexTx']
  // console.log("theTx", theTx.hexTx)
  // finalTxData['signedTx'] = theTx.hexTx
  // finalTxData['theTxParams'] = theTx.txParams
  // finalTxData['theTx'] = theTx.tx

  // finalTxData['txHash'] = toHex(keccak(Buffer.from(finalTxData['signedTx'].slice(2), 'hex')))
  snipeTxs[nonce] = batch
  nonce++
}


var fs = require("fs");
fs.writeFile("./data/snipeTxs.json", JSON.stringify(snipeTxs), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
});



// 0xced27ca300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000393b2103ee8016f763efe4e1a681ccd4a6e3393b000000000000000000000000393b2103ee8016f763efe4e1a681ccd4a6e3393b
// 0xced27ca300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020000000000000000000000006421a2c532ca32535813e84e6752fb8c609a261a00000000000000000000000036dae080ef7c14d8b39615a743c5a235dedde9f9
