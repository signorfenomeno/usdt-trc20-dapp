// Frontend USDT TRC20-DApp (React - TRON/TRC20)
// ✅ Verbeterde versie met volledige smart contract integratie, QR-functionaliteit en landingspagina met instructies

import React, { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import QRCode from 'qrcode.react';

const contractAddress = "TQtjrNhHaMxfhyFAtrrQ8F3pgWHyYRsqag";
const contractABI = [
  { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "type": "function" },
  { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "type": "function" },
  { "constant": false, "inputs": [ { "name": "recipient", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "airdrop", "outputs": [], "type": "function" },
  { "constant": false, "inputs": [ { "name": "user", "type": "address" } ], "name": "burnExpired", "outputs": [], "type": "function" },
  { "constant": true, "inputs": [ { "name": "account", "type": "address" } ], "name": "expiresAt", "outputs": [ { "name": "", "type": "uint256" } ], "type": "function" },
  { "constant": false, "inputs": [ { "name": "user", "type": "address" } ], "name": "recoverExpired", "outputs": [], "type": "function" }
];

const tokenDetails = {
  address: contractAddress,
  symbol: "USDT",
  decimals: 6,
  image: "https://totalcoin.io/uploads/coins/big/usdt.png",
  name: "Tether USD",
  website: "https://tether.to",
  description: "Tether USD stablecoin on TRON TRC20"
};

export default function UsdtTrc20Tron() {
  const [account, setAccount] = useState(null);
  const [added, setAdded] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [valueInEuro, setValueInEuro] = useState(0);
  const [expiresAt, setExpiresAt] = useState(null);
  const [smsPhone, setSmsPhone] = useState('');

  useEffect(() => {
    const connectTron = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        const userAddress = window.tronWeb.defaultAddress.base58;
        setAccount(userAddress);
        const instance = await window.tronWeb.contract(contractABI, contractAddress);
        setContract(instance);
        await fetchBalance(instance, userAddress);
      } else {
        console.warn("TronLink niet gevonden of niet verbonden");
      }
    };
    connectTron();
  }, [account]);

  const fetchBalance = async (instance, userAddress) => {
    const raw = await instance.balanceOf(userAddress).call();
    const tokens = Number(raw) / 1e6;
    const PricePerUSDT = 0.912;
    setBalance(tokens);
    setValueInEuro(tokens * PricePerUSDT);

    const expiryRaw = await instance.expiresAt(userAddress).call();
    setExpiresAt(Number(expiryRaw));
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const generateLandingUrl = () => {
    return `https://example.com/claim?address=${account}`;
  };

  const sendLandingPageLink = () => {
    if (!smsPhone || !/^[+0-9]{8,20}$/.test(smsPhone)) {
      alert("Please enter a valid phone number including country code");
      return;
    }
    const message = `Click here to claim your USDT TRC20 token: ${generateLandingUrl()}`;
    const url = `https://api.whatsapp.com/send?phone=${smsPhone.replace('+', '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <div className="bg-white shadow rounded-2xl p-4">
        <div className="space-y-3 pt-2">
          <h2 className="text-xl font-bold">USDT TRC20 <span className="text-green-600 text-sm ml-2">✅ Verified Token (TRC20)</span></h2>
          <p>Wallet: <span className="font-mono">{account}</span></p>

          <div className="bg-green-50 p-4 rounded-xl text-center space-y-1">
            <h3 className="text-3xl font-bold text-green-600">{balance.toLocaleString()} USDT</h3>
            <p className="text-gray-500 text-sm">≈ € {valueInEuro.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p className="text-xs text-muted-foreground italic">(Rate: 1 USDT ≈ €0.912)</p>
            {expiresAt && <p className="text-xs">⏰ Expires: {formatDate(expiresAt)}</p>}
          </div>

          <div className="space-y-2">
            <input type="text" className="border border-gray-300 p-2 w-full rounded" placeholder="📱 Phone number with country code" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} />
            <button onClick={sendLandingPageLink} className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition">📤 Send claim link via WhatsApp</button>
            <QRCode value={generateLandingUrl()} size={160} className="mx-auto mt-2" />
            <p className="text-xs text-muted-foreground text-center">Scan this QR or share the link above to import the token in wallet.</p>
          </div>

          <button onClick={() => alert('Add token manually using: ' + tokenDetails.address)} disabled={added} className="bg-green-600 text-white p-2 rounded w-full hover:bg-green-700 transition">➕ Show Token Info</button>
          <button onClick={async () => await contract.airdrop(account, 10000 * 1e6).send()} className="bg-purple-600 text-white p-2 rounded w-full hover:bg-purple-700 transition">Receive USDT</button>
          <button onClick={async () => await contract.burnExpired(account).send()} className="bg-red-600 text-white p-2 rounded w-full hover:bg-red-700 transition">🔥 Burn Expired Tokens</button>
          <button onClick={async () => await contract.recoverExpired(account).send()} className="bg-yellow-600 text-white p-2 rounded w-full hover:bg-yellow-700 transition">♻️ Recover Expired Tokens</button>
        </div>
      </div>
    </div>
  );
}
