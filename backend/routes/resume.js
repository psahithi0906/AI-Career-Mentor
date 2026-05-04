const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = file.originalname.toLowerCase().split(".").pop();
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/rtf",
      "text/rtf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const allowedExtensions = ["pdf", "docx", "doc", "txt", "rtf"];

    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(extension)) {
      return cb(new Error("Please upload a resume as PDF, DOCX, TXT, or RTF."));
    }

    cb(null, true);
  },
});

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const normalizeText = (value, fallback = "") => {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text || fallback;
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
};

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

const parseJson = (content) => {
  const cleaned = content.replace(/```json|```/gi, "").trim();
  const jsonBlock = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonBlock ? jsonBlock[0] : cleaned);
};

const ROLE_PROFILES = [
  {
    match: ["data scientist", "machine learning", "ml engineer", "ai engineer"],
    skills: ["python", "sql", "machine learning", "statistics", "pandas", "numpy", "scikit", "tensorflow", "pytorch", "model", "feature engineering", "data visualization"],
    projects: [
      {
        title: "End-to-end predictive modeling project",
        description: "Build a model from raw data through cleaning, feature engineering, training, evaluation, and deployment notes.",
        skillsToShow: ["Python", "Model evaluation", "Feature engineering", "Data storytelling"],
      },
      {
        title: "Business analytics dashboard",
        description: "Create a dashboard that explains trends, key metrics, and recommendations from a real dataset.",
        skillsToShow: ["SQL", "Visualization", "Insight generation"],
      },
    ],
  },
  {
    match: ["data analyst", "business analyst", "analytics"],
    skills: ["sql", "excel", "power bi", "tableau", "python", "dashboard", "metrics", "reporting", "statistics", "data cleaning", "stakeholder"],
    projects: [
      {
        title: "KPI dashboard for a business problem",
        description: "Analyze a dataset, define KPIs, and build a dashboard with clear recommendations.",
        skillsToShow: ["SQL", "Power BI or Tableau", "Business metrics", "Presentation"],
      },
      {
        title: "Customer or sales analysis case study",
        description: "Show data cleaning, segmentation, trend analysis, and action-oriented insights.",
        skillsToShow: ["Excel", "Data cleaning", "Storytelling"],
      },
    ],
  },
  {
    match: ["frontend", "front end", "react", "ui developer"],
    skills: ["html", "css", "javascript", "typescript", "react", "redux", "api", "responsive", "accessibility", "testing", "vite"],
    projects: [
      {
        title: "Responsive React product dashboard",
        description: "Build a dashboard with API data, filters, loading states, error states, and mobile-friendly layouts.",
        skillsToShow: ["React", "API integration", "Responsive CSS", "State management"],
      },
      {
        title: "Accessible component library",
        description: "Create reusable buttons, forms, modals, and cards with keyboard and screen-reader support.",
        skillsToShow: ["Accessibility", "Reusable components", "Testing"],
      },
    ],
  },
  {
    match: ["backend", "back end", "node", "api developer"],
    skills: ["node", "express", "api", "sql", "postgres", "mongodb", "authentication", "jwt", "testing", "docker", "performance"],
    projects: [
      {
        title: "Secure REST API with authentication",
        description: "Build an API with JWT auth, validation, database models, pagination, and documented endpoints.",
        skillsToShow: ["Node.js", "Express", "Database design", "Authentication"],
      },
      {
        title: "API performance and logging project",
        description: "Add caching, structured logs, error handling, and load-test results to an existing API.",
        skillsToShow: ["Performance", "Observability", "Testing"],
      },
    ],
  },
  {
    match: ["full stack", "mern", "software engineer", "software developer"],
    skills: ["javascript", "typescript", "react", "node", "express", "sql", "mongodb", "api", "testing", "git", "deployment"],
    projects: [
      {
        title: "Full-stack job tracking application",
        description: "Build a deployed app with authentication, CRUD flows, search/filtering, and a clean database schema.",
        skillsToShow: ["React", "Node.js", "Database design", "Deployment"],
      },
      {
        title: "Real-time collaboration feature",
        description: "Add notifications, live updates, or chat to prove end-to-end product engineering ability.",
        skillsToShow: ["WebSockets", "State management", "Backend APIs"],
      },
    ],
  },
  {
    match: ["devops", "cloud", "site reliability", "sre"],
    skills: ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform", "linux", "monitoring", "networking", "security"],
    projects: [
      {
        title: "CI/CD deployment pipeline",
        description: "Containerize an app and deploy it with automated tests, builds, and environment configuration.",
        skillsToShow: ["Docker", "CI/CD", "Cloud deployment"],
      },
      {
        title: "Infrastructure monitoring setup",
        description: "Create dashboards and alerts for logs, uptime, latency, and resource usage.",
        skillsToShow: ["Monitoring", "Linux", "Incident readiness"],
      },
    ],
  },
  {
    match: ["product manager", "associate product", "product owner"],
    skills: ["roadmap", "user research", "metrics", "analytics", "stakeholder", "prioritization", "wireframe", "agile", "requirements", "experimentation"],
    projects: [
      {
        title: "Product case study with roadmap",
        description: "Pick a product, define users, problems, success metrics, prioritization, and a release plan.",
        skillsToShow: ["User research", "Prioritization", "Metrics", "Roadmapping"],
      },
      {
        title: "Feature experiment proposal",
        description: "Design an A/B test with hypothesis, target segment, success metrics, and rollout risks.",
        skillsToShow: ["Experimentation", "Analytics", "Stakeholder communication"],
      },
    ],
  },
];

