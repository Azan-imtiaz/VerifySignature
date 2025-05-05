import {
  createWeb3Modal,
  defaultWagmiConfig,
  walletConnectProvider,
  EIP6963Connector,
} from "@web3modal/wagmi";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { configureChains, createConfig } from "@wagmi/core";
import { sendTransaction, prepareSendTransaction } from "@wagmi/core";
import { disconnect } from "@wagmi/core";
import { watchAccount } from "@wagmi/core";
import { switchNetwork } from "@wagmi/core";
import { getNetwork } from "@wagmi/core";
import { parseEther } from "viem";
import { waitForTransaction } from "@wagmi/core";
import { connect } from "@wagmi/core";
//import { abi, contractAddress } from "/constants.js"
import { mainnet, arbitrum, bsc, sepolia, bscTestnet } from "viem/chains";
import { getAccount } from "@wagmi/core";
import { publicProvider } from "@wagmi/core/providers/public";
import { InjectedConnector } from "@wagmi/core";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";

import { ethers } from "/ethers-5.6.esm.min.js";
import { abi, contractAddress } from "/constants.js";
import { usdtContractAddress, usdtAbi } from "/constantstwo.js";
import { ethContractAddress, ethAbi } from "./constantThree";
import { claimContractAddress, claimContractAbi } from "./constantFive.js";      
import { ethUsdtContractAddress, ethUsdtAbi } from "./constantFour.js";             

import Swal from "sweetalert2";

function notifyModalTimer(title, html) {
  let timerInterval;
  Swal.fire({
    title: title,
    html: `${html} <b></b>`,
    timer: 5000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timer = Swal.getPopup().querySelector("b");
      timerInterval = setInterval(() => {
        timer.textContent = `${Swal.getTimerLeft()}`;
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
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
    // html: html,
    showClass: {
      popup: `
        animate__animated
        animate__jello
        animate__faster
      `,
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
    },
  });
}

// 1. Define constants
const projectId = "1b41c979ca44cc0a72e6211eefb4ee67";
const sepoliaProvider = new ethers.providers.JsonRpcProvider(
  // "https://bsc-dataseed1.binance.org/"
  "https://data-seed-prebsc-1-s1.binance.org:8545/"
);
const ethProvider = new ethers.providers.JsonRpcProvider(
  // "https://eth-mainnet.g.alchemy.com/v2/Jp68VtVIMNhMDN9NJpZqdvh5ehFEwL8j"
  //  "https://sonic-blaze.g.alchemy.com/v2/5pga0rTwblyZSAnBL_lIHdl2SVGKc4xe"
    "https://sonic-blaze.g.alchemy.com/v2/ATMRDOeJN88OXeJOJyif6JYKUG-CcR1h"
);
// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
export const sonicChain = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'Sonic Blaze Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    public: { http: ['https://rpc.blaze.soniclabs.com/'] },
    default: { http: ['https://rpc.blaze.soniclabs.com/'] },
  },
  blockExplorers: {
    etherscan: { name: 'SonicScan', url: 'https://testnet.sonicscan.org' },
    default: { name: 'SonicScan', url: 'https://testnet.sonicscan.org' },
  },
} ;

// const chains = [mainnet, arbitrum, bsc, sepolia, bscTestnet]
// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
const { chains, publicClient } = configureChains(
  [bscTestnet, sonicChain],
  [walletConnectProvider({ projectId }), publicProvider()]
);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new EIP6963Connector({ chains }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({
      chains,
      options: { appName: metadata.name },
    }),
  ],
  publicClient,
});


// 3. Create modal
const modal = createWeb3Modal({
  wagmiConfig,
  projectId, //, defaultChain: bsc
  themeVariables: {
    "--w3m-z-index": 1000,
  },
  themeMode: "light",
});

const { open, selectedNetworkId } = modal.getState();

const connectButton = document.getElementById("open-connect-modal");
const showAccount = document.getElementById("account");
const purchaseButton = document.getElementById("purchaseButton");
const purchaseButtonUSDT = document.getElementById("purchaseButtonUSDT");
const bnbInput = document.getElementById("bnbInput");
const novisInput = document.getElementById("novisInput");
const approveButton = document.getElementById("approveButton");
const ETHbutton = document.getElementById("ETHbutton");
const ETHbuttonTwo = document.getElementById("ETHbutton2");
const USDTbutton = document.getElementById("USDTbutton");
const USDTbuttonTwo = document.getElementById("USDTbutton2");
const getTokens = document.getElementById('claimTokens')
const connecClaimtButton = document.getElementById("connecClaimtButton")
const switchButton = document.getElementById("SwitchButton");
const currentChainText = document.getElementById("currentChain");
const butnColor = document.getElementById("butn-color");
const butnerColor = document.getElementById("butner-color");
const butnColor2 = document.getElementById("butn-color2");
const butnerColor2 = document.getElementById("butner-color2");
const butnerColor3 = document.getElementById("butner-color3");
const butnerColor4 = document.getElementById("butner-color4");
//const walletAddress = document.getElementById("wallet-address")

connectButton.onclick = connectWallet;
connecClaimtButton.onclick = connectWallet
// showAccount.onclick = openModal
//approveButton.onclick = approve
getTokens.onclick = tokenClaim;

// purchaseButton.onclick = function() {
//   purchaseTokens()
// }

purchaseButton.addEventListener("click", function () {
  if (chain == "BNB") {
    purchaseTokens();
  }
  if (chain == "ETHER") {
    purchaseTokensTwo();
  }
});

approveButton.addEventListener("click", function () {
  if (chain == "BNB") {
    approve();
  }
  if (chain == "ETHER") {
    approveTwo();
  }
});

purchaseButtonUSDT.addEventListener("click", function () {
  if (chain == "BNB") {
    purchaseTokensUSDT();
  }
  if (chain == "ETHER") {
    purchaseTokensUSDTTwo();
  }
});

// getTokens.addEventListener('click' , function() {
// 	if (chain == "BNB") {
//     tokenClaim()
//   }
//   if (chain == "ETHER") {
//     tokenClaimTwo()
//   }

// })

// purchaseButtonUSDT.onclick = function() {
//    purchaseTokensUSDT()
//   }

let userConnected = false;
let CurrencySelected = "ETH";
let CurrencySelectedTwo = "ETH";
var usdtTrigger = false;
var webthreeaccount;
let enteredAmount = null;
let chain = "ETHER";

switchButton.addEventListener("click", async () => {
  if (chain == "BNB") {
    toggleChain("ETHER");
  } else if (chain == "ETHER") {
    toggleChain("BNB");
  }
});

