let Rpc = require('isomorphic-rpc')
var { toHex, keccak } = require('eth-util-lite')

async function heightIsWithin(acceptableDiff, baseHttpEndpoint, ...httpEndpoints){
  try{
    let baseRpc = new Rpc(baseHttpEndpoint)
    let baseBlock = await baseRpc.eth_getBlockByNumber("latest", false)
    let baseHeadNum = parseInt(baseBlock['number'])
    let lowestHeadNum = baseHeadNum
    let heighestHeadNum = baseHeadNum

    for (let i = 0; i < httpEndpoints.length; i++) {
      let currentRpc = new Rpc(httpEndpoints[i])
      let currentBlock = await currentRpc.eth_getBlockByNumber("latest", false)
      let currentHeadNum = parseInt(currentBlock['number'])
      
      if(currentHeadNum < lowestHeadNum){
        lowestHeadNum = currentHeadNum
      }else if(currentHeadNum > heighestHeadNum){
        heighestHeadNum = currentHeadNum
      }
    }

    if(Math.abs(lowestHeadNum - heighestHeadNum) > acceptableDiff){
      console.log("here")
      return false
    }

    let syncNum = toHex(heighestHeadNum - acceptableDiff)
    baseBlock = await baseRpc.eth_getBlockByNumber(syncNum, false)
    for (let i = 0; i < httpEndpoints.length; i++) {
      let currentRpc = new Rpc(httpEndpoints[i])
      let currentBlock = await currentRpc.eth_getBlockByNumber(syncNum, false)
      if(currentBlock['hash'] != baseBlock['hash']){
        console.log("there")
        return false
      }
    }
  }catch(e){
    console.log("everywhere", e)
    return false
  }

  return true
}



let checkNetworkHealth = heightIsWithin
module.exports = checkNetworkHealth
