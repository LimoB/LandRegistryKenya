import React from "react";
import { Link } from "react-router-dom";
import {
  Fingerprint,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: <Fingerprint size={22} strokeWidth={1.5} />,
    title: "Verified Identity",
    desc: "Your account is linked to your official ID ensuring only rightful ownership access."
  },
  {
    icon: <Zap size={22} strokeWidth={1.5} />,
    title: "Smart Processing",
    desc: "Automatic checks remove fraud risks and speed up title transfers."
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.5} />,
    title: "Permanent Security",
    desc: "Records are stored on an immutable ledger and cannot be altered."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* HEADER */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center px-3 py-1 text-[10px] rounded-full bg-blue-500/10 text-blue-500">
            Transparency First
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How it works
          </h2>

          <p className="text-sm text-text/50 leading-relaxed">
            A faster, safer way to manage land ownership using secure digital infrastructure.
          </p>
        </div>

        {/* STEPS */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="p-5 border border-border/40 rounded-xl bg-card hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                {step.icon}
              </div>

              <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-text/50 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* COMPARISON */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* OLD */}
          <div className="p-6 border border-border/40 rounded-xl bg-card">
            <h4 className="text-[10px] uppercase text-text/40 mb-4">
              Traditional System
            </h4>

            <ul className="space-y-3">
              {[
                "Slow processing",
                "Risk of lost records",
                "Hidden fees",
                "Manual verification"
              ].map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-text/50 line-through"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* NEW */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
            <h4 className="text-[10px] uppercase text-white/70 mb-4">
              LandLedger System
            </h4>

            <ul className="space-y-3">
              {[
                "Instant transfers",
                "Permanent records",
                "Transparent system",
                "Mobile verification"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-primary text-white px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-center md:text-left">
            <h4 className="text-lg font-semibold">
              Ready to secure your land?
            </h4>
            <p className="text-xs text-white/70">
              Create your account and start today.
            </p>
          </div>

          <Link
            to="/register"
            className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:scale-105 transition"
          >
            Get Started
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;