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
}
