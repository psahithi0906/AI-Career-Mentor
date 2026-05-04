const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const normalizeText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
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

const buildFallbackRoadmap = ({ currentRole, desiredRole, experience, currentSkills }) => {
  const knownSkills = currentSkills.length > 0 ? currentSkills : ["Communication", "Problem solving"];

  return {
    summary: `Move from ${currentRole} to ${desiredRole} by strengthening role-specific fundamentals, building 2-3 targeted projects, and showing measurable impact in your portfolio and resume.`,
    matchLevel: "Intermediate",
    estimatedTimeline: experience.includes("0") || experience.includes("1") ? "6-12 months" : "4-9 months",
    skillGapAnalysis: [
      {
        skill: knownSkills[0] || "Core technical skill",
        importance: "High",
        currentStatus: "Partial",
        whyItMatters: `This gives you continuity from your current background into the ${desiredRole} role.`,
      },
      {
        skill: `${desiredRole} tools and workflows`,
        importance: "High",
        currentStatus: "Missing",
        whyItMatters: `Hiring teams for ${desiredRole} usually expect hands-on familiarity with the core tools used in the role.`,
      },
      {
        skill: "Portfolio-ready execution",
        importance: "Medium",
        currentStatus: "Partial",
        whyItMatters: "A strong project portfolio helps prove readiness even before you hold the target title officially.",
      },
    ],
    learningPath: [
      {
        phase: "Phase 1",
        focus: `Map your current skills to ${desiredRole} expectations and close the biggest knowledge gaps.`,
        duration: "2-4 weeks",
        outcomes: ["Identify top missing skills", "Create a focused learning plan", "Refresh core fundamentals"],
      },
      {
        phase: "Phase 2",
        focus: `Build practical experience through projects aligned with ${desiredRole}.`,
        duration: "4-8 weeks",
        outcomes: ["Complete 1-2 strong projects", "Document decisions and outcomes", "Show measurable impact"],
      },
      {
        phase: "Phase 3",
        focus: "Prepare for interviews and targeted applications.",
        duration: "2-4 weeks",
        outcomes: ["Tailor resume and LinkedIn", "Practice role-specific interview questions", "Start targeted applications"],
      },
    ],
    timelineMilestones: [
      {
        milestone: "Gap analysis complete",
        timeline: "Week 1",
        successCriteria: "You can list the top 3-5 skills required for the target role and your current level in each.",
      },
      {
        milestone: "First portfolio project complete",
        timeline: "Month 1-2",
        successCriteria: "You have a finished project with clear outcomes, documentation, and resume-ready bullet points.",
      },
      {
        milestone: "Job-ready profile",
        timeline: "Month 2-3",
        successCriteria: "Resume, portfolio, and interview stories are aligned to the target role.",
      },
    ],
    careerProgression: [
      {
        role: currentRole,
        reason: "Use your current role as the base narrative for your transition.",
      },
      {
        role: `Intermediate ${desiredRole}`,
        reason: "A bridge role can help you gain direct experience before aiming for the final target title.",
      },
      {
        role: desiredRole,
        reason: "This becomes realistic once you can demonstrate projects, core skills, and interview readiness.",
      },
    ],
    certifications: [
      {
        name: `${desiredRole} fundamentals certification`,
        provider: "Industry-recognized provider",
        value: "Helpful if you need a structured path and a quick credibility boost.",
      },
      {
        name: "Project-based specialization",
        provider: "Practical learning platform",
        value: "Useful when paired with hands-on portfolio work instead of theory alone.",
      },
    ],
    projects: [
      {
        title: `${desiredRole} flagship project`,
        goal: `Demonstrate the core responsibilities of a ${desiredRole} in a practical way.`,
        deliverables: ["Working project", "Short case study", "GitHub or portfolio write-up"],
      },
      {
        title: "Improvement or optimization project",
        goal: "Show measurable impact, decision-making, and real-world tradeoffs.",
        deliverables: ["Before/after metrics", "Architecture or process notes", "Resume bullet points"],
      },
    ],
    jobSearchTips: [
      `Tailor your resume to ${desiredRole} keywords and responsibilities.`,
      "Use projects and quantified outcomes to compensate for title gaps.",
      "Prioritize applications where your adjacent experience is clearly transferable.",
    ],
  };
};

