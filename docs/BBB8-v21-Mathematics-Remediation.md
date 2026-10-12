# QuantumSynapse BBB8 v21 — Mathematics, Failure Map, and Remediation

Status: **local research software, implemented and testable**. This document
describes the mathematics actually executed by the BBB8 v21 code in
`quantum-core/`. Proposed formulas from research notes are labelled
separately and are not silently treated as implemented.

## Eight-stage executable flow

```text
POST /v1/fabric/run
        |
        v
1 Bell sampling
        |
        v
2 QBER channel gate
        |
        v
3 Local feature/QML decision
        |
        v
4 Policy orchestration
        |
        v
5 Domain-separated SHA3-512
        |
        v
6 ML-DSA / ML-KEM / AES-GCM
        |
        v
7 Distinct 6-of-9 signed software-cell certificate
        |
        v
8 Atomic SQLite ledger + signed outcome + checkpoint
```

## 1. Bell state and sampling

The ideal simulated source is the Bell state

[
|Phi^+angle = rac{|00angle + |11angle}{sqrt 2}.
]

For Alice basis (A) and Bob basis (B),

[
P(a,b|A,B)=
egin{cases}
1/2 & A=B, a=b,\
0 & A=B, a
e b,\
1/4 & A
e B.
end{cases}
]

The implementation is a classical probability simulation of a BBM92-like
entanglement experiment. It is not a photonic link or physical QKD system.

### Legacy entangled-optimizer regression

The corrected historical state family is

[
|psi(	heta)angle
= cos(	heta/2)|0ldots0angle
- isin(	heta/2)|1ldots1angle.
]

At (	heta=pi/2), both amplitudes have magnitude (1/sqrt2), so a
single-qubit reduced density matrix is maximally mixed and has purity (1/2).
At (	heta=pi), only the (|1ldots1angle) amplitude remains, so the
state is a product state and reduced purity is 1.

The regression tests use the same little-endian convention as the engine:
qubit (q) maps to integer bit (2^q). No manual bit reversal is permitted.

## 2. Sifting and QBER channel gate

Let (n_s) be the number of sampled sifted positions and (m) the number of
mismatches. The estimator is

[
widehat Q = rac{m}{n_s}.
]

The software gate uses the IID diagnostic

[
Q_{upper}
= minleft(
1,
widehat Q + sqrt{rac{ln(100)}{2n_s}}
ight).
]

The channel is accepted only when:

[
n_s ge 128
land
n_{remaining} ge 128
land
Q_{upper} < 0.11.
]

The code always returns:

- `iid_only = true`
- `finite_key_secure = false`

because this calculation does **not** implement a composable finite-key
security proof, authenticated classical-channel reconciliation, leakage
accounting, or privacy amplification.

For a random-basis intercept/resend Eve, the simplified model has 0 error when
Eve chose the matching basis and 50% error when she chose the wrong basis.
Since the two cases occur with equal probability,

[
QBER_{Eve}
= rac12(0)+rac12left(rac12ight)
= rac14
= 25%.
]

The seeded tests accept a statistical band around 25%, not an exact sample
value.

## 3. Local feature extraction and QML decision

The implemented telemetry features are:

[
mu = rac1nsum_i t_i,
]

[
range = max_i t_i-min_i t_i,
]

[
Delta_{max}
= max_i |t_i-t_{i-1}|.
]

For an optional grayscale matrix (G),

[
image_mean = rac{1}{|G|}sum G_{ij},
]

[
image_contrast = max G_{ij}-min G_{ij}.
]

The current code uses the conservative maximum

[
r =
max(
mu,
range,
Delta_{max},
image_mean,
image_contrast,
declared_risk
).
]

A newer research note proposes a weighted (0.40/0.35/0.25) feature score.
That weighted formula is **not** the algorithm currently executed by v21 and
is therefore not represented as implemented.

The scalar is mapped to

[
x = 2r-1.
]

The single-qubit model probability is

[
P_0(x;w,b)
= rac{1+cos(wx+b)}{2}.
]

The conservative effective risk is

[
r_{eff} = max(r,P_0).
]

Decision:

[
decision =
egin{cases}
reject & r_{eff}ge0.80,\
review & 0.45le r_{eff}<0.80,\
approve & r_{eff}<0.45.
end{cases}
]

### Parameter-shift gradient

Writing (phi=wx+b),

[
rac{partial P}{partial phi}
=
rac{P(phi+pi/2)-P(phi-pi/2)}{2}.
]

The chain rule is required for (w):

[
rac{partial P}{partial w}
=
xrac{partial P}{partialphi},
qquad
rac{partial P}{partial b}
=
rac{partial P}{partialphi}.
]

A regression test compares both gradients against finite differences.

## 4. Policy orchestration

A request can commit only when all hard gates pass:

[
PolicyApprove =
ChannelPass
land
DecisionApprove
land
CryptoAllowed.
]

A channel failure is always a rejection. A valid high-risk decision is
`review` or `reject` and cannot be overridden by consensus.

## 5. Canonical digest

For canonical JSON (J(P)) and a domain prefix (D),

