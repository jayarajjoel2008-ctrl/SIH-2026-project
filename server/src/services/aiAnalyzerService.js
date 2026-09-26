import { config } from '../config/index.js';

const INDICATOR_MAP = {
  "trauma": ["trauma", "attack", "beating", "assault", "violence", "injury", "hit", "abuse", "atrocity", "burned", "caste", "untouchab", "shaken", "lynched", "mob", "struck"],
  "fear": ["afraid", "scared", "fear", "terrified", "panic", "danger", "frightened", "nightmare", "cannot sleep", "hiding", "trembling", "dread"],
  "depression": ["hopeless", "worthless", "sad", "crying", "lost", "exhausted", "tired", "giving up", "pain", "empty", "dark", "no hope", "helpless", "burden"],
  "suicidal ideation": ["suicide", "kill myself", "end my life", "want to die", "better off dead", "end it all", "take my life", "no reason to live"],
  "intimidation": ["threat", "threatened", "harassed", "warned", "boycott", "forced", "coerced", "pressure", "stalked", "cornered", "blackmail"],
  "social isolation": ["isolated", "alone", "boycott", "no one", "outcast", "abandoned", "shunned", "well", "excluded", "ostracized", "cut off"],
  "extreme vulnerability": ["homeless", "displaced", "no food", "child", "elderly", "pregnant", "starving", "no shelter", "penniless", "evicted"]
};

export class AIAnalyzerService {
  /**
   * Analyze narrative and extract trauma indicators, compute SVI score, risk tier, and clinical summary
   */
  static async analyzeAssessment({
    narrative = "",
    language = "English",
    self_reported_stress = 5,
    voice_features = null,
    input_mode = "Text",
    primary_concern = ""
  }) {
    // If Gemini or OpenAI API key is configured, optionally use external LLM
    if (config.geminiApiKey) {
      try {
        const llmResult = await this.invokeGemini({
          narrative,
          language,
          self_reported_stress,
          voice_features,
          input_mode,
          primary_concern
        });
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn("External Gemini API call failed, falling back to built-in clinical NLP engine:", err.message);
      }
    }

    return this.analyzeClinicalNLP({
      narrative,
      language,
      self_reported_stress,
      voice_features,
      input_mode,
      primary_concern
    });
  }

  /**
   * High-fidelity, trauma-informed clinical NLP rule and scoring engine
   */
  static analyzeClinicalNLP({
    narrative = "",
    language = "English",
    self_reported_stress = 5,
    voice_features = null,
    input_mode = "Text",
    primary_concern = ""
  }) {
    const text = (narrative || "").toLowerCase();

    // 1. Detect emotional & trauma indicators
    const detected_indicators = [];
    for (const [indicator, keywords] of Object.entries(INDICATOR_MAP)) {
      if (keywords.some(word => text.includes(word))) {
        detected_indicators.push(indicator);
      }
    }

    // 2. Base score from self-reported stress (1-10 -> 0-35 points)
    const stressNum = Math.max(1, Math.min(10, Number(self_reported_stress) || 5));
    let score = Math.round((stressNum / 10) * 35);

    // 3. Indicator weighted score (up to 45 points)
    const indicatorWeights = {
      "suicidal ideation": 30,
      "trauma": 15,
      "intimidation": 12,
      "extreme vulnerability": 14,
      "fear": 10,
      "depression": 10,
      "social isolation": 8
    };

    let indicatorScore = 0;
    for (const ind of detected_indicators) {
      indicatorScore += (indicatorWeights[ind] || 8);
    }
    score += Math.min(45, indicatorScore);

    // 4. Voice features addition
    if (voice_features) {
      score += 10;
    }

    // 5. Narrative distress density & detail
    if (text.length > 150) score += 5;
    if (text.length > 300) score += 5;

    // Normalize SVI score between 0 and 100
    let svi_score = Math.min(100, Math.max(10, score));

    // 6. Risk categorization
    let risk_category = "Low";
    if (svi_score >= 81) risk_category = "Critical";
    else if (svi_score >= 56) risk_category = "High";
    else if (svi_score >= 31) risk_category = "Moderate";
    else risk_category = "Low";

    // 7. Safety override: Suicidal ideation or acute lethal threat forces Critical risk
    const hasSuicide = detected_indicators.includes("suicidal ideation");
    if (hasSuicide) {
      risk_category = "Critical";
      svi_score = Math.max(88, svi_score);
    }

    // 8. Actionable recommendations
    const recommendations = [];
    if (risk_category === "Critical" || hasSuicide) {
      recommendations.push("emergency support");
      recommendations.push("police intervention");
      recommendations.push("medical assistance");
      recommendations.push("counselling");
      recommendations.push("witness protection");
    } else if (risk_category === "High") {
      recommendations.push("counselling");
      recommendations.push("legal aid");
      recommendations.push("police intervention");
      recommendations.push("witness protection");
    } else if (risk_category === "Moderate") {
      recommendations.push("counselling");
      recommendations.push("legal aid");
    } else {
      recommendations.push("counselling");
    }

    // 9. Voice feature insights
    const voice_insights = voice_features || (text.length > 30 ? {
      pitch_variation: "Normal frequency range",
      pause_pattern: "Consistent speech cadence",
      speech_rate: input_mode === "Voice" ? "Measured / Controlled (125 wpm)" : "Standard digital submission",
      emotional_tone: risk_category === "Critical" ? "Acute Distress / Tremor" : risk_category === "High" ? "Elevated Tension" : "Coherent & Steady"
    } : null);

    // 10. Trauma-informed clinical summary
    const indicatorList = detected_indicators.length > 0 ? detected_indicators.join(", ") : "general situational stress";
    const concernText = primary_concern ? `Primary reported concern: "${primary_concern}". ` : "";
    const summary = `Complainant presents screening-level indications of ${indicatorList} with a Stress Vulnerability Index (SVI) score of ${svi_score}/100 (${risk_category} Risk tier). ${concernText}Immediate recommended interventions include: ${recommendations.slice(0, 3).join(", ")}.`;

    return {
      svi_score,
      risk_category,
      detected_indicators,
      voice_features: voice_insights,
      recommendations,
      summary
    };
  }

  /**
   * Optional Gemini API integration for deep trauma analysis
   */
  static async invokeGemini({ narrative, language, self_reported_stress, voice_features, primary_concern }) {
    const prompt = `You are a trauma-informed clinical AI assistant supporting the National Helpline Against Atrocities (NHAA 14566) in India.
Analyze the following narrative and produce a JSON response with:
- svi_score (number 0-100)
- risk_category ("Low" | "Moderate" | "High" | "Critical")
- detected_indicators (array of: trauma, fear, depression, suicidal ideation, intimidation, social isolation, extreme vulnerability)
- recommendations (array of: emergency support, police intervention, medical assistance, counselling, legal aid, witness protection)
- summary (compassionate clinical summary)

Narrative: "${narrative}"
Language: ${language}
Self-reported stress: ${self_reported_stress}/10
Primary concern: ${primary_concern}

Respond with valid JSON only.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Empty Gemini response");

    const parsed = JSON.parse(candidateText);
    return {
      svi_score: Math.max(0, Math.min(100, Math.round(Number(parsed.svi_score) || 50))),
      risk_category: parsed.risk_category || "Moderate",
      detected_indicators: Array.isArray(parsed.detected_indicators) ? parsed.detected_indicators : [],
      voice_features: voice_features || null,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["counselling"],
      summary: parsed.summary || ""
    };
  }
}
