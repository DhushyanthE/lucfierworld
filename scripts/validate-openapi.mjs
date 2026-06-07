#!/usr/bin/env node
/**
 * Validates public/openapi/admin.json against the OpenAPI 3.1 schema.
 * Fails (exit 1) on any structural or schema violation so CI blocks merges.
 *
 * Uses @apidevtools/swagger-parser, which validates against the OpenAPI 3.1
 * JSON Schema (and the embedded JSON Schema draft 2020-12) plus reference
 * resolution and structural rules.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = resolve(__dirname, "../public/openapi/admin.json");

// Cheap pre-checks so we get a clear error before pulling in the validator.
let spec;
try {
  spec = JSON.parse(readFileSync(specPath, "utf8"));
} catch (err) {
  console.error(`❌ Could not read/parse ${specPath}: ${err.message}`);
  process.exit(1);
}

if (!spec.openapi || !/^3\.1\./.test(spec.openapi)) {
  console.error(`❌ Expected openapi: "3.1.x", got: ${JSON.stringify(spec.openapi)}`);
  process.exit(1);
}

let SwaggerParser;
try {
  ({ default: SwaggerParser } = await import("@apidevtools/swagger-parser"));
} catch {
  console.error(
    "❌ @apidevtools/swagger-parser is not installed.\n" +
      "   Run: npm install --save-dev @apidevtools/swagger-parser",
  );
  process.exit(1);
}

try {
  await SwaggerParser.validate(specPath);
  console.log(`✅ ${specPath} is a valid OpenAPI ${spec.openapi} document`);
} catch (err) {
  console.error("❌ OpenAPI validation failed:");
  console.error(err.message);
  process.exit(1);
}
