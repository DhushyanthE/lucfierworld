import { compileLeviathan } from "./lib/compileLeviathan.mjs";

const { abi, bytecode } = compileLeviathan();
const functions = new Set(abi.filter((x) => x.type === "function").map((x) => x.name));
const required = [
  "transfer",
  "submitAttestation",
  "finalizeDharmicRound",
  "addLiquidity",
  "removeLiquidity",
  "swapExactETHForLVTH",
  "swapExactLVTHForETH",
  "marketState",
];
const missing = required.filter((name) => !functions.has(name));
if (missing.length) throw new Error(`LeviathanCoin ABI missing required functions: ${missing.join(", ")}`);

console.log(JSON.stringify({
  contract: "LeviathanCoin",
  abi_entries: abi.length,
  bytecode_bytes: (bytecode.length - 2) / 2,
  required_functions: required,
  status: "compiled"
}, null, 2));
