# LeviathanCoin Sepolia live deployment

This path deploys the real `LeviathanCoin` ERC-20 plus its embedded LVTH/ETH
constant-product exchange to Ethereum Sepolia. The application backend remains
read-only: it never receives or derives a wallet private key.

## Security boundaries

- `SEPOLIA_PRIVATE_KEY` is used only by the deployment process.
- Never put a private key in Vite variables, Supabase Edge Function variables,
  source code, logs, chat, or browser storage.
- The deployed Edge Function receives only `LEVIATHAN_DEPLOYER_ADDRESS`,
  `LEVIATHAN_CONTRACT_ADDRESS`, and a read-only-capable RPC URL.
- Browser transfers and swaps are signed by the user's wallet with
  `eth_sendTransaction`.
- The backend chain reader only uses `eth_call`, `eth_getLogs`,
  `eth_getBalance`, `eth_chainId`, and `eth_blockNumber`.

## Required deployment environment

For local or GitHub environment `sepolia`:

```text
SEPOLIA_RPC_URL=<Sepolia HTTPS RPC>
SEPOLIA_PRIVATE_KEY=<deployment signer secret>
LEVIATHAN_INITIAL_SUPPLY=1000000
LEVIATHAN_INITIAL_LIQUIDITY_LVTH=<optional>
LEVIATHAN_INITIAL_LIQUIDITY_ETH=<optional>
```

For the deployed `leviathan-chain` Edge Function after deployment:

```text
EVM_RPC_URL=<Sepolia HTTPS RPC>
LEVIATHAN_DEPLOYER_ADDRESS=<public 0x address>
LEVIATHAN_CONTRACT_ADDRESS=<deployed public 0x address>
SEPOLIA_EXPLORER_BASE_URL=https://sepolia.etherscan.io
```

## Validate before deployment

```bash
npm ci
npm run contract:compile

LEVIATHAN_DEPLOYER_ADDRESS=0x... \
SEPOLIA_RPC_URL=https://... \
npm run wallet:sepolia
```

The wallet check refuses every network except chain ID `11155111`.

## Deploy

```bash
SEPOLIA_RPC_URL=https://... \
SEPOLIA_PRIVATE_KEY=... \
LEVIATHAN_INITIAL_SUPPLY=1000000 \
LEVIATHAN_INITIAL_LIQUIDITY_LVTH=100000 \
LEVIATHAN_INITIAL_LIQUIDITY_ETH=1 \
npm run deploy:sepolia
```

The script prints the deployer address, Sepolia balance before/after deployment,
contract address, deployment transaction, explorer URL, and optional liquidity
transaction. Copy only the public addresses into the Edge Function environment.

GitHub Actions also exposes the same operation through the protected
`leviathan-live` workflow's manual dispatch. Store the RPC URL and private key
as environment secrets.

## Exchange

The token contract provides:

- `addLiquidity(maxLvthAmount, minShares)`
- `removeLiquidity(shares, minLvthOut, minEthOut)`
- `swapExactETHForLVTH(minLvthOut, deadline)`
- `swapExactLVTHForETH(lvthIn, minEthOut, deadline)`
- `marketState()`

The AMM charges 0.30%. Swaps include minimum-output slippage protection and a
deadline. The contract publishes `Swap`, `LiquidityAdded`, and
`LiquidityRemoved` events.

## Application wiring

The public read-only Edge Function exposes:

- `GET /leviathan-chain/wallet` — configured deployer public address and Sepolia ETH balance.
- `GET /leviathan-chain/state?address=0x...` — token/PoDS state and optional holder balance.
- `GET /leviathan-chain/market` — reserves, spot price, cumulative LVTH/ETH volume.
- `GET /leviathan-chain/trades` — recent Swap logs.
- `GET /leviathan-chain/attestations` — recent accepted attestation logs.

The `/wallet`, `/network-explorer`, `/crypto-market`, and `/leviathan`
views consume those live endpoints. Simulation-only explorer content is labeled
as simulation and is kept separate from Sepolia data.