async function toggleChain(chainName) {
  if (chainName == "ETHER") {
    if (userConnected == true) {
      const network = await switchNetwork({
        chainId: 57054,
      });

      // alert("Switching networks, please wait.")

      notifyModal("Switching networks, please wait.", "", "info");

      const newWatch = getNetwork();
      const changedNetwork = newWatch.chain.id;
      console.log(changedNetwork);

      if (changedNetwork != 57054) {
        //    notifyModal("failed to switch network",'',"warning")

        notifyModal("failed to switch network", "", "warning");

        return;
      }
      await tokenInfo()
      // await tokenInfoTwo()
    }

    chain = "ETHER";
    console.log("Chain changed to ETHER");
    toggleCryptoInfoTwo("ETH");
    ETHbutton.style.display = "none";
    USDTbutton.style.display = "none";
    ETHbuttonTwo.style.display = "block";
    USDTbuttonTwo.style.display = "block";
    currentChainText.innerHTML = "BNB";
  }

  if (chainName == "BNB") {
    if (userConnected == true) {
      const network = await switchNetwork({
        chainId: 97,
      });

      // alert("Switching networks, please wait.")
      notifyModal("Switching networks, please wait.", "", "info");

      const newWatch = getNetwork();
      const changedNetwork = newWatch.chain.id;
      console.log(changedNetwork);

      if (changedNetwork != 97) {
        notifyModal("failed to switch network", "", "warning");
        return;
      }

      await tokenInfo()
    }
    chain = "BNB";
    console.log("Chain changed to BNB");
    toggleCryptoInfo("ETH");
    ETHbutton.style.display = "block";
    USDTbutton.style.display = "block";
    ETHbuttonTwo.style.display = "none";
    USDTbuttonTwo.style.display = "none";
    currentChainText.innerHTML = "ETH";
  }
}

ETHbutton.onclick = function () {
  toggleCryptoInfo("ETH");
};

USDTbutton.onclick = function () {
  toggleCryptoInfo("USDT");
};

ETHbuttonTwo.onclick = function () {
  toggleCryptoInfoTwo("ETH");
};

USDTbuttonTwo.onclick = function () {
  toggleCryptoInfoTwo("USDT");
};

showAccount.addEventListener("click", function () {
  if (userConnected == false) {
    connectWallet();
  } else {
    openModal();
  }
});

function toggleCryptoInfo(crypto) {
  var logo = document.getElementById("change-logo");
  // var currencyText = document.getElementById("currencyText");

  if (crypto === "ETH") {
    logo.innerHTML =
      '<img id="logo-currency" src="new-img/binance.png" alt="BNB">';
    //     currencyText.innerText = "BNB"

    // USDTbutton.style.background = "#CA0B0B";
    // USDTbutton.style.backgroundColor = "#343439";
    butnColor.style.color = "white";
    butnerColor.style.color = "white";
    butnerColor3.style.color = "white";
    butnerColor4.style.color = "white";

    // ETHbutton.style.background = "linear-gradient(45deg,  #04c589 ,#76C0F6)";

    CurrencySelected = "ETH";
    usdtTrigger = false;
    hideApproveButton();
    if (userConnected === true) {
      ShowBuyButton();
      purchaseButtonUSDT.style.display = "none";
    }
    if (enteredAmount != null) {
      calculateNovisAmount(enteredAmount);
    }
  } else if (crypto === "USDT") {
    logo.innerHTML =
      '<img id="logo-currency" src="new-img/usdt logo.png" alt="USDT">';
    //     currencyText.innerHTML = "USDT"

    // USDTbutton.style.background = "linear-gradient(45deg,  #04c589 ,#76C0F6)";

    butnColor.style.color = "white";
    butnerColor.style.color = "white";
    butnerColor3.style.color = "white";
    butnerColor4.style.color = "white";

    // ETHbutton.style.backgroundColor = "#343439";

    ETHbutton.style.background = "none";

    CurrencySelected = "USDT";
    usdtTrigger = true;
    if (userConnected === true) {
      hideBuyButton();
      showApproveButton();
    }
    if (enteredAmount != null) {
      calculateNovisAmount(enteredAmount);
    }
  }
}

function toggleCryptoInfoTwo(crypto) {
  var logo = document.getElementById("change-logo");
  // var currencyText = document.getElementById("currencyText");

  if (crypto === "ETH") {
    logo.innerHTML =
      '<img id="logo-currency" src="new-img/ethlogo.png" alt="BNB">';
    //     currencyText.innerText = "BNB"

    // USDTbuttonTwo.style.background = "none";
    // USDTbuttonTwo.style.backgroundColor = "#343439";
    butnColor2.style.color = "white";
    butnerColor2.style.color = "white";
    butnerColor3.style.color = "white";
    butnerColor4.style.color = "white";

    // ETHbuttonTwo.style.background = "linear-gradient(45deg,  #04c589 ,#76C0F6)";

    CurrencySelectedTwo = "ETH";
    usdtTrigger = false;
    hideApproveButton();
    if (userConnected === true) {
      ShowBuyButton();
      purchaseButtonUSDT.style.display = "none";
    }
    if (enteredAmount != null) {
      calculateNovisAmountTwo(enteredAmount);
    }
  } else if (crypto === "USDT") {
    logo.innerHTML =
      '<img id="logo-currency" src="new-img/usdt logo.png" alt="USDT">';
    //     currencyText.innerHTML = "USDT"

    // USDTbuttonTwo.style.background =
    //   "linear-gradient(45deg,  #04c589 ,#76C0F6)";
    butnColor2.style.color = "white";
    butnerColor2.style.color = "white";
    butnerColor3.style.color = "white";
    butnerColor4.style.color = "white";
    // ETHbuttonTwo.style.backgroundColor = "#343439";

    ETHbuttonTwo.style.background = "none";

    CurrencySelectedTwo = "USDT";
    usdtTrigger = true;
    if (userConnected === true) {
      hideBuyButton();
      showApproveButton();
    }
    if (enteredAmount != null) {
      calculateNovisAmountTwo(enteredAmount);
    }
  }
}

async function calculateNovisAmount(bnbAmount) {
  try {
    //if(CurrencySelected == 'ETH'){
    //   const [ethRate, div, price] = await Promise.all([rate(), ethDivider(), tokenValue()]);
    // //  const ethRate = await rate(); // Call the rate() function asynchronously
    // //  const div = await ethDivider()
    // //  const price = await tokenValue()
    // // const novisAmount = bnbAmount * parseFloat(currentRate); // Multiply with the rate
    // const novisAmount = bnbAmount * parseFloat(ethRate) * parseFloat(div) / parseFloat(price);
    //  novisInput.value = novisAmount.toFixed(2);

    if (CurrencySelected === "ETH") {
      const [ethRate, div, price] = await Promise.all([
        rate(),
        ethDivider(),
        tokenValue(),
      ]);
      const novisAmount =
        (bnbAmount * parseFloat(ethRate) * parseFloat(div)) / parseFloat(price);
      novisInput.value = novisAmount.toFixed(2);
      attachDebouncedUpdate();
    }

    if (CurrencySelected == "USDT") {
      const [currentRate, usdtDiv] = await Promise.all([
        usdtRate(),
        usdtDivider(),
      ]);
      const novisAmount =
        (bnbAmount * parseFloat(currentRate)) / parseFloat(usdtDiv);
      novisInput.value = novisAmount.toFixed(2);
    }
  } catch (error) {
    console.error(error);
  }
}