[
h
=
SHA3	ext{-}512(D | J(P)).
]

Canonicalization is deterministic Python JSON with sorted keys and compact
separators. It is versioned and deterministic inside this implementation; it is
not claimed to be RFC 8785 canonical JSON.

Different domains are used for request, proposal, vote, outcome and block so a
signature from one semantic context cannot be reused as another.

## 6. PQC, confidentiality, and encrypted key custody

Proposal and vote signatures use

[
sigma
=
ML	ext{-}DSA	ext{-}87.Sign(sk,D|h).
]

The in-process confidentiality round trip uses

[
(ct,ss)
=
ML	ext{-}KEM	ext{-}1024.Encaps(pk),
]

[
K
=
HKDF	ext{-}SHA256(ss, context),
]

[
C
=
AES	ext{-}256	ext{-}GCM_K(nonce,plaintext,AAD).
]

When the PQC library is unavailable, the code exposes an explicit classical
test fallback. Normal service policy fails closed unless that fallback is
explicitly enabled for tests.

### v21 KeyVault

Signer private keys are no longer stored in the public `cells` table.

For cell identity (i), a 256-bit data-encryption key is derived from a
high-entropy deployment master secret (M):

[
K_i
=
HKDF	ext{-}SHA256(
M,
salt=	ext{"QSF/BBB8/v21/keyvault"},
info=	ext{"cell:"}|i
).
]

The private signer key is wrapped as

[
C_i
=
AES	ext{-}256	ext{-}GCM_{K_i}
(N_i,sk_i,AAD_i).
]

The AAD contains the same cell identity. Therefore moving ((N_i,C_i)) into a
different cell row causes authentication failure.

The master secret is not stored in SQLite. A secret manager, OS keyring, TPM,
HSM or equivalent custody mechanism is still required for production.

If a database with the old plaintext `cells.secret_key` schema is detected,
v21 refuses startup. It does not claim that dropping or overwriting a SQLite
column securely erases historical pages.

## 7. Six-of-nine signed software-cell certificate

Each vote binds the cell identity, network, height, prior head hash, proposal
digest, approval bit and policy version.

A block certificate is accepted only when:

[
DistinctValidApprovals ge 6.
]

Unknown identities, duplicate identities, invalid signatures, wrong network,
wrong height, wrong predecessor and wrong policy version are rejected.

This remains a single-host software-cell simulation; it is not nine
independently operated validators.

## 8. Atomic ledger commit

For a committed block (B_h),

[
Head_h
=
SHA3	ext{-}512(
D_{block}|J(B_h)
).
]

The next block must contain

[
B_{h+1}.prev_hash = Head_h.
]

SQLite uses `BEGIN IMMEDIATE` so ledger append and signed request-outcome
persistence are one transaction. Review, reject, channel failure, crypto
failure and missing quorum do not advance the ledger height.

Chain verification recomputes each stored block hash, checks height continuity,
checks predecessor linkage and re-verifies every stored certificate.

## External checkpoint

The service can export

[
Checkpoint=(network,height,head_hash).
]

Given a checkpoint obtained from an independently authenticated source, the
local verifier accepts it only if the local ledger contains the exact same hash
at that height. If the trusted checkpoint height is greater than the local
height, a rollback/restored-old-database condition is detected.

The checkpoint comparison does not authenticate the source by itself.

## Remediation map

| Issue | Failure | v21 status |
|---|---|---|
| 1 | Legacy test reversed little-endian indices | Regression test fixed |
| 2 | Wrong (	heta=pi) entanglement expectation | (pi/2) entangled, (pi) product tested |
| 3 | Pydantic/MCP dependency conflict | Pydantic >=2.12,<3 |
| 4 | SSE/Starlette dependency conflict | sse-starlette==3.0.3 |
| 5 | ES target / replaceAll mismatch | Current branch has no `replaceAll` use; TS build is enforced |
| 6 | QBER security boundary implicit | `iid_only=true`, `finite_key_secure=false` |
| 7 | Signer secret keys plaintext in SQLite | AES-GCM/HKDF KeyVault; old schema fails closed |
| 8 | Same ID + changed body ambiguity | Request digest conflict returns HTTP 409 |
| 9 | No external rollback checkpoint | Checkpoint export/verify + rollback test |
| 10 | No browser automation | Playwright lab tests |
| 11 | No BBB8 CI | Python + coverage + TS/build + Chromium workflow |
| 12 | No live RLS smoke test | Opt-in Supabase anonymous-boundary smoke test |

## Scientific/security boundary

Shor's algorithm threatens cryptosystems based on integer factorization and
discrete logarithms. It is not a general inverse for SHA3. Grover's algorithm
changes brute-force asymptotics for hashes and symmetric keys but does not make
SHA3-512, ML-DSA or ML-KEM automatically broken.

The Bell/QBER code is simulation. The nine cells are software identities on one
host. The local QML task is a narrow synthetic classifier, not AGI. Physical
QKD, independent validator operation, secure hardware custody and production
distributed deployment remain separate engineering work.
