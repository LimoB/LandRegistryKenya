import { useState } from 'react';
import { ethers } from 'ethers';
// Ensure the path to your artifact is correct
import LandRegistryABI from './artifacts/LandRegistry.json';

// FIX: Declare the ethereum object on the window for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useBlockchain = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found! Please install the extension.");
      return null;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request accounts from MetaMask
      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      return connectedAccount;
    } catch (error) {
      console.error("User denied account access", error);
      return null;
    }
  };

  const getContract = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Get the current network the user is on
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    // Check if our contract JSON has data for this specific network
    const networkData = (LandRegistryABI.networks as any)[chainId];

    if (!networkData) {
      // Fallback: If chainId doesn't match, try to get the first available address 
      // from the JSON (useful for local dev environments)
      const firstNetworkId = Object.keys(LandRegistryABI.networks)[0];
      const fallbackAddress = (LandRegistryABI.networks as any)[firstNetworkId]?.address;

      if (!fallbackAddress) throw new Error("Contract not found in artifacts.");
      
      console.warn("Chain ID mismatch. Using fallback address from artifacts.");
      return new ethers.Contract(fallbackAddress, LandRegistryABI.abi, signer);
    }

    return new ethers.Contract(networkData.address, LandRegistryABI.abi, signer);
  };

  return { connectWallet, getContract, account };
};