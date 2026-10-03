// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * LeviathanCoin — the canonical on-chain token of the QuantumSynapse Fabric.
 *
 * SCOPE NOTE (deliberate, do not "fix" by inflating it): this is an ERC-20 on a
 * standard EVM chain plus a Proof-of-Neural-Work attestation registry. It is NOT
 * a new layer-1 blockchain. "Leviathan chain technology" in this project means
 * this contract set deployed on an EVM chain, not a bespoke consensus network —
 * inventing one would be unverifiable scope inflation.
 *
 * Attestations carry a CHSH/Bell score S. Governance requires 2.0 < S <= 2.828
 * (Tsirelson bound); anything outside that window is rejected on-chain, so a
 * classical (S <= 2) or physically impossible (S > 2*sqrt(2)) claim can never be
 * recorded, let alone minted against.
 */
contract LeviathanCoin {
    string public constant name = "LeviathanCoin";
    string public constant symbol = "LVTH";
    uint8 public constant decimals = 18;

    /// Bell score is stored in milli-units: 2.000 -> 2000, 2.828 -> 2828.
    uint32 public constant BELL_CLASSICAL_LIMIT_MILLI = 2000;
    uint32 public constant BELL_TSIRELSON_LIMIT_MILLI = 2828;

    /// Reward per accepted attestation, in wei-scale token units.
    uint256 public constant EPOCH_REWARD = 5e18;

    uint256 public totalSupply;
    address public immutable governor;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    struct Attestation {
        address prover;
        uint32 bellScoreMilli;
        uint64 epoch;
        bytes32 modelHash;
        uint256 blockNumber;
    }

    /// epoch => best accepted Bell score so far (must be beaten to be recorded).
    mapping(uint64 => uint32) public bestScoreMilli;
    Attestation[] private attestations;
    mapping(bytes32 => bool) public modelHashUsed;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AttestationAccepted(
        address indexed prover,
        uint64 indexed epoch,
        uint32 bellScoreMilli,
        bytes32 modelHash,
        uint256 reward
    );
    event AttestationRejected(address indexed prover, uint64 indexed epoch, string reason);

    error NotGovernor();
    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();

    constructor(uint256 initialSupply) {
        governor = msg.sender;
        if (initialSupply > 0) {
            totalSupply = initialSupply;
            balanceOf[msg.sender] = initialSupply;
            emit Transfer(address(0), msg.sender, initialSupply);
        }
    }

    // --- ERC-20 -------------------------------------------------------------

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < value) revert InsufficientAllowance();
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - value;
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) private {
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = balanceOf[from];
        if (bal < value) revert InsufficientBalance();
        balanceOf[from] = bal - value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    // --- Proof-of-Neural-Work attestations ----------------------------------

    /**
     * Records a quantum attestation and mints the epoch reward when it is valid.
     * Reverts on invalid input rather than silently emitting a rejection, so a
     * caller can never mistake a failed submission for an accepted one.
     */
    function submitAttestation(uint64 epoch, uint32 bellScoreMilli, bytes32 modelHash)
        external
        returns (uint256 attestationId)
    {
        require(bellScoreMilli > BELL_CLASSICAL_LIMIT_MILLI, "bell: not better than classical");
        require(bellScoreMilli <= BELL_TSIRELSON_LIMIT_MILLI, "bell: above Tsirelson bound");
        require(modelHash != bytes32(0), "model hash required");
        require(!modelHashUsed[modelHash], "model already attested");
        require(bellScoreMilli > bestScoreMilli[epoch], "must beat network best");

        modelHashUsed[modelHash] = true;
        bestScoreMilli[epoch] = bellScoreMilli;

        attestationId = attestations.length;
        attestations.push(
            Attestation({
                prover: msg.sender,
                bellScoreMilli: bellScoreMilli,
                epoch: epoch,
                modelHash: modelHash,
                blockNumber: block.number
            })
        );

        totalSupply += EPOCH_REWARD;
        balanceOf[msg.sender] += EPOCH_REWARD;
        emit Transfer(address(0), msg.sender, EPOCH_REWARD);
        emit AttestationAccepted(msg.sender, epoch, bellScoreMilli, modelHash, EPOCH_REWARD);
    }

    function attestationCount() external view returns (uint256) {
        return attestations.length;
    }

    function attestationAt(uint256 id) external view returns (Attestation memory) {
        require(id < attestations.length, "no such attestation");
        return attestations[id];
    }

    /// Read-only helper the indexer/agent layer calls; never mutates state.
    function isScoreAcceptable(uint32 bellScoreMilli) external pure returns (bool) {
        return bellScoreMilli > BELL_CLASSICAL_LIMIT_MILLI
            && bellScoreMilli <= BELL_TSIRELSON_LIMIT_MILLI;
    }

    // --- Proof of Dharmic State (PoDS) --------------------------------------
    // score = bellGate(S) * reputation * stakeWeight. Mirrors
    // supabase/functions/_shared/dharmic.ts. Reputation/score are milli-units.

    mapping(address => uint256) public stakeOf;
    mapping(address => uint32) public reputationMilli; // 0..2000, default 1000 on first stake
    mapping(address => uint32) public slashCount;
    uint256 public dharmicRound;
    uint256 public dharmicBestMilli;
    uint256 public validatorCount;

    struct DharmicRecord {
        uint256 round;
        address leader;
        uint256 scoreMilli;
        bytes32 payloadDigest;
        bytes32 previousRoundHash;
        bytes32 roundHash;
        uint32 acceptVotes;
        uint32 cells;
        uint256 timestamp;
    }

    mapping(uint256 => DharmicRecord) private dharmicRecords;
    bytes32 public dharmicHead;

    event Staked(address indexed cell, uint256 amount);
    event DharmicRoundFinalized(
        uint256 indexed round,
        address indexed leader,
        uint256 scoreMilli,
        bytes32 indexed payloadDigest,
        bytes32 previousRoundHash,
        bytes32 roundHash,
        uint32 acceptVotes,
        uint32 cells,
        uint256 timestamp
    );
    event CellSlashed(address indexed cell, uint32 slashes);

    function stake(uint256 amount) external {
        _transfer(msg.sender, address(this), amount);
        if (stakeOf[msg.sender] == 0) { reputationMilli[msg.sender] = 1000; validatorCount++; }
        stakeOf[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    /**
     * Governor finalizes a round after off-chain cells have verified the
     * leader's ML-DSA-87 signature. On-chain checks: Bell bounds, > 2/3 quorum,
     * strictly beats network best.
     */
    function finalizeDharmicRound(
        address leader,
        uint32 bellScoreMilli,
        uint32 acceptVotes,
        uint32 cells,
        uint256 scoreMilli,
        bytes32 payloadDigest,
        bytes32 previousRoundHash
    ) external {
        if (msg.sender != governor) revert NotGovernor();
        require(stakeOf[leader] > 0, "leader not staked");
        require(cells > 0 && uint256(acceptVotes) * 3 > uint256(cells) * 2, "strict quorum not met");
        require(payloadDigest != bytes32(0), "payload digest required");
        require(previousRoundHash == dharmicHead, "round link mismatch");

        if (bellScoreMilli <= BELL_CLASSICAL_LIMIT_MILLI || bellScoreMilli > BELL_TSIRELSON_LIMIT_MILLI) {
            slashCount[leader] += 1;
            reputationMilli[leader] = reputationMilli[leader] > 200 ? reputationMilli[leader] - 200 : 0;
            emit CellSlashed(leader, slashCount[leader]);
            return;
        }

        require(scoreMilli > dharmicBestMilli, "must beat network best");

        uint256 nextRound = dharmicRound + 1;
        bytes32 roundHash = keccak256(
            abi.encode(nextRound, leader, scoreMilli, payloadDigest, previousRoundHash, acceptVotes, cells)
        );

        dharmicRound = nextRound;
        dharmicBestMilli = scoreMilli;
        dharmicHead = roundHash;
        dharmicRecords[nextRound] = DharmicRecord({
            round: nextRound,
            leader: leader,
            scoreMilli: scoreMilli,
            payloadDigest: payloadDigest,
            previousRoundHash: previousRoundHash,
            roundHash: roundHash,
            acceptVotes: acceptVotes,
            cells: cells,
            timestamp: block.timestamp
        });

        uint32 rep = reputationMilli[leader] + 50;
        reputationMilli[leader] = rep > 2000 ? 2000 : rep;

        emit DharmicRoundFinalized(
            nextRound,
            leader,
            scoreMilli,
            payloadDigest,
            previousRoundHash,
            roundHash,
            acceptVotes,
            cells,
            block.timestamp
        );
    }

    function dharmicRecordAt(uint256 round) external view returns (DharmicRecord memory) {
        require(round > 0 && round <= dharmicRound, "no such round");
        return dharmicRecords[round];
    }
}
