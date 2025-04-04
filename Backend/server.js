const express = require("express");
const { ethers } = require("ethers");
const bodyParser = require("body-parser");

const app = express();
const port = 5000; 

app.use(bodyParser.json());

const privateKey = "0ecb54969fb205c948a56965c1e2bc23970e65897b092bb2787bd246cf419bcf";
const wallet = new ethers.Wallet(privateKey);

app.post("/sign-message", async (req, res) => {
    const { message } = req.body; // Message sent from frontend
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const signature = await wallet.signMessage(message);
        res.json({ signature });
    } catch (error) {
        console.error("Error signing the message:", error);
        res.status(500).json({ error: "Failed to sign the message" });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