async function calculateNovisAmountTwo(bnbAmount) {
  try {
    if (CurrencySelectedTwo === "ETH") {
      const [ethRate, div, price] = await Promise.all([
        rateTwo(),
        ethDividerTwo(),
        tokenValueTwo(),
      ]);
      const novisAmount =
        (bnbAmount * parseFloat(ethRate) * parseFloat(div)) / parseFloat(price);
      novisInput.value = novisAmount.toFixed(2);
      attachDebouncedUpdateTwo();
    }

    if (CurrencySelectedTwo == "USDT") {
      const [currentRate, usdtDiv] = await Promise.all([
        usdtRateTwo(),
        usdtDividerTwo(),
      ]);
      console.log(currentRate);
      console.log(usdtDiv);
      const novisAmount =
        (bnbAmount * parseFloat(currentRate)) / parseFloat(usdtDiv);
      novisInput.value = novisAmount.toFixed(2);
    }
  } catch (error) {
    console.error(error);
  }
}

function attachDebouncedUpdate() {
  const debouncedUpdate = debounce(async () => {
    if (CurrencySelected === "ETH") {
      try {
        const [ethRate, div, price] = await Promise.all([
          rate(),
          ethDivider(),
          tokenValue(),
        ]);
        const novisAmount =
          (bnbAmount * parseFloat(ethRate) * parseFloat(div)) /
          parseFloat(price);
        novisInput.value = novisAmount.toFixed(2);
      } catch (error) {
        console.error("Error fetching values for debounced update:", error);
        // Handle error as needed
      }
    }
  }, 100); // Adjust the debounce delay as needed

  // Attach debouncedUpdate to your input event (e.g., onkeyup)
  novisInput.addEventListener("keyup", debouncedUpdate);
}

function attachDebouncedUpdateTwo() {
  const debouncedUpdate = debounce(async () => {
    if (CurrencySelected === "ETH") {
      try {
        const [ethRate, div, price] = await Promise.all([
          rateTwo(),
          ethDividerTwo(),
          tokenValueTwo(),
        ]);
        const novisAmount =
          (bnbAmount * parseFloat(ethRate) * parseFloat(div)) /
          parseFloat(price);
        novisInput.value = novisAmount.toFixed(2);
      } catch (error) {
        console.error("Error fetching values for debounced update:", error);
        // Handle error as needed
      }
    }
  }, 100); // Adjust the debounce delay as needed

  // Attach debouncedUpdate to your input event (e.g., onkeyup)
  novisInput.addEventListener("keyup", debouncedUpdate);
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
  toggleChain("ETHER");
  await progress();

  const unwatch = watchAccount((account) => {
    console.log("Account changed:", account);

    // Check if the user is trying to change their account
    if (userConnected && account.address !== webthreeaccount) {
      const latestAccount = account.address;
      console.log("User is trying to change their account!");
      // Your code to handle the account change event
      // For example, you can call connectWallet to reconnect the wallet
      const smallAccount = `${latestAccount.substring(
        0,
        5
      )}...${latestAccount.slice(-3)}`;
      showAccount.innerHTML = smallAccount;
      webthreeaccount = account.address;

      // if(chain == "BNB"){
      //    tokenInfo()
      // }
      // if(chain == "ETHER"){
      //    tokenInfoTwo()
      // }
    }
  });
});

bnbInput.addEventListener("input", (event) => {
  const bnbAmount = parseFloat(event.target.value);
  if (isNaN(bnbAmount)) {
    novisInput.value = "";
    enteredAmount = null;
  } else {
    if (chain == "BNB") {
      enteredAmount = bnbAmount;
      calculateNovisAmount(bnbAmount); // Call the async function to calculate novis amount
    }
    if (chain == "ETHER") {
      enteredAmount = bnbAmount;
      calculateNovisAmountTwo(bnbAmount);
    }
  }
});

function hideBuyButton() {
  var Buybutton = document.getElementById("purchaseButton");
  Buybutton.style.display = "none";
}

function ShowBuyButton() {
  var Buybutton = document.getElementById("purchaseButton");
  Buybutton.style.display = "block";
}

function hideApproveButton() {
  var Approvebutton = document.getElementById("approveButton");
  Approvebutton.style.display = "none";
}

function showApproveButton() {
  var button = document.getElementById("approveButton");
  button.style.display = "block"; // Reset to its original display value (block, inline-block, etc.)
}

