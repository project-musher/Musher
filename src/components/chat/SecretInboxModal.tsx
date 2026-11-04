import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  X,
  EyeOff,
  SquarePen,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface SecretInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretInboxModal: React.FC<SecretInboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    chats,
    currentUser,
    isSecretVaultUnlocked,
    unlockSecretVault,
    lockSecretVault,
    setSecretVaultPin,
    secretVaultPin,
    openChatWithUser,
    toggleChatSecretStatus,
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const secretChats = chats.filter((c) => c.isSecretInbox);
  const nonSecretChats = chats.filter((c) => !c.isSecretInbox);

  const handleKeyClick = (digit: string) => {
    sounds.playTap();
    if (enteredPin.length < 4) {
      const updated = enteredPin + digit;
      setEnteredPin(updated);
      setErrorMessage('');

      if (updated.length === 4) {
        const success = unlockSecretVault(updated);
        if (!success) {
          setErrorMessage('Incorrect PIN. Please try again.');
          setEnteredPin('');
        }
      }
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setEnteredPin('');
    setErrorMessage('');
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setSecretVaultPin(newPin);
      setIsChangingPin(false);
      setNewPin('');
      sounds.playGamePoint();
    } else {
      setErrorMessage('PIN must be exactly 4 digits');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 text-rose-400 border border-rose-500/30">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Secret Second Inbox <Lock className="w-3.5 h-3.5 text-rose-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                Encrypted confidential chats accessible only by your PIN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: Locked keypad vs Unlocked Inbox */}
        {!isSecretVaultUnlocked ? (
          <div className="p-6 flex flex-col items-center space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-zinc-300">Enter Secret 4-Digit PIN</span>
              <p className="text-[11px] text-zinc-500">
                Default PIN is <span className="font-mono text-rose-400">1234</span>
              </p>
            </div>

            {/* PIN Dots */}
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition ${
                    i < enteredPin.length
                      ? 'bg-rose-500 border-rose-400 scale-110 shadow-lg shadow-rose-500/50'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <span className="text-xs text-rose-400 font-medium animate-shake">
                {errorMessage}
              </span>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-64 max-w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyClick(digit)}
                  className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-lg font-bold text-white active:scale-95 transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-400 active:scale-95 transition"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('0')}
                className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-lg font-bold text-white active:scale-95 transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnteredPin('1234');
                  unlockSecretVault('1234');
                }}
                className="h-14 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-bold text-rose-300 active:scale-95 transition"
              >
                Demo 1234
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Vault Unlocked
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition"
                >
                  Change PIN
                </button>
                <button
                  onClick={lockSecretVault}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] text-rose-300 font-semibold transition"
                >
                  Lock Vault
                </button>
              </div>
            </div>

            {isChangingPin && (
              <form onSubmit={handleSaveNewPin} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <label className="text-[11px] font-semibold text-zinc-400">Set New 4-Digit PIN</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter 4 numbers"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Secret Chats List */}
            <div>
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Protected Conversations ({secretChats.length})
              </h3>
              {secretChats.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                  No secret conversations yet. Add any conversation below to move it out of your public inbox!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {secretChats.map((c) => {
                    const peer = c.participants.find((p) => p.id !== currentUser.id);
                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between transition group"
                      >
                        <div
                          onClick={() => {
                            sounds.playTap();
                            if (peer) openChatWithUser(peer);
                            onClose();
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <img
                            src={peer?.avatar}
                            alt={peer?.name}
                            className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{peer?.name}</span>
                            <span className="text-[10px] text-zinc-400">
                              {c.lastMessage?.text || 'No recent messages'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleChatSecretStatus(c.id)}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-400 hover:text-white transition"
                          title="Move to Public Inbox"
                        >
                          Un-hide
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add more chats to secret vault */}
            {nonSecretChats.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Move Public Chat into Secret Vault
                </h4>
                <div className="space-y-1">
                  {nonSecretChats.map((c) => {
                    const peer = c.participants.find((p) => p.id !== currentUser.id);
                    return (
                      <div
                        key={c.id}
                        className="px-3 py-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 flex items-center justify-between text-xs text-zinc-300"
                      >
                        <span>{peer?.name}</span>
                        <button
                          onClick={() => toggleChatSecretStatus(c.id)}
                          className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold hover:bg-rose-500/30 transition"
                        >
                          Move to Vault
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
