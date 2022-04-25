import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // Keep track if current address is connected or not.
  const [walletConnected, setWalletConnected] = useState(false);
  // Keep track if user has joined whitelist
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // Set loading to true when waiting for transaction to get mined
  const [loading, setLoading] = useState(false);
  // Track the number of addresses added to the whitelist
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Create reference to Web3Modal for users to connect ether wallet.
  const web3ModalRef = useRef();

  // Create a getProviderOrSigner function to allow users interact with their ether wallet.
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // Let users know whether they are connected to a Rinkeby network.
    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 4){
      window.alert("Change the network to Rinkeby.")
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
  Add the current connected wallet addy to the whitelist - addAddressToWhitelist
  */
 const addAddressToWhitelist = async () => {
   try {
    const signer = await getProviderOrSigner(true);

    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );
 
    const tx = await whitelistContract.addAddressToWhitelist();
    setLoading(true);
 
    // Wait for the transaction to get mined
    await tx.wait();
    setLoading(false);
    // Get the number of addresses in the whitelist
    await getNumberOfWhitelisted();
    setJoinedWhitelist(true);
  } catch (err) {
    console.error(err);
   }
 };

 const getNumberOfWhitelisted = async () => {
   try {
     // Get provider from Web3Modal
     const provider = await getProviderOrSigner();
     // Connect to the contract using a Provider to gain read-only access
     const whitelistContract = new Contract(
       WHITELIST_CONTRACT_ADDRESS,
       abi,
       provider
     );
     // Call the numAddressesWhitelisted() from the "Whitelist.sol" contract
     const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
     setNumberOfWhitelisted(_numberOfWhitelisted);
   } catch (err) {
     console.error(err);
   };
 };

 /*
 Check if the address is in the whitelist: checkIfAddressInWhitelist
 */
const checkIfAddressInWhitelist = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );
    // Get the address associated to the signer which is connected to Metamask
    const address = await signer.getAddress();
    // Call the whitelistedAddresses from the contract
    const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
    setJoinedWhitelist(_joinedWhitelist);
  } catch (err){
    console.error(err);
  }
};

/*
Connect ethereum wallet: connectWallet
*/
const connectWallet = async () => {
  try {
    // Get provider from web3modal
    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressInWhitelist();
    getNumberOfWhitelisted();
  } catch (err) {
    console.error(err)
  }
};

/*
renderButton: returns a button based on the state of the dApp.
*/
const renderButton = () => {
  if(walletConnected){
    if(joinedWhitelist){
      return (
        <div className={styles.description}>
          Thanks for joining the Whitelist!
        </div>
      );
    } else if (loading) {
      return <button className={styles.button}>Loading...</button>
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
          Join the Whitelist.
        </button>
      );
    }
  } else {
    return (
      <button onClick={connectWallet} className={styles.button}>
        Connect your Ethereum wallet.
      </button>
    );
  }
};

// Use useEffect to track changes in the state of the website
useEffect(() => {
  // If !walletConnected, create a new Web3Modal instance and connect Ethereum wallet
  if(!walletConnected) {
    // The "current" value is persistent as long as the page is open.
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
  }
}, [walletConnected]);

return(
  <div>
    <Head>
      <title>Mave Whitelist Dapp</title>
      <meta name="description" content="Mave-Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Mave DeFi👋</h1>
        <div className={styles.description}>
          Mave DeFi is a collection of Non Fungible Tokens for Web3 builders and devs.
        </div>
        <div className={styles.description}>
          {numberOfWhitelisted} have already joined the Whitelist.
        </div>
        {renderButton()}
      </div>
      <div>
        <Image className={styles.image} src="./crypto-devs.svg" alt="background image" />
      </div>
    </div>

    <footer className={styles.footer}>
      Made with&nbsp;<span>&#10084;</span>&nbsp;by&nbsp;<a href="https://www.github.com/ikenwaa" target="_blank" rel="noreferrer">Augustine Ikenwa</a>
    </footer>
  </div>
);
}