router.post("/roadmap", async (req, res) => {
  try {
    const currentRole = normalizeText(req.body.currentRole, "Software Engineer");
    const desiredRole = normalizeText(req.body.desiredRole);
    const experience = normalizeText(req.body.experience, "0-2 years");
    const currentSkills = normalizeArray(req.body.currentSkills);
    const company = normalizeText(req.body.company, "Not provided");

    if (!desiredRole) {
      return res.status(400).json({
        success: false,
        message: "Desired role is required",
      });
    }

    const prompt = `
Create a practical career roadmap for a user transitioning from ${currentRole} to ${desiredRole}.

User profile:
- Current role: ${currentRole}
- Experience: ${experience}
- Current company: ${company}
- Current skills: ${currentSkills.join(", ") || "Not provided"}

Return ONLY valid JSON in this shape:
{
  "summary": "string",
  "matchLevel": "Beginner|Intermediate|Strong",
  "estimatedTimeline": "string",
  "skillGapAnalysis": [
    {
      "skill": "string",
      "importance": "High|Medium|Low",
      "currentStatus": "Have|Partial|Missing",
      "whyItMatters": "string"
    }
  ],
  "learningPath": [
    {
      "phase": "string",
      "focus": "string",
      "duration": "string",
      "outcomes": ["string"]
    }
  ],
  "timelineMilestones": [
    {
      "milestone": "string",
      "timeline": "string",
      "successCriteria": "string"
    }
  ],
  "careerProgression": [
    {
      "role": "string",
      "reason": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "provider": "string",
      "value": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "goal": "string",
      "deliverables": ["string"]
    }
  ],
  "jobSearchTips": ["string"]
}
`;

    let parsed = null;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a career mentor. Return only valid JSON with realistic, actionable advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const output = completion.choices?.[0]?.message?.content || "{}";
      parsed = parseJson(output);
    } catch (groqError) {
      console.error("Groq roadmap fallback triggered:", groqError.message);
      parsed = buildFallbackRoadmap({
        currentRole,
        desiredRole,
        experience,
        currentSkills,
      });
    }

    res.json({
      success: true,
      roadmap: {
        summary: normalizeText(parsed.summary, `Roadmap from ${currentRole} to ${desiredRole}`),
        matchLevel: normalizeText(parsed.matchLevel, "Intermediate"),
        estimatedTimeline: normalizeText(parsed.estimatedTimeline, "6-12 months"),
        skillGapAnalysis: ensureArray(parsed.skillGapAnalysis).map((item) => ({
          skill: normalizeText(item.skill, "Skill"),
          importance: normalizeText(item.importance, "Medium"),
          currentStatus: normalizeText(item.currentStatus, "Missing"),
          whyItMatters: normalizeText(item.whyItMatters, "Important for the target role."),
        })),
        learningPath: ensureArray(parsed.learningPath).map((item) => ({
          phase: normalizeText(item.phase, "Phase"),
          focus: normalizeText(item.focus, "Learning focus"),
          duration: normalizeText(item.duration, "4-6 weeks"),
          outcomes: normalizeArray(item.outcomes),
        })),
        timelineMilestones: ensureArray(parsed.timelineMilestones).map((item) => ({
          milestone: normalizeText(item.milestone, "Milestone"),
          timeline: normalizeText(item.timeline, "Upcoming"),
          successCriteria: normalizeText(item.successCriteria, "Clear deliverable completed"),
        })),
        careerProgression: ensureArray(parsed.careerProgression).map((item) => ({
          role: normalizeText(item.role, "Related role"),
          reason: normalizeText(item.reason, "Supports progress toward the target role."),
        })),
        certifications: ensureArray(parsed.certifications).map((item) => ({
          name: normalizeText(item.name, "Certification"),
          provider: normalizeText(item.provider, "Recommended provider"),
          value: normalizeText(item.value, "Useful for validating your skills."),
        })),
        projects: ensureArray(parsed.projects).map((item) => ({
          title: normalizeText(item.title, "Portfolio project"),
          goal: normalizeText(item.goal, "Demonstrate relevant experience."),
          deliverables: normalizeArray(item.deliverables),
        })),
        jobSearchTips: normalizeArray(parsed.jobSearchTips),
      },
    });
  } catch (error) {
    console.error("Skill roadmap error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate skill roadmap",
      error: error.message,
    });
  }
});

module.exports = router;
