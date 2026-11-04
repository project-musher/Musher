import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  TrendingUp,
  X,
  BadgeCheck,
  Rocket,
  Shield,
  Eye,
  Heart,
  Flame,
  CreditCard,
  Lock,
  Smartphone,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const SubscriptionModal: React.FC = () => {
  const {
    userSubscription,
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    subscribeToTier,
    cancelSubscription,
    boostProfilePageViewsAndLikes,
    currentUser,
  } = useApp();

  const [vipPrice, setVipPrice] = useState(52); // $50 - $55 / month
  const [boostResult, setBoostResult] = useState<{ viewsAdded: number; likesAdded: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'premium' | 'vip'>('premium');

  if (!isSubscriptionModalOpen) return null;

  const currentTier = userSubscription.tier;

  const handleOpenCheckout = (tier: 'premium' | 'vip') => {
    sounds.playTap();
    setCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  const handleSimulateBoost = () => {
    const result = boostProfilePageViewsAndLikes();
    setBoostResult(result);
    setTimeout(() => setBoostResult(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header banner */}
        <div className="p-6 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-b border-zinc-800 relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300 border border-amber-500/40">
                <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
              </span>
              <h2 className="text-lg font-extrabold text-white">
                MUSHer Premium & VIP Club
              </h2>
            </div>
            <p className="text-xs text-zinc-300">
              Get an insane surge in profile page views, viral reel reach, and exclusive VIP status
            </p>
          </div>
          <button
            onClick={closeSubscriptionModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active tier status bar */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                {currentTier === 'vip' ? '👑' : currentTier === 'premium' ? '💎' : '🌱'}
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Current Tier: <span className="uppercase text-amber-400">{currentTier}</span>
                  {currentTier !== 'free' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                      Active
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentTier === 'vip'
                    ? '100x Viral Reel Reach & 50x Profile Views Surge'
                    : currentTier === 'premium'
                    ? '25x Algorithmic Views Boost & Blue Verification'
                    : 'Standard organic reach'}
                </span>
              </div>
            </div>

            {currentTier !== 'free' && (
              <button
                onClick={cancelSubscription}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
              >
                Cancel Auto-Renew
              </button>
            )}
          </div>

          {/* Pricing Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tier 1: Premium ($27/mo) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition ${
              currentTier === 'premium'
                ? 'bg-sky-950/30 border-sky-500 shadow-xl shadow-sky-500/10'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                    <h3 className="font-extrabold text-sm text-white">Premium Creator</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    Popular
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">$27</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>

                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span><strong>10x–25x</strong> Viral Reels View Multiplier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span><strong>10x Profile Page Views</strong> Boost</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Official Blue Verified Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Unlimited Time Capsule Letters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Ad-free uninterrupted browsing</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenCheckout('premium')}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                    currentTier === 'premium'
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                      : 'bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{currentTier === 'premium' ? 'Current Active Tier (Manage)' : 'Make Payment for Premium ($27/mo)'}</span>
                </button>
              </div>
            </div>

            {/* Tier 2: VIP ($50-$55/mo) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between relative transition ${
              currentTier === 'vip'
                ? 'bg-amber-950/40 border-amber-500 shadow-2xl shadow-amber-500/20 ring-1 ring-amber-500'
                : 'bg-gradient-to-b from-amber-950/20 to-zinc-900 border-amber-500/40 hover:border-amber-400'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h3 className="font-extrabold text-sm text-white">VIP Spotlight</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-sm">
                    Maximum Reach
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-amber-400 font-mono">${vipPrice}</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  {/* Price slider between 50 and 55 */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-400 font-mono">$50</span>
                    <input
                      type="range"
                      min={50}
                      max={55}
                      value={vipPrice}
                      onChange={(e) => setVipPrice(Number(e.target.value))}
                      className="w-24 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-zinc-400 font-mono">$55</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-zinc-200">
                  <li className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Rocket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>100x Viral Explore Magnet</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-amber-200">
                    <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>50x Surge in Page Views:</strong> A lot of people will view your page!</span>
                  </li>
                  <li className="flex items-center gap-2 text-pink-300">
                    <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0 fill-pink-400" />
                    <span><strong>Automatic Likes Engine:</strong> More people will like your content!</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                    <span>Golden VIP Crown Profile Ornament</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Unrestricted 3D Message Universe Archiving</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleOpenCheckout('vip')}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                    currentTier === 'vip'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-500/30'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{currentTier === 'vip' ? 'Current Active VIP (Manage)' : `Make Payment for VIP ($${vipPrice}/mo)`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* How to Make Payment Guide */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" /> How to Make Payment for Premium or VIP
              </span>
              <span className="text-[10px] text-zinc-400">Accepted globally</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] mb-1">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">1</span>
                  Select Plan
                </div>
                <p className="text-[10px] text-zinc-400">
                  Pick Premium ($27/mo) or VIP ($50–$55/mo) with guaranteed views & likes boost.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                  Choose Payment Method
                </div>
                <p className="text-[10px] text-zinc-400">
                  Credit/Debit Card (Visa/Mastercard), 1-Tap Apple/Google Pay, PayPal, or M-Pesa.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                  Instant Boost & Receipt
                </div>
                <p className="text-[10px] text-zinc-400">
                  Perks activate immediately with an official downloadable digital invoice.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-sky-400" /> Visa / Mastercard / Amex
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-400" /> Apple / Google Pay
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-green-400" /> M-Pesa
                </span>
              </div>
              <button
                onClick={() => handleOpenCheckout('premium')}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 transition"
              >
                <span>Launch Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Boost Simulator */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Live Algorithmic Boost Simulator
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Simulate the viral traffic boost powered by your subscription tier
                </p>
              </div>

              <button
                onClick={handleSimulateBoost}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <Flame className="w-3.5 h-3.5 fill-black" /> Trigger Viral Surge
              </button>
            </div>

            {boostResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
                <span>🔥 Algorithmic push successful!</span>
                <span className="font-mono font-bold">
                  +{boostResult.viewsAdded.toLocaleString()} Page Views • +{boostResult.likesAdded} Likes
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block mb-0.5 uppercase tracking-wider">Total Profile Views</span>
                <span className="text-lg font-extrabold text-white font-mono">
                  {(currentUser.profileViewsCount || 1840).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block mb-0.5 uppercase tracking-wider">Total Likes Received</span>
                <span className="text-lg font-extrabold text-pink-400 font-mono">
                  {(currentUser.totalLikesReceived || 8920).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialTier={checkoutTier}
        customVipPrice={vipPrice}
      />
    </div>
  );
};
