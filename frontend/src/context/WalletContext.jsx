"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../lib/contract.js";

const EXPECTED_CHAIN = 31337n; // Hardhat Local
const ROLE_NAMES = ["Person", "Admin", "Émetteur", "Vérificateur"]; // index = enum Role du contrat
const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  // Construit provider, signer et contrat à partir de l'état actuel de MetaMask
  const setup = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    setChainId(net.chainId);

    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setRole("");
    setAccount(addr);

    if (net.chainId !== EXPECTED_CHAIN) {
      setContract(null);
      setRole("");
      setError("Mauvais réseau. Passez MetaMask sur Hardhat Local (chaîne 31337).");
      return;
    }
    if (!REGISTRY_ADDRESS) {
      setContract(null);
      setError("Adresse du contrat manquante : vérifiez NEXT_PUBLIC_REGISTRY_ADDRESS dans .env.local.");
      return;
    }

    const c = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    setContract(c);
    setError("");

    try {
      const r = await c.roles(addr);
      setRole(ROLE_NAMES[Number(r)] || "");
    } catch {
      setRole(""); // contrat introuvable à cette adresse (nœud redémarré ?)
      setError("Contrat introuvable. Redéployez puis mettez à jour .env.local.");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount("");
    setContract(null);
    setChainId(null);
    setRole("");
    setError("");
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) return setError("Installez MetaMask d'abord.");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await setup();
    } catch (e) {
      if (e.code === 4001 || e.code === "ACTION_REJECTED") {
        setError("Connexion refusée dans MetaMask.");
      } else {
        setError(e.shortMessage || e.message);
      }
    }
  }, [setup]);

  // 1) Reconnexion silencieuse au chargement si le site est déjà autorisé
  // 2) Réaction aux changements de compte ou de réseau dans MetaMask
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => { if (accounts.length > 0) setup(); })
      .catch(() => {});

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
      else setup();
    };
    const onChainChanged = () => setup();

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [setup, disconnect]);

  return (
    <WalletContext.Provider
      value={{ account, contract, chainId, role, error, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Hook utilisé par toutes les pages et tous les composants
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet doit être utilisé dans <WalletProvider>");
  return ctx;
}
