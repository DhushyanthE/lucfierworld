import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import solc from "solc";
import { ethers } from "ethers";

const rpcUrl = process.env.EVM_RPC_URL?.trim();
const privateKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();
if (!rpcUrl) throw new Error("EVM_RPC_URL is required");
if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY is required");
if (!/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) throw new Error("DEPLOYER_PRIVATE_KEY must be a 32-byte hex key");

const provider = new ethers.JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (network.chainId !== 11155111n) {
  throw new Error(`Refusing deployment: expected Sepolia chain 11155111, got ${network.chainId}`);
}

const wallet = new ethers.Wallet(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`, provider);
const balanceBefore = await provider.getBalance(wallet.address);
if (balanceBefore === 0n) throw new Error("Deployer wallet has zero Sepolia ETH");

const sourcePath = path.resolve("src/contracts/LeviathanCoin.sol");
const source = fs.readFileSync(sourcePath, "utf8");
const input = {
  language: "Solidity",
  sources: { "LeviathanCoin.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) throw new Error(errors.map((e) => e.formattedMessage).join("\n"));

const artifact = output.contracts["LeviathanCoin.sol"].LeviathanCoin;
const initialSupply = ethers.parseUnits(process.env.LVTH_INITIAL_SUPPLY ?? "1000000", 18);
const factory = new ethers.ContractFactory(artifact.abi, "0x" + artifact.evm.bytecode.object, wallet);
const contract = await factory.deploy(initialSupply);
const deploymentTx = contract.deploymentTransaction();
await contract.waitForDeployment();
const address = await contract.getAddress();

let liquidityTx = null;
const liquidityEth = process.env.LVTH_INITIAL_LIQUIDITY_ETH?.trim();
const liquidityLvth = process.env.LVTH_INITIAL_LIQUIDITY_LVTH?.trim();
if (liquidityEth && liquidityLvth) {
  const tx = await contract.addLiquidity(
    ethers.parseUnits(liquidityLvth, 18),
    { value: ethers.parseEther(liquidityEth) },
  );
  const receipt = await tx.wait();
  liquidityTx = receipt?.hash ?? tx.hash;
}

let smokeSwapTx = null;
let smokeSwapLvthOut = null;
const smokeSwapEth = process.env.LVTH_SMOKE_SWAP_ETH?.trim();
if (smokeSwapEth) {
  const ethIn = ethers.parseEther(smokeSwapEth);
  const quoted = await contract.quoteEthForLvth(ethIn);
  if (quoted <= 0n) throw new Error("Smoke swap quote is zero; seed liquidity first");
  const minOut = (quoted * 9900n) / 10000n;
  const tx = await contract.swapEthForLvth(minOut, { value: ethIn });
  const receipt = await tx.wait();
  smokeSwapTx = receipt?.hash ?? tx.hash;
  smokeSwapLvthOut = ethers.formatUnits(quoted, 18);
}

const balanceAfter = await provider.getBalance(wallet.address);
const result = {
  network: "sepolia",
  chain_id: Number(network.chainId),
  deployer: wallet.address,
  deployer_balance_before_eth: ethers.formatEther(balanceBefore),
  deployer_balance_after_eth: ethers.formatEther(balanceAfter),
  contract: address,
  deployment_tx: deploymentTx?.hash ?? null,
  initial_supply_lvth: ethers.formatUnits(initialSupply, 18),
  initial_liquidity_tx: liquidityTx,
  initial_liquidity_eth: liquidityEth ?? null,
  initial_liquidity_lvth: liquidityLvth ?? null,
  smoke_swap_eth: smokeSwapEth ?? null,
  smoke_swap_lvth_quote: smokeSwapLvthOut,
  smoke_swap_tx: smokeSwapTx,
};

fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync("artifacts/leviathan-sepolia.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
