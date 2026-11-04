import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  Smartphone,
  Sparkles,
  Crown,
  BadgeCheck,
  Download,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SubscriptionTier } from '../../types';
import { sounds } from '../../utils/audio';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: 'premium' | 'vip';
  customVipPrice?: number;
}

type PaymentMethod = 'card' | 'apple_pay' | 'paypal' | 'mpesa' | 'crypto';

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialTier = 'premium',
  customVipPrice = 52,
}) => {
  const {
    currentUser,
    subscribeToTier,
    boostProfilePageViewsAndLikes,
    setActiveTab,
    viewUserProfile,
  } = useApp();

  const [selectedTier, setSelectedTier] = useState<'premium' | 'vip'>(initialTier);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [vipPrice, setVipPrice] = useState(customVipPrice);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser.name || 'Davis Kimeu');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [postalCode, setPostalCode] = useState('90210');
  const [saveCard, setSaveCard] = useState(true);

  // Mobile money / M-Pesa state
  const [mobilePhone, setMobilePhone] = useState('+254 712 345 678');
  const [mpesaPromptSent, setMpesaPromptSent] = useState(false);

  // Crypto state
  const [cryptoCopied, setCryptoCopied] = useState(false);

  // Checkout workflow state
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'receipt'>('form');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [receiptData, setReceiptData] = useState<{
    txnId: string;
    tier: 'premium' | 'vip';
    amount: number;
    method: string;
    date: string;
    renewalDate: string;
  } | null>(null);

  // Sync initial tier when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedTier(initialTier);
      setVipPrice(customVipPrice);
      setCheckoutStep('form');
      setMpesaPromptSent(false);
    }
  }, [isOpen, initialTier, customVipPrice]);

  if (!isOpen) return null;

  const currentPrice = selectedTier === 'vip' ? vipPrice : 27;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Card';
  };

  // Execute payment flow with simulated multi-step banking handshake
  const handleExecutePayment = () => {
    sounds.playTap();
    setCheckoutStep('processing');
    setProcessingStatus('Securing 256-bit TLS connection...');

    const newTxnId = `TXN-MUSHER-${Math.floor(100000 + Math.random() * 900000)}-${selectedTier.toUpperCase()}`;
    setTransactionId(newTxnId);

    // Step 1: Tokenize
    setTimeout(() => {
      if (selectedMethod === 'mpesa') {
        setProcessingStatus('Sending STK Push prompt to ' + mobilePhone + '...');
      } else if (selectedMethod === 'card') {
        setProcessingStatus(`Authorizing ${getCardBrand()} ending in ${cardNumber.slice(-4) || '4242'}...`);
      } else if (selectedMethod === 'apple_pay') {
        setProcessingStatus('Authorizing biometric token via Apple Pay...');
      } else if (selectedMethod === 'paypal') {
        setProcessingStatus('Authenticating PayPal balance & billing agreement...');
      } else {
        setProcessingStatus('Confirming blockchain transaction hash...');
      }
    }, 800);

    // Step 2: Gateway authorization
    setTimeout(() => {
      setProcessingStatus('Payment verified & captured! Applying VIP boost...');
    }, 1600);

    // Step 3: Complete & show receipt
    setTimeout(() => {
      // Subscribe user to tier
      subscribeToTier(selectedTier, currentPrice);
      // Automatically trigger initial view & like surge
      boostProfilePageViewsAndLikes();

      // Confetti burst!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: selectedTier === 'vip' ? ['#f59e0b', '#fbbf24', '#ffffff'] : ['#38bdf8', '#818cf8', '#ec4899'],
        });
      } catch {
        // Safe fallback
      }

      const now = new Date();
      const renewal = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

      setReceiptData({
        txnId: newTxnId,
        tier: selectedTier,
        amount: currentPrice,
        method:
          selectedMethod === 'card'
            ? `${getCardBrand()} •••• ${cardNumber.slice(-4) || '4242'}`
            : selectedMethod === 'mpesa'
            ? `M-Pesa (${mobilePhone})`
            : selectedMethod === 'apple_pay'
            ? 'Apple Pay'
            : selectedMethod === 'paypal'
            ? 'PayPal Express'
            : 'Crypto (USDT TRC20)',
        date: now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        renewalDate: renewal.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });

      setCheckoutStep('receipt');
      sounds.playBoostSurge();
    }, 2400);
  };

  const handleCopyCrypto = () => {
    navigator.clipboard?.writeText('0x71C...MUSHER_VIP_VAULT_DEPOSIT_2026');
    setCryptoCopied(true);
    setTimeout(() => setCryptoCopied(false), 2500);
  };

  const handleFinishAndGoToProfile = () => {
    onClose();
    setActiveTab('profile');
    viewUserProfile(currentUser.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              selectedTier === 'vip' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}>
              {selectedTier === 'vip' ? <Crown className="w-5 h-5 fill-amber-400" /> : <BadgeCheck className="w-5 h-5 fill-sky-400/20" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Checkout & Instant Upgrade
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  256-bit SSL
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Unlock immediate views boost, viral reach, and verified creator status
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* STEP 1: PAYMENT FORM */}
          {checkoutStep === 'form' && (
            <>
              {/* Tier Switcher Pills */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedTier('premium')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    selectedTier === 'premium'
                      ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Premium Creator ($27/mo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTier('vip')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    selectedTier === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>VIP Spotlight (${vipPrice}/mo)</span>
                </button>
              </div>

              {/* Order Summary Box */}
              <div className={`p-4 rounded-2xl border transition ${
                selectedTier === 'vip'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-sky-950/20 border-sky-500/30'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {selectedTier === 'vip' ? '👑 MUSHer VIP Spotlight Pass' : '💎 MUSHer Premium Creator Pass'}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {selectedTier === 'vip'
                        ? '100x Viral Magnet, 50x Page Views surge & Auto-Likes engine'
                        : '25x Reel reach, 10x Profile Views boost & Blue Verification badge'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white font-mono">${currentPrice}.00</span>
                    <span className="text-[10px] text-zinc-400 block">/ month</span>
                  </div>
                </div>

                {selectedTier === 'vip' && (
                  <div className="pt-2.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">VIP Custom Rate ($50–$55/mo):</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-400 font-bold">${vipPrice}/mo</span>
                      <input
                        type="range"
                        min={50}
                        max={55}
                        value={vipPrice}
                        onChange={(e) => setVipPrice(Number(e.target.value))}
                        className="w-20 accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2.5 space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Platform Setup & Boost Verification</span>
                    <span className="text-emerald-400 font-bold">FREE ($0.00)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Estimated Tax</span>
                    <span className="text-zinc-300 font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800/60">
                    <span>Total Due Today</span>
                    <span className="font-mono text-amber-400">${currentPrice}.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  Select Preferred Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'card'
                        ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold">Card</span>
                    <span className="text-[9px] text-zinc-500">Visa / MC / Amex</span>
                  </button>

                  {/* Apple / Google Pay */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('apple_pay')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'apple_pay'
                        ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">Apple / GPay</span>
                    <span className="text-[9px] text-zinc-500">1-Touch Pay</span>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('paypal')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'paypal'
                        ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold">PayPal</span>
                    <span className="text-[9px] text-zinc-500">Express Checkout</span>
                  </button>

                  {/* M-Pesa / Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('mpesa')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'mpesa'
                        ? 'bg-zinc-800 border-amber-500 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">M-Pesa</span>
                    <span className="text-[9px] text-zinc-500">STK Mobile PIN</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT DETAILS FORM ACCORDING TO SELECTED METHOD */}

              {/* Card Form */}
              {selectedMethod === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-sky-400" /> Card Details
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">
                      {getCardBrand()}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                      />
                      <div className="absolute right-3 top-3 text-[10px] text-zinc-500 font-mono">
                        SSL Encrypted
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={expiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                        maxLength={4}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[11px] text-zinc-400 block mb-1">ZIP / Postal</label>
                      <input
                        type="text"
                        placeholder="90210"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Full Name as on Card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-400">
                      Save card securely for seamless auto-renewal (cancel anytime in 1 tap)
                    </span>
                  </label>
                </div>
              )}

              {/* Apple Pay / Google Pay view */}
              {selectedMethod === 'apple_pay' && (
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center text-white">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1-Touch Biometric Checkout</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Use Face ID, Touch ID, or Google Wallet linked to your device. No card number typing required.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 font-mono">
                    Authorized via Apple Pay / Google Wallet • Total: ${currentPrice}.00
                  </div>
                </div>
              )}

              {/* PayPal view */}
              {selectedMethod === 'paypal' && (
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 mx-auto flex items-center justify-center text-blue-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">PayPal Express Checkout</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Pay with your PayPal balance, bank account, or PayPal credit.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                    User: <span className="font-bold text-white">{currentUser.name}</span> (@{currentUser.username})
                  </div>
                </div>
              )}

              {/* M-Pesa view */}
              {selectedMethod === 'mpesa' && (
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-emerald-500/30 text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      M-PESA
                    </span>
                    <span className="text-xs font-bold text-white">Instant STK Push Authorization</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">M-Pesa Phone Number</label>
                    <input
                      type="text"
                      placeholder="+254 712 345 678"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      A prompt will appear immediately on this phone asking for your M-Pesa PIN.
                    </span>
                  </div>
                </div>
              )}

              {/* Security guarantees */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>30-Day Guarantee</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Instant Activation</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition ${
                    selectedTier === 'vip'
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-amber-500/30 hover:brightness-105'
                      : 'bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 text-black shadow-sky-500/30 hover:brightness-105'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    Pay ${currentPrice}.00 & Upgrade to {selectedTier === 'vip' ? 'VIP' : 'Premium'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-zinc-500">
                  By clicking Pay, you agree to our Terms of Service. Renews monthly at ${currentPrice}/mo. You can cancel anytime with a single click in your profile settings.
                </p>
              </div>
            </>
          )}

          {/* STEP 2: PROCESSING HANDSHAKE */}
          {checkoutStep === 'processing' && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-white">
                  Authorizing Payment • ${currentPrice}.00
                </h3>
                <p className="text-xs text-amber-400/90 font-mono flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {processingStatus}
                </p>
              </div>

              <div className="max-w-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                Please do not close this window. Your payment is being verified with your banking provider.
              </div>
            </div>
          )}

          {/* STEP 3: OFFICIAL DIGITAL RECEIPT & CONFIRMATION */}
          {checkoutStep === 'receipt' && receiptData && (
            <div className="space-y-5 animate-scaleUp">
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-black text-white">Payment Confirmed!</h3>
                <p className="text-xs text-zinc-300">
                  You are now officially a{' '}
                  <span className="font-bold text-amber-400 uppercase">
                    {receiptData.tier} Member
                  </span>
                  . Your reach multiplier and profile views surge are live!
                </p>
              </div>

              {/* Digital Invoice Slip */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Receipt Number</span>
                    <span className="text-xs font-mono font-bold text-zinc-200">{receiptData.txnId}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    PAID • SUCCESS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Customer</span>
                    <span className="font-semibold text-white">{currentUser.name}</span>
                    <span className="text-[10px] text-zinc-400 block truncate">@{currentUser.username}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Payment Method</span>
                    <span className="font-semibold text-white">{receiptData.method}</span>
                    <span className="text-[10px] text-zinc-400 block">Encrypted</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Payment Date</span>
                    <span className="font-mono text-zinc-300">{receiptData.date}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Next Renewal</span>
                    <span className="font-mono text-zinc-300">{receiptData.renewalDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">Total Amount Charged</span>
                  <span className="text-lg font-black text-amber-400 font-mono">${receiptData.amount}.00 USD</span>
                </div>
              </div>

              {/* Unlocked Perks Activated List */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Perks Activated On Your Account:
                </span>
                <div className="space-y-1.5 text-xs text-zinc-200">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Official Blue Verified Creator badge applied</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {receiptData.tier === 'vip'
                        ? '100x Viral Explore Magnet & 50x Profile Views push initiated'
                        : '25x Algorithmic views multiplier applied to all reels'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-pink-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Ad-free experience & unthrottled media delivery enabled</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const text = `MUSHer Invoice ${receiptData.txnId}\nPlan: ${receiptData.tier.toUpperCase()}\nAmount: $${receiptData.amount}.00\nDate: ${receiptData.date}\nStatus: PAID`;
                    navigator.clipboard?.writeText(text);
                    sounds.playSend();
                    alert('Receipt details copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Copy Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndGoToProfile}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Upgraded Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