async function connectWallet() {
  await disconnect();

  await modal.open();

  while (modal.getState().open) {
    // Wait for a short duration before checking again
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const account = getAccount();
  console.log(account.address);

  if (account.isConnected == false) {
    // alert("please connect wallet")

    notifyModal("please connect wallet", "", "info");

    return;
  }

  const watch = getNetwork();

  console.log(watch.chain.id);

  const newNetwork = watch.chain.id;

  if (chain == "BNB") {
    if (newNetwork != 97) {
      // alert("connect to BSC")
      notifyModal("connect to BSC", "", "info");

      const network = await switchNetwork({
        chainId: 97,
      });
    }
  }

  if (chain == "ETHER") {
    if (newNetwork != 57054) {
      // alert("connect to ETH")

      notifyModal("connect to ETH", "", "info");
      const network = await switchNetwork({
        chainId: 57054,
      });
    }
  }
  await tokenInfo()

  // if(chain == "BNB"){
  //   await tokenInfo()
  // }
  // if(chain == "ETHER"){
  //   await tokenInfoTwo()
  // }
  userConnected = true;
  connectButton.innerHTML = "Connecting...";
  // connecClaimtButton.innerHTML = "Connecting..."
  connectButton.innerHTML = "Connected";
  connectButton.style.display = "none";
  // connecClaimtButton.innerHTML = "Connected"
  connecClaimtButton.style.display = 'none'
  getTokens.style.display = "block"

  if (usdtTrigger == true) {
    showApproveButton();
  }

  if (usdtTrigger == false) {
    purchaseButton.style.display = "block";
  }

  const accountAddress = account.address;
  webthreeaccount = accountAddress;
  const truncatedAccount = `${accountAddress.substring(
    0,
    5
  )}...${accountAddress.slice(-3)}`;
  showAccount.innerHTML = truncatedAccount;
  //  walletAddress.innerHTML = accountAddress
}

async function openModal() {
  if (userConnected === false) {
    return;
  }
  await modal.open();

  while (modal.getState().open) {
    // Wait for a short duration before checking again
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const account = getAccount();
  console.log(account);

  if (!account.address) {
    console.log("Disconnected");
    connectButton.style.display = "block";
    // connecClaimtButton.style.display = 'block'
    connectButton.innerHTML = "Connect";
    // connecClaimtButton.innerHTML = "See Your Claimable Tokens"
    getTokens.style.display = "none";
    hideBuyButton();
    hideApproveButton();
    showAccount.innerHTML = "Account";
    // walletAddress.innerHTML = "-"
  }

  await tokenInfo()
}

async function progress() {
  // if (typeof window.ethereum !== "undefined") {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum)
  //  const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  const ethContract = new ethers.Contract(
    ethContractAddress,
    ethAbi,
    ethProvider
  );
  try {
    const [
      BNBearned,
      bnbratenew,
      USDTEarned,
      EthEarned,
      ethratenew,
      ethUSDTEarned,
    ] = await Promise.all([
      contract.progressETH(),
      contract.getETHPriceInUSD(),
      contract.progressUSDT(),
      ethContract.progressETH(),
      ethContract.getETHPriceInUSD(),
      ethContract.progressUSDT(),
    ]);

    //    const BNBearned = await contract.progressBNB()
    const progressDiv = document.getElementById("progress");
    const firstTotal = ethers.utils.formatUnits(BNBearned);
    //  const bnbratenew = await contract.getBNBPriceInUSD()
    const BnbUSD = parseFloat(firstTotal) * parseFloat(bnbratenew);
    console.log(BnbUSD);
    //  const USDTEarned = await contract.progressUSDT()
    const formatUsdt = parseFloat(USDTEarned) / 10 ** 18;
    console.log(formatUsdt);

    //  const EthEarned = await ethContract.progressETH()
    const ethfirstTotal = ethers.utils.formatUnits(EthEarned);
    //   const ethratenew = await ethContract.getETHPriceInUSD()
    const EthUSD = parseFloat(ethfirstTotal) * parseFloat(ethratenew);
    console.log(EthUSD);

    //  const ethUSDTEarned = await ethContract.progressUSDT()
    const ethformatUsdt = parseFloat(ethUSDTEarned) / 10 ** 18;

    const totalEarned =
      parseFloat(BnbUSD) +
      parseFloat(formatUsdt) +
      parseFloat(EthUSD) +
      parseFloat(ethformatUsdt);
    const newSold = parseFloat(totalEarned).toFixed(2);
    progressDiv.innerHTML = parseFloat(newSold).toLocaleString();
    // const final = document.getElementById('usdRaised')
    // const finalAmount = totalEarned
    //  final.innerHTML = finalAmount.toLocaleString()
    console.log(newSold);
    updateProgressBar(newSold);
  } catch (error) {
    console.log(error);
    //  alert(error.message)
    notifyModal(error.message, "", "warning");
  }
  // } else {
  //    purchaseButton.innerHTML = "Please install MetaMask"
  //  }
}

async function updateProgressBar(newSold) {
  const progressBarRect = document.getElementById("progressBarRect");
  const progressBarContainer = document.querySelector(
    ".section2__progressBarContainer"
  );
  const progressBarWidth = progressBarContainer.offsetWidth - 4;
  //const progressDiv = document.getElementById('progress');
  const BNBearned = parseFloat(newSold.replace(",", ""));
  const BNBstart = 0;
  const BNBend = 19527946;
  const progress = Math.max(
    0,
    Math.min((BNBearned - BNBstart) / (BNBend - BNBstart), 1)
  );
  progressBarRect.style.width = progress * progressBarWidth + "px";
}

async function tokensSold() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const totalSold = await contract.soldTokens();
      // const tokensSoldDiv = document.getElementById('tokens-sold');
      // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
    } catch (error) {
      console.log(error);
      //  alert(error.message)

      notifyModal(error.message, "", "warning");
    }
  } else {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rinkeby.infura.io/v3/your-project-id"
    );
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const totalSold = await contract.soldTokens();
    // const tokensSoldDiv = document.getElementById('tokens-sold');
    // tokensSoldDiv.innerText = ethers.utils.formatUnits(totalSold);
  }
}

