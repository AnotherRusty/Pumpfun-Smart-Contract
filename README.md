# pumpfun fork program

## Setup

Only needed once per chain

## Deployment

Program is deployed

## Config

Call the `configure` instruction to set the config for the program +
Sets the fee amounts and allowed launch parameters.

## Prerequites

Install Rust, Solana, and AVM: https://solana.com/docs/intro/installation

Remember to install anchor v0.30.1.

## Quick Start

### Build the program

```bash
# build the program
anchor run build

# For those who use a different CARGO_TARGET_DIR location (like me I used ${userHome}/.cargo/target)
# then you'll need to move the <program-name>.so back to $PWD/target/deploy/<program-name.so>.

# E.g:
ln -s $HOME/.cargo/target/sbf-solana-solana/release/pumpfun.so $PWD/target/deploy/pumpfun.so
```

### Test program on devnet

Set the cluster as devnet in `Anchor.toml`:
```bash
[provider]
cluster = "<DEVNET_RPC>"
```

Deploy program:
```bash
anchor deploy
```

#### Use CLI to test the program

Initialize program:
```bash
yarn script config
```

Launch a token:
```bash
yarn script launch
```

Add Whitelist
```bash
yarn script addWl
```

Swap SOL for token:
```bash
yarn script swap -t <TOKEN_MINT> -a <SWAP_AMOUNT> -s <SWAP_DIRECTION>
```
`TOKEN_MINT`: You can get token mint when you launch a token
`SWAP_AMOUNT`: SOL/Token amount to swap
`SWAP_DIRECTION`: 0 - Buy token, 1 - Sell token

### Test program on MainNet
#### Use CLI to test the program 
Migrate token to raydium once the curve is completed:
```bash
yarn script migrate -t <TOKEN_MINT>
```
`TOKEN_MINT`: mint address of the token to be launched on the raydium
