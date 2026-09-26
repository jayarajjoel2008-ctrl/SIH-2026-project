export const SEED_USERS = [
  {
    id: "usr-admin-1",
    email: "admin@mindcare.gov.in",
    password: "admin123", // In production hashed, for local demo plain/bcrypt
    name: "Helpline Administrator",
    role: "admin",
    created_date: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: "usr-demo-1",
    email: "user@example.com",
    password: "user123",
    name: "Citizen Complainant",
    role: "user",
    created_date: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: "usr-demo-2",
    email: "ramesh.k@example.com",
    password: "password123",
    name: "Ramesh K.",
    role: "user",
    created_date: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const SEED_ASSESSMENTS = [
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
  },
  {
    id: "seed-4",
    reference_id: "NHAA-2026-1039",
    full_name: "Pooja V.",
    age: 23,
    gender: "Female",
    phone: "+91 99887 76655",
    language: "Hindi",
    input_mode: "Text",
    narrative: "Denied admission and hostel accommodation despite clearing the qualifying examination with merit rank. Constant derogatory remarks made by department staff.",
    primary_concern: "Education & Institutional Discrimination",
    self_reported_stress: 5,
    consent_given: true,
    svi_score: 45,
    risk_category: "Moderate",
    detected_indicators: ["depression", "social isolation"],
    voice_features: null,
    recommendations: ["legal aid", "counselling"],
    summary: "Complainant experiences institutional denial of facilities and verbal prejudice. Moderate stress with demoralization; legal recourse and supportive academic counseling indicated.",
    status: "Analyzed",
    created_date: new Date(Date.now() - 3600 * 1000 * 50).toISOString()
  }
];
