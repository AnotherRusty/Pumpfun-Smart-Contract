# Pumpfun smart contract fork implementing all main functionalities
This repo gives basic understanding on the pumpfun(pump.fun) smart contracts. To get the full codebase of smart contracts, you can contact me in my profile.

## USAFun(Original pumpfun smart contract forking)
The following video shows how USAFun smart contract works. The USAFun smart contract is built by forking original pumpfun smart contract and adding its own features

## How Works
### 1. Administrative Roles

- Sets initial parameters(usafun config) and whitelist
- Can Modify protocol parameters
- Controls whitelist status
- Fee recipient
### 2. Bonding Curve Mechanism
The protocol implements a constant product bonding curve (x * y = k).

```
TEST_DECIMALS = 6;
TEST_CURVE_LIMIT_LAMPORT = 4_000_000_000;
TEST_VIRTUAL_RESERVES_LAMPORT = 2_000_000_000;
TEST_RESERVE_TOKEN = 950_000_000_000;
TEST_TOKEN_SUPPLY = 1_000_000_000_000;
```

The bonding curve ensures price discovery and continuous liquidity for the token.
### 3. Create a  Bonding Curve

- Initialize curve parameters
- Enable whitelist
- Configure initial purchases

### 4. Fee structure

The fee rate is 1%(customizable) and it is taken for all the trades before and after the curve by the admin wallet
 
### 5. Migration

Migration is a critical process that occurs once the bonding curve has been completed and the tokens are empty. 

People buy on the bonding curve and the market cap is growing. Once it reaches a market cap of $100k, the smart contract runs a CPI (Cross-Program Invocation) call to create a Raydium AMM.

## Some Transactions Link
### 1. Created Coin Address:
  - https://solscan.io/token/F3VijpV5wpDAcG4LtDjDyoz3DEagRnoMSnVdCPpCUMYg?cluster=devnet
### 2. Bonding Curve:
  - https://solscan.io/tx/eQ1bUPFunyQVScsiHsd2Q6ktYf3bTgPkxEGSxBxpsDawnay38MW8w1UPJ37KUnLRqHpQv5i77HN9eRZBLFZL9Lh?cluster=custom&customUrl=https://devnet.helius-rpc.com/?api-key=7387c4ee-fe6a-43a6-96ea-05e6534aa500
### 3. Bonding Curve PDA Address:
  - E2eDwJtbiXnnTnD1S3H6ESxCxZS6MamWhv45cB6uKXiX
### 4. Swap Tx
  - https://solscan.io/tx/3z9puJ6Jcum1iQ9eA5q6hxoaVAKyKGkFFJuwqBjcrmgrA6xbpiLxwB5GDpD3cD7Wzuo48NViAZKKT9u72N6QSxPS?cluster=devnet
### 5. Bonding Curve Reaching Tx
  - https://solscan.io/tx/2QtdKZrhYuwJtWrd7dhja8mnNqZSmR4qbpo9iSLnrhkZADF3zzm8DojYVisvVaiGAkgmoU4ocSyo65EewJkpjvNo?cluster=devnet
