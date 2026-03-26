import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Fingerprint, 
  // GanttChartSquare, 
  Lock, 
  QrCode,
  Globe
} from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-blue-700 dark:text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
              Blockchain Node: Kenya Mainnet Live
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
            The Future of <br />
            <span className="text-blue-600 italic">Land Ownership.</span>
          </h1>
          
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium">
            Secure your property rights on an immutable digital ledger. 
            Eliminate fraud, bypass bureaucracy, and verify titles in milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/register"
              className="group px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center"
            >
              Public Registry
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-10 border-t border-slate-100 dark:border-slate-900">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-black uppercase text-slate-400">
                    ID
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-tight">
              Trusted by <br />
              <span className="text-slate-900 dark:text-white">150k+ Kenyan Citizens</span>
            </p>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative lg:block">
           <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-3xl -z-10 animate-pulse"></div>
           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-4 shadow-2xl rotate-2">
              <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 aspect-square flex flex-col justify-between overflow-hidden relative">
                  <Fingerprint className="text-blue-600/10 absolute -right-10 -bottom-10 w-64 h-64" />
                  <div className="flex justify-between items-start">
                      <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Deed</p>
                          <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">#LR-2024-KSM</h4>
                      </div>
                      <ShieldCheck className="text-emerald-500" size={32} />
                  </div>
                  <div className="space-y-4">
                      <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                      <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-600 uppercase">Verified on Ledger</span>
                      <QrCode size={40} className="text-slate-300 dark:text-slate-700" />
                  </div>
              </div>
           </div>
        </div>
      </main>

      {/* Trust Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-24 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Lock className="text-blue-600" size={24} />}
            title="Immutable Records"
            desc="Once recorded on our blockchain nodes, titles cannot be altered or forged by any official."
          />
          <FeatureCard 
            icon={<QrCode className="text-blue-600" size={24} />}
            title="Instant Verification"
            desc="Verify the authenticity of any title deed instantly via mobile QR scanning."
          />
          <FeatureCard 
            icon={<Globe className="text-blue-600" size={24} />}
            title="Zero Corruption"
            desc="Eliminating middle-men ensures direct transparency between the Ministry and citizens."
          />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="space-y-4 group">
        <div className="w-14 h-14 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
);

export default Home;