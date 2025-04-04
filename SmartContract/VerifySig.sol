// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SignatureVerifier {
    mapping(address => bool) public verifiedWallets;

    event WalletVerified(address indexed wallet);

    function verifyAndStoreWallet(
        address signer,
        string memory message,
        bytes memory signature
    ) public {
        require(verifySignature(signer, message, signature), "Invalid signature");
        verifiedWallets[signer] = true;
        emit WalletVerified(signer);
    }

    modifier onlyVerified(address _wallet) {
        require(verifiedWallets[_wallet], "Wallet not verified");
        _;
    }

    function verifySignature(
        address signer,
        string memory message,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 ethSignedMessageHash = prefixed(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (r, s, v);
    }

    function prefixed(bytes32 hash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}

contract SecureContract is SignatureVerifier {
    function secureFunction() public onlyVerified(msg.sender) {
        
    }
}
