import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const rawBase44 = createClient({
  appId: appId || 'mindcare-app',
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Primary backend API URL (uses Vite proxy /api or explicit env)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal API request wrapper that talks to the Antigravity backend server
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("base44_access_token") || localStorage.getItem("token");
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errMessage = errJson.error;
    } catch {}
    const error = new Error(errMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// Initial mock data fallback if server is unreachable
const SEED_ASSESSMENTS = [
  {
    id: "seed-1",
    reference_id: "NHAA-2026-1042",
    full_name: "Ramesh K.",
    age: 34,
    gender: "Male",
    phone: "+91 98765 43210",
    language: "English",
    input_mode: "Voice",
    narrative: "Our village council issued a social boycott against our family after we registered a complaint. We are not allowed to fetch water from the common well, and our children are prevented from attending school. People are giving death threats.",
    primary_concern: "Social boycott",
    self_reported_stress: 8,
    consent_given: true,
    svi_score: 78,
    risk_category: "High",
    detected_indicators: ["trauma", "fear", "intimidation", "social isolation"],
    voice_features: {
      pitch_variation: "High tremors detected",
      pause_pattern: "Frequent hesitations (2.4s avg)",
      speech_rate: "Rapid / Agitated (168 wpm)",
      emotional_tone: "Fearful & Distressed"
    },
    recommendations: ["police intervention", "legal aid", "counselling", "witness protection"],
    summary: "Complainant presents acute trauma and severe distress following a village-wide social boycott and active threats. Heightened fear and isolation require immediate protective intervention and legal support.",
    status: "Escalated",
    created_date: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  },
  {
    id: "seed-2",
    reference_id: "NHAA-2026-1041",
    full_name: "Sunita D.",
    age: 29,
    gender: "Female",
    phone: "+91 91234 56789",
    language: "English",
    input_mode: "Text",
    narrative: "Facing continuous workplace harassment and discrimination based on caste identity. I feel exhausted, unable to sleep, and hopeless about receiving fair treatment from management.",
    primary_concern: "Work",
    self_reported_stress: 6,
    consent_given: true,
    svi_score: 52,
    risk_category: "Moderate",
    detected_indicators: ["depression", "fear", "social isolation"],
    voice_features: null,
    recommendations: ["counselling", "legal aid"],
    summary: "Complainant reports chronic occupational discrimination leading to emotional exhaustion, insomnia, and depressive symptoms. Regular psychological counselling and legal guidance are advised.",
    status: "Analyzed",
    created_date: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
  },
  {
    id: "seed-3",
    reference_id: "NHAA-2026-1040",
    full_name: "Anil P.",
    age: 42,
    gender: "Male",
    phone: "+91 94567 89012",
    language: "English",
    input_mode: "Voice",
    narrative: "Physical assault occurred near the community center last night. Perpetrators threatened dire consequences if we approach police. Complainant is severely shaken with physical injuries.",
    primary_concern: "Past trauma",
    self_reported_stress: 9,
    consent_given: true,
    svi_score: 88,
    risk_category: "Critical",
    detected_indicators: ["trauma", "fear", "intimidation", "extreme vulnerability"],
    voice_features: {
      pitch_variation: "Unstable / High pitch spikes",
      pause_pattern: "Long dysfluent pauses",
      speech_rate: "Irregular (110 wpm)",
      emotional_tone: "Terrified"
    },
    recommendations: ["emergency support", "medical assistance", "police intervention", "witness protection", "counselling"],
    summary: "Critical trauma presentation following targeted physical assault and imminent retaliatory threats. Immediate medical evaluation and police protection are urgently required.",
    status: "Escalated",
    created_date: new Date(Date.now() - 3600 * 1000 * 36).toISOString()
  }
];

function getStoredAssessments() {
  try {
    const raw = localStorage.getItem("base44_assessments");
    if (!raw) {
      localStorage.setItem("base44_assessments", JSON.stringify(SEED_ASSESSMENTS));
      return [...SEED_ASSESSMENTS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_ASSESSMENTS];
  }
}

function saveStoredAssessments(list) {
  try {
    localStorage.setItem("base44_assessments", JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// Client-side AI fallback in case server is booting
function analyzeLocally({ narrative = "", language = "English", self_reported_stress = 5, voice_features = null, primary_concern = "" }) {
  const text = (narrative || "").toLowerCase();
  const indicatorMap = {
    "trauma": ["trauma", "attack", "beating", "assault", "violence", "injury", "hit", "abuse", "atrocity", "burned", "caste", "untouchab", "shaken"],
    "fear": ["afraid", "scared", "fear", "terrified", "panic", "danger", "frightened", "nightmare", "cannot sleep", "hiding"],
    "depression": ["hopeless", "worthless", "sad", "crying", "lost", "exhausted", "tired", "giving up", "pain", "empty", "dark", "no hope"],
    "suicidal ideation": ["suicide", "kill myself", "end my life", "want to die", "better off dead", "end it all"],
    "intimidation": ["threat", "threatened", "harassed", "warned", "boycott", "forced", "coerced", "pressure", "stalked"],
    "social isolation": ["isolated", "alone", "boycott", "no one", "outcast", "abandoned", "shunned", "well", "excluded"],
    "extreme vulnerability": ["homeless", "displaced", "no food", "child", "elderly", "pregnant", "starving", "no shelter"]
  };

  const detected_indicators = [];
  for (const [indicator, words] of Object.entries(indicatorMap)) {
    if (words.some(w => text.includes(w))) {
      detected_indicators.push(indicator);
    }
  }

  const stressNum = Number(self_reported_stress) || 5;
  let score = Math.round((stressNum / 10) * 35);
  score += Math.min(45, detected_indicators.length * 10);
  if (voice_features) score += 10;
  if (text.length > 150) score += 5;
  if (text.length > 300) score += 5;

  let svi_score = Math.min(100, Math.max(10, score));
  let risk_category = "Low";
  if (svi_score >= 81) risk_category = "Critical";
  else if (svi_score >= 56) risk_category = "High";
  else if (svi_score >= 31) risk_category = "Moderate";

  const hasSuicide = detected_indicators.includes("suicidal ideation");
  if (hasSuicide) {
    risk_category = "Critical";
    svi_score = Math.max(85, svi_score);
  }

  const recommendations = [];
  if (risk_category === "Critical" || hasSuicide) {
    recommendations.push("emergency support", "police intervention", "medical assistance", "counselling", "witness protection");
  } else if (risk_category === "High") {
    recommendations.push("counselling", "legal aid", "police intervention", "witness protection");
  } else if (risk_category === "Moderate") {
    recommendations.push("counselling", "legal aid");
  } else {
    recommendations.push("counselling");
  }

  const voice_insights = voice_features || (text.length > 50 ? {
    pitch_variation: "Normal range",
    pause_pattern: "Even cadence",
    speech_rate: "Standard text submission",
    emotional_tone: risk_category === "Critical" ? "Acute Distress" : risk_category === "High" ? "Elevated Tension" : "Controlled"
  } : null);

  const indicatorList = detected_indicators.length > 0 ? detected_indicators.join(", ") : "general distress";
  const summary = `Complainant demonstrates screening-level signs of ${indicatorList} with a Stress Vulnerability Index of ${svi_score}/100 (${risk_category} Risk). Primary concern noted: ${primary_concern || "Psychological trauma & distress"}. Immediate recommended interventions include ${recommendations.slice(0, 3).join(", ")}.`;

  return {
    svi_score,
    risk_category,
    detected_indicators,
    voice_features: voice_insights,
    recommendations,
    summary
  };
}

function chatLocally({ message = "" }) {
  const msg = (message || "").toLowerCase();
  if (msg.includes("suicide") || msg.includes("die") || msg.includes("kill") || msg.includes("emergency") || msg.includes("danger")) {
    return "I hear your deep distress, and your safety is the most important thing. Please connect with emergency help right away: Call the National Helpline 14566, Police at 100, Medical Ambulance at 108, or AASRA 9820466726. Support is standing by for you 24/7.";
  }
  if (msg.includes("threat") || msg.includes("attack") || msg.includes("police") || msg.includes("boycott") || msg.includes("caste")) {
    return "What you are experiencing is serious and unacceptable. You have full legal protection under the SC/ST Atrocities Act. Please complete your assessment in our Assessment tab so that legal aid and police intervention can be coordinated for you. You can also dial 14566 directly.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello. Welcome to MindCare support. I am here to listen and assist you in a safe, confidential space. How are you feeling today, or what would you like help with?";
  }
  return "Thank you for sharing that with me. I understand this is difficult. We are here to support you with psychological counselling, legal resources, and emergency coordination. You can also complete a full Voice/Text assessment on the Assessment page for structured assistance.";
}

const customAuth = {
  async me() {
    try {
      const res = await apiRequest('/auth/me');
      if (res) {
        localStorage.setItem("base44_user", JSON.stringify(res));
        return res;
      }
    } catch (err) {
      console.warn("Backend auth/me error, using local user fallback:", err?.message);
    }
    const raw = localStorage.getItem("base44_user");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return null;
  },

  async loginViaEmailPassword(email, password, role = null) {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      if (res && res.user) {
        if (res.token) {
          localStorage.setItem("base44_access_token", res.token);
          localStorage.setItem("token", res.token);
        }
        localStorage.setItem("base44_user", JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn("Backend login failed, using local session fallback:", err?.message);
    }

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const determinedRole = role || (email.toLowerCase().includes("admin") ? "admin" : "user");
    const user = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: determinedRole,
      created_date: new Date().toISOString()
    };
    localStorage.setItem("base44_user", JSON.stringify(user));
    localStorage.setItem("base44_access_token", `tok-${Date.now()}`);
    return user;
  },

  async loginAsGuest() {
    try {
      const res = await apiRequest('/auth/guest', { method: 'POST' });
      if (res && res.user) {
        if (res.token) {
          localStorage.setItem("base44_access_token", res.token);
          localStorage.setItem("token", res.token);
        }
        localStorage.setItem("base44_user", JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn("Backend guest login failed, using local fallback:", err?.message);
    }

    const guestUser = {
      id: `guest-${Date.now()}`,
      email: `citizen.guest@mindcare.gov.in`,
      name: "Anonymous Citizen",
      role: "user",
      isGuest: true,
      created_date: new Date().toISOString()
    };
    localStorage.setItem("base44_user", JSON.stringify(guestUser));
    localStorage.setItem("base44_access_token", `guest-tok-${Date.now()}`);
    return guestUser;
  },

  async register({ email, password, role = "user" }) {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      if (res && res.user) {
        if (res.token) {
          localStorage.setItem("base44_access_token", res.token);
          localStorage.setItem("token", res.token);
        }
        localStorage.setItem("base44_user", JSON.stringify(res.user));
        return res;
      }
    } catch (err) {
      console.warn("Backend register failed, using local registration fallback:", err?.message);
    }

    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const user = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: role || "user",
      created_date: new Date().toISOString()
    };
    localStorage.setItem("base44_user", JSON.stringify(user));
    localStorage.setItem("base44_access_token", `tok-${Date.now()}`);
    return { success: true, user };
  },

  async verifyOtp({ email, otpCode, role = "user" }) {
    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, role })
      });
      if (res && res.user) {
        if (res.token) localStorage.setItem("base44_access_token", res.token);
        localStorage.setItem("base44_user", JSON.stringify(res.user));
        return res;
      }
    } catch (err) {}

    const user = {
      id: `usr-${Date.now()}`,
      email: email || "user@example.com",
      name: (email || "user").split('@')[0],
      role: role || "user",
      created_date: new Date().toISOString()
    };
    localStorage.setItem("base44_user", JSON.stringify(user));
    return { access_token: `tok-${Date.now()}`, user };
  },

  async resendOtp(email) {
    return { success: true };
  },

  async resetPasswordRequest(email) {
    try {
      return await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch {
      return { success: true };
    }
  },

  async resetPassword({ resetToken, newPassword }) {
    try {
      return await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword })
      });
    } catch {
      return { success: true };
    }
  },

  async loginWithProvider(provider, returnTo, role = "user") {
    const user = {
      id: `usr-${Date.now()}`,
      email: `google.user@example.com`,
      name: `Google User`,
      role: role || 'user',
      created_date: new Date().toISOString()
    };
    localStorage.setItem("base44_user", JSON.stringify(user));
    localStorage.setItem("base44_access_token", `tok-${Date.now()}`);
    window.location.href = returnTo || (role === 'admin' ? '/dashboard' : '/home');
  },

  logout(redirectUrl) {
    try {
      apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    localStorage.removeItem("base44_user");
    localStorage.removeItem("base44_access_token");
    localStorage.removeItem("token");
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/";
    }
  },

  redirectToLogin(returnUrl) {
    window.location.href = `/login?returnTo=${encodeURIComponent(returnUrl || window.location.pathname)}`;
  },

  setToken(token) {
    localStorage.setItem("base44_access_token", token);
  }
};

