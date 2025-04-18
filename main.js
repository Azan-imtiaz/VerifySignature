import { createWeb3Modal, defaultWagmiConfig, walletConnectProvider, EIP6963Connector } from '@web3modal/wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { sendTransaction, prepareSendTransaction } from '@wagmi/core'
import { disconnect } from '@wagmi/core'
import { watchAccount } from '@wagmi/core'
import { switchNetwork } from '@wagmi/core'
import { getNetwork } from '@wagmi/core'
import { parseEther } from 'viem'
import { waitForTransaction } from '@wagmi/core'
import { connect } from '@wagmi/core'
//import { abi, contractAddress } from "/constants.js"
import { mainnet, arbitrum, bsc, sepolia, bscTestnet } from 'viem/chains'
import { getAccount } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'

import { ethers } from "/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "/constants.js"
import { usdtContractAddress, usdtAbi } from "/constantstwo.js"




import Swal from 'sweetalert2'


// const Swal = require('sweetalert2')


function notifyModalTimer(title, html){
  let timerInterval;
Swal.fire({
  title: title,
  html: `${html} <b></b>`,
  timer: 6000,
  timerProgressBar: true,
  imageUrl: "new-img/logo.png",
    color: "#ffffff",
    background: "#000",
    confirmButtonColor: "#D8871C",
    imageWidth: "120px",
  didOpen: () => {
    Swal.showLoading();
    const timer = Swal.getPopup().querySelector("b");
    timerInterval = setInterval(() => {
      timer.textContent = `${Swal.getTimerLeft()}`;
    }, 100);
  },
  willClose: () => {
    clearInterval(timerInterval);
  }
}).then((result) => {
  /* Read more about handling dismissals below */
  if (result.dismiss === Swal.DismissReason.timer) {
    console.log("");
  }
});
}

function notifyModal(title, html, icon, btnText) {
  Swal.fire({
    icon: icon,
    title: title,
    text: html,
    imageUrl: "new-img/logo.png",
    imageWidth: "120px",
    color: "#ffffff",
    background: "#000",
    confirmButtonColor: "#D8871C",
    // html: html,
    showClass: {
      popup: `
        animate__animated
        animate__jello
        animate__faster
      `
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `
    }
    
  });
}

// 1. Define constants
const projectId = 'c1f1e63c3bc31b9110112f4a582f03f6'
// const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/KCEXaqX6oRaPhi7jqmjB3RnbU_m6hj_G");
// const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Jp68VtVIMNhMDN9NJpZqdvh5ehFEwL8j");
const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// const chains = [mainnet, arbitrum, bsc, sepolia, bscTestnet]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
const { chains, publicClient } = configureChains([bscTestnet], [
  walletConnectProvider({ projectId }),
  publicProvider()
])

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } })
  ],
  publicClient
})


// 3. Create modal
const modal = createWeb3Modal({ wagmiConfig, projectId, defaultChain: bscTestnet,
  themeVariables: {
    '--w3m-z-index': 1000
  },
  themeMode: 'light'
})

const { open, selectedNetworkId } = modal.getState()

const connectButton = document.getElementById('open-connect-modal')
const showAccount = document.getElementById("account")
const purchaseButton = document.getElementById('purchaseButton')
const purchaseButtonUSDT = document.getElementById('purchaseButtonUSDT')
const bnbInput = document.getElementById('bnbInput')
const novisInput = document.getElementById('novisInput')
const approveButton = document.getElementById('approveButton')
const ETHbutton = document.getElementById("ETHbutton")
const USDTbutton = document.getElementById("USDTbutton")
const getTokens = document.getElementById('claimTokens')
const connecClaimtButton = document.getElementById("connecClaimtButton")
const contactForm = document.getElementById('contactForm')
const bonusToken = document.getElementById('bonus-claim')
//const walletAddress = document.getElementById("wallet-address")


connectButton.onclick = connectWallet
connecClaimtButton.onclick = connectWallet
//showAccount.onclick = openModal
approveButton.onclick = approve
getTokens.onclick = tokenClaim;

purchaseButton.onclick = function() {
  purchaseTokens()
}

purchaseButtonUSDT.onclick = function() {
   purchaseTokensUSDT()
  }

let userConnected = false;
let CurrencySelected = "ETH"
var usdtTrigger = false;
var webthreeaccount;
let enteredAmount = null;

ETHbutton.onclick = function() {
  toggleCryptoInfo("ETH");
};

USDTbutton.onclick = function() {
  toggleCryptoInfo("USDT");
};

showAccount.addEventListener('click' , function() {
	if (userConnected == false) {
		connectWallet();
	} else {
		openModal();
	}

})

function toggleCryptoInfo(crypto) {
  var logo = document.getElementById("change-logo");
 // var currencyText = document.getElementById("currencyText");
 

  if (crypto === 'ETH') {
      logo.innerHTML = '<img id="logo-currency" src="new-img/ethlogo.png" alt="ETH">';
 //     currencyText.innerText = "BNB"
      CurrencySelected = "ETH"
      usdtTrigger = false
      hideApproveButton()
      if(userConnected === true) {
        ShowBuyButton()
        purchaseButtonUSDT.style.display = "none"
      }
      if(enteredAmount != null) {
        calculateNovisAmount(enteredAmount);
      }
  } else if (crypto === 'USDT') {
      logo.innerHTML = '<img id="logo-currency" src="new-img/usdt logo.png" alt="USDT">';
 //     currencyText.innerHTML = "USDT"
      CurrencySelected = "USDT"
      usdtTrigger = true
      if(userConnected === true) {
        hideBuyButton()
        showApproveButton()
      }
      if(enteredAmount != null) {
        calculateNovisAmount(enteredAmount);
      }
  }
  
}

async function calculateNovisAmount(bnbAmount) {
  try{
     //if(CurrencySelected == 'ETH'){
    //   const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
    // //  const ethRate = await rate(); // Call the rate() function asynchronously
    // //  const div = await ethDivider()
    // //  const price = await tokenValue()
    // // const novisAmount = bnbAmount * parseFloat(currentRate); // Multiply with the rate
    // const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
    //  novisInput.value = novisAmount.toFixed(2);
 
    if (CurrencySelected === 'ETH') {
      const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
      const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
      novisInput.value = novisAmount.toFixed(2);
      attachDebouncedUpdate();
    }

    if(CurrencySelected == 'USDT'){
      const [currentRate, usdtDiv] = await Promise.all([usdtRate(), usdtDivider(),]);
      const novisAmount = bnbAmount * parseFloat(currentRate) / parseFloat(usdtDiv); // Multiply with the rate
      novisInput.value = novisAmount.toFixed(2);
      }
  } catch (error) {
    console.error(error);
  }
}

function attachDebouncedUpdate() {
  const debouncedUpdate = debounce(async () => {
    if (CurrencySelected === 'ETH') {
      try {
        const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
        const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
        novisInput.value = novisAmount.toFixed(2);
      } catch (error) {
        console.error('Error fetching values for debounced update:', error);
        // Handle error as needed
      }
    }
  }, 100); // Adjust the debounce delay as needed

  // Attach debouncedUpdate to your input event (e.g., onkeyup)
  novisInput.addEventListener('keyup', debouncedUpdate);
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  await progress();

  const unwatch = watchAccount((account) => {
    console.log("Account changed:", account);

    // Check if the user is trying to change their account
    if (userConnected && account.address !== webthreeaccount) {
      const latestAccount = account.address
      console.log("User is trying to change their account!");
      // Your code to handle the account change event
      // For example, you can call connectWallet to reconnect the wallet
      const smallAccount = `${latestAccount.substring(0, 5)}...${latestAccount.slice(-3)}`;
      showAccount.innerHTML = smallAccount
      webthreeaccount = account.address
      tokenInfo()
    }
  });
});

bnbInput.addEventListener('input', (event) => {
  const bnbAmount = parseFloat(event.target.value);
  if (isNaN(bnbAmount)) {
    novisInput.value = '';
    enteredAmount = null;
  } else {
    enteredAmount = bnbAmount;
    calculateNovisAmount(bnbAmount); // Call the async function to calculate novis amount
  }
});

function hideBuyButton() {
  var Buybutton = document.getElementById('purchaseButton');
  Buybutton.style.display = 'none';
}

function ShowBuyButton() {
  var Buybutton = document.getElementById('purchaseButton');
  Buybutton.style.display = 'block';
}

function hideApproveButton() {
  var Approvebutton = document.getElementById('approveButton');
  Approvebutton.style.display = 'none';
}

function showApproveButton() {
  var button = document.getElementById('approveButton');
  button.style.display = 'block'; // Reset to its original display value (block, inline-block, etc.)
}

async function connectWallet() {

  // notifyModal("Presale not started", '', "")
  // return

  await disconnect()
  
  await modal.open()
  
  while (modal.getState().open) {
    // Wait for a short duration before checking again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const account = getAccount()
  console.log(account.address)
  
  if(account.isConnected ==false) {
    // alert("please connect wallet")
    notifyModal("Please Connect Wallet",'',"")
    return
  }

  const watch = getNetwork()

  console.log(watch.chain.id)

 

  const newNetwork = watch.chain.id
  
  if(newNetwork != 97) {
    // alert("connect to ETH")
    notifyModal("Connect to ETH", '',"success")
    const network = await switchNetwork({
      chainId: 97,
    })
  }
  
  

  await tokenInfo()
  userConnected = true
  connectButton.innerHTML = "Connecting..."
  connecClaimtButton.innerHTML = "Connecting..."
  connectButton.innerHTML = "Connected"
  connectButton.style.display = 'none'
  connecClaimtButton.innerHTML = "Connected"
  connecClaimtButton.style.display = 'none'
  getTokens.style.display = "block"

  if (usdtTrigger == true)
  {
    showApproveButton();
  }

  if(usdtTrigger == false)
        {
   purchaseButton.style.display = "block"
        }

  const accountAddress = account.address
  webthreeaccount = accountAddress
  const truncatedAccount = `${accountAddress.substring(0, 5)}...${accountAddress.slice(-3)}`;
  showAccount.innerHTML = truncatedAccount
//  walletAddress.innerHTML = accountAddress

  
  }

  async function openModal() {
    if(userConnected === false) {
      return
    }
    await modal.open()
  
    while (modal.getState().open) {
      // Wait for a short duration before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const account = getAccount()
    console.log(account)

    if(!account.address) {
      console.log("Disconnected")
      connectButton.style.display = 'block'
      connecClaimtButton.style.display = 'block'
      connectButton.innerHTML = "Connect"
      connecClaimtButton.innerHTML = "See Your Claimable Tokens"
      getTokens.style.display = "none"
      hideBuyButton()
      hideApproveButton()
  showAccount.innerHTML = "Account"
 // walletAddress.innerHTML = "-"

    }




  }

  async function progress() {
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum)
     //  const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
       const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
       try {
         const BNBearned = await contract.progressETH()
         const progressDiv = document.getElementById('progress');
         const firstTotal = ethers.utils.formatUnits(BNBearned);
         const bnbratenew = await contract.getETHPriceInUSD()
         const BnbUSD = parseFloat(firstTotal) * parseFloat(bnbratenew)
         console.log(BnbUSD)
         const USDTEarned = await contract.progressUSDT()
         const formatUsdt = parseFloat(USDTEarned) / 10 ** 6;
         console.log(formatUsdt)
         const totalEarned = parseFloat(BnbUSD) + parseFloat(formatUsdt) + 80243
         const newSold = parseFloat(totalEarned).toFixed(2)
       //  progressDiv.innerHTML = parseFloat(newSold).toLocaleString('de-DE')
       progressDiv.innerHTML = parseFloat(newSold).toLocaleString()
        // const final = document.getElementById('usdRaised')
        // const finalAmount = totalEarned
       //  final.innerHTML = finalAmount.toLocaleString()
         console.log(newSold)
         updateProgressBar(newSold);
       } catch (error) {
         console.log(error)
        //  alert(error.message)
        notifyModal(error.message, '',"error")
       }
    // } else {
   //    purchaseButton.innerHTML = "Please install MetaMask"
   //  } 
   }
   
   async function updateProgressBar(newSold) {
     const progressBarRect = document.getElementById('progressBarRect');
     const progressBarContainer = document.querySelector('.section2__progressBarContainer');
     const progressBarWidth = progressBarContainer.offsetWidth - 4;
     //const progressDiv = document.getElementById('progress');
     const BNBearned = parseFloat(newSold.replace(',', ''));
     const BNBstart = 0;
     const BNBend = 1000000;
     const progress = Math.max(0, Math.min((BNBearned - BNBstart) / (BNBend - BNBstart), 1));
     progressBarRect.style.width = progress * progressBarWidth + 'px';
   }
   
   async function tokensSold() {
     if (typeof window.ethereum !== "undefined") {
       const provider = new ethers.providers.Web3Provider(window.ethereum)
       const signer = provider.getSigner()
       const contract = new ethers.Contract(contractAddress, abi, signer)
       try {
         const totalSold = await contract.soldTokens()
        // const tokensSoldDiv = document.getElementById('tokens-sold');
        // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
       } catch (error) {
         console.log(error)
        //  alert(error.message)
        notifyModal(error.message, '',"error")
       }
     } else {
       const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/your-project-id")
       const contract = new ethers.Contract(contractAddress, abi, provider)
       const totalSold = await contract.soldTokens()
      // const tokensSoldDiv = document.getElementById('tokens-sold');
      // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
     }
   }
   
   async function rate() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const Ethrate = await contract.getETHPriceInUSD();

        return Ethrate
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }

  async function tokenValue() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
   //  const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const tokenPrice = await contract.getTokenUsdPrice();

     //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);



        return tokenPrice
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }

  async function ethDivider() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const divider = await contract.getDivider();

     //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);



        return divider
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }
   
   async function usdtRate() {
    // if (typeof window.ethereum !== "undefined") {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum)
    //   const signer = provider.getSigner()
   // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
       const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
       try {
         const rate = await contract.getUsdtRate();
         const newRate = rate.toString()
         return newRate
       } catch (error) {
         throw new Error(error.message);
       }
   //  } else {
   //    throw new Error("Please install MetaMask");
   //  } 
   }

   async function usdtDivider() {
    //if (typeof window.ethereum !== "undefined") {
    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
        const divider = await contract.getUsdtDivider();

     //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);



        return divider
      } catch (error) {
        throw new Error(error.message);
      }
    //} else {
    //  throw new Error("Please install MetaMask");
    //} 
  }
 
  
// function getMetaMaskProvider() {
//   if (!window.ethereum) {
//       throw new Error("No wallet detected. Please install MetaMask.");
//   }

//   if (window.ethereum.providers) {
//       const metaMaskProvider = window.ethereum.providers.find(
//           (provider) => provider.isMetaMask
//       );
//       if (!metaMaskProvider) {
//           throw new Error("MetaMask not detected. Please ensure MetaMask is installed and active.");
//       }
//       return metaMaskProvider;
//   }

 
//   if (window.ethereum.isMetaMask) {
//       return window.ethereum;
//   }

//   throw new Error("Please use MetaMask. Other wallets are not supported.");
// }

async function createVoucher(amount) {
  let signer;
  // let provider;

  console.log("Ethers:", ethers);
  console.log("Providers:", ethers.providers);

  try {
    
      // const metaMaskProvider = getMetaMaskProvider();
    
      // provider = new ethers.providers.Web3Provider(metaMaskProvider);
      // signer = provider.getSigner();
    
      const signer= new ethers.Wallet("4a6ec653d6706b916ade2584ccc8510900b157797e7bf82774630b639479688f");
      // await metaMaskProvider.request({ method: 'eth_requestAccounts' });

      const domain = {
          name: "Voucher-Domain",
          version: "1",
          chainId: 97,
          verifyingContract: contractAddress 
      };

      const voucher = { amount };
      
      const types = {
          Voucher: [
              { name: "amount", type: "uint256" },
          ]
      };

      const signature = await signer._signTypedData(domain, types, voucher);
      return {
          ...voucher,
          signature
      };
  } catch (error) {
      console.error("Error creating voucher:", error);
      throw error;
  }
}
   async function purchaseTokens() {
 
    console.log("running...")
    const amount = document.getElementById("bnbInput").value
    if (amount >= 0.001) {
      console.log(`Funding with ${amount}...`)
      console.log('Buying with ETH')
      // alert("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet)")
      notifyModal("Please wait for wallet confirmation. ", "Remember to confirm transaction inside your wallet","")
       // const provider = new ethers.providers.Web3Provider(window.ethereum)
     //  const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      //  const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      

        try {
          // const hasPresaleStarted = await contract.checkPresaleStatus()
          // if (hasPresaleStarted == true){

        
  
          const hasPresaleEnded = await contract.checkPresaleEnd();
          if(hasPresaleEnded == true) {
            // alert("Presale has ended");
            notifyModal("Presale has ended", '',"")
            return
          }
           
          const account = getAccount()
          const currentAccount = account.address
            const balanceWei = await sepoliaProvider.getBalance(currentAccount);
            const balanceEth = ethers.utils.formatEther(balanceWei);
            if(balanceEth >= amount) {
          const availibleTokens = await contract.getClaimableTokens()
          const avlTokens = ethers.utils.formatUnits(availibleTokens)


          const [Ethratenew, dividernew, tokennewprice] = await Promise.all([rate(), ethDivider(), tokenValue()]);
          const totalBuy = amount * parseFloat(Ethratenew) * parseFloat(dividernew) / parseFloat(tokennewprice);

          console.log(avlTokens)
          if(avlTokens >= totalBuy) {
          // const transactionResponse = await contract.buyTokens({
          //   value: ethers.utils.parseEther(amount),
          //   gasLimit: 500000,
          // })

          const voucher = await createVoucher(parseEther(amount)); 
          console.log("Voucher"
          );
          console.log(voucher)

          const { hash } = await writeContract({
            address: contractAddress,
            abi: abi,
            functionName: 'buyTokens',
            args:[voucher],
            value: parseEther(amount)
          })

          const data = await waitForTransaction({
            confirmations: 2,
            hash,
          })

          console.log(data)
          // const data = await waitForTransaction({
          //   confirmations: 1,
          //   transactionResponse,
          // })
        //  await listenForTransactionMine(hash, provider)
          console.log("Done")
          // alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")
          notifyModal("Tokens Bought! Kindly wait for claim period to start.", "You may refresh page to see your updated claimable tokens","success")
        }
        else {
          // alert("not enought tokens availible to be sold at this moment")
          notifyModal("not enought tokens availible to be sold at this moment", '',"")
        } 
      } else{
        // alert("you do not have enough ETH")
        notifyModal("you do not have enough ETH", '',"")
      }
        // } else{
        //   alert("Presale has not started")
        // }
        } catch (error) {
          console.log(error)
          // alert(error.message)
          notifyModal(error.message, '',"error")
          return
        }
    } else {
      // alert("Please enter amount more than 0.001 ETH")
      notifyModal("Oops!", "Please enter amount more than 0.001 ETH", "")
    }
  }

  async function approve() {
    const amount = document.getElementById("bnbInput").value
   // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
   const newAmount = ethers.utils.parseUnits(amount, 6);
    if (amount >= 1) {
      console.log("approving...")
      // alert("approve tokens in your wallet!")
      notifyModal("Approve Tokens in your Wallet!", "Please approve tokens inside your wallet","")
      //const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii");
     // const signer = provider.getSigner()
      const contract = new ethers.Contract(usdtContractAddress, usdtAbi, sepoliaProvider)
      const presaleContract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
  
      // const hasPresaleStarted = await presaleContract.checkPresaleStatus()
      //   if (hasPresaleStarted == false){
      //     alert("Presale has not started");
      //     return
      // }
      const hasPresaleEnded = await presaleContract.checkPresaleEnd();
      if(hasPresaleEnded == true) {
        // alert("Presale has ended");
        notifyModal("Presale has ended", '',"")
        return
      }
  
      const availibleTokens = await presaleContract.getClaimableTokens()
      const avlTokens = ethers.utils.formatUnits(availibleTokens)
      const [currentRateNew, usdtDivNew] = await Promise.all([usdtRate(), usdtDivider(),]);
      const totalBuy = parseFloat(amount) * parseFloat(currentRateNew) / parseFloat(usdtDivNew)


      console.log(avlTokens);
      console.log(totalBuy)
      if(avlTokens >= totalBuy) {

    const account = getAccount()
    const currentAccount = account.address;
    const userBalance = await contract.balanceOf(currentAccount)
    const formatBalance = ethers.utils.formatUnits(userBalance , 6)
    const newFormatBalance = parseFloat(formatBalance)
    console.log(newFormatBalance)
    console.log(amount)
        if(newFormatBalance >= amount) {
        const currentAllowance = await contract.allowance(currentAccount, contractAddress);

        if(currentAllowance == 0) {
          console.log("first approve")
         // const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
         const { hash } = await writeContract({
          address: usdtContractAddress,
          abi: usdtAbi,
          functionName: 'approve',
          args: [contractAddress, newAmount]
        })
  
          // alert("approving...")
          notifyModalTimer("approving...",'')
          approveButton.innerHTML = "Approving.."
          
          const data = await waitForTransaction({
            confirmations: 2,
            hash,
          })
  
          console.log(data)
          console.log("Done")
        }
          if (currentAllowance.lt(newAmount)&& currentAllowance != 0) {
            console.log("second approve")
            // alert("Will now Reset USDT allowance. USDT ERC20 requires resetting approval when spending limits are too low. Please let your wallet approve USDT as 0.")
            notifyModal("Will now Reset USDT allowance. USDT ERC20 requires resetting approval when spending limits are too low. Please let your wallet approve USDT as 0", '',"")
           // const resetApprovalResponse = await contract.approve(contractAddress, '0', { gasLimit: 200000 });
           // await listenForTransactionMine(resetApprovalResponse, provider);
           const { hash } = await writeContract({
            address: usdtContractAddress,
            abi: usdtAbi,
            functionName: 'approve',
            args: [contractAddress, '0']
          })
    
            // alert("approving...")
            notifyModalTimer("approving...",'')
            approveButton.innerHTML = "Approving.."
            
            const dataTwo = await waitForTransaction({
              confirmations: 2,
              hash,
            })
    



             console.log(dataTwo)
            //  alert("Will now approve your desired amount")
            notifyModal("Will now approve your desired amount",'',"success")
          }

        const currentAllowanceTwo = await contract.allowance(currentAccount, contractAddress);
        if(currentAllowanceTwo == 0) {
       // const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
      //  alert("approving...")
       // await listenForTransactionMine(transactionResponse, provider)

       const { hash } = await writeContract({
        address: usdtContractAddress,
        abi: usdtAbi,
        functionName: 'approve',
        args: [contractAddress, newAmount]
      })

        // alert("approving...")
        notifyModalTimer("approving...",'')
        approveButton.innerHTML = "Approving.."
        
        const dataThree = await waitForTransaction({
          confirmations: 2,
          hash,
        })

        console.log(dataThree)
        console.log("Done")


        console.log("Done")
          }
        purchaseButtonUSDT.style.display = "block"
        approveButton.innerHTML = "Approved"
        approveButton.style.backgroundColor = "#00FF00"
        approveButton.style.color = "#000000"
        // alert("Approved!")
        notifyModal("Approved!",'',"success")
        }
        else{
          // alert('You dont not have enough balance')
          notifyModal("You do not have enough balance",'',"")
        }
          } else {
            // alert("Not Enough tokens availaible at the moment")
            notifyModal("Not Enough tokens availaible at the moment",'',"")
          }
      } catch (error) {
        console.log(error)
        // alert(error.message)
        notifyModal(error.message,'',"error")
        return;
     //purchaseButton.style.display = "block"
    }
  } else{
    // alert("Please enter amount more than 1 USDT!")
    notifyModal("Please enter amount more than 1 USDT!",'',"")
  }
  }

  async function purchaseTokensUSDT() {
    const amount = document.getElementById("bnbInput").value
   // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
   const newAmount = ethers.utils.parseUnits(amount, 6);
  
    if (amount >= 1) {
      console.log(`Funding with ${amount}...`)
      console.log('Buying with USDT')
      // alert("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet)")
      notifyModal("Please wait for wallet confirmation.","Remember to confirm transaction inside your wallet","")
      //  const provider = new ethers.providers.Web3Provider(window.ethereum)
      //  const signer = provider.getSigner()
     // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
        const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
        try {
          // const hasPresaleStarted = await contract.checkPresaleStatus()
          // if (hasPresaleStarted == true){
  
            const hasPresaleEnded = await contract.checkPresaleEnd();
            if(hasPresaleEnded == true) {
              // alert("Presale has ended");
              notifyModal("Presale has ended",'',"")
              return
            }
  
          const availibleTokens = await contract.getClaimableTokens()
          const avlTokens = ethers.utils.formatUnits(availibleTokens)
          const [currentRateFinal, usdtDivFinal] = await Promise.all([usdtRate(), usdtDivider()]);
          const totalBuy = parseFloat(amount) * parseFloat(currentRateFinal) / parseFloat(usdtDivFinal)
          console.log(avlTokens)
          console.log(totalBuy)
          if(avlTokens >= totalBuy) {


       //   const transactionResponse = await contract.buyTokensWithUSDT(newAmount, { gasLimit: 200000 })
         // await listenForTransactionMine(transactionResponse, provider)
        
         const voucher = await createVoucher(ethers.utils.parseUnits(amount, 6)); 
         
         const { hash } = await writeContract({
          address: contractAddress,
          abi: abi,
          functionName: 'buyTokensWithUSDT',
          args: [voucher]
        })

        const data = await waitForTransaction({
          confirmations: 2,
          hash,
        })

        console.log(data)

          console.log("Done")
          // alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")

          notifyModal("Tokens Bought! Kindly wait for claim period to start.","You may refresh page to see your updated claimable tokens","success")
  
          purchaseButtonUSDT.style.display = "none"
          approveButton.style.backgroundColor = "#f4c20f"
          approveButton.innerHTML = "Approve"
          approveButton.style.color = "#f7f7f7"
          
  
  
        }
        else {
          // alert("not enought tokens availible to be sold at this moment")
          notifyModal("Not enought tokens availible to be sold at this moment",'',"")
        }
        // } else{
        //   alert("Presale has not started")
        // }
        } catch (error) {
          console.log(error)
          // alert(error.message)
          notifyModal(error.message,'',"error")
          return
        }
    } else {
      // alert("Please enter amount more than 1 USDT !")
      notifyModal("Please enter amount more than 1 USDT !",'',"")
    }
  
  }

  async function tokenClaim() {
    console.log('claiming Tokens')
    notifyModal("Please wait for wallet confirmation",'',"")
     // const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      try {
          const checkStatus = await contract.checkPresaleStatus()
          if(checkStatus == true){

            const hasPresaleEnded = await contract.checkPresaleEnd();
          if (hasPresaleEnded == true){
         // const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          const account = getAccount()
          const currentAccount = account.address
          const users = await contract.Customer(currentAccount.toString())
          const tokenAmount = users.tokensBought

          if(tokenAmount == 0 ){
            // alert("No tokens left to be claimed")
            notifyModal("No tokens left to be claimed",'',"")
            return
          }
        // alert("Please wait for wallet confirmation")
        
      //  const transactionResponse = await contract.claimTokens()
      //  await listenForTransactionMine(transactionResponse, provider)

      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'claimTokens'
      })

      const data = await waitForTransaction({
        confirmations: 2,
        hash,
      })

        console.log(data)
        // alert("Tokens claimed. Please import address 0xE58278e99f0c21c0216396aD8ce1E9Da36EDEFCC into your wallet")
        notifyModal("Tokens claimed. ","Please import address 0x63579d3DB460812b77f574D02288FA6449507b1b into your wallet","success")
        // const tokensLeft = users
        // const tokensForClaim = document.getElementById('tokens-claim')
        // tokensForClaim.innerText = ethers.utils.formatUnits(tokensLeft)
          } else{
            // alert("Presale has not ended")
            notifyModal("Presale has not ended",'',"")
          }
          }
          else {
            
            
            // alert("Presale has not started")
            notifyModal("Presale has not started",'',"")
            
          }

        
      } catch (error) {
        console.log(error)
      }
  } 

  async function tokenInfo() {
    
     // const provider = new ethers.providers.Web3Provider(window.ethereum);
     // const signer = provider.getSigner();
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        sepoliaProvider
      );
      try {
    
    const account = getAccount()
    const currentAccount = account.address
		const users = await contract.Customer(currentAccount.toString())
    const tokensToBeClaimed = document.getElementById('tokens-claim')
 
    const tokenSCclaim = users.tokensBought;
    const bonus= users.customBonus;
    const tokenFinalAmount = ethers.utils.formatUnits(tokenSCclaim)

    const tokenFinalBonus = ethers.utils.formatUnits(bonus)
    if(tokenFinalAmount != 0){
      const boughtTokens= tokenFinalAmount  - tokenFinalBonus;
      tokensToBeClaimed.innerText = parseFloat(boughtTokens).toFixed(2)
      bonusToken.innerText = parseFloat(tokenFinalBonus).toFixed(2)
    }
    else{
      tokensToBeClaimed.innerText = parseFloat(0.00).toFixed(2)
      bonusToken.innerText = parseFloat(0.00).toFixed(2)
    } 
   
    
  
   // const claimStatus = document.getElementById('claimTime')
    /*const presalePeriod = await contract.getPresalePeriod()
    if(presalePeriod > 0){
    let unixTimestamp = parseInt(presalePeriod)
    let date = new Date(unixTimestamp * 1000)
    const humanDateFormat = date.toLocaleString()*/
    // const hasPresaleEnded = await contract.checkPresaleEnd();
    //     if(hasPresaleEnded == true) {
    //       claimStatus.innerText = "Positive"
    //       claimStatus.style.color = "green"
    //       return
    //     }  else{
    //   claimStatus.innerText = "Negative"
    //   claimStatus.style.color = "red"
    // }

  } catch (error){
		console.log(error)
	  }
    
  }
  
    
  //  async function listenForTransactionMine(transactionResponse, provider) {
  //    const receipt = await provider.waitForTransaction(transactionResponse.hash)
  //    console.log(receipt)
  //    return receipt
  //  }
   
   
   //new 1
