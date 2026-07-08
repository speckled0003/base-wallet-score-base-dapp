"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Copy,
  Fingerprint,
  Gauge,
  Loader2,
  Medal,
  Radio,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { formatEther } from "viem";
import { supportedChains } from "@/lib/wagmi";

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function chainName(chainId?: number) {
  if (chainId === base.id) return "Base";
  if (chainId === baseSepolia.id) return "Base Sepolia";
  return "Unsupported";
}

function scoreFromAddress(address?: string) {
  if (!address) return 72;
  const clean = address.toLowerCase().replace("0x", "");
  const seed = clean
    .slice(0, 16)
    .split("")
    .reduce((sum, char) => sum + Number.parseInt(char, 16), 0);
  return 58 + (seed % 38);
}

function tierFor(score: number) {
  if (score >= 90) return "Based Legend";
  if (score >= 80) return "Power Builder";
  if (score >= 70) return "Onchain Regular";
  return "Fresh Explorer";
}

export function WalletScoreApp() {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const { address, connector, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    sendTransaction,
    data: saveHash,
    isPending: isSaving,
    error: saveError,
  } = useSendTransaction();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    chainId: base.id,
    query: { enabled: Boolean(address) },
  });

  const score = useMemo(() => scoreFromAddress(address), [address]);
  const tier = tierFor(score);
  const isSupported = supportedChains.some((chain) => chain.id === chainId);
  const primaryConnector = connectors[0];
  const addressExplorerUrl = address ? `https://basescan.org/address/${address}` : "";
  const txExplorerUrl = useMemo(() => {
    if (!saveHash) return "";
    const root =
      chainId === baseSepolia.id
        ? "https://sepolia.basescan.org"
        : "https://basescan.org";
    return `${root}/tx/${saveHash}`;
  }, [chainId, saveHash]);

  const traits = [
    { label: "Identity", value: shortAddress(address) || "Connect" },
    {
      label: "Balance",
      value: balanceLoading
        ? "..."
        : `${Number(formatEther(balance?.value ?? BigInt(0))).toFixed(4)} ETH`,
    },
    { label: "Network", value: chainName(chainId) },
  ];

  const badges = [
    { title: "Base native", copy: "Ready for Base App" },
    { title: "Shareable", copy: "Card built for social" },
    { title: "Signal score", copy: "Stable wallet profile" },
  ];

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function shareScore() {
    const text = `My Base Wallet Score is ${score}: ${tier}.`;

    if (navigator.share) {
      await navigator.share({
        title: "Base Wallet Score",
        text,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setShared(true);
    window.setTimeout(() => setShared(false), 1200);
  }

  function saveScoreOnchain() {
    if (!address) return;

    if (!isSupported) {
      switchChain({ chainId: base.id });
      return;
    }

    sendTransaction({
      to: address,
      value: BigInt(0),
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071318] text-white">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_10%,rgba(21,184,136,0.38),transparent_34%),linear-gradient(180deg,#071318_0%,#0a1d20_50%,#061216_100%)]" />
        <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-[560px] w-[560px] rounded-full border border-emerald-200/12 bg-emerald-300/10 blur-3xl" />

        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/score-icon.svg"
                alt=""
                width={44}
                height={44}
                className="rounded-2xl"
                priority
              />
              <div>
                <p className="text-sm font-semibold">Base Wallet Score</p>
                <p className="text-xs text-white/55">Score. Save. Share.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs text-white/70 backdrop-blur">
              <Radio className="size-3.5 text-emerald-300" />
              {chainName(chainId)}
            </div>
          </header>

          <div className="grid flex-1 items-center gap-7 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
            <section className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/18 bg-emerald-300/12 px-3 py-2 text-sm text-emerald-100">
                <Sparkles className="size-4" />
                Wallet profile in one tap
              </div>
              <h1 className="text-[3.15rem] font-semibold leading-[0.94] tracking-normal sm:text-7xl lg:text-8xl">
                Score your Base wallet.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/68 lg:mx-0">
                Connect a wallet, get a clean Base profile card, save the score
                onchain, and share your identity.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-[1.35rem] border border-white/12 bg-white/8 p-2 backdrop-blur-xl">
                {[
                  ["1", "Connect"],
                  ["2", "Save"],
                  ["3", "Share"],
                ].map(([step, label]) => (
                  <div key={step} className="rounded-2xl bg-[#0d1f22]/86 px-3 py-3">
                    <p className="text-sm font-bold text-emerald-200">{step}</p>
                    <p className="mt-1 text-xs font-semibold leading-4 text-white">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mx-auto w-full max-w-[470px]">
              <div className="rounded-[2.2rem] border border-white/16 bg-white/10 p-3 shadow-2xl shadow-black/45 backdrop-blur-2xl">
                <div className="rounded-[1.65rem] border border-white/12 bg-[#f7fbf9] p-5 text-slate-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Wallet score
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">{tier}</h2>
                    </div>
                    <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-700/20">
                      <Gauge className="size-5" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[2rem] bg-slate-950 p-5 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-white/55">Score</p>
                        <p className="mt-1 text-[4.5rem] font-black leading-none">
                          {score}
                        </p>
                      </div>
                      <Medal className="mb-2 size-12 text-emerald-300" />
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {traits.map((trait) => (
                      <div
                        key={trait.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="text-sm text-slate-500">{trait.label}</p>
                        <p className="text-sm font-semibold text-slate-950">{trait.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {!isConnected ? (
                      <button
                        type="button"
                        onClick={() => primaryConnector && connect({ connector: primaryConnector })}
                        disabled={!primaryConnector || isConnecting}
                        className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {isConnecting ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
                        Connect wallet
                      </button>
                    ) : !isSupported ? (
                      <button
                        type="button"
                        onClick={() => switchChain({ chainId: base.id })}
                        disabled={isSwitching}
                        className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {isSwitching ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                        Switch to Base
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        {shortAddress(address)}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={shareScore}
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-600"
                    >
                      <Share2 className="size-4" />
                      {shared ? "Copied" : "Share"}
                    </button>
                  </div>

                  {isConnected && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Copy className="size-4" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <a
                        href={addressExplorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowUpRight className="size-4" />
                        Basescan
                      </a>
                      <button
                        type="button"
                        onClick={saveScoreOnchain}
                        disabled={isSaving || isSwitching}
                        className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {isSaving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : saveHash ? (
                          <BadgeCheck className="size-4 text-emerald-300" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        {saveHash ? "Score saved onchain" : "Save score onchain"}
                      </button>
                    </div>
                  )}

                  {saveHash && txExplorerUrl && (
                    <a
                      href={txExplorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
                    >
                      <span>Builder Code transaction saved</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}

                  {saveError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {saveError.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/12 bg-white/9 p-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Fingerprint className="size-4 text-emerald-200" />
                  <h2 className="text-sm font-semibold">Score badges</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.title}
                      className="rounded-2xl bg-[#0d1f22]/76 px-3 py-3"
                    >
                      <BadgeCheck className="mb-2 size-4 text-emerald-300" />
                      <p className="text-sm font-semibold">{badge.title}</p>
                      <p className="mt-1 text-xs leading-4 text-white/45">{badge.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
