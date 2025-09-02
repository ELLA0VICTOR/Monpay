// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title MonPayRelayer (MinimalForwarder-like)
 * @notice Trusted Forwarder implementing ERC-2771 style meta-transactions.
 * Users sign Request, backend submits it. Target contract must read `_msgSender()`
 * via ERC2771Context.
 */
contract MonPayRelayer {
    struct Request {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        bytes data;
    }

    mapping(address => uint256) public nonces;

    bytes32 private constant TYPEHASH = keccak256(
        "Request(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)"
    );

    function getNonce(address from) external view returns (uint256) {
        return nonces[from];
    }

    function verify(Request calldata req, bytes calldata signature) public view returns (bool) {
        address signer = _recover(req, signature);
        return nonces[req.from] == req.nonce && signer == req.from;
    }

    function execute(Request calldata req, bytes calldata signature)
        external
        payable
        returns (bool, bytes memory)
    {
        require(verify(req, signature), "MonPayRelayer: signature mismatch");
        nonces[req.from] = req.nonce + 1;

        // append sender & relayer data to call
        (bool success, bytes memory ret) = req.to.call{gas: req.gas, value: req.value}(
            abi.encodePacked(req.data, req.from, msg.sender)
        );
        // If call used all gas, we won't reach here
        assert(gasleft() > req.gas / 63);

        return (success, ret);
    }

    function _recover(Request calldata req, bytes calldata signature) internal pure returns (address) {
        bytes32 hashStruct = keccak256(abi.encode(
            TYPEHASH,
            req.from, req.to, req.value, req.gas, req.nonce,
            keccak256(req.data)
        ));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", bytes32(0), hashStruct));
        // EIP-191 with empty domain separator (sufficient for forwarder)
        (bytes32 r, bytes32 s, uint8 v) = _split(signature);
        return ecrecover(digest, v, r, s);
    }

    function _split(bytes memory sig) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "bad sig length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) v += 27;
    }
}
