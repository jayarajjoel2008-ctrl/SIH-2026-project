import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Brain,
  Shield,
  ShieldCheck,
  User,
  HeartHandshake,
  LogIn,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Wind
} from "lucide-react";
import { safeReturnTo } from "@/lib/authReturnTo";
import heroDoctorImage from "@/assets/hero-doctor.jpg";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithRole, loginGuest, isAuthenticated, user } = useAuth();

  // Mode: "user" | "admin"
  const defaultTab = searchParams.get("role") === "admin" ? "admin" : "user";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // If already authenticated, redirect intelligently
  useEffect(() => {
    if (isAuthenticated && user) {
      const returnTo = safeReturnTo();
      const isRoleAdmin = user.role === "admin";
      if (returnTo) {
        if (!isRoleAdmin && (returnTo === "/dashboard" || returnTo.startsWith("/dashboard") || returnTo === "/admin" || returnTo.startsWith("/admin"))) {
          navigate("/home");
        } else {
          navigate(returnTo);
        }
      } else if (isRoleAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleDemoFill = (roleType) => {
    setError("");
    if (roleType === "user") {
      setEmail("citizen.user@mindpluze.org");
      setPassword("citizen123");
    } else {
      setEmail("officer.admin@mindpluze.gov.in");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const returnTo = safeReturnTo();
      const loggedUser = await loginWithRole(email, password, activeTab);
      const isRoleAdmin = activeTab === "admin" || loggedUser?.role === "admin";
      
      if (returnTo && (isRoleAdmin || (!returnTo.startsWith("/dashboard") && !returnTo.startsWith("/admin")))) {
        navigate(returnTo);
      } else if (isRoleAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setGuestLoading(true);
    try {
      await loginGuest();
      navigate("/home");
    } catch {
      setError("Unable to start guest session. Please try again.");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-[#1E1B4B] flex flex-col justify-between relative overflow-x-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Fixed Fullscreen Background Image */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: `url(${heroDoctorImage})`,
          backgroundColor: "#1E1B4B",
        }}
      />

      {/* Dark subtle gradient overlays matching front page */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/30 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Header / Portal Branding */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between z-10 mb-6">
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF8C68] via-[#FFA07A] to-[#4E36E2] shadow-soft-purple flex items-center justify-center text-white group-hover:scale-105 transition">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight drop-shadow-sm">MindPluze</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-[#B8A5FE] border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                NHAA 14566
              </span>
            </div>
            <p className="text-xs text-slate-300 font-semibold drop-shadow-sm">AI-Powered Predictive Stress & Trauma Triage</p>
          </div>
        </Link>

        {/* Quick Help Hotline Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/15 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-soft">
          <Phone className="w-3.5 h-3.5 text-[#FF8C68] animate-pulse" />
          <span>Helpline: <strong className="text-[#FFA07A]">14566</strong></span>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="max-w-xl mx-auto w-full z-10">
        {/* Role Selector Tabs (Soft UI Pill Bar with Glassmorphism) */}
        <div className="bg-slate-900/60 backdrop-blur-md p-1.5 rounded-full border border-white/15 flex items-center gap-2 mb-6 shadow-xl">
          <button
            type="button"
            onClick={() => handleTabChange("user")}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === "user"
                ? "bg-[#4E36E2] text-white shadow-soft-purple scale-[1.01]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen / User Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === "admin"
                ? "bg-[#4E36E2] text-white shadow-soft-purple scale-[1.01]"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Helpline Officer / Admin</span>
          </button>
        </div>

        {/* Card Body (Pure White Soft Card with subtle glassmorphic backdrop) */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-7 sm:p-9 shadow-2xl border border-white/40 transition-all duration-300">
          {/* Header depending on role */}
          {activeTab === "user" ? (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-[#4E36E2] bg-purple-50 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <HeartHandshake className="w-3.5 h-3.5" /> Citizen & Complainant Portal
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoFill("user")}
                  className="text-xs font-bold text-[#4E36E2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#FF8C68]" /> Fill Demo User
                </button>
              </div>
              <h2 className="text-2xl font-black text-[#1E1B4B] mt-3 tracking-tight">
                Welcome to Confidential Care
              </h2>
              <p className="text-sm text-[#8E95B2] font-medium mt-1">
                Access your trauma assessments, AI support, and emergency welfare services safely.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-[#4E36E2] bg-purple-50 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4E36E2]" /> Authorized Officer Portal
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoFill("admin")}
                  className="text-xs font-bold text-[#4E36E2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#FF8C68]" /> Fill Demo Admin
                </button>
              </div>
              <h2 className="text-2xl font-black text-[#1E1B4B] mt-3 tracking-tight">
                Helpline & Clinical Admin
              </h2>
              <p className="text-sm text-[#8E95B2] font-medium mt-1">
                Access National Helpline 14566 SVI Analytics, case triage, and dispatch logs.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="email">
                {activeTab === "user" ? "Email Address" : "Officer / Admin Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={activeTab === "user" ? "citizen@example.com" : "officer@mindpluze.gov.in"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#F4F6FB] text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#4E36E2] focus:ring-2 focus:ring-[#4E36E2]/20 transition text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#4E36E2] hover:underline font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-[#F4F6FB] text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#4E36E2] focus:ring-2 focus:ring-[#4E36E2]/20 transition text-sm font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || guestLoading}
              className="w-full mt-2 text-white font-bold py-3.5 rounded-full shadow-soft-purple flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer bg-[#4E36E2] hover:bg-[#3C28B6]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {activeTab === "user" ? "Sign In as Citizen" : "Secure Admin Login"}
                </>
              )}
            </button>
          </form>

          {/* Citizen Guest / Anonymous Access Option */}
          {activeTab === "user" && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="relative flex justify-center text-xs uppercase mb-4">
                <span className="bg-white px-3 text-[#8E95B2] font-bold tracking-wider">
                  Or Immediate Crisis Assessment
                </span>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={guestLoading || loading}
                className="w-full bg-[#F4F6FB] hover:bg-slate-100 border border-slate-200 text-[#1E1B4B] font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm transition cursor-pointer"
              >
                {guestLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#4E36E2]" />
                ) : (
                  <Stethoscope className="w-4 h-4 text-[#4E36E2]" />
                )}
                <span>Continue as Anonymous Citizen (No Sign-In Required)</span>
              </button>
            </div>
          )}

          {/* Quick Actions & Security Highlights */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E95B2]">
            {activeTab === "user" ? (
              <>
                <div>
                  New here?{" "}
                  <Link to="/register" className="text-[#4E36E2] font-bold hover:underline">
                    Create free account
                  </Link>
                </div>
                <Link to="/breathe" className="inline-flex items-center gap-1 text-[#4E36E2] font-bold hover:underline">
                  <Wind className="w-3.5 h-3.5" /> Guided Breathing
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted Admin Session</span>
                </div>
                <div className="text-slate-400 font-medium">
                  NHAA Officer ID required
                </div>
              </>
            )}
          </div>
        </div>

        {/* Public Exploration Link */}
        <div className="text-center mt-6">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-white bg-slate-900/60 hover:bg-slate-900/80 px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg transition hover:scale-105"
          >
            <span>Explore Public Features & Guidelines</span>
            <ArrowRight className="w-4 h-4 text-[#FF8C68]" />
          </Link>
        </div>
      </div>

      {/* Emergency Footer Banner */}
      <div className="max-w-xl mx-auto w-full z-10 mt-8 text-center text-xs text-slate-300 font-medium drop-shadow-sm">
        <p>
          Emergency Triage Partner: National Helpline Against Atrocities (14566) · Ministry of Social Justice & Empowerment
        </p>
      </div>
    </div>
  );
}