const DEFAULT_PROFILE = {
  skills: ["communication", "problem solving", "collaboration", "analysis", "documentation", "project management", "leadership", "technical skills"],
  projects: [
    {
      title: "Role-focused portfolio project",
      description: "Build a project that mirrors the daily responsibilities of the target role and documents the outcome clearly.",
      skillsToShow: ["Execution", "Documentation", "Problem solving"],
    },
    {
      title: "Measurable improvement case study",
      description: "Improve an existing process, app, or analysis and show the before/after result with numbers.",
      skillsToShow: ["Impact analysis", "Communication", "Ownership"],
    },
  ],
};

const getRoleProfile = (targetRole) => {
  const role = targetRole.toLowerCase();
  return ROLE_PROFILES.find((profile) => profile.match.some((keyword) => role.includes(keyword))) || DEFAULT_PROFILE;
};

const countMatches = (resumeLower, keywords) => {
  return keywords.filter((keyword) => resumeLower.includes(keyword.toLowerCase()));
};

const hasAny = (resumeLower, values) => {
  return values.some((value) => resumeLower.includes(value));
};

const extractPdfText = async (file) => {
  const parser = new PDFParse({ data: file.buffer });

  try {
    const result = await parser.getText();
    return normalizeText(result.text).replace(/\n{3,}/g, "\n\n");
  } finally {
    await parser.destroy();
  }
};

const extractTextFile = (file) => {
  return normalizeText(file.buffer.toString("utf8")).replace(/\n{3,}/g, "\n\n");
};