async function rate() {
  //if (typeof window.ethereum !== "undefined") {
  //  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  try {
    const Ethrate = await contract.getETHPriceInUSD();

    return Ethrate;
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
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  try {
    const tokenPrice = await contract.getTokenUsdPrice();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return tokenPrice;
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
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  try {
    const divider = await contract.getDivider();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return divider;
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
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  try {
    const rate = await contract.getUsdtRate();
    const newRate = rate.toString();
    return newRate;
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
  const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
  try {
    const divider = await contract.getUsdtDivider();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return divider;
  } catch (error) {
    throw new Error(error.message);
  }
  //} else {
  //  throw new Error("Please install MetaMask");
  //}
}

async function rateTwo() {
  //if (typeof window.ethereum !== "undefined") {
  //  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
  const contract = new ethers.Contract(ethContractAddress, ethAbi, ethProvider);
  try {
    const Ethrate = await contract.getETHPriceInUSD();

    return Ethrate;
  } catch (error) {
    throw new Error(error.message);
  }
  //} else {
  //  throw new Error("Please install MetaMask");
  //}
}

async function tokenValueTwo() {
  //if (typeof window.ethereum !== "undefined") {
  //  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  //  const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
  const contract = new ethers.Contract(ethContractAddress, ethAbi, ethProvider);
  try {
    const tokenPrice = await contract.getTokenUsdPrice();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return tokenPrice;
  } catch (error) {
    throw new Error(error.message);
  }
  //} else {
  //  throw new Error("Please install MetaMask");
  //}
}

async function ethDividerTwo() {
  //if (typeof window.ethereum !== "undefined") {
  //  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
  const contract = new ethers.Contract(ethContractAddress, ethAbi, ethProvider);
  try {
    const divider = await contract.getDivider();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return divider;
  } catch (error) {
    throw new Error(error.message);
  }
  //} else {
  //  throw new Error("Please install MetaMask");
  //}
}

async function usdtRateTwo() {
  // if (typeof window.ethereum !== "undefined") {
  //   const provider = new ethers.providers.Web3Provider(window.ethereum)
  //   const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
  const contract = new ethers.Contract(ethContractAddress, ethAbi, ethProvider);
  try {
    const rate = await contract.getUsdtRate();
    const newRate = rate.toString();
    return newRate;
  } catch (error) {
    throw new Error(error.message);
  }
  //  } else {
  //    throw new Error("Please install MetaMask");
  //  }
}

async function usdtDividerTwo() {
  //if (typeof window.ethereum !== "undefined") {
  //  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const signer = provider.getSigner()
  // const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii"); //https://bsc-dataseed1.binance.org/
  const contract = new ethers.Contract(ethContractAddress, ethAbi, ethProvider);
  try {
    const divider = await contract.getUsdtDivider();

    //  const newRate = bnbAmount * parseFloat(Ethrate) * parseFloat(divider) / parseFloat(divider);

    return divider;
  } catch (error) {
    throw new Error(error.message);
  }
  //} else {
  //  throw new Error("Please install MetaMask");
  //}
}

async function purchaseTokens() {
  console.log("running...");
  const amount = document.getElementById("bnbInput").value;
  if (amount >= 0.001) {
    console.log(`Funding with ${amount}...`);
    console.log("Buying with BNB");
    // notifyModal("Please Wait for your wallet to fetch the transaction. (Remember to confirm transaction inside your wallet app)",'',"info")

    notifyModal(
      "Please Wait for your wallet to fetch the transaction.",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    //  const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
    //  const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
    try {
      // const hasPresaleStarted = await contract.checkPresaleStatus()
      // if (hasPresaleStarted == true){

      const hasPresaleEnded = await contract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        // notifyModal("Presale has ended",'',"warning")

        notifyModal("Presale has ended", "", "warning");

        return;
      }

      const account = getAccount();
      const currentAccount = account.address;
      const balanceWei = await sepoliaProvider.getBalance(currentAccount);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      if (balanceEth >= amount) {
        const availibleTokens = await contract.getClaimableTokens();
        const avlTokens = ethers.utils.formatUnits(availibleTokens);

        const [Ethratenew, dividernew, tokennewprice] = await Promise.all([
          rate(),
          ethDivider(),
          tokenValue(),
        ]);
        const totalBuy =
          (amount * parseFloat(Ethratenew) * parseFloat(dividernew)) /
          parseFloat(tokennewprice);

        console.log(avlTokens);
        if (avlTokens >= totalBuy) {
          // const transactionResponse = await contract.buyTokens({
          //   value: ethers.utils.parseEther(amount),
          //   gasLimit: 500000,
          // })

          const { hash } = await writeContract({
            address: contractAddress,
            abi: abi,
            functionName: "buyTokens",
            value: parseEther(amount),
          });

          const data = await waitForTransaction({
            confirmations: 2,
            hash,
          });

          console.log(data);
          // const data = await waitForTransaction({
          //   confirmations: 1,
          //   transactionResponse,
          // })
          //  await listenForTransactionMine(hash, provider)
          console.log("Done");
          // alert("Tokens Have Been Purchased! (Refresh Page to see your tokens on claim button)")

          notifyModal(
            "Tokens Have Been Purchased! ",
            "Import tokens using Address 0xbe025D088a253E1e991a49CEAE4611647D0f8d93",
            "success"
          );
        } else {
          //  notifyModal("not enought tokens availible to be sold at this moment",'',"warning")

          notifyModal(
            "not enough tokens availible to be sold at this moment",
            "",
            "warning"
          );
        }
      } else {
        // alert("you do not have enough BNB")

        notifyModal("you do not have enough BNB", "", "warning");
      }
      // } else{
      //   alert("Presale has not started")
      // }
    } catch (error) {
      console.log(error);
    }
  } else {
    // alert("Please enter amount more than 0.001 BNB")

    notifyModal("Please enter amount more than 0.001 BNB", "", "info");
  }
}

async function purchaseTokensTwo() {
  console.log("running...");
  const amount = document.getElementById("bnbInput").value;
  if (amount >= 0.001) {
    console.log(`Funding with ${amount}...`);
    console.log("Buying with ETH");
    // notifyModal("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet",'',"info")

    notifyModal(
      "Please wait for wallet confirmation. ",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    //  const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
    //  const signer = provider.getSigner()
    const contract = new ethers.Contract(
      ethContractAddress,
      ethAbi,
      ethProvider
    );
    try {
      // const hasPresaleStarted = await contract.checkPresaleStatus()
      // if (hasPresaleStarted == true){

      const hasPresaleEnded = await contract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        notifyModal("Presale has ended", "", "warning");
        return;
      }

      const account = getAccount();
      const currentAccount = account.address;
      const balanceWei = await ethProvider.getBalance(currentAccount);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      console.log(balanceEth);
      if (balanceEth >= amount) {
        const availibleTokens = await contract.getClaimableTokens();
        const avlTokens = ethers.utils.formatUnits(availibleTokens);

        const [Ethratenew, dividernew, tokennewprice] = await Promise.all([
          rateTwo(),
          ethDividerTwo(),
          tokenValueTwo(),
        ]);
        const totalBuy =
          (amount * parseFloat(Ethratenew) * parseFloat(dividernew)) /
          parseFloat(tokennewprice);

        console.log(avlTokens);
        if (avlTokens >= totalBuy) {
          // const transactionResponse = await contract.buyTokens({
          //   value: ethers.utils.parseEther(amount),
          //   gasLimit: 500000,
          // })

          const { hash } = await writeContract({
            address: ethContractAddress,
            abi: ethAbi,
            functionName: "buyTokens",
            value: parseEther(amount),
          });

          const data = await waitForTransaction({
            confirmations: 2,
            hash,
          });

          console.log(data);
          // const data = await waitForTransaction({
          //   confirmations: 1,
          //   transactionResponse,
          // })
          //  await listenForTransactionMine(hash, provider)
          console.log("Done");
          // alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")
          notifyModal(
            "Tokens Have Been Purchased! ",
            "Import tokens using Address 0x3C43452707E95878CedfDeb24D5488c31cE669F2",
            "success"
          );
        } else {
          //  notifyModal("not enought tokens availible to be sold at this moment",'',"warning")
          notifyModal(
            "not enough tokens availible to be sold at this moment",
            "",
            "warning"
          );
        }
      } else {
        // notifyModal("you do not have enough ETH",'',"warning")

        notifyModal("you do not have enough ETH", "", "warning");
      }
      // } else{
      //   alert("Presale has not started")
      // }
    } catch (error) {
      console.log(error);
    }
  } else {
    // alert("Please enter amount more than 0.001 eth")

    notifyModal("Please enter amount more than 0.001 eth", "", "warning");
  }
}

async function approve() {
  const amount = document.getElementById("bnbInput").value;
  // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
  const newAmount = ethers.utils.parseUnits(amount);
  if (amount >= 1) {
    // alert("Approving.... Please Wait for your wallet to fetch the transaction. (Remember to confirm transaction inside your wallet app)")

    notifyModal(
      "Approving.... Please Wait for your wallet to fetch the transaction.",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    console.log("approving... BEP20");
    //const provider = new ethers.providers.Web3Provider(window.ethereum)
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
    // const signer = provider.getSigner()
    const contract = new ethers.Contract(
      usdtContractAddress,
      usdtAbi,
      sepoliaProvider
    );
    const presaleContract = new ethers.Contract(
      contractAddress,
      abi,
      sepoliaProvider
    );
    try {
      // const hasPresaleStarted = await presaleContract.checkPresaleStatus()
      //   if (hasPresaleStarted == false){
      //     alert("Presale has not started");
      //     return
      // }
      const hasPresaleEnded = await presaleContract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        notifyModal("Presale has ended", "", "warning");
        return;
      }

      const availibleTokens = await presaleContract.getClaimableTokens();
      const avlTokens = ethers.utils.formatUnits(availibleTokens);
      const [currentRateBep, usdtDivBep] = await Promise.all([
        usdtRate(),
        usdtDivider(),
      ]);
      const totalBuy =
        (parseFloat(amount) * parseFloat(currentRateBep)) /
        parseFloat(usdtDivBep);
      console.log(avlTokens);
      console.log(totalBuy);
      if (avlTokens >= totalBuy) {
        const account = getAccount();
        const currentAccount = account.address;
        const userBalance = await contract.balanceOf(currentAccount);
        const formatBalance = ethers.utils.formatUnits(userBalance);
        const newFormatBalance = parseFloat(formatBalance);
        console.log(newFormatBalance);
        console.log(amount);
        if (newFormatBalance >= amount) {
          const currentAllowance = await contract.allowance(
            currentAccount,
            contractAddress
          );
          if (currentAllowance.lt(newAmount)) {
            //  const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
            const { hash } = await writeContract({
              address: usdtContractAddress,
              abi: usdtAbi,
              functionName: "approve",
              args: [contractAddress, newAmount],
            });

            // alert("approving...")
            notifyModalTimer("approving...", "");

            approveButton.innerHTML = "Approving..";

            const data = await waitForTransaction({
              confirmations: 2,
              hash,
            });

            console.log(data);

            console.log("Done");
          }
          purchaseButtonUSDT.style.display = "block";
          approveButton.innerHTML = "Approved";
          approveButton.style.backgroundColor = "#00FF00";
          approveButton.style.color = "#000000";
          // alert("Approved!")

          notifyModal("Approved!", "", "success");
        } else {
          // alert('You dont not have enough balance')
          notifyModal("You do not have enough balance", "", "warning");
        }
      } else {
        //   notifyModal("Not Enough tokens availaible at the moment",'',"warning")
        notifyModal(
          "Not Enough tokens availaible at the moment",
          "",
          "warning"
        );
      }
    } catch (error) {
      console.log(error);
      // alert(error.message)

      notifyModal(error.message, "", "warning");

      return;
      //purchaseButton.style.display = "block"
    }
  } else {
    // notifyModal("Please enter amount more than 1 USDT",'',"info")
    notifyModal("Please enter amount more than 1 USDT", "", "warning");
  }
}

async function approveTwo() {
  const amount = document.getElementById("bnbInput").value;
  // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
  const newAmount = ethers.utils.parseUnits(amount, 18);
  // console.log(newAmount)
  if (amount >= 1) {
    console.log("approving... ERC20");
    // alert("approve tokens in your wallet!")

    notifyModal(
      "Approving.... Please Wait for your wallet to fetch the transaction.",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    //const provider = new ethers.providers.Web3Provider(window.ethereum)
    // const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/uADNUYxUrYOsPEWhgrpagu5RpFHPSCii");
    // const signer = provider.getSigner()
    const contract = new ethers.Contract(
      ethUsdtContractAddress,
      ethUsdtAbi,
      ethProvider
    );
    const presaleContract = new ethers.Contract(
      ethContractAddress,
      ethAbi,
      ethProvider
    );
    try {
      // const hasPresaleStarted = await presaleContract.checkPresaleStatus()
      //   if (hasPresaleStarted == false){
      //     alert("Presale has not started");
      //     return
      // }
      const hasPresaleEnded = await presaleContract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        notifyModal("Presale has ended", "", "warning");
        return;
      }

      const availibleTokens = await presaleContract.getClaimableTokens();
      const avlTokens = ethers.utils.formatUnits(availibleTokens);
      const [currentRateNew, usdtDivNew] = await Promise.all([
        usdtRateTwo(),
        usdtDividerTwo(),
      ]);
      const totalBuy =
        (parseFloat(amount) * parseFloat(currentRateNew)) /
        parseFloat(usdtDivNew);
      console.log(avlTokens);
      console.log(totalBuy);
      if (avlTokens >= totalBuy) {
        const account = getAccount();
        const currentAccount = account.address;
        const userBalance = await contract.balanceOf(currentAccount);
        const formatBalance = ethers.utils.formatUnits(userBalance, 6);
        const newFormatBalance = parseFloat(formatBalance);
        console.log(newFormatBalance);
        console.log(amount);
        if (newFormatBalance >= amount) {
          const currentAllowance = await contract.allowance(
            currentAccount,
            ethContractAddress
          );

          if (currentAllowance == 0) {
            console.log("first approve");
            // const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
            const { hash } = await writeContract({
              address: ethUsdtContractAddress,
              abi: ethUsdtAbi,
              functionName: "approve",
              args: [ethContractAddress, newAmount],
            });

            notifyModalTimer("approving...", "");
            approveButton.innerHTML = "Approving..";

            const data = await waitForTransaction({
              confirmations: 2,
              hash,
            });

            console.log(data);
            console.log("Done");
          }
          if (currentAllowance.lt(newAmount) && currentAllowance != 0) {
            console.log("second approve");
            // alert("Will now Reset USDT allowance. USDT ERC20 requires resetting approval when spending limits are too low. Please let your wallet approve USDT as 0.")

            notifyModal(
              "Will now Reset USDT allowance. USDT ERC20 requires resetting approval when spending limits are too low. Please let your wallet approve USDT as 0.",
              "",
              "info"
            );

            // const resetApprovalResponse = await contract.approve(contractAddress, '0', { gasLimit: 200000 });
            // await listenForTransactionMine(resetApprovalResponse, provider);
            const { hash } = await writeContract({
              address: ethUsdtContractAddress,
              abi: ethUsdtAbi,
              functionName: "approve",
              args: [ethContractAddress, "0"],
            });

            notifyModalTimer("approving...", "");
            approveButton.innerHTML = "Approving..";

            const dataTwo = await waitForTransaction({
              confirmations: 2,
              hash,
            });

            console.log(dataTwo);
            //  alert("Will now approve your desired amount")

            notifyModal("Will now approve your desired amount", "", "info");
          }

          const currentAllowanceTwo = await contract.allowance(
            currentAccount,
            ethContractAddress
          );
          if (currentAllowanceTwo == 0) {
            // const transactionResponse = await contract.approve(contractAddress, newAmount, { gasLimit: 200000 })
            //  alert("approving...")
            // await listenForTransactionMine(transactionResponse, provider)

            const { hash } = await writeContract({
              address: ethUsdtContractAddress,
              abi: ethUsdtAbi,
              functionName: "approve",
              args: [ethContractAddress, newAmount],
            });

            notifyModalTimer("approving...", "");
            approveButton.innerHTML = "Approving..";

            const dataThree = await waitForTransaction({
              confirmations: 2,
              hash,
            });

            console.log(dataThree);
            console.log("Done");

            console.log("Done");
          }
          purchaseButtonUSDT.style.display = "block";
          approveButton.innerHTML = "Approved";
          approveButton.style.backgroundColor = "#00FF00";
          approveButton.style.color = "#000000";
          // alert("Approved!")
          notifyModal("Approved!", "", "success");
        } else {
          // alert('You do not have enough balance')

          notifyModal("You do not have enough balance", "", "warning");
        }
      } else {
        //   notifyModal("Not Enough tokens availaible at the moment",'',"warning")
        notifyModal(
          "Not Enough tokens availaible at the moment",
          "",
          "warning"
        );
      }
    } catch (error) {
      console.log(error);
      // alert(error.message)

      notifyModal(error.message, "", "warning");

      return;
      //purchaseButton.style.display = "block"
    }
  } else {
    // notifyModal("Please enter amount more than 1 USDT",'',"info")
    notifyModal("Please enter amount more than 1 USDT", "", "info");
  }
}

async function purchaseTokensUSDT() {
  const amount = document.getElementById("bnbInput").value;
  // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
  const newAmount = ethers.utils.parseUnits(amount);

  if (amount >= 1) {
    console.log(`Funding with ${amount}...`);
    console.log("Buying with USDT Bep20");
    // notifyModal("Please Wait for your wallet to fetch the transaction. (Remember to confirm transaction inside your wallet app)",'',"info")
    notifyModal(
      "Please Wait for your wallet to fetch the transaction. ",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
    //  const signer = provider.getSigner()
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
    const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider);
    try {
      // const hasPresaleStarted = await contract.checkPresaleStatus()
      // if (hasPresaleStarted == true){

      const hasPresaleEnded = await contract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        notifyModal("Presale has ended", "", "warning");
        return;
      }

      const availibleTokens = await contract.getClaimableTokens();
      const avlTokens = ethers.utils.formatUnits(availibleTokens);
      const [currentRateBepTwo, usdtDivBepTwo] = await Promise.all([
        usdtRate(),
        usdtDivider(),
      ]);
      const totalBuy =
        (parseFloat(amount) * parseFloat(currentRateBepTwo)) /
        parseFloat(usdtDivBepTwo);
      console.log(avlTokens);
      console.log(totalBuy);
      if (avlTokens >= totalBuy) {
        //   const transactionResponse = await contract.buyTokensWithUSDT(newAmount, { gasLimit: 200000 })
        // await listenForTransactionMine(transactionResponse, provider)

        const { hash } = await writeContract({
          address: contractAddress,
          abi: abi,
          functionName: "buyTokensWithUSDT",
          args: [newAmount],
        });

        const data = await waitForTransaction({
          confirmations: 2,
          hash,
        });

        console.log(data);

        console.log("Done");
        // alert("Tokens Purchased! Please wait for claim period to start. (Refresh page to see your updated claimable tokens)")

        notifyModal(
          "Tokens Have Been Purchased! ",
          "Import tokens using Address 0xbe025D088a253E1e991a49CEAE4611647D0f8d93",
          "success"
        );

        purchaseButtonUSDT.style.display = "none";
        approveButton.style.backgroundColor = "#4D4CAE";
        approveButton.innerHTML = "Approve";
        //  approveButton.style.color = "#4D4CAE"
      } else {
        notifyModal(
          "not enough tokens availible to be sold at this moment",
          "",
          "warning"
        );
      }
      // } else{
      //   alert("Presale has not started")
      // }
    } catch (error) {
      console.log(error);
    }
  } else {
    // alert("Please enter amount more than 1 USDT!")

    notifyModal("Please enter amount more than 1 USDT!", "", "warning");
  }
}

async function purchaseTokensUSDTTwo() {
  const amount = document.getElementById("bnbInput").value;
  // const newAmount = ethers.BigNumber.from(amount).mul(ethers.BigNumber.from(10).pow(18));
  const newAmount = ethers.utils.parseUnits(amount, 18);

  if (amount >= 1) {
    console.log(`Funding with ${amount}...`);
    console.log("Buying with USDT Erc20");
    // notifyModal("Please wait for wallet confirmation. (Remember to confirm transaction inside your wallet",'',"info")

    notifyModal(
      "Please wait for wallet confirmation. ",
      "Remember to confirm transaction inside your wallet app",
      "info"
    );

    //  const provider = new ethers.providers.Web3Provider(window.ethereum)
    //  const signer = provider.getSigner()
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
    const contract = new ethers.Contract(
      ethContractAddress,
      ethAbi,
      ethProvider
    );
    try {
      // const hasPresaleStarted = await contract.checkPresaleStatus()
      // if (hasPresaleStarted == true){

      const hasPresaleEnded = await contract.checkPresaleEnd();
      if (hasPresaleEnded == true) {
        notifyModal("Presale has ended", "", "warning");
        return;
      }

      const availibleTokens = await contract.getClaimableTokens();
      const avlTokens = ethers.utils.formatUnits(availibleTokens);
      const [currentRateNewTwo, usdtDivNewTwo] = await Promise.all([
        usdtRateTwo(),
        usdtDividerTwo(),
      ]);
      const totalBuy =
        (parseFloat(amount) * parseFloat(currentRateNewTwo)) /
        parseFloat(usdtDivNewTwo);
      console.log(avlTokens);
      console.log(totalBuy);
      if (avlTokens >= totalBuy) {
        //   const transactionResponse = await contract.buyTokensWithUSDT(newAmount, { gasLimit: 200000 })
        // await listenForTransactionMine(transactionResponse, provider)

        const { hash } = await writeContract({
          address: ethContractAddress,
          abi: ethAbi,
          functionName: "buyTokensWithUSDT",
          args: [newAmount],
        });

        const data = await waitForTransaction({
          confirmations: 2,
          hash,
        });

        console.log(data);

        console.log("Done");
        // alert("Tokens Bought! Kindly wait for claim period to start. (You may refresh page to see your updated claimable tokens)")

        notifyModal(
          "Tokens Have Been Purchased! ",
          "Import tokens using Address 0x3C43452707E95878CedfDeb24D5488c31cE669F2",
          "success"
        );

        purchaseButtonUSDT.style.display = "none";
        approveButton.style.backgroundColor = "#4D4CAE";
        approveButton.innerHTML = "Approve";
        // approveButton.style.color = "#4D4CAE"
      } else {
        // alert("not enough tokens availible to be sold at this moment")
        notifyModal(
          "not enough tokens availible to be sold at this moment",
          "",
          "warning"
        );
      }
      // } else{
      //   alert("Presale has not started")
      // }
    } catch (error) {
      console.log(error);
    }
  } else {
    notifyModal("Please enter amount more than 1 USDT", "", "info");
  }
}

async function createVoucher(amount) {
 

  try {
      
    const nonce = Math.floor(Math.random() * 1000000); 

      const signer = new ethers.Wallet("4a6ec653d6706b916ade2584ccc8510900b157797e7bf82774630b639479688f");

      const domain = {
          name: "Voucher-Domain",
          version: "1",
          chainId: 97,
          verifyingContract: claimContractAddress
      };

      const voucher = { 
          amount,
          nonce
      };
      
      const types = {
          Voucher: [
              { name: "amount", type: "uint256" },
              { name: "nonce", type: "uint256" }
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

async function createSignature(address) {

const url = "http://localhost:5000/createSignature";
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({address })
    });
    
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }
}


  async function tokenClaim() {
   
    notifyModal("Please wait for wallet confirmation",'',"info")
     // const provider = new ethers.providers.Web3Provider(window.ethereum)
     // const signer = provider.getSigner()
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      const contract = new ethers.Contract(contractAddress, abi, sepoliaProvider)
      const contract2 = new ethers.Contract(ethContractAddress, ethAbi, ethProvider)
      try {
          const checkStatus = await contract.checkPresaleStatus()
          const checkStatus2 = await contract2.checkPresaleStatus()
          if(checkStatus == true && checkStatus2 == true){

            const hasPresaleEnded = await contract.checkPresaleEnd();
            const hasPresaleEnded2 = await contract2.checkPresaleEnd();
          if (hasPresaleEnded == true && hasPresaleEnded2 == true){
         // const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          const account = getAccount()
          const currentAccount = account.address
          console.log(currentAccount)
         
      const response = await createSignature(currentAccount.toString()); 
  console.log("response")
      console.log(response.status)
      if(response.status === 200){
        // notifyModal("Tokens claimed. Please import address 0x538955F731F14E357Ae78DF33B12c279F3bfdE68 into your wallet",'',"success")
  console.log(response.voucher);
  await toggleChain("BNB");


  const { hash } = await writeContract({
    address: claimContractAddress,
    abi: claimContractAbi,
    functionName: 'claimTokens',
    args:[response.voucher]
  })

  const data = await waitForTransaction({
    confirmations: 2,
    hash,
  })
  notifyModal("Tokens claimed. Please import address 0x538955F731F14E357Ae78DF33B12c279F3bfdE68 into your wallet",'',"success")

      }
      if(response.status!==200){
        console.log("you did not have enough funds");
        notifyModal("You did not have enough tokens to claim",'',"success")

      }
      
          } else{
            // alert("Presale has not ended")
            notifyModal("Presale has not ended",'',"warning")

          }
          }
          else {
            // alert("Presale has not started")
            notifyModal("Presale has not started",'',"warning")
          }

      } catch (error) {
        console.log(error);

  let revertReason = "Unknown error";

  if (error && error.message) {
    const match = error.message.match(/reverted with the following reason:\s*(.*)\s*Contract Call:/);
    if (match && match[1]) {
      revertReason = match[1].trim();
    } else {
      revertReason = error.message;
    }
  }

  notifyModal("Error", revertReason, "error");
      }
  }

  async function tokenInfo() {
     // const provider = new ethers.providers.Web3Provider(window.ethereum);
     // const signer = provider.getSigner();
    // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
      
    const account = getAccount()
    const currentAccount = account.address

    const claimContract = new ethers.Contract(
      claimContractAddress,claimContractAbi,sepoliaProvider
    );
    console.log(claimContract)
  console.log(claimContract)
let status=  await claimContract.userStatus(currentAccount.toString());
   

if(status == true){
  const tokensToBeClaimed = document.getElementById('tokens-claim')
  tokensToBeClaimed.innerText = "0.00"
  return;
}

console.log('status');
console.log(status)

    const contract = new ethers.Contract(
        contractAddress,
        abi,
        sepoliaProvider
      );
    
      const contract2 = new ethers.Contract(
        ethContractAddress,
        ethAbi,
        ethProvider
      );
      try {

   
		const users = await contract.Customer(currentAccount.toString())
    const users2 = await contract2.Customer(currentAccount.toString())
  
    // console.log(tokensToBeClaimed )
    const tokensBought1 = ethers.BigNumber.from(users.tokensBought);
  console.log(ethers.utils.formatUnits(tokensBought1, 18));
const tokensBought2 = ethers.BigNumber.from(users2.tokensBought);
console.log(ethers.utils.formatUnits(tokensBought2, 18));

const customBonus = ethers.BigNumber.from(users.customBonus);
console.log(ethers.utils.formatUnits(customBonus, 18));
const customBonus2 = ethers.BigNumber.from(users2.customBonus);
console.log(ethers.utils.formatUnits(customBonus2, 18));
const tokenSCclaim = tokensBought1.add(tokensBought2).add(customBonus).add(customBonus2);
    // let tokenSCclaim = users.tokensBought + users2.tokensBought;
    // const tokenSCbonus = users.customBonus + users2.customBonus;
    // tokenSCclaim+=tokenSCbonus
    const finalTokenAmount = ethers.utils.formatUnits(tokenSCclaim, 18);
    tokensToBeClaimed.innerText = `${parseFloat(finalTokenAmount).toFixed(2)}`
    console.log("final token amount "+ parseFloat(finalTokenAmount).toFixed(2))


  } catch (error){
		console.log(error)
	  }

  }

  async function tokenInfoTwo() {
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
   // const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org/");
     const contract2 = new ethers.Contract(
       ethContractAddress,
       ethAbi,
       ethProvider
     );
     try {

   const account = getAccount()
   const currentAccount = account.address
   const users = await contract2.Customer(currentAccount.toString())
   const tokensToBeClaimed = document.getElementById('tokens-claim')
   const tokenSCclaim = users.tokensBought
   const finalTokenAmount = ethers.utils.formatUnits(tokenSCclaim)
   tokensToBeClaimed.innerText = `(ERC-20) TDS ${parseFloat(finalTokenAmount).toFixed(2)}`
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
