# Ethereum Classic EIP-161 Cleanup
### Scripts, Tools, and Contracts


An etherscan example transaction record:
```
Function: asm_clean(uint256 s, uint256 i)

MethodID: 0x53f11cb3
[0]:  6de0aa0cf1f9936e8564c853bda6aa3eb835133cde173e1b5d3f3f392a64f278
[1]:  0000000000000000000000000000000000000000000000000000000000000550
```

### ETH statesweep repo
https://github.com/ethereum/statesweep

--- zacs notes ---

one of the 2 difficult contracts exits on ETC: 0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31
the other 2: 0x6a0a0fc761c612c340a0e98d33b37a75e5268472 and 0x8a2e29e7d66569952ecffae4ba8acb49c1035b6f have empty accounts on my node, but gastracker says that they are involved in a bunch of transactions but they are NOT contracts 

0x8a2E29E7D66569952eCfFAe4BA8acB49C1035B6f has only 133 transactions to it according to blockscout.com (better ETC explorer)

0x6A0a0Fc761c612C340a0e98d33b37a75e5268472 seems to have 50 pages of 50 each (2458) but its too big a dataset to download the CSV (throw 500). Update: it let me download the CSV, and it has 2459 transactions.

As far as the actual transactions go, most of the ones I tested from that page seem to be findable on gastracker AND my node, but others are simply not there (on either)

I didnt seem to find the "sequential" addresses in the db (although 1 out of 4 may also have proofs that contain empty accounts at their dead ends)

so basically we need to make that original.json file that 
etherchain created, then we can run the python to generate the rest of the needed data.


CONTRACT 0x7c20218efc2e07c8fe2532ff860d4a5d8287cb31
---------------------------------------------------
according to blockscout it was created at block

2420438

and according to gastracker the last tx was at block 

2459860

current nonce is known to be 28249 (from my full node)
 -> histogram and destination array shows exactly 28249 txs 'to' 0x7c202 address
 -> using the ETH file there were 27928 matching txs found
 -> 0x7c2 data checks out. Issac's file had ZERO discrepancies



gas-repricing was on block (according to ECIP 1015)

2500000 


so let search 2420438 - 2500000


update: there are tons of transactions to 0x6a0a0fc761c612c340a0e98d33b37a75e5268472 even though there isnt a contract there


Full node results:
6a0a0fc761c612c340a0e98d33b37a75e5268472 contains an empty account
8a2e29e7d66569952ecffae4ba8acb49c1035b6f is also empty
7c20218efc2e07c8fe2532ff860d4a5d8287cb31 is known to have identical code to its ETH depolyment

nothing else with > 1000 txs from the histogram show suicides on the block explorers


state_bloat_txs -> input txhash blh gasused
final -> seed, num


ok so officiallygot the last step left done using the python script  (making final_data.json from state_bloat_transactions.json) 


Then of course there is the matter of running a server to send the txs
  check that the addresses all (were) indeed empty
  get some funding
  make a process that sends idk 20 transactions per minute for about 24 hours
  make sure it tallies off completed ones
  run it for a few seconds first

ok, I got the python file to run, and it made the final data file

for ETH Total suicides: 15967160
for ETC Total suicides: 13785000

deploying the sweeper contract at address: 0x39856bb3305997aD7acA33f8b21a8af9B86B79F4
source is verified [here](https://blockscout.com/etc/mainnet/address/0x39856bb3305997ad7aca33f8b21a8af9b86b79f4/contracts)

all thats left now is to send the sweep transactions. For this I can run a node server. But it has to sign the transactions, and its very important to track which ones have been sent.

So - I need another json file that saves every x seconds, with the same data as final_data (input and num), but also contains the txhash of the tx that supposedly go mined.

when it starts it should check for the last transaction hash

Update. Instead i presigned all the transactions into a json file, so the script just moniters the txs in the mempool, and keeps adding the next ones as they get batched. The downside is that i cant change the gasprice without re-running the script


had to redo some of them because they reverted. The reason turned out to be when the seed started with `00` they were getting removed. Added padding to 64 bytes and created the finalData3 file (something like that). I also remade the existing txs with the fix so running process was fixed too

when its done, I can run through the tree (index.js) using `_findValueNodes` and pipe all the rest of the empties into a file `node index.js > empties.txt`. It will hopefulyl not be all that many left. Can check this with the "tally" function (show ratio of empty to non-empty). Once I have those, make another script to create transactions to the `snipe` contract located here: https://blockscout.com/etc/mainnet/address/0xae02e6d8aeed663b44e5f06f23d20c2d38835bb5/contracts

Then feed them into a variation of serve.js

doule check that they are gettting removed.

when its all done run through the entire tree again looking for empties!


3 transactions from the final snipe lookup that I removed from the list so during the conclusion check, we can make sure they are found (then I can delete them by hand):

"0xdf721dbcaaff45db71cebaba5f1f800347f9e9af", <- from about line  4,500 // this one! 
double keccak of it "0x7e1243e41fc0a825de21de65b3a654d79d7f4b60cbf3b962c4d77437f7584cf7"


"0xce3b5ffca16fff926c890f0885a3e90ceb89db0a", <- from about line 55,000
"0x4c8a93797ad151bb9c24a8d1ee2e89a094e76399", <- from about line 26,000




