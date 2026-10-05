import { ethers } from "ethers";
import { compileLeviathan } from "./lib/compileLeviathan.mjs";

const rpc = process.env.SEPOLIA_RPC_URL || process.env.EVM_RPC_URL;
const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
if (!rpc) throw new Error("SEPOLIA_RPC_URL or EVM_RPC_URL is required");
if (!privateKey) throw new Error("SEPOLIA_PRIVATE_KEY is required in the local/deployment environment; never commit it");

const provider = new ethers.JsonRpcProvider(rpc);
const network = await provider.getNetwork();
if (network.chainId !== 11155111n) throw new Error(`refusing deployment: expected Sepolia 11155111, got ${network.chainId}`);

const wallet = new ethers.Wallet(privateKey, provider);
const balanceBefore = await provider.getBalance(wallet.address);
if (balanceBefore === 0n) throw new Error(`deployer ${wallet.address} has zero Sepolia ETH`);

const { abi, bytecode } = compileLeviathan();
const initialSupply = ethers.parseUnits(process.env.LEVIATHAN_INITIAL_SUPPLY || "1000000", 18);
const factory = new ethers.ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy(initialSupply);
const deploymentTx = contract.deploymentTransaction();
await contract.waitForDeployment();
const address = await contract.getAddress();

let liquidity = null;
const lvth = process.env.LEVIATHAN_INITIAL_LIQUIDITY_LVTH;
const eth = process.env.LEVIATHAN_INITIAL_LIQUIDITY_ETH;
if (lvth && eth && Number(lvth) > 0 && Number(eth) > 0) {
  const tokenAmount = ethers.parseUnits(lvth, 18);
  const ethAmount = ethers.parseEther(eth);
  const tx = await contract.addLiquidity(tokenAmount, 0, { value: ethAmount });
  const receipt = await tx.wait();
  liquidity = { lvth, eth, tx_hash: receipt.hash };
}

const balanceAfter = await provider.getBalance(wallet.address);
console.log(JSON.stringify({
  network: "sepolia",
  chain_id: 11155111,
  deployer: wallet.address,
  deployer_balance_before_eth: ethers.formatEther(balanceBefore),
  deployer_balance_after_eth: ethers.formatEther(balanceAfter),
  contract: address,
  deployment_tx: deploymentTx?.hash ?? null,
  explorer_url: `https://sepolia.etherscan.io/address/${address}`,
  liquidity,
  configure: {
    LEVIATHAN_DEPLOYER_ADDRESS: wallet.address,
    LEVIATHAN_CONTRACT_ADDRESS: address
  }
}, null, 2));
