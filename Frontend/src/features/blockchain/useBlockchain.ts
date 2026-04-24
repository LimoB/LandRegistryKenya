import { useState, useCallback } from 'react';
import { ethers, type Eip1193Provider } from 'ethers';
import LandRegistryABI from './artifacts/LandRegistry.json';

interface NetworkData {
  address: string;
}

interface LandRegistryArtifact {
  abi: ethers.Interface | ethers.InterfaceAbi;
  networks: Record<string, NetworkData | undefined>;
}

const ContractData = LandRegistryABI as unknown as LandRegistryArtifact;

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      send: (method: string, params: unknown[]) => Promise<unknown>;
    };
  }
}

export const useBlockchain = () => {
  const [account, setAccount] = useState<string | null>(null);

  /**
   * Connects to MetaMask
   */
  const connectWallet = async (): Promise<string | null> => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature.");
      return null;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []) as string[];
      const connectedAccount = accounts[0] || null;
      
      setAccount(connectedAccount);
      return connectedAccount;
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  /**
   * Gets the contract instance with a signer
   */
  const getContract = useCallback(async (): Promise<ethers.Contract> => {
    if (!window.ethereum) throw new Error("MetaMask not found.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    // Priority: Try to find the contract for the actual network MetaMask is on
    let contractAddress = ContractData.networks[chainId]?.address;

    // Fallback: Use the most recent deployment address if the current chain isn't found
    if (!contractAddress) {
      const networkIds = Object.keys(ContractData.networks);
      if (networkIds.length > 0) {
        // Grab the last deployed network address
        contractAddress = ContractData.networks[networkIds[networkIds.length - 1]]?.address;
      }
    }

    if (!contractAddress) {
      throw new Error("Contract address not found. Ensure you deployed and updated artifacts.");
    }

    return new ethers.Contract(contractAddress, ContractData.abi, signer);
  }, []);

  /**
   * NEW: Checks if the current user has permissions to register land.
   * Use this in your UI to show/hide buttons or prevent "Internal RPC" errors.
   */
  const checkAccess = async (userAddress: string) => {
    try {
      const contract = await getContract();
      
      // Call the contract view functions
      const adminAddress = await contract.admin();
      const isOfficer = await contract.isLandOfficer(userAddress);
      
      const isAdmin = adminAddress.toLowerCase() === userAddress.toLowerCase();
      
      return {
        isAdmin,
        isOfficer,
        canRegister: isAdmin || isOfficer
      };
    } catch (error) {
      console.error("Error checking access:", error);
      return { isAdmin: false, isOfficer: false, canRegister: false };
    }
  };

  return { connectWallet, getContract, account, checkAccess };
};