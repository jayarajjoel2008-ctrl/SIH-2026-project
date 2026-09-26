import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Bot, ShieldCheck, Zap, AlertCircle, Stethoscope, ArrowRight, Activity, Lock, HeartHandshake, ChevronDown } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import Chatbot from "@/components/Chatbot";
import EmergencyModal from "@/components/EmergencyModal";
import BreatheSection from "@/components/BreatheSection";
import heroDoctorImage from "@/assets/hero-doctor.jpg";

const executiveSummary = [
  { step: "01", title: "AI Speech & NLP Triage", desc: "Real-time acoustic biomarker and narrative semantic analysis.", tag: "Acoustic AI" },
  { step: "02", title: "Multilingual Inclusivity", desc: "Covers 12+ regional Indian dialects for accessible reporting.", tag: "12+ Dialects" },
  { step: "03", title: "SVI Risk Categorization", desc: "Instant clinical scoring (0-100) into Low, Moderate, High & Critical.", tag: "Objective SVI" },
  { step: "04", title: "NHAA 14566 Integration", desc: "Automated routing to legal aid, police dispatch, and medical care.", tag: "Govt Gateway" },
];

const features = [
  { step: "01", title: "Acoustic Biomarkers", desc: "Speech rhythm, pitch variations, micro-tremors, and voice stress detection.", icon: Activity },
  { step: "02", title: "Trauma-Informed NLP", desc: "Detects intimidation, fear, suicidal ideation, and acute social distress.", icon: Brain },
  { step: "03", title: "Standardized SVI Matrix", desc: "Objective 0-100 index for fast clinical triage and priority routing.", icon: Zap },
  { step: "04", title: "End-to-End Encryption", desc: "Zero-knowledge encryption maintaining strict victim confidentiality.", icon: Lock },
  { step: "05", title: "Auto-Support Routing", desc: "Direct legal aid, police protection, medical help, and psychological care.", icon: HeartHandshake },
  { step: "06", title: "24/7 AI Companion", desc: "Instant compassionate conversational grounding and crisis de-escalation.", icon: Bot },
];

const steps = [
  {
    n: "01",
    title: "Informed Consent",
    desc: "Victims grant secure, voluntary consent with full anonymity controls.",
    badge: "Step 1"
  },
  {
    n: "02",
    title: "Voice / Text Input",
    desc: "Complainants speak or type their narrative in their native dialect.",
    badge: "Step 2"
  },
  {
    n: "03",
    title: "SVI Clinical Analysis",
    desc: "AI engine calculates Stress Vulnerability Index and detects indicators.",
    badge: "Step 3"
  },
  {
    n: "04",
    title: "Support Dispatch",
    desc: "Direct coordination with NHAA 14566, police, doctors, or counsellors.",
    badge: "Step 4"
  }
];

