import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  Search,
  Download,
  Eye,
  Trash2,
  X,
  FileText,
  BarChart3,
  CheckCircle2,
  MoreHorizontal,
  Bell,
  Settings,
  Filter,
  ChevronDown,
  Upload,
  MapPin,
  LogOut,
  Brain,
  CalendarDays,
  Clock,
  Activity,
  Plus,
  PhoneCall
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Chatbot from "@/components/Chatbot";

const RISK_COLORS = {
  Low: "#00A3C4", // Modern cyan
  Moderate: "#F59E0B", // Amber
  High: "#F87171", // Soft coral red
  Critical: "#EF4444" // Vivid red
};

// Radial Semicircle Gauge Component matching reference image
const SemicircleGauge = ({ value = 145, subtitle = "Urgent Intakes", totalTicks = 26, activeTicks = 18 }) => {
  const ticks = [];
  const cx = 150;
  const cy = 135;
  const rInner = 82;
  const rOuter = 108;

  for (let i = 0; i < totalTicks; i++) {
    const fraction = i / (totalTicks - 1);
    const angleDeg = 180 + fraction * 180;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);

    const isActive = i <= activeTicks;
    // Gradient from vibrant cyan to light mint
    const color = isActive
      ? i < activeTicks * 0.4
        ? "#0092B8"
        : i < activeTicks * 0.8
        ? "#00B4D8"
        : "#48CAE4"
      : "#E2E8F0";

    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 300 160" className="w-full max-w-[260px] overflow-visible">
        {ticks}
      </svg>
      <div className="absolute top-[52px] flex flex-col items-center justify-center text-center">
        <span className="text-4xl sm:text-5xl font-black text-[#0D2444] tracking-tight">
          {value}
        </span>
        <span className="text-xs font-semibold text-slate-400 mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, logout, isAdmin, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAdmin) {
      navigate("/home", { replace: true });
    }
  }, [isLoadingAuth, isAdmin, navigate]);

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeNavTab, setActiveNavTab] = useState("Dashboard");
  const [growthTimeframe, setGrowthTimeframe] = useState("24h");
  const [statsFilter, setStatsFilter] = useState("SVI Distribution");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [showTriageLogsModal, setShowTriageLogsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [triageFilter, setTriageFilter] = useState("All");
  const [triageSearch, setTriageSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: 1,
      day: new Date().getDate(),
      time: "09:30 AM",
      duration: "45 mins",
      title: "Acute Trauma Psychological De-escalation",
      caseRef: "NHAA-2026-4891",
      officer: "Dr. Sarah Collins",
      priority: "Critical",
      type: "Psychiatric Care",
      status: "Scheduled"
    },
    {
      id: 2,
      day: new Date().getDate(),
      time: "11:00 AM",
      duration: "30 mins",
      title: "NHAA 14566 Legal Aid Inter-Agency Hearing",
      caseRef: "NHAA-2026-3108",
      officer: "Adv. Rajesh Sharma",
      priority: "High",
      type: "Legal Aid",
      status: "In Progress"
    },
    {
      id: 3,
      day: new Date().getDate(),
      time: "02:15 PM",
      duration: "60 mins",
      title: "Medical Evaluation & Emergency Follow-up",
      caseRef: "NHAA-2026-5920",
      officer: "Dr. Priya Patel",
      priority: "Critical",
      type: "Medical Care",
      status: "Scheduled"
    },
    {
      id: 4,
      day: new Date().getDate() + 1,
      time: "10:00 AM",
      duration: "30 mins",
      title: "Vocal Biomarker Re-assessment & SVI Re-evaluation",
      caseRef: "NHAA-2026-8812",
      officer: "Officer K. Raman",
      priority: "Moderate",
      type: "SVI Check-in",
      status: "Scheduled"
    },
    {
      id: 5,
      day: new Date().getDate() + 1,
      time: "03:30 PM",
      duration: "45 mins",
      title: "Tele-MANAS Multi-Disciplinary Case Review",
      caseRef: "NHAA-2026-1402",
      officer: "Dr. Sarah Collins",
      priority: "High",
      type: "Inter-Agency Review",
      status: "Scheduled"
    }
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime] = useState("10:00 AM");
  const [newEventCase, setNewEventCase] = useState("");
  const [newEventPriority, setNewEventPriority] = useState("High");
  const [newEventOfficer] = useState("Dr. Sarah Collins");
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Assessment.list("-created_date", 200);
      setAssessments(data || []);
    } catch (e) {
      console.error("Failed to load assessments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Metrics computation
  const counts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  assessments.forEach((a) => {
    if (counts[a.risk_category] !== undefined) counts[a.risk_category]++;
  });
  const total = assessments.length;
  const critical = counts.Critical;

  // Indicator counts
  const indicatorCounts = {};
  assessments.forEach((a) => {
    if (Array.isArray(a.detected_indicators)) {
      a.detected_indicators.forEach((ind) => {
        indicatorCounts[ind] = (indicatorCounts[ind] || 0) + 1;
      });
    }
  });
  const topIndicators = Object.entries(indicatorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Filtered rows
  const filtered = assessments.filter((a) => {
    const matchFilter = filter === "All" || a.risk_category === filter;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      (a.reference_id || "").toLowerCase().includes(q) ||
      (a.full_name || "").toLowerCase().includes(q) ||
      (a.primary_concern || "").toLowerCase().includes(q) ||
      (a.language || "").toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  // Actions
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await base44.entities.Assessment.delete(id);
      setAssessments((prev) => prev.filter((item) => item.id !== id));
      if (selectedAssessment?.id === id) {
        setSelectedAssessment(null);
      }
      setDeleteConfirmId(null);
      selectedRowIds.delete(id);
      setSelectedRowIds(new Set(selectedRowIds));
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRowIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRowIds.size} selected record(s)?`)) return;

    for (const id of selectedRowIds) {
      try {
        await base44.entities.Assessment.delete(id);
      } catch (err) {
        console.error("Error deleting record " + id, err);
      }
    }
    setAssessments((prev) => prev.filter((item) => !selectedRowIds.has(item.id)));
    setSelectedRowIds(new Set());
  };

  const handleDownloadSingle = (a, e) => {
    if (e) e.stopPropagation();
    const reportText = [
      "============================================================",
      "MINDPLUZE - CLINICAL STRESS & TRAUMA ASSESSMENT REPORT",
      "National Helpline Against Atrocities (NHAA 14566)",
      "============================================================",
      `Reference ID:         ${a.reference_id || "N/A"}`,
      `Assessment ID:        ${a.id}`,
      `Date & Time:          ${a.created_date ? new Date(a.created_date).toLocaleString() : "N/A"}`,
      `Status:               ${a.status || "Analyzed"}`,
      "",
      "--- COMPLAINANT DEMOGRAPHICS ---",
      `Full Name:            ${a.full_name || "Anonymous Complainant"}`,
      `Age:                  ${a.age || "N/A"}`,
      `Gender:               ${a.gender || "N/A"}`,
      `Phone:                ${a.phone || "N/A"}`,
      `Language:             ${a.language || "English"}`,
      `Input Mode:           ${a.input_mode || "Text"}`,
      `Primary Concern:      ${a.primary_concern || "N/A"}`,
      `Self-Reported Stress: ${a.self_reported_stress || 5} / 10`,
      "",
      "--- AI CLINICAL FINDINGS ---",
      `Stress Vulnerability Index (SVI): ${a.svi_score || 0} / 100`,
      `Risk Category:        ${a.risk_category || "Moderate"} Risk`,
      "",
      "Detected Indicators:",
      ...(a.detected_indicators && a.detected_indicators.length
        ? a.detected_indicators.map((ind) => `  * ${ind}`)
        : ["  * General distress"]),
      "",
      "Voice Analytics & Speech Biomarkers:",
      ...(a.voice_features
        ? Object.entries(a.voice_features).map(([k, v]) => `  * ${k.replace(/_/g, " ")}: ${v}`)
        : ["  * Standard text entry"]),
      "",
      "Recommended Interventions:",
      ...(a.recommendations && a.recommendations.length
        ? a.recommendations.map((rec) => `  [✓] ${rec.toUpperCase()}`)
        : ["  [✓] Psychological counselling"]),
      "",
      "Clinical Summary:",
      a.summary || "Complainant presents acute trauma indicators requiring targeted support.",
      "",
      "Complainant Narrative:",
      a.narrative || "No narrative text provided.",
      "",
      "============================================================",
      "Confidential · Generated by MindPluze Screening Engine",
      "============================================================"
    ].join("\n");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MindPluze_Report_${a.reference_id || a.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllReport = () => {
    if (assessments.length === 0) {
      alert("No assessment records to export.");
      return;
    }

    const headers = [
      "Reference ID",
      "Full Name",
      "Age",
      "Gender",
      "Phone",
      "Language",
      "Input Mode",
      "Primary Concern",
      "Self Stress (1-10)",
      "SVI Score",
      "Risk Category",
      "Detected Indicators",
      "Recommendations",
      "Summary",
      "Date"
    ];

    const rows = filtered.map((a) => [
      `"${a.reference_id || ""}"`,
      `"${(a.full_name || "").replace(/"/g, '""')}"`,
      `"${a.age || ""}"`,
      `"${a.gender || ""}"`,
      `"${a.phone || ""}"`,
      `"${a.language || ""}"`,
      `"${a.input_mode || ""}"`,
      `"${(a.primary_concern || "").replace(/"/g, '""')}"`,
      `"${a.self_reported_stress || ""}"`,
      `"${a.svi_score || ""}"`,
      `"${a.risk_category || ""}"`,
      `"${(a.detected_indicators || []).join("; ")}"`,
      `"${(a.recommendations || []).join("; ")}"`,
      `"${(a.summary || "").replace(/"/g, '""')}"`,
      `"${a.created_date ? new Date(a.created_date).toLocaleString() : ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MindPluze_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleRowSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.size === filtered.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filtered.map((a) => a.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F5F9]">
        <Loader2 className="w-10 h-10 text-[#0092B8] animate-spin mb-3" />
        <p className="text-sm font-bold text-[#0D2444]">Loading Executive Dashboard...</p>
      </div>
    );
  }

  // Weekly bar data
  const weeklyBars = [
    { day: "Mon", pct: "9.9%", height: 35, active: false },
    { day: "Tue", pct: "19%", height: 50, active: false },
    { day: "Wed", pct: "31%", height: 68, active: false },
    { day: "Thu", pct: "34%", height: 75, active: false },
    { day: "Fri", pct: "90%", height: 95, active: true },
    { day: "Sat", pct: "78%", height: 80, active: false },
    { day: "Sun", pct: "50%", height: 58, active: false }
  ];

  return (
    <div className="min-h-screen bg-[#EBEFF4] text-slate-800 p-3 sm:p-6 lg:p-8 font-sans">
      <Chatbot />

      {/* Outer Executive White Canvas Frame */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-200/70 p-5 sm:p-8 lg:p-10 transition-all">
        
        {/* ================= TOP NAVIGATION BAR ================= */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 pb-7 mb-7 border-b border-slate-100">
          {/* Left Brand */}
          <Link to="/home" className="flex items-center gap-3 self-start md:self-auto group" title="Return to Citizen Portal Home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0092B8] to-[#0D2444] flex items-center justify-center text-white shadow-md shadow-cyan-900/10 group-hover:scale-105 transition">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-[#0D2444] tracking-tight">MindPluze</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0092B8] ml-2 bg-[#0092B8]/10 px-2 py-0.5 rounded-full">
                NHAA 14566
              </span>
            </div>
          </Link>

          {/* Center Navigation Pills */}
          <nav className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200/60 overflow-x-auto max-w-full">
            {["Dashboard", "Analytics", "Assessments", "Triage Logs", "Calendar"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveNavTab(tab);
                  if (tab === "Assessments") {
                    document.getElementById("cases-table")?.scrollIntoView({ behavior: "smooth" });
                  } else if (tab === "Analytics") {
                    setShowDistributionModal(true);
                  } else if (tab === "Triage Logs") {
                    setShowTriageLogsModal(true);
                  } else if (tab === "Calendar") {
                    setShowCalendarModal(true);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeNavTab === tab
                    ? "bg-[#0D2444] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0D2444] hover:bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Right Controls & Officer Profile */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Notification Bell */}
            <button
              onClick={() => alert("All 14566 crisis channels operational.")}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#0092B8] rounded-full ring-2 ring-white" />
            </button>

            {/* Settings Gear */}
            <button
              onClick={() => setShowDistributionModal(true)}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Settings & Metrics"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Officer Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0D2444] text-[#00E5FF] flex items-center justify-center font-bold text-xs">
                  SC
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-[#0D2444] leading-tight">Sarah Collins</p>
                  <p className="text-[10px] font-medium text-slate-400">NHAA Case Officer</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#0D2444]">{user?.email || "officer.admin@mindpluze.gov.in"}</p>
                    <p className="text-[10px] text-[#0092B8] font-semibold">Lead Clinical Admin</p>
                  </div>
                  <Link
                    to="/home"
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#0092B8]" /> View Citizen Home
                  </Link>
                  <button
                    onClick={() => logout("/")}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= PAGE TITLE & ACTION TOOLBAR ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0D2444] tracking-tight">
              Clinical Triage Overview
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
              Live SVI predictive stress monitoring, victim vulnerability triage and helpline dispatch status.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDistributionModal(true)}
                className="bg-white border border-slate-200/90 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Default View</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Triage Logs button */}
            <button
              onClick={() => {
                setActiveNavTab("Triage Logs");
                setShowTriageLogsModal(true);
              }}
              className="bg-white border border-slate-200/90 text-slate-700 hover:text-[#0092B8] hover:border-[#0092B8] font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition cursor-pointer"
              title="Open Real-time Clinical Triage Logs"
            >
              <Activity className="w-3.5 h-3.5 text-[#0092B8]" />
              <span>Triage Logs</span>
            </button>

            {/* Calendar button */}
            <button
              onClick={() => {
                setActiveNavTab("Calendar");
                setShowCalendarModal(true);
              }}
              className="bg-white border border-slate-200/90 text-slate-700 hover:text-[#0092B8] hover:border-[#0092B8] font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition cursor-pointer"
              title="Open Crisis Scheduling & Appointments Calendar"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#0092B8]" />
              <span>Calendar</span>
            </button>

            {/* Export button */}
            <button
              onClick={handleDownloadAllReport}
              className="bg-white border border-slate-200/90 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            {/* Primary Filter button */}
            <button
              onClick={() => {
                document.getElementById("cases-table")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#0092B8] hover:bg-[#007F9E] text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-cyan-900/15 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Cases</span>
            </button>
          </div>
        </div>

        {/* ================= TOP 3-COLUMN METRICS ROW ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          
          {/* Column 1: Stacked Dark Card + White Card */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* Dark Navy Card (Total Sales style) */}
            <div className="bg-[#0D2444] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden flex-1">
              <div className="flex items-center justify-between text-slate-300 text-sm font-semibold mb-2">
                <span>Total Logged Cases</span>
                <button
                  onClick={() => setShowDistributionModal(true)}
                  className="hover:text-white p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
                  {total + 1420}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-[#00E5FF] bg-white/10 px-2.5 py-0.5 rounded-full">
                  +22% vs last month
                </span>
              </div>
            </div>

            {/* White Card (Total Purchase style) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between flex-1">
              <div className="flex items-center justify-between text-slate-500 text-sm font-semibold mb-2">
                <span>Critical Risk Escalations</span>
                <button
                  onClick={() => setFilter("Critical")}
                  className="hover:text-slate-700 p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-3xl sm:text-4xl font-black text-[#0D2444] tracking-tight">
                  {critical + 380}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  +8% vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: User Growth Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#0D2444]">Victim Intake & SVI Trends</span>
                <button
                  onClick={() => setShowDistributionModal(true)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-200/60 w-fit mb-5">
                {["24h", "32h", "A Week", "Month"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setGrowthTimeframe(tf)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      growthTimeframe === tf
                        ? "bg-[#0D2444] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl font-black text-[#0D2444] tracking-tight">
                  205,890
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +22%
                </span>
              </div>

              {/* Gradient Progress Bar */}
              <div className="w-full bg-slate-100 h-7 rounded-2xl overflow-hidden p-1 flex items-center">
                <div className="h-full bg-gradient-to-r from-[#0092B8] via-[#00B4D8] to-[#2DD4BF] rounded-xl w-[72%] shadow-sm transition-all duration-700" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-4 pt-3 border-t border-slate-100">
              <span>Checking totally</span>
              <span className="font-bold text-[#0D2444]">+210 today</span>
            </div>
          </div>

          {/* Column 3: Semicircle Radial Volume Gauge */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#0D2444]">Clinical Triage Volume</span>
              <button
                onClick={() => setShowDistributionModal(true)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Semicircle Gauge Graphic */}
            <div className="my-2">
              <SemicircleGauge value={145} subtitle="New Complainants" />
            </div>

            <div className="text-center text-xs font-medium text-slate-400 pt-2 border-t border-slate-100">
              <span>Triage processing speed has increased </span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block ml-1">
                +25%
              </span>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM 2-COLUMN ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
          
          {/* Left: Statistics & Weekly Bars (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <span className="text-base font-bold text-[#0D2444]">Statistics</span>

              {/* Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["SVI Distribution", "Voice Insights"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatsFilter(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      statsFilter === item
                        ? "bg-[#0D2444] text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}

                <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center gap-1">
                  <span>Weekly</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Main Stats + Column Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              {/* Left Score */}
              <div className="sm:col-span-4 space-y-2">
                <span className="text-4xl sm:text-5xl font-black text-[#0D2444] tracking-tight block">
                  +76%
                </span>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  Helpline crisis de-escalation index increases every week.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0092B8] bg-[#0092B8]/10 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 88% Resolution Rate
                  </span>
                </div>
              </div>

              {/* Right Weekly Columns */}
              <div className="sm:col-span-8 flex items-end justify-between gap-2 pt-6">
                {weeklyBars.map((b) => (
                  <div key={b.day} className="flex-1 flex flex-col items-center gap-2">
                    {/* Floating Pill Badge */}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        b.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {b.pct}
                    </span>

                    {/* Column Bar */}
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-2xl h-36 flex items-end p-1">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          b.active
                            ? "bg-gradient-to-t from-[#0092B8] to-[#2DD4BF] shadow-md shadow-cyan-900/20"
                            : "bg-[#0092B8]/20"
                        }`}
                        style={{ height: `${b.height}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span className="text-xs font-bold text-slate-400 mt-1">{b.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Regional Map & Live Officer Dispatch (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10">
              <span className="text-base font-bold text-[#0D2444]">Live Officer Dispatch</span>
              <button
                onClick={() => setShowDistributionModal(true)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Illustrated Soft Map Graphic Canvas */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#E8F4F8] via-[#EDF8FA] to-[#E3F2F7] p-4 my-2 border border-slate-200/50 overflow-hidden">
              {/* Subtle Map Country Pin */}
              <div className="absolute top-3 right-6 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 z-10">
                <span className="text-sm">🇮🇳</span>
              </div>

              {/* Dispatch Feed List */}
              <div className="space-y-2.5 relative z-10">
                {/* Item 1 */}
                <div className="bg-white/90 backdrop-blur rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm border border-white/80 hover:bg-white transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0092B8] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      JV
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D2444] truncate">Officer J. Verma</p>
                      <p className="text-[10px] text-slate-500 truncate">Police & Legal Aid Dispatched</p>
                    </div>
                  </div>
                  <button className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm shrink-0 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Zone East
                  </button>
                </div>

                {/* Item 2 */}
                <div className="bg-white/90 backdrop-blur rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm border border-white/80 hover:bg-white transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0D2444] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      PS
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D2444] truncate">Clinician P. Sharma</p>
                      <p className="text-[10px] text-slate-500 truncate">Psychological Triage Active</p>
                    </div>
                  </div>
                  <button className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm shrink-0 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Zone Central
                  </button>
                </div>

                {/* Item 3 */}
                <div className="bg-white/90 backdrop-blur rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm border border-white/80 hover:bg-white transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      MR
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0D2444] truncate">Officer M. Rao</p>
                      <p className="text-[10px] text-slate-500 truncate">Emergency Medical Enroute</p>
                    </div>
                  </div>
                  <button className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm shrink-0 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Zone South
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>National Helpline 14566 Live Dispatch</span>
              <span className="font-bold text-[#0092B8]">24/7 Active</span>
            </div>
          </div>
        </div>

        {/* ================= DETAILED CASE MANAGEMENT & ASSESSMENT TABLE ================= */}
        <section id="cases-table" className="pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-[#0D2444] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0092B8]" />
                Complainant Assessment Database ({filtered.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full encrypted repository of victim narratives, speech biomarkers, and triage classifications.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, ID, concern..."
                  className="bg-transparent text-xs font-medium outline-none w-full text-slate-800 placeholder-slate-400"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Risk Level Pills */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/60">
                {["All", "Critical", "High", "Moderate", "Low"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filter === f
                        ? "bg-[#0D2444] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {selectedRowIds.size > 0 && (
              <div className="bg-[#0D2444] text-white px-6 py-3 flex items-center justify-between text-xs font-bold">
                <span>{selectedRowIds.size} record(s) selected</span>
                <button
                  onClick={handleDeleteSelected}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No assessments found matching query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.size === filtered.length && filtered.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-[#0092B8] focus:ring-[#0092B8] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Reference ID</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Complainant</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Concern</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Language</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">SVI Score</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Risk Category</th>
                      <th className="px-4 py-4 font-bold text-[#0D2444]">Date</th>
                      <th className="px-5 py-4 font-bold text-[#0D2444] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-50/70 transition cursor-pointer group"
                        onClick={() => setSelectedAssessment(a)}
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRowIds.has(a.id)}
                            onChange={(e) => toggleRowSelect(a.id, e)}
                            className="rounded border-slate-300 text-[#0092B8] focus:ring-[#0092B8] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4 font-mono text-xs font-bold text-[#0092B8]">
                          {a.reference_id}
                        </td>
                        <td className="px-4 py-4 font-bold text-[#0D2444]">
                          {a.full_name || "Anonymous Complainant"}
                        </td>
                        <td className="px-4 py-4 text-slate-600 text-xs font-medium">
                          {a.primary_concern || "General distress"}
                        </td>
                        <td className="px-4 py-4 text-slate-600 text-xs">
                          {a.language || "English"}
                        </td>
                        <td className="px-4 py-4 font-black text-[#0D2444]">
                          {a.svi_score}/100
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                              a.risk_category === "Critical"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : a.risk_category === "High"
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : a.risk_category === "Moderate"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-cyan-50 text-[#0092B8] border border-cyan-200"
                            }`}
                          >
                            {a.risk_category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {a.created_date ? new Date(a.created_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedAssessment(a)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0092B8] hover:text-white text-[#0D2444] text-xs font-bold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                            </button>
                            <button
                              onClick={(e) => handleDownloadSingle(a, e)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                              title="Download Report"
                            >
                              <Download className="w-3.5 h-3.5 inline mr-1" /> Report
                            </button>
                            <button
                              onClick={(e) => handleDelete(a.id, e)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-bold transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* ================= MODAL: RECORD DETAILS ================= */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAssessment(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0092B8]/10 text-[#0092B8] flex items-center justify-center font-bold text-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-[#0D2444]">
                    {selectedAssessment.full_name || "Anonymous Complainant"}
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#0092B8] bg-[#0092B8]/10 px-2.5 py-0.5 rounded-full">
                    {selectedAssessment.reference_id}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Assessment ID: {selectedAssessment.id} · Recorded: {new Date(selectedAssessment.created_date || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">SVI Index</p>
                <p className="text-2xl font-black text-[#0D2444] mt-1">{selectedAssessment.svi_score}/100</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Risk Level</p>
                <p className="text-base font-black text-rose-600 mt-2">{selectedAssessment.risk_category}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Self Stress</p>
                <p className="text-2xl font-black text-[#0D2444] mt-1">{selectedAssessment.self_reported_stress || 5}/10</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Language</p>
                <p className="text-base font-black text-[#0D2444] mt-2">{selectedAssessment.language || "English"}</p>
              </div>
            </div>

            {/* Narrative & Clinical Summary */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-bold text-[#0D2444] uppercase tracking-wider mb-1.5">
                  Complainant Narrative
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                  {selectedAssessment.narrative || "No narrative text."}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0D2444] uppercase tracking-wider mb-1.5">
                  AI Clinical Summary & Recommendations
                </h4>
                <div className="p-4 rounded-2xl bg-[#0092B8]/5 border border-[#0092B8]/15 text-sm text-slate-700 leading-relaxed">
                  {selectedAssessment.summary}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleDownloadSingle(selectedAssessment, e)}
                className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>

              <button
                onClick={() => setSelectedAssessment(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REAL-TIME TRIAGE LOGS ================= */}
      {showTriageLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setShowTriageLogsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0092B8]/10 text-[#0092B8] flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#0092B8]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-[#0D2444]">Clinical Triage Logs</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live NHAA Stream
                  </span>
                </div>
                <p className="text-xs text-slate-500">Real-time audit log of SVI risk assessments, helpline alerts, and crisis dispatches</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              {/* Risk category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                {["All", "Critical", "High", "Moderate", "Low"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setTriageFilter(lvl)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      triageFilter === lvl
                        ? "bg-[#0D2444] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by ID, name, or concern..."
                  value={triageSearch}
                  onChange={(e) => setTriageSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0092B8]"
                />
              </div>
            </div>

            {/* Triage Log Stream List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {assessments
                .filter((a) => {
                  const matchFilter = triageFilter === "All" || a.risk_category === triageFilter;
                  const q = triageSearch.toLowerCase();
                  const matchQuery =
                    !q ||
                    (a.reference_id || "").toLowerCase().includes(q) ||
                    (a.full_name || "").toLowerCase().includes(q) ||
                    (a.primary_concern || "").toLowerCase().includes(q) ||
                    (a.language || "").toLowerCase().includes(q);
                  return matchFilter && matchQuery;
                })
                .slice(0, 50)
                .map((a, idx) => {
                  const isCrit = a.risk_category === "Critical";
                  const isHigh = a.risk_category === "High";
                  const actionText = isCrit
                    ? "🚨 Critical Escalation: Police 100 & NHAA Rapid Response Unit dispatched"
                    : isHigh
                    ? "📞 High Priority: Tele-MANAS 14416 Psychiatric Crisis Support assigned"
                    : a.risk_category === "Moderate"
                    ? "📋 Queued for Trauma Counselling & Legal Aid Guidance"
                    : "🧘 Guided Reset Delivered · Standard Monitoring Active";

                  return (
                    <div
                      key={a.id || idx}
                      className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#0092B8]/40 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-[#0D2444] bg-slate-100 px-2 py-0.5 rounded-md">
                            {a.reference_id || `LOG-${1000 + idx}`}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${RISK_COLORS[a.risk_category] || "#F59E0B"}15`,
                              color: RISK_COLORS[a.risk_category] || "#F59E0B"
                            }}
                          >
                            {a.risk_category} · SVI {a.svi_score || 0}/100
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {a.full_name || "Anonymous Complainant"} ({a.language || "English"})
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
                          <span>{actionText}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Primary: {a.primary_concern || "Trauma distress"} · Logged: {a.created_date ? new Date(a.created_date).toLocaleString() : "Just now"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedAssessment(a);
                            setShowTriageLogsModal(false);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0092B8] hover:bg-[#0092B8] hover:text-white transition cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}

              {assessments.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No triage logs found matching the filter criteria.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Showing live triage activity synced with Ministry of Social Justice & Empowerment (14566).
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadAllReport}
                  className="px-4 py-2 bg-[#0092B8] hover:bg-[#007F9E] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Logs
                </button>
                <button
                  onClick={() => setShowTriageLogsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRISIS SCHEDULE & CALENDAR ================= */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 mb-5 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0092B8]/10 text-[#0092B8] flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-[#0092B8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-[#0D2444]">Crisis & Clinical Calendar</h3>
                    <span className="text-xs font-bold text-[#0092B8] bg-[#0092B8]/10 px-2.5 py-0.5 rounded-full">
                      November 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Scheduled psychiatric evaluations, NHAA hearing bridges, and de-escalation check-ins</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddEventForm(!showAddEventForm)}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#0D2444] hover:bg-[#1E3A5F] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddEventForm ? "Cancel" : "Add Appointment"}</span>
              </button>
            </div>

            {/* Quick Add Event Form */}
            {showAddEventForm && (
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 animate-in slide-in-from-top-2">
                <p className="text-xs font-bold text-[#0D2444] mb-3">Schedule New Clinical / Crisis Follow-up Session</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Session Title (e.g. Trauma Counselling)"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0092B8]"
                  />
                  <input
                    type="text"
                    placeholder="Case Ref (e.g. NHAA-2026-4891)"
                    value={newEventCase}
                    onChange={(e) => setNewEventCase(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-[#0092B8]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newEventPriority}
                      onChange={(e) => setNewEventPriority(e.target.value)}
                      className="px-2 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!newEventTitle.trim()) return;
                        setCalendarEvents((prev) => [
                          {
                            id: Date.now(),
                            day: selectedDate,
                            time: newEventTime,
                            duration: "45 mins",
                            title: newEventTitle,
                            caseRef: newEventCase || `NHAA-${Math.floor(1000 + Math.random() * 9000)}`,
                            officer: newEventOfficer,
                            priority: newEventPriority,
                            type: "Clinical Session",
                            status: "Scheduled"
                          },
                          ...prev
                        ]);
                        setNewEventTitle("");
                        setNewEventCase("");
                        setShowAddEventForm(false);
                      }}
                      className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Layout: Month Grid on Left + Events List on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
              {/* Left Column: Interactive Month Days Strip */}
              <div className="lg:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#0D2444] uppercase tracking-wider">Select Date · November 2026</span>
                  <span className="text-[11px] font-bold text-[#0092B8]">Day {selectedDate} Active</span>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* 30 Day Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                    const isSelected = selectedDate === d;
                    const hasEvent = calendarEvents.some((ev) => ev.day === d);
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition cursor-pointer ${
                          isSelected
                            ? "bg-[#0092B8] text-white font-black shadow-sm"
                            : "hover:bg-white text-slate-700"
                        }`}
                      >
                        <span>{d}</span>
                        {hasEvent && (
                          <span
                            className={`w-1 h-1 rounded-full absolute bottom-1 ${
                              isSelected ? "bg-white" : "bg-[#0092B8]"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0092B8]" /> Has Scheduled Events
                  </span>
                  <span>14566 Crisis Line</span>
                </div>
              </div>

              {/* Right Column: Scheduled Appointments List */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0D2444] uppercase tracking-wider">
                    Scheduled Sessions for Day {selectedDate}
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    {calendarEvents.filter((ev) => ev.day === selectedDate).length} Appointment(s)
                  </span>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {calendarEvents
                    .filter((ev) => ev.day === selectedDate)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#0092B8]/30 hover:shadow-sm transition flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0092B8] bg-[#0092B8]/10 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3 h-3" /> {ev.time} ({ev.duration})
                            </span>
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${RISK_COLORS[ev.priority] || "#F59E0B"}15`,
                                color: RISK_COLORS[ev.priority] || "#F59E0B"
                              }}
                            >
                              {ev.priority} Priority
                            </span>
                          </div>

                          <span className="text-xs font-mono font-bold text-slate-400">
                            {ev.caseRef}
                          </span>
                        </div>

                        <div>
                          <p className="font-black text-sm text-[#0D2444]">{ev.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Assigned Officer: <span className="font-semibold text-slate-700">{ev.officer}</span> · Type: {ev.type}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold ${ev.status === "In Progress" ? "text-amber-600" : "text-slate-500"}`}>
                            Status: {ev.status}
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href="tel:14566"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0092B8] bg-slate-50 hover:bg-[#0092B8] hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 transition"
                            >
                              <PhoneCall className="w-3 h-3" /> Connect 14566
                            </a>
                            <button
                              onClick={() => {
                                setCalendarEvents((prev) =>
                                  prev.map((e) =>
                                    e.id === ev.id
                                      ? { ...e, status: e.status === "Completed" ? "Scheduled" : "Completed" }
                                      : e
                                  )
                                );
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                                ev.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {ev.status === "Completed" ? "✓ Completed" : "Mark Done"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {calendarEvents.filter((ev) => ev.day === selectedDate).length === 0 && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">No appointments scheduled for Day {selectedDate}.</p>
                      <button
                        onClick={() => setShowAddEventForm(true)}
                        className="mt-2 text-xs font-bold text-[#0092B8] hover:underline"
                      >
                        + Schedule an intake session on Day {selectedDate}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Integrated with NHAA 14566 National Helpline dispatch roster.
              </span>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DISTRIBUTION BREAKDOWN ================= */}
      {showDistributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowDistributionModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0092B8]/10 text-[#0092B8] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#0D2444]">Clinical SVI Breakdown</h3>
                <p className="text-xs text-slate-500">Comprehensive screening statistics across all complainant data</p>
              </div>
            </div>

            {/* Risk Category Distribution */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#0D2444] uppercase tracking-wide mb-3">
                Risk Classification Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(counts).map(([cat, count]) => {
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div
                      key={cat}
                      className="p-4 rounded-2xl border border-slate-100 text-center"
                      style={{ backgroundColor: `${RISK_COLORS[cat]}10` }}
                    >
                      <p className="text-xs font-bold" style={{ color: RISK_COLORS[cat] }}>
                        {cat} Risk
                      </p>
                      <p className="text-2xl font-black text-[#0D2444] mt-1">{count}</p>
                      <p className="text-[11px] text-slate-500">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Detected Psychological Indicators */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#0D2444] uppercase tracking-wide mb-3">
                Trauma & Vulnerability Indicator Frequencies
              </h4>
              <div className="space-y-2.5">
                {topIndicators.map(({ name, count }) => {
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#0D2444]">
                        <span className="capitalize">{name}</span>
                        <span>{count} cases ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0092B8] to-[#EF4444] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={handleDownloadAllReport}
                className="bg-[#0092B8] hover:bg-[#007F9E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Complete CSV
              </button>
              <button
                onClick={() => setShowDistributionModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}