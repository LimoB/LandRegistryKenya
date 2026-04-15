import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Fingerprint, 
  Lock, 
  QrCode,
  Search,
  CheckCircle2,
  MapPin,
  Globe,
  Plus
} from "lucide-react";

// --- Types ---
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Hero Section */}
      <main className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-400/10 dark:bg-blue-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full animate-in fade-in zoom-in duration-700">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Digital Land Reform Kenya
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
            Simple. Secure. <br />
            <span className="text-blue-600 italic">Land Ownership.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Protect your property rights with blockchain technology. 
            Instant verification, zero paperwork, and total peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              New Registration
            </Link>
            <Link
              to="/verify-title"
              className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Verify a Deed
            </Link>
          </div>
        </div>

        {/* Unique Component: The "Live" Deed Preview */}
        <div className="max-w-5xl mx-auto mt-24 relative px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl p-4 md:p-10 backdrop-blur-xl relative overflow-hidden">
             
             {/* Decorative Grid Pattern */}
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

             <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                {/* Visual Title Deed Card */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 space-y-8 shadow-inner">
                   <div className="flex justify-between items-center">
                      <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                        <Fingerprint className="text-white" size={28} strokeWidth={1.5} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Official Record</p>
                        <span className="text-emerald-500 font-bold text-sm flex items-center gap-1 justify-end">
                          <CheckCircle2 size={16} /> Verified on Ledger
                        </span>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Property Identification</p>
                      <h4 className="text-2xl font-black dark:text-white tracking-tighter">BLOCK-45/KISUMU/2026</h4>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        <MapPin size={16} className="text-blue-600" /> 
                        <span>Milimani, Kisumu City</span>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Registered Owner</p>
                        <p className="text-sm font-black dark:text-white">J. Omondi & Family</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <QrCode size={40} className="text-slate-900" />
                      </div>
                   </div>
                </div>

                {/* Content Side */}
                <div className="space-y-8">
                   <div className="space-y-2">
                     <h3 className="text-3xl font-black dark:text-white tracking-tight">Immutable Trust.</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Your title deed is now a digital asset, protected by cryptography that cannot be forged or altered.</p>
                   </div>
                   
                   <ul className="grid gap-4">
                      {[
                        { title: "Paperless", desc: "No more physical file loss." },
                        { title: "Instant", desc: "Verify ownership in 2 seconds." },
                        { title: "Direct", desc: "No brokers or hidden costs." }
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 group">
                          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <span className="block font-black text-xs uppercase tracking-widest dark:text-white">{item.title}</span>
                            <span className="text-sm text-slate-500">{item.desc}</span>
                          </div>
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Registered Titles", val: "1.2M+" },
            { label: "Fraud Attempted", val: "0%" },
            { label: "Active Nodes", val: "1,402" },
            { label: "Verify Speed", val: "< 2s" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-20">
          <FeatureCard 
            icon={<Lock size={26} strokeWidth={1.5} />}
            title="Encrypted Ledger"
            desc="Your property data is shredded and encrypted across hundreds of secure nodes. Only you hold the key."
          />
          <FeatureCard 
            icon={<QrCode size={26} strokeWidth={1.5} />}
            title="Digital DNA"
            desc="Every deed carries a unique digital fingerprint. Verification is as simple as scanning a QR code."
          />
          <FeatureCard 
            icon={<Globe size={26} strokeWidth={1.5} />}
            title="Global Standard"
            desc="Built on international blockchain standards to ensure Kenyan land rights are recognized globally."
          />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Ready to secure <br /> your future?</h2>
            <p className="text-blue-100 font-medium max-w-xl mx-auto">Join thousands of Kenyans moving their land titles to the secure ledger today.</p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-3 px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase text-xs tracking-widest"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Sub Component ---
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
    <div className="space-y-6 group">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm">
            {icon}
        </div>
        <div className="space-y-3">
          <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {desc}
          </p>
        </div>
    </div>
);

export default Home;