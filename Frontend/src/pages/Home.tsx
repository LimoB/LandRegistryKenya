import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Fingerprint,
  Plus,
  Search,
  CheckCircle2,
  Globe,
  Blocks,
  ShieldCheck,
  Lock,
  QrCode,
  MapPin
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => {
  return (
    <div className="group p-6 glass border border-border/40 rounded-2xl hover:border-primary/40 transition">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-text/50 text-xs leading-relaxed">{desc}</p>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text">
      
      {/* HERO */}
      <main className="relative pt-24 pb-16 px-6 overflow-hidden">

        {/* subtle glow */}
        <div className="absolute top-[-10%] left-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[90px] -z-10" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[110px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">

          {/* badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full border border-border/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] uppercase tracking-widest text-text/60 font-semibold">
              Polygon • Kenya Digital Registry
            </span>
          </div>

          {/* title */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            The Future of{" "}
            <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
              Land Ownership
            </span>
          </h1>

          {/* subtitle */}
          <p className="text-sm md:text-base text-text/50 max-w-xl mx-auto leading-relaxed">
            Blockchain-secured land titles that eliminate fraud and enable instant verification.
          </p>

          {/* buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="px-6 py-3 text-sm bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.03] transition"
            >
              <Plus size={16} />
              Register Land
            </Link>

            <Link
              to="/verify-title"
              className="px-6 py-3 text-sm glass rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
              <Search size={16} />
              Verify Title
            </Link>
          </div>
        </div>

        {/* CARD SECTION */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="glass rounded-3xl p-6 md:p-10 shadow-xl">

            <div className="grid lg:grid-cols-5 gap-10 items-center">

              {/* deed card */}
              <div className="lg:col-span-2">
                <div className="bg-black border border-white/10 rounded-2xl p-6 space-y-6 relative">

                  <div className="flex justify-between items-center">
                    <Fingerprint size={22} className="text-primary" />
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase text-blue-400 mb-1">
                      Title Number
                    </p>
                    <h3 className="text-lg font-mono text-white">
                      LND-2026-KSM-882
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-white/50 mt-2">
                      <MapPin size={14} />
                      Kisumu, Kenya
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] text-white/40 uppercase">
                        Owner
                      </p>
                      <p className="text-sm text-white font-semibold">
                        Joshua Omondi
                      </p>
                    </div>

                    <Blocks size={24} className="text-white/60" />
                  </div>
                </div>
              </div>

              {/* right text */}
              <div className="lg:col-span-3 space-y-5">

                <ShieldCheck size={22} className="text-blue-500" />

                <h2 className="text-2xl font-bold leading-snug">
                  Secure Property Ownership
                </h2>

                <p className="text-sm text-text/50 leading-relaxed">
                  Zero-knowledge proofs ensure ownership verification without exposing sensitive personal data.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ["Anti-Fraud", "Tamper-proof ledger"],
                    ["Instant Transfer", "Fast ownership changes"],
                    ["Bank Ready", "Use as collateral"],
                    ["Audit Trail", "Full history tracking"]
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-2 items-start">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-xs text-text/40">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STATS */}
      <section className="border-y border-border/40">
        <div className="max-w-5xl mx-auto py-10 px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["1.2M+", "Titles"],
            ["99.9%", "Uptime"],
            ["Polygon", "Network"],
            ["0", "Fraud"]
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-xl font-bold text-primary">{val}</p>
              <p className="text-[10px] uppercase text-text/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2">Core Features</h2>
          <p className="text-sm text-text/50">
            A modern infrastructure for land management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Lock size={18} />}
            title="Secure Storage"
            desc="Distributed storage across nodes ensures durability."
          />
          <FeatureCard
            icon={<QrCode size={18} />}
            title="QR Verification"
            desc="Scan and verify ownership instantly."
          />
          <FeatureCard
            icon={<Globe size={18} />}
            title="Decentralized"
            desc="No central authority controls your data."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto pb-20 px-6">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl p-10 text-center text-white">

          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Secure Your Land Today
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Get Started
            </Link>

            <button className="flex items-center justify-center gap-2 text-sm hover:underline">
              Learn More <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;