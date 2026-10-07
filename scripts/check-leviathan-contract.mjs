import fs from "node:fs";
import solc from "solc";

const source = fs.readFileSync("src/contracts/LeviathanCoin.sol", "utf8");
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
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}

const artifact = output.contracts?.["LeviathanCoin.sol"]?.LeviathanCoin;
if (!artifact?.evm?.bytecode?.object) throw new Error("LeviathanCoin bytecode missing");

const functions = new Set(
  artifact.abi.filter((x) => x.type === "function").map((x) => x.name),
);
for (const name of [
  "addLiquidity",
  "removeLiquidity",
  "swapEthForLvth",
  "swapLvthForEth",
  "quoteEthForLvth",
  "quoteLvthForEth",
  "spotPriceWeiPerLvth",
  "poolEthReserve",
  "poolLvthReserve",
  "cumulativeEthVolumeWei",
  "cumulativeLvthVolumeWei",
]) {
  if (!functions.has(name)) throw new Error(`ABI missing ${name}`);
}

const events = new Set(
  artifact.abi.filter((x) => x.type === "event").map((x) => x.name),
);
for (const name of ["Swap", "LiquidityAdded", "LiquidityRemoved"]) {
  if (!events.has(name)) throw new Error(`ABI missing event ${name}`);
}

console.log(`LeviathanCoin compile OK: ${artifact.evm.bytecode.object.length / 2} byte bytecode`);