export default function Home() {
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  return (
    <div className="min-h-screen bg-[#EEF2F8] text-[#1E1B4B]">
      <SiteNav />
      <Chatbot />
      <EmergencyModal isOpen={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

      {/* Hero Section Container (Full-bleed doctor background image with dark gradient overlays) */}
      <section
        className="relative h-[calc(100vh-5rem)] min-h-[560px] w-full overflow-hidden bg-cover bg-center flex flex-col justify-between"
        style={{
          backgroundImage: `url(${heroDoctorImage})`,
          backgroundColor: "#1E1B4B",
        }}
      >
        {/* Dark subtle gradient overlay to make text pop while keeping doctor clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10 w-full flex-1 flex flex-col justify-center">
          <div className="grid md:grid-cols-12 gap-6 lg:gap-10 items-center flex-1 my-auto">
            
            {/* Left Column (span 7): Badge, Title, Subtitle, Buttons, Metric Pill */}
            <div className="md:col-span-7 lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              {/* Partner Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#4E36E2] px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#4E36E2] animate-pulse" />
                <span>MindPluze · NHAA 14566 Official Partner</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                <span className="text-[#B8A5FE] block">AI-Powered</span>
                <span>Trauma Support</span>
                <span className="block">for NHAA Victims</span>
              </h1>

              {/* Subtitle */}
              <p className="text-white/90 text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-xl">
                Immediate psychological assessment and crisis intervention for victims of caste-based atrocities. In official coordination with National Helpline Against Atrocities (14566).
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 bg-[#4E36E2] hover:bg-[#3C28B6] text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] text-xs sm:text-sm cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" /> Start Assessment
                </Link>

                <button
                  onClick={openChatbot}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full border border-white/25 backdrop-blur-md transition-all hover:scale-[1.02] text-xs sm:text-sm shadow-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#FFA07A]" /> Talk to AI Companion
                </button>
              </div>

              {/* Infographic Metric Card (Bottom Left) */}
              <div className="pt-1 sm:pt-2">
                <div className="inline-grid grid-cols-3 gap-5 bg-black/40 backdrop-blur-md border border-white/15 px-5 py-3 rounded-2xl shadow-xl">
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-white">50K+</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Screenings</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-[#B8A5FE]">98%</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Accuracy</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xl sm:text-2xl font-black text-white">24/7</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Active Help</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (span 5): Floating Badges over doctor */}
            <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-end items-end h-full mt-auto pb-2">
              <div className="flex flex-wrap gap-3 justify-end">
                {/* Badge 1: 100% Confidential */}
                <div className="bg-black/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/15 px-3.5 py-2.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-[#B8A5FE] flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">100% Confidential</p>
                    <p className="text-[10px] text-slate-300 font-semibold">Zero-Identity Leakage</p>
                  </div>
                </div>

                {/* Badge 2: Instant SVI Results */}
                <div className="bg-black/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/15 px-3.5 py-2.5 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FFA07A] flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 fill-[#FFA07A]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Instant SVI Results</p>
                    <p className="text-[10px] text-slate-300 font-semibold">Automated Triage Score</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator - absolute so it takes 0 document flow height */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center pointer-events-auto">
          <button
            onClick={() => document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth" })}
            className="group flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll to second page"
          >
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-75 group-hover:opacity-100">Scroll to Explore</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#B8A5FE]" />
          </button>
        </div>
      </section>

      {/* EXECUTIVE SUMMARY / HIGHLIGHTS SECTION (Second Page) */}
      <section id="highlights" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {executiveSummary.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-[#F4F6FB] text-[#4E36E2] font-mono border border-slate-200/50">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-bold text-[#FF8C68] bg-orange-50 px-2.5 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-black text-[#1E1B4B] text-base leading-snug">{item.title}</h4>
                <p className="text-xs text-[#8E95B2] mt-2 leading-relaxed font-medium">{item.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#4E36E2]">
                <span>NHAA Standard</span>
                <span>✓ Active</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BUSINESS PROCESS TIMELINE SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4E36E2] bg-purple-50 px-4 py-1.5 rounded-full border border-[#4E36E2]/20">
            Structured Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E1B4B] tracking-tight mt-3">
            Assessment Process Flow
          </h2>
          <p className="text-[#8E95B2] mt-3 text-base font-medium">
            Four streamlined clinical stages from intake to emergency intervention.
          </p>
        </div>

        {/* Connected Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-white rounded-[28px] p-7 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center"
            >
              {/* Step Node Circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF8C68] to-[#4E36E2] text-white shadow-soft-purple flex items-center justify-center font-black text-xl mb-4 border-2 border-white">
                {s.n}
              </div>

              <span className="text-[11px] font-bold text-[#4E36E2] uppercase tracking-wider bg-[#F4F6FB] px-3 py-1 rounded-full mb-2.5">
                {s.badge}
              </span>

              <h3 className="text-base font-black text-[#1E1B4B] mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-[#8E95B2] font-medium leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4E36E2] bg-purple-50 px-4 py-1.5 rounded-full border border-[#4E36E2]/20">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E1B4B] mt-3">
            Clinical & Psychological Capabilities
          </h2>
          <p className="text-[#8E95B2] mt-3 text-base font-medium">
            Combining ethical AI diagnostics with rapid crisis response protocols.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-[28px] p-7 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#F4F6FB] text-[#4E36E2] flex items-center justify-center shadow-sm group-hover:bg-[#4E36E2] group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {f.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#1E1B4B] group-hover:text-[#4E36E2] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[#8E95B2] font-medium mt-2 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#4E36E2]">
                  <span>● Clinical Module Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NHAA INTEGRATION CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-[36px] p-8 sm:p-12 shadow-soft-lg border border-slate-100 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4E36E2] bg-purple-50 px-3.5 py-1.5 rounded-full mb-4 border border-[#4E36E2]/20 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4E36E2]" /> Official Government Integration
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight">
                Integrated with National Helpline Against Atrocities (14566)
              </h2>
              <p className="mt-4 text-[#8E95B2] font-medium leading-relaxed text-sm sm:text-base">
                MindPluze operates seamlessly alongside the Ministry of Social Justice & Empowerment's NHAA 14566 framework — ensuring immediate psychiatric triage and swift legal aid routing.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="https://socialjustice.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#4E36E2] hover:bg-[#3C28B6] text-white font-bold px-6 py-3 rounded-full transition text-sm shadow-soft-purple"
                >
                  Visit NHAA Official Portal <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Infographic Success Matrix Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-[#F4F6FB] border border-slate-200/70 p-5 rounded-2xl shadow-xs">
                <p className="text-2xl font-black text-[#4E36E2]">100%</p>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1">Victim Data Privacy</p>
                <p className="text-[11px] text-[#8E95B2] font-medium mt-0.5">Encrypted at rest</p>
              </div>
              <div className="bg-[#F4F6FB] border border-slate-200/70 p-5 rounded-2xl shadow-xs">
                <p className="text-2xl font-black text-[#FF8C68]">&lt; 30s</p>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1">Assessment Time</p>
                <p className="text-[11px] text-[#8E95B2] font-medium mt-0.5">Real-time inference</p>
              </div>
              <div className="bg-[#F4F6FB] border border-slate-200/70 p-5 rounded-2xl shadow-xs">
                <p className="text-2xl font-black text-[#FF8C68]">12+</p>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1">Indian Languages</p>
                <p className="text-[11px] text-[#8E95B2] font-medium mt-0.5">Native speech engines</p>
              </div>
              <div className="bg-[#F4F6FB] border border-slate-200/70 p-5 rounded-2xl shadow-xs">
                <p className="text-2xl font-black text-[#4E36E2]">24/7</p>
                <p className="text-xs font-bold text-[#1E1B4B] mt-1">Helpline Linkage</p>
                <p className="text-[11px] text-[#8E95B2] font-medium mt-0.5">NHAA & 100/108</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO-MINUTE RESET / BREATHE SECTION */}
      <BreatheSection />

      {/* EMERGENCY CRISIS SUPPORT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[36px] bg-white border border-slate-100 p-8 sm:p-12 text-[#1E1B4B] text-center shadow-soft-lg">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF8C68] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E1B4B]">Emergency Support Helplines</h2>
          <p className="mt-2 text-[#8E95B2] max-w-xl mx-auto text-sm sm:text-base font-medium">
            If you or someone around you is in immediate danger or facing acute psychological distress, connect with emergency services immediately.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3.5">
            {[
              ["NHAA Helpline", "14566"],
              ["Police Control Room", "100"],
              ["Medical Ambulance", "108"],
              ["Tele-MANAS", "14416"],
            ].map(([l, n]) => (
              <a
                key={n}
                href={`tel:${n}`}
                className="inline-flex items-center gap-2 bg-[#F4F6FB] hover:bg-[#4E36E2] hover:text-white text-[#1E1B4B] font-bold px-6 py-3 rounded-full transition shadow-xs text-sm border border-slate-200 cursor-pointer"
              >
                📞 {l}: <span className="text-[#FF8C68] group-hover:text-white font-black">{n}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#8E95B2]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#4E36E2] flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-black text-sm text-[#1E1B4B]">MindPluze</span>
          </div>
          <p className="font-semibold text-slate-600">AI-Based Real-Time Stress & Trauma Assessment Module · NHAA 14566</p>
          <p className="mt-1">© {new Date().getFullYear()} National Helpline Against Atrocities. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}