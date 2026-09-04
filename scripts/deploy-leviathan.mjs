/**
 * Compiles and deploys src/contracts/LeviathanCoin.sol to a real EVM chain.
 *
 * Requires two environment variables:
 *   EVM_RPC_URL             an HTTP JSON-RPC endpoint (e.g. a Sepolia endpoint)
 *   DEPLOYER_PRIVATE_KEY    a funded key on that chain (test funds only)
 *
 * Prints the deployed address. It never logs the key. Run with:
 *   EVM_RPC_URL=... DEPLOYER_PRIVATE_KEY=... node scripts/deploy-leviathan.mjs
 */
import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { ethers } from "ethers";

const rpcUrl = process.env.EVM_RPC_URL?.trim();
const key = process.env.DEPLOYER_PRIVATE_KEY?.trim();
if (!rpcUrl) throw new Error("EVM_RPC_URL is required");
if (!key) throw new Error("DEPLOYER_PRIVATE_KEY is required (funded test key)");

const file = "LeviathanCoin.sol";
const source = fs.readFileSync(path.join("src/contracts", file), "utf8");

const out = JSON.parse(
  solc.compile(
    JSON.stringify({
      language: "Solidity",
      sources: { [file]: { content: source } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      },
    }),
  ),
);

const fatal = (out.errors ?? []).filter((e) => e.severity === "error");
if (fatal.length) {
  throw new Error("compilation failed:\n" + fatal.map((e) => e.formattedMessage).join("\n"));
}

const artifact = out.contracts[file].LeviathanCoin;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(key, provider);

const network = await provider.getNetwork();
const balance = await provider.getBalance(wallet.address);
console.log(`chain id ${network.chainId}, deployer ${wallet.address}, balance ${ethers.formatEther(balance)} ETH`);
if (balance === 0n) throw new Error("deployer has no funds on this chain — fund it first");

const factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);
// 1,000,000 LVTH premint to the deployer/governor.
const contract = await factory.deploy(ethers.parseUnits("1000000", 18));
console.log("deploy tx:", contract.deploymentTransaction()?.hash);
await contract.waitForDeployment();
const address = await contract.getAddress();

console.log("LEVIATHAN_CONTRACT_ADDRESS=" + address);
console.log("totalSupply:", (await contract.totalSupply()).toString());
console.log("attestationCount:", (await contract.attestationCount()).toString());