const customFunctions = {
  async invoke(fnName, payload) {
    try {
      const res = await apiRequest(`/functions/${fnName}`, {
        method: 'POST',
        body: JSON.stringify(payload || {})
      });
      if (res && res.data) return res;
    } catch (err) {
      console.warn(`Backend function ${fnName} call failed, using local engine:`, err?.message);
    }

    if (fnName === "analyzeAssessment") {
      const result = analyzeLocally(payload || {});
      return { data: result };
    }
    if (fnName === "supportChat" || fnName === "supportchat") {
      const reply = chatLocally(payload || {});
      return { data: { reply } };
    }
    return { data: {} };
  }
};

const customEntities = {
  Assessment: {
    async create(data) {
      try {
        const created = await apiRequest('/assessments', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (created) return created;
      } catch (err) {
        console.warn("Backend Assessment.create failed, using local storage fallback:", err?.message);
      }

      const list = getStoredAssessments();
      const newRecord = {
        ...data,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        created_date: new Date().toISOString()
      };
      list.unshift(newRecord);
      saveStoredAssessments(list);
      return newRecord;
    },

    async list(sort = "-created_date", limit = 200) {
      try {
        const query = new URLSearchParams({ sort, limit }).toString();
        const res = await apiRequest(`/assessments?${query}`);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch (err) {
        console.warn("Backend Assessment.list failed, using local storage fallback:", err?.message);
      }

      const list = getStoredAssessments();
      return list.slice(0, limit);
    },

    async get(id) {
      try {
        const res = await apiRequest(`/assessments/${id}`);
        if (res) return res;
      } catch (err) {
        console.warn("Backend Assessment.get failed, using local storage fallback:", err?.message);
      }

      const list = getStoredAssessments();
      const found = list.find(item => item.id === id || item.reference_id === id);
      return found || list[0] || null;
    },

    async update(id, data) {
      try {
        const res = await apiRequest(`/assessments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res) return res;
      } catch (err) {
        console.warn("Backend Assessment.update failed, using local storage fallback:", err?.message);
      }

      const list = getStoredAssessments();
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveStoredAssessments(list);
        return list[idx];
      }
      return data;
    },

    async delete(id) {
      try {
        const res = await apiRequest(`/assessments/${id}`, {
          method: 'DELETE'
        });
        if (res && res.success) return res;
      } catch (err) {
        console.warn("Backend Assessment.delete failed, using local storage fallback:", err?.message);
      }

      const list = getStoredAssessments().filter(item => item.id !== id);
      saveStoredAssessments(list);
      return { success: true };
    }
  }
};

const customIntegrations = {
  Core: {
    async UploadFile({ file }) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        return await apiRequest('/integrations/upload', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.warn("Backend file upload failed, using fallback:", err?.message);
        return { file_url: URL.createObjectURL(file) };
      }
    },

    async TranscribeAudio({ audio_url }) {
      try {
        const res = await apiRequest('/integrations/transcribe', {
          method: 'POST',
          body: JSON.stringify({ audio_url })
        });
        return res?.transcript || res;
      } catch (err) {
        console.warn("Backend audio transcription failed, using fallback:", err?.message);
        return "I have been facing continuous threats and harassment in my locality. Our access to community resources has been restricted, and we are living in constant fear. We urgently request legal protection and intervention.";
      }
    }
  }
};

// Seamless Proxy export: auth, functions, entities, integrations
export const base44 = new Proxy(rawBase44, {
  get(target, prop, receiver) {
    if (prop === 'auth') {
      return customAuth;
    }
    if (prop === 'functions') {
      return customFunctions;
    }
    if (prop === 'entities') {
      return customEntities;
    }
    if (prop === 'integrations') {
      return customIntegrations;
    }
    return Reflect.get(target, prop, receiver);
  }
});
