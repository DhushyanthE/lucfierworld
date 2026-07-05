// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICirquitVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external view returns (bool);
}

/**
 * @title BridgeLock
 * @notice Cross-chain bridge gateway that finalises transfers only after a
 *         zk-SNARK (Groth16) proof produced by the post-quantum system engine
 *         is validated on-chain.
 */
contract BridgeLock is AccessControl, ReentrancyGuard {
    bytes32 public constant RELAY_ROLE = keccak256("RELAY_ROLE");

    ICirquitVerifier public verifier;
    mapping(bytes32 => bool) public processedBridges;

    event BridgeCompleted(bytes32 indexed srcTxHash, address indexed recipient, uint256 amount);
    event VerifierUpgraded(address indexed oldVerifier, address indexed newVerifier);

    error BridgeAlreadyProcessed(bytes32 srcTxHash);
    error CryptographicProofInvalid();
    error SettlementTransferFailed();
    error ZeroAddressDetected();

    constructor(address _verifier) {
        if (_verifier == address(0)) revert ZeroAddressDetected();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAY_ROLE, msg.sender);
        verifier = ICirquitVerifier(_verifier);
    }

    function completeBridge(
        bytes32 srcTxHash,
        address recipient,
        uint256 amount,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[1] calldata input
    ) external onlyRole(RELAY_ROLE) nonReentrant {
        if (processedBridges[srcTxHash]) revert BridgeAlreadyProcessed(srcTxHash);
        if (!verifier.verifyProof(a, b, c, input)) revert CryptographicProofInvalid();

        processedBridges[srcTxHash] = true;

        (bool success, ) = payable(recipient).call{value: amount}("");
        if (!success) revert SettlementTransferFailed();

        emit BridgeCompleted(srcTxHash, recipient, amount);
    }

    function upgradeVerifier(address _newVerifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_newVerifier == address(0)) revert ZeroAddressDetected();
        address oldVerifier = address(verifier);
        verifier = ICirquitVerifier(_newVerifier);
        emit VerifierUpgraded(oldVerifier, _newVerifier);
    }
}
