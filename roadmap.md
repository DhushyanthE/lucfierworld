# Task roadmap

- [x] Leviathan Coin logo wired: CDN asset on the LVTH console header, resized favicon in place of the old external icon.
- [x] Security Testing Suite page (`/security-testing`): the eight industry categories (SAST, DAST, IAST, SCA, vulnerability scanners, penetration testing, security auditing, mobile appsec) mapped to what actually runs here, plus a real same-origin DAST baseline probe (HTTP security headers + transport).
- [x] Sepolia faucet panel wired into the LVTH wallet tab: copies the address, opens Google Cloud / Alchemy / QuickNode / Infura / PoW faucets, balance re-check button.
- [x] Fresh `agent-openai` edge function on the owner's OpenAI key (read-only tools, session-gated); `/agent` console switched to it.
- [ ] Verify a real OpenAI answer through `agent-openai` after the user signs into an app account (no auth user matches their email yet; sign-in required).
- [ ] Send authenticated Sentinel telemetry and verify the durable audit row (SHA3-512 digest + ML-DSA-87 signature) after the user signs into an app account.
- [ ] Deploy LeviathanCoin on Sepolia once the wallet holds test ETH (currently 0 ETH); the exchange/swap functions already exist in the contract and `/market` + swap panel already read live price/volume — they go live automatically after deployment.
- [ ] Lovable editor/project-creation incident is platform-side and cannot be repaired from this project.
