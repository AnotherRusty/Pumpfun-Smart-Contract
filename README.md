# Pumpfun Smart Contract Forking(USAFUN Smart Contract)
The Pump.fun Smart Contract Fork is an innovative platform that enables users to create tokens, markets, and liquidity pools on Raydium/Meteora. Building upon the core features of Pump.fun, this enhanced project offers additional capabilities for managing token authorities, customizing token properties, setting up whitelists, and handling liquidity pools with advanced functionality.

## Overview


https://github.com/user-attachments/assets/22761493-1a8a-42bf-97f1-8e747381af1f



## How Works
1. Administrative Roles

- Sets initial parameters(usafun config) and whitelist
- Can Modify protocol parameters
- Controls whitelist status
- Fee recipient
2. Bonding Curve Mechanism
The protocol implements a constant product bonding curve (x * y = k).

```
TEST_DECIMALS = 6;
TEST_CURVE_LIMIT_LAMPORT = 4_000_000_000;
TEST_VIRTUAL_RESERVES_LAMPORT = 2_000_000_000;
TEST_RESERVE_TOKEN = 950_000_000_000;
TEST_TOKEN_SUPPLY = 1_000_000_000_000;
```

The bonding curve ensures price discovery and continuous liquidity for the token.
3. Create a  Bonding Curve

- Initialize curve parameters
- Enable whitelist
- Configure initial purchases

4. Fee structure

The fee rate is 1%(customizable) and it is taken for all the trades before and after the curve by the admin wallet
 
5. Migration

Migration is a critical process that occurs once the bonding curve has been completed and the tokens are empty. 

People buy on the bonding curve and the market cap is growing. Once it reaches a market cap of $100k, the smart contract runs a CPI (Cross-Program Invocation) call to create a Raydium AMM.

## Some Transactions Link
1. Created Coin Address:
https://solscan.io/token/F3VijpV5wpDAcG4LtDjDyoz3DEagRnoMSnVdCPpCUMYg?cluster=devnet
2. Bonding Curve:
- https://solscan.io/tx/eQ1bUPFunyQVScsiHsd2Q6ktYf3bTgPkxEGSxBxpsDawnay38MW8w1UPJ37KUnLRqHpQv5i77HN9eRZBLFZL9Lh?cluster=custom&customUrl=https://devnet.helius-rpc.com/?api-key=7387c4ee-fe6a-43a6-96ea-05e6534aa500
3. Bonding Curve PDA Address:
- E2eDwJtbiXnnTnD1S3H6ESxCxZS6MamWhv45cB6uKXiX


## Contact
Telegram: @idioRusty
Feel free to reach out if you need the full source code (smart contract, backend, and frontend) or have any other questions.
