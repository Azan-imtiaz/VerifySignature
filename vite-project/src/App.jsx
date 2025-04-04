import React from 'react';
import { WagmiConfig, createClient } from 'wagmi';
import { Chain} from 'wagmi';

const client = createClient({
    autoConnect: true,
    provider: (chain) => new ethers.providers.JsonRpcProvider(chain.rpcUrls.default),
});

function App() {
    return (
        <WagmiConfig client={client}>
           
            <VerifySignatureApp />
        </WagmiConfig>
    );
}

export default App;
