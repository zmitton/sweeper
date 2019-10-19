var MPT = require('merkle-patricia-tree')
var levelup = require('levelup')
var leveldown = require('leveldown')

var Rpc = require('isomorphic-rpc')
var rpc = new Rpc('https://etc-parity.0xinfra.com')
var { toHex , toBuffer } = require('eth-util-lite')
var { Account } = require('eth-object')


// get the somewhat-current stateroot by querying a block:
// curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x88d1a5", false],"id":1}' -H "Content-type:application/json" https://etc-parity.0xinfra.com
var stateRoot =  toBuffer('0xa3ee61d94609ac25a9fe9828a810cb3cb76f3176a756dd2d9767cfbcaa38e069') // from blknum 0x88d1a5

var chaindata = '/Users/zacharymitton/Library/Ethereum/classic/geth/chaindata'
var db = levelup(leveldown(chaindata))
var tree = new MPT(db,stateRoot)


//this function iterates the entire tree (took about 6 hours to complete)
tree._findValueNodes((a,b,c,d)=>{
  if(b.raw[1].equals(Account.NULL.buffer)){
    // we have the account here but its address is actually the preimage of the key
    // luckily these are saved in the level db as secure-key+PATH->preimage
    db.get(Buffer.concat([Buffer.from('secure-key-'),Buffer.from(arrayToHex(c),'hex')]), (e,r)=>(console.log(toHex(r))))
  }
}, console.log)