const stripRtfText = (file) => {
  return normalizeText(file.buffer.toString("utf8"))
    .replace(/\\par[d]?/gi, "\n")
    .replace(/\\'[0-9a-f]{2}/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\\[a-z]+\d* ?/gi, "")
    .replace(/\n{3,}/g, "\n\n");
};

const extractResumeText = async (file) => {
  const extension = file.originalname.toLowerCase().split(".").pop();

  if (file.mimetype === "application/pdf" || extension === "pdf") {
    return extractPdfText(file);
  }

  if (file.mimetype === "text/plain" || extension === "txt") {
    return extractTextFile(file);
  }

  if (["application/rtf", "text/rtf"].includes(file.mimetype) || extension === "rtf") {
    return stripRtfText(file);
  }

  if (file.mimetype === "application/msword" || extension === "doc") {
    throw new Error("Legacy .doc files cannot be parsed yet. Please export the resume as .docx and upload again.");
  }

  const result = await mammoth.extractRawText({ buffer: file.buffer });
  return normalizeText(result.value).replace(/\n{3,}/g, "\n\n");
};

const buildFallbackAnalysis = ({ resumeText, targetRole, currentSkills }) => {
  const resumeLower = resumeText.toLowerCase();
  const profile = getRoleProfile(targetRole);
  const roleKeywords = [...new Set([targetRole, ...profile.skills])];
  const matchedRoleKeywords = countMatches(resumeLower, roleKeywords);
  const userSkillMatches = countMatches(resumeLower, currentSkills);
  const missingKeywords = roleKeywords.filter((keyword) => !matchedRoleKeywords.includes(keyword)).slice(0, 8);
  const hasMetrics = /\b\d+(\.\d+)?\s?(%|percent|k|m|x|hours|users|customers|revenue|accuracy|reduced|increased|improved)\b/i.test(resumeText);
  const hasProjects = hasAny(resumeLower, ["project", "portfolio", "github", "built", "developed", "implemented"]);
  const hasExperience = hasAny(resumeLower, ["experience", "intern", "worked", "responsible", "managed", "created"]);
  const hasEducation = hasAny(resumeLower, ["education", "degree", "university", "college", "bachelor", "master"]);
  const hasSummary = hasAny(resumeLower, ["summary", "profile", "objective"]);

  const keywordCoverage = matchedRoleKeywords.length / Math.max(roleKeywords.length, 1);
  const sectionScore = [hasProjects, hasExperience, hasEducation, hasSummary].filter(Boolean).length * 5;
  const metricScore = hasMetrics ? 12 : 0;
  const userSkillScore = Math.min(userSkillMatches.length * 3, 12);
  const atsScore = Math.max(35, Math.min(92, Math.round(38 + keywordCoverage * 30 + sectionScore + metricScore + userSkillScore)));

  const skillGaps = missingKeywords.slice(0, 5).map((skill, index) => ({
    skill,
    reason: `${skill} is commonly expected for ${targetRole} roles, but it was not clearly visible in the resume text.`,
    priority: index < 3 ? "High" : "Medium",
  }));

  if (!hasMetrics) {
    skillGaps.unshift({
      skill: "Quantified achievements",
      reason: "The resume needs numbers such as impact, scale, accuracy, time saved, users, or percentage improvement.",
      priority: "High",
    });
  }

  if (!hasProjects) {
    skillGaps.push({
      skill: "Project evidence",
      reason: `A ${targetRole} resume is stronger when it proves skills through practical projects or portfolio work.`,
      priority: "Medium",
    });
  }

  const improvements = [
    hasMetrics
      ? "Keep the quantified achievements, but make sure each major project or role has at least one measurable result."
      : "Add measurable results to bullets, such as percentages, accuracy, users, time saved, revenue, or performance improvements.",
    matchedRoleKeywords.length > 0
      ? `Keep visible role keywords like ${matchedRoleKeywords.slice(0, 4).join(", ")}, and add the missing high-priority ones naturally.`
      : `Add role-specific keywords for ${targetRole}, especially ${missingKeywords.slice(0, 5).join(", ")}.`,
    hasSummary
      ? `Rewrite the summary so it directly targets ${targetRole} and mentions your strongest matching skills.`
      : `Add a short professional summary targeted to ${targetRole} with 3-4 strongest skills.`,
    hasProjects
      ? "For each project, include problem, tools used, your contribution, and final outcome."
      : "Add a projects section with 1-2 role-relevant projects, tools used, and measurable outcomes.",
  ];

  return {
    atsScore,
    atsSummary: `Estimated match for ${targetRole}: ${Math.round(keywordCoverage * 100)}% role-keyword coverage, ${hasMetrics ? "measurable impact found" : "measurable impact missing"}, and ${hasProjects ? "project evidence found" : "project evidence needs strengthening"}.`,
    skillGaps: skillGaps.slice(0, 6),
    improvements,
    projects: profile.projects,
    keywords: missingKeywords.length > 0 ? missingKeywords : roleKeywords.slice(0, 8),
  };
};

const analyzeWithGroq = async ({ resumeText, targetRole, currentSkills, experience }) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const prompt = `
Analyze this resume for a candidate applying for the role: ${targetRole}.

Candidate context:
- Current skills: ${currentSkills.join(", ") || "Not provided"}
- Experience: ${experience || "Not provided"}

Resume text:
${resumeText.slice(0, 12000)}

Return ONLY valid JSON in this exact shape:
{
  "atsScore": 0,
  "atsSummary": "string",
  "skillGaps": [
    {
      "skill": "string",
      "reason": "string",
      "priority": "High|Medium|Low"
    }
  ],
  "improvements": ["string"],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "skillsToShow": ["string"]
    }
  ],
  "keywords": ["string"]
}
Keep the advice specific to the resume text and the target role.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content: "You are an ATS resume reviewer and career mentor. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return parseJson(response.data.choices?.[0]?.message?.content || "{}");
};

const handleUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    next();
  });
};

router.post("/analyze", verifyToken, handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    const targetRole = normalizeText(req.body.targetRole, "Software Engineer");
    const experience = normalizeText(req.body.experience);
    const currentSkills = normalizeText(req.body.currentSkills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const resumeText = await extractResumeText(req.file);

    if (resumeText.length < 80) {
      return res.status(400).json({
        success: false,
        message: "Could not read enough resume text from this document. Please upload a text-based PDF, DOCX, TXT, or RTF resume.",
      });
    }

    let parsed;
    let source = "Groq AI";

    try {
      parsed = await analyzeWithGroq({ resumeText, targetRole, currentSkills, experience });
    } catch (aiError) {
      console.error("Resume AI fallback triggered:", aiError.message);
      parsed = buildFallbackAnalysis({ resumeText, targetRole, currentSkills });
      source = "Local fallback";
    }

    const atsScore = Number(parsed.atsScore);

    res.json({
      success: true,
      source,
      analysis: {
        source,
        atsScore: Number.isFinite(atsScore) ? Math.max(0, Math.min(100, Math.round(atsScore))) : 60,
        atsSummary: normalizeText(parsed.atsSummary, "Resume analysis completed."),
        skillGaps: ensureArray(parsed.skillGaps).map((item) => ({
          skill: normalizeText(item.skill, "Skill"),
          reason: normalizeText(item.reason, "Important for the target role."),
          priority: normalizeText(item.priority, "Medium"),
        })),
        improvements: normalizeArray(parsed.improvements),
        projects: ensureArray(parsed.projects).map((item) => ({
          title: normalizeText(item.title, "Recommended project"),
          description: normalizeText(item.description, "Build a project that proves role readiness."),
          skillsToShow: normalizeArray(item.skillsToShow),
        })),
        keywords: normalizeArray(parsed.keywords),
      },
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Resume analysis failed",
    });
  }
});

module.exports = router;
