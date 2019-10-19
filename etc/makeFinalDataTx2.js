var Rpc = require('isomorphic-rpc')
// var rpc = new Rpc('http://etc-parity.0xinfra.com')
var rpc = new Rpc('http://localhost:8545')
var rlp = require('rlp')
var final_data = require('./data/reverted.json');
// var final_data = require('../data/final_data.json');

console.log("final_data.length = ", final_data.length)

var { toHex, keccak, toBuffer } = require('eth-util-lite')

const EthereumTx = require('ethereumjs-tx')
const privateKey = Buffer.from(
  'e331b6d69882b4cb4ea581d88e0b604039afde5967688d3d1ffdd2370d0fe109',
  // 'd88e0b6040fd1083456194702935367638756198764039846575763810197478',
  'hex',
)

// Buffer.concat([Buffer.alloc(12),toBuffer("0x0021a2c532ca32535813e84e6752fb8c609a261a")])
// gasLimit should be (num * 1000) + 25000


function makeTx(finalDataElem, nonce){
  // nonce++
  // var funcSig = "53f11cb3" //asm_clean
  var funcSig = "39846a67" //sol_clean

  var num = toHex(finalDataElem['num']).slice(2).toString(16).padStart(64, '0')
  var seed = toHex(finalDataElem['seed']).slice(2).toString(16).padStart(64, '0')
  var input = '0x'+funcSig+seed+num

  var gas = toHex((finalDataElem['num'] * 4000) + 60000 )

  var txParams = {
    nonce: toHex(nonce),
    gasPrice: '0x00184e7200',
    gasLimit: gas,
    to: '0x39856bb3305997aD7acA33f8b21a8af9B86B79F4',
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

nonce = 5
var final_data_with_txs = {}
for (var i = 0; i < final_data.length; i++) {
  var finalTxData = final_data[i]
  theTx = makeTx(final_data[i], nonce)
  finalTxData['signedTx'] = theTx.hexTx
  finalTxData['theTxParams'] = theTx.txParams
  // finalTxData['theTx'] = theTx.tx

  finalTxData['txHash'] = toHex(keccak(Buffer.from(finalTxData['signedTx'].slice(2), 'hex')))
  final_data_with_txs[nonce] = finalTxData
  nonce++
}


var fs = require("fs");
fs.writeFile("./data/final_data_with_txs3.json", JSON.stringify(final_data_with_txs), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
});

// var hexTx = makeTx(final_data[0])
// console.log("HEX TX : ", hexTx)
// rpc.eth_sendRawTransaction(hexTx).then(console.log)


// async function serve(){
//   let txhash = await rpc.eth_sendRawTransaction(hexTx)
//   console.log("txhash ", txhash)
//   return txhash
// }


// serve()
// var fs = require("fs");

// var sbto = []
// var missing = []

// gas price 400 Mwei is getting mined right now almost right away. 
// blocks are only 5% full at best. at that price this will cost:
// its a little less then 1000 gas per iteration (a single account erase)
// so for 13785000 accounts, thats 13,785,000,000
