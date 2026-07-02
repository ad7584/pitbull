# LP fork test — execute the deposit against real pool state, no real money

The $ANSEM PumpSwap pool is mainnet-only, so the LP deposit can't run on devnet.
To *execute* (not just simulate) it safely, run a **local mainnet fork** that
clones the real program + pool accounts, fund a throwaway keeper with the
validator's airdrop, and run the deposit against localhost. Nothing touches
mainnet; the SOL is fake fork SOL.

## 1. Clone the pool + program into a local validator

```bash
# addresses (verified):
POOL=FnzKY6x7entQ1eR3D225dQyT7ybfka4PskBMQhb8L3CC
PROG=pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA        # PumpSwap AMM
T22=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb          # Token-2022 (base is T22)
ANSEM=9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump
WSOL=So11111111111111111111111111111111111111112
LPMINT=CevNeicTXqL1oAjqZ3FNmexftzKD4ozqev5DgX2sAgFq

# fetch the pool's base/quote token accounts + global config from `node src/lp-inspect.mjs`
# (add prints for pool.poolBaseTokenAccount / poolQuoteTokenAccount / globalConfig),
# then clone everything:
solana-test-validator --reset --url mainnet-beta \
  --clone-upgradeable-program $PROG \
  --clone-upgradeable-program $T22 \
  --clone $POOL --clone $ANSEM --clone $WSOL --clone $LPMINT \
  --clone <POOL_BASE_TOKEN_ACCOUNT> --clone <POOL_QUOTE_TOKEN_ACCOUNT> \
  --clone <GLOBAL_CONFIG_PDA>
```

## 2. Point the engine at the fork + fund the keeper

```bash
export LP_MAINNET_RPC_URL=http://127.0.0.1:8899
solana airdrop 50 <KEEPER_PUBKEY> --url http://127.0.0.1:8899
```

## 3. Execute the real deposit against the fork

Temporarily set `LP_LIVE_ENABLED=true` **against the fork RPC only**, then call
`provideLiquidity(keeper, ansemAmount, { live: true })` (or the buy→deposit flow
in `provideLiquidityFromSol`). Assert LP tokens are minted to the keeper and
`refreshLpValue()` writes a sane `lp_value_lamports`.

## 4. Only after a clean fork test
Independent audit → tiny **staged** mainnet run (e.g. 0.1 SOL) with keys in a
KMS/multisig → then, consciously, enable on mainnet. Never before.
