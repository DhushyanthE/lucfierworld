import { ethers } from "ethers";

const rpc = process.env.SEPOLIA_RPC_URL || process.env.EVM_RPC_URL;
const address = process.env.LEVIATHAN_DEPLOYER_ADDRESS;
if (!rpc) throw new Error("SEPOLIA_RPC_URL or EVM_RPC_URL is required");
if (!address || !ethers.isAddress(address)) throw new Error("LEVIATHAN_DEPLOYER_ADDRESS must be a valid public address");

const provider = new ethers.JsonRpcProvider(rpc);
const network = await provider.getNetwork();
if (network.chainId !== 11155111n) throw new Error(`expected Sepolia chainId 11155111, got ${network.chainId}`);
const balance = await provider.getBalance(address);
console.log(JSON.stringify({
  network: "sepolia",
  chain_id: Number(network.chainId),
  address,
  balance_wei: balance.toString(),
  balance_eth: ethers.formatEther(balance),
  explorer_url: `https://sepolia.etherscan.io/address/${address}`
}, null, 2));
