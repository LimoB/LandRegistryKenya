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
    <div className="group p-8 glass border border-border/50 rounded-[2rem] hover:border-primary/50 transition-all duration-300">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-text/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      {/* HERO SECTION */}
      <main className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Glows - Matched to Sidebar Palette */}
        <div className="absolute top-[-10%] left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full shadow-sm border border-border/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-text font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
              Polygon Mainnet Live • Kenya Digital Registry
            </span>
          </div>

          {/* Hero Title with Gradient Text */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] lg:max-w-4xl mx-auto">
            The Future of <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Land Titles.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text/50 max-w-2xl mx-auto font-medium leading-relaxed">
            Eliminate land fraud with immutable blockchain-backed records. 
            Transparent, secure, and instantly verifiable for every citizen.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 text-white font-black rounded-2xl hover:scale-[1.05] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
            >
              <Plus size={20} />
              New Registration
            </Link>

            <Link
              to="/verify-title"
              className="w-full sm:w-auto px-10 py-4 glass text-text font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Verify Deed
            </Link>
          </div>
        </div>

        {/* INTERACTIVE DEED PREVIEW - MATCHED TO SIDEBAR DESIGN */}
        <div className="max-w-6xl mx-auto mt-24 px-4">
          <div className="glass rounded-[3rem] p-4 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              
              {/* The "Deed Card" */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[2.5rem] p-8 space-y-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-[0.05] pointer-events-none rotate-12">
                    <Fingerprint size={200} />
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                      <Fingerprint size={32} />
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={12} />
                      Verified
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Title Number</p>
                    <h3 className="text-2xl font-bold text-white font-mono">LND-2026-KSUM-882</h3>
                    <div className="flex items-center gap-2 text-white/40 text-sm mt-3">
                      <MapPin size={16} className="text-blue-500" />
                      Milimani Estate, Kisumu
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/30 uppercase font-bold">Primary Holder</p>
                      <p className="text-lg font-bold text-white">Joshua Omondi</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl">
                       <Blocks size={38} className="text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Highlights */}
              <div className="lg:col-span-3 space-y-8 px-4">
                <div className="inline-flex p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <ShieldCheck size={28} />
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-tight">
                  Sovereign Identity <br/>Meet Property Rights.
                </h2>
                <p className="text-text/50 text-lg leading-relaxed">
                  We use Zero-Knowledge Proofs to verify ownership without exposing sensitive personal data. Your land is yours, protected by mathematics.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    ["Anti-Fraud", "Tamper-proof ledger logs"],
                    ["Instant Sale", "Liquid property transfers"],
                    ["Bank Integration", "Collateralized in seconds"],
                    ["Public Audit", "Transparent trail of history"]
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3 items-start">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="text-emerald-500" size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{title}</p>
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

      {/* WEB3 STATS SECTION */}
      <section className="border-y border-border/50 glass">
        <div className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            ["1.2M+", "Titles Registered"],
            ["99.9%", "Uptime Status"],
            ["Polygon", "Mainnet Layer"],
            ["0", "Fraud Cases"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent tracking-tighter">{val}</p>
              <p className="text-[10px] text-text/40 font-black uppercase tracking-[0.2em] mt-2">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="max-w-6xl mx-auto py-32 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
                <h2 className="text-4xl font-black tracking-tight mb-4">The New Standard.</h2>
                <p className="text-text/50">Moving Kenya from physical files to an immutable digital reality.</p>
            </div>
            <Link to="/how-it-works" className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
                Explore Technology <ArrowRight size={20} />
            </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Lock />}
            title="Encrypted Vault"
            desc="Physical deeds can be lost or burned. Your digital title is sharded across thousands of nodes."
          />
          <FeatureCard
            icon={<QrCode />}
            title="Smart Verification"
            desc="Every land parcel is issued a unique QR fingerprint for instant mobile verification."
          />
          <FeatureCard
            icon={<Globe />}
            title="Decentralized"
            desc="No single point of failure. The registry belongs to the citizens, secured by the network."
          />
        </div>
      </section>

      {/* CALL TO ACTION - GRADIENT BOX */}
      <section className="max-w-6xl mx-auto pb-32 px-6">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
              Secure your land <br/> in the digital age.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                to="/register"
                className="bg-white text-blue-600 px-12 py-5 rounded-[1.5rem] font-black hover:scale-105 hover:shadow-2xl transition-all shadow-xl"
                >
                Register My Land
                </Link>
                <button className="text-white font-bold flex items-center gap-2 hover:underline">
                    Watch Demo <ArrowRight size={18} />
                </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;