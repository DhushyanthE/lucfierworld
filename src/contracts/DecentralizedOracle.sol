// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DecentralizedOracle
 * @notice Ingests external price feeds with per-feeder nonces and ECDSA
 *         signature verification. ECDSA is a placeholder for the eventual
 *         Dilithium/Kyber post-quantum authentication layer.
 */
contract DecentralizedOracle is AccessControl {
    bytes32 public constant FEEDER_ROLE = keccak256("FEEDER_ROLE");

    mapping(string => uint256) public prices;
    mapping(address => uint256) public nonces;

    event PriceUpdated(string indexed pair, uint256 price, uint256 timestamp, address indexed feeder);

    error InvalidNonceSequence(address feeder, uint256 expected, uint256 provided);
    error SignatureVerificationFailed();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FEEDER_ROLE, msg.sender);
    }

    function updatePrice(
        string calldata pair,
        uint256 price,
        uint256 nonce,
        bytes calldata signature
    ) external onlyRole(FEEDER_ROLE) {
        if (nonce <= nonces[msg.sender]) {
            revert InvalidNonceSequence(msg.sender, nonces[msg.sender] + 1, nonce);
        }

        bytes32 message = keccak256(abi.encode(pair, price, nonce, msg.sender));
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message));

        address signer = ECDSA.recover(messageHash, signature);
        if (signer != msg.sender) revert SignatureVerificationFailed();

        nonces[msg.sender] = nonce;
        prices[pair] = price;
        emit PriceUpdated(pair, price, block.timestamp, msg.sender);
    }
}
