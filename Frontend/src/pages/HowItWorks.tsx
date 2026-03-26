import { Fingerprint, Database, Cpu } from 'lucide-react';

const steps = [
  {
    icon: <Fingerprint className="text-blue-600" size={32} />,
    title: "Digital Identity",
    desc: "Users authenticate via Secure Gateway v3.0 using cryptographically signed IDs."
  },
  {
    icon: <Cpu className="text-purple-600" size={32} />,
    title: "Smart Contracts",
    desc: "Title transfers are governed by automated logic that prevents double-selling."
  },
  {
    icon: <Database className="text-emerald-600" size={32} />,
    title: "Immutable Ledger",
    desc: "Records are distributed across national nodes, making them impossible to alter."
  }
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-white">
            Protocol <span className="text-blue-600">Infrastructure.</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs tracking-[0.3em] uppercase">The future of land administration</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
              <div className="mb-6">{step.icon}</div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 dark:text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h4 className="text-xl font-black uppercase">Ready to secure your land?</h4>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Join 50,000+ citizens on the mainnet.</p>
          </div>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;