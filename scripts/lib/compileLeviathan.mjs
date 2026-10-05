import fs from "node:fs";
import solc from "solc";

export function compileLeviathan() {
  const source = fs.readFileSync(new URL("../../src/contracts/LeviathanCoin.sol", import.meta.url), "utf8");
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
  const contract = output.contracts?.["LeviathanCoin.sol"]?.LeviathanCoin;
  if (!contract?.evm?.bytecode?.object) throw new Error("LeviathanCoin bytecode missing");
  return { abi: contract.abi, bytecode: "0x" + contract.evm.bytecode.object };
}
