import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: <Fingerprint className="text-blue-600" size={32} strokeWidth={1.5} />,
    title: "1. Verified Identity",
    desc: "Your account is linked to your official ID. This ensures that only the rightful owner can access or manage property records."
  },
  {
    icon: <Zap className="text-amber-500" size={32} strokeWidth={1.5} />,
    title: "2. Smart Processing",
    desc: "Our system automatically checks for existing claims and legal blockers, making title transfers instant and fraud-proof."
  },
  {
    icon: <ShieldCheck className="text-emerald-500" size={32} strokeWidth={1.5} />,
    title: "3. Permanent Security",
    desc: "Once a record is saved, it is locked into the national digital ledger. It can never be lost, deleted, or altered by anyone."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-24 px-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full">
            <span className="text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">Transparency first</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            How we protect <br />
            <span className="text-blue-600">your property.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base leading-relaxed">
            We’ve replaced slow, manual paperwork with a secure digital system 
            that puts the power back into the hands of the landowners.
          </p>
        </div>

        {/* Process Steps Section */}
        <div className="relative">
          {/* Subtle connecting line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-900 -translate-y-1/2 -z-10" />
          
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center space-y-6 p-8 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                  {step.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Section: Old vs New */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="p-10 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">The Old Way</h4>
            <ul className="space-y-4">
              {["Weeks of waiting", "Risk of lost files", "Middlemen & hidden fees", "Manual verification"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-500 line-through decoration-slate-300 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-10 bg-blue-600 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-blue-600/20">
            <h4 className="font-bold text-blue-200 uppercase tracking-widest text-xs">The LandLedger Way</h4>
            <ul className="space-y-4">
              {["Instant title transfers", "Records saved forever", "Transparent & direct", "Smartphone verification"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle2 className="text-blue-200" size={18} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          
          <div className="space-y-4 relative z-10 text-center md:text-left">
            <h4 className="text-2xl md:text-3xl font-black">Ready to claim your digital deed?</h4>
            <p className="text-blue-100/70 text-sm font-medium">Join thousands of homeowners securing their future today.</p>
          </div>
          
          <Link 
            to="/register"
            className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl relative z-10"
          >
            Create Your Account
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;