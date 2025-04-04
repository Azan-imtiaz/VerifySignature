import React, { useState } from 'react';
import { useAccount, useSigner, useContractWrite } from 'wagmi';
import { ethers } from 'ethers';

function VerifySignatureApp() {
    const [message, setMessage] = useState("Authorize minting of NFT");
    const [signature, setSignature] = useState("");
    const [isVerified, setIsVerified] = useState(null);

    const { isConnected, address } = useAccount(); // Get the connected wallet address
    const { data: signer } = useSigner(); // Get the signer (wallet) from Wagmi

    // Contract details
    const contractAddress = "YOUR_SMART_CONTRACT_ADDRESS"; // Replace with your contract address
    const contractABI = [
        "function verifySignature(address signer, string memory message, bytes memory signature) public pure returns (bool)"
    ];

    // Wagmi hook to interact with the contract
    const { write } = useContractWrite({
        addressOrName: contractAddress,
        contractInterface: contractABI,
        functionName: 'verifySignature',
        onSuccess(data) {
            setIsVerified(true);
            console.log("Signature Verified:", data);
        },
        onError(error) {
            setIsVerified(false);
            console.error("Error verifying signature:", error);
        },
    });

    // Call the backend to sign the message
    async function signMessage() {
        try {
            const response = await fetch('http://localhost:5000/sign-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (response.ok) {
                const data = await response.json();
                setSignature(data.signature);
                console.log("Signature from Backend:", data.signature);
            } else {
                console.error("Error signing message:", response.statusText);
            }
        } catch (error) {
            console.error("Error calling backend:", error);
        }
    }

    // Send the signature to the smart contract for verification
    function verifySignature() {
        if (isConnected && signer && signature) {
            write({
                args: [address, message, signature],
            });
        } else {
            alert("Please connect your wallet and sign the message first.");
        }
    }

    return (
        <div>
            <h2>Verify Signature Example</h2>

            {!isConnected ? (
                <button onClick={() => connectWallet()}>Connect Wallet</button>
            ) : (
                <p>Connected Wallet Address: {address}</p>
            )}

            <div>
                <button onClick={signMessage}>Get Signature from Backend</button>
                <p>Signed Message: {signature}</p>
            </div>

            <div>
                <button onClick={verifySignature}>Verify Signature</button>
                {isVerified !== null && (
                    <p>
                        Signature Verification: {isVerified ? "Valid" : "Invalid"}
                    </p>
                )}
            </div>
        </div>
    );
}

export default VerifySignatureApp;
