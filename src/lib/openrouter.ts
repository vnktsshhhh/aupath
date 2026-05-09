const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "anthropic/claude-3-haiku";
const SMART_MODEL = "anthropic/claude-3.5-sonnet";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chat(
  messages: ChatMessage[],
  model = DEFAULT_MODEL,
  maxTokens = 1024
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "AuPath - Australian Job Assistant",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function extractProfileFromResume(resumeText: string) {
  const response = await chat(
    [
      {
        role: "system",
        content:
          "You are an expert Australian HR consultant. Extract structured career profile data from resume text. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `Extract a structured profile from this resume. Return JSON with these fields:
{
  "name": string,
  "headline": string (e.g. "Senior Software Engineer"),
  "summary": string (2-3 sentences),
  "skills": string[] (technical and soft skills),
  "yearsExperience": number,
  "workRights": string (one of: "Australian Citizen", "Permanent Resident", "Working Holiday Visa", "Student Visa (with work rights)", "Temporary Skilled Visa (482)", "Any right to work"),
  "location": string (Australian city),
  "state": string (NSW/VIC/QLD/WA/SA/TAS/ACT/NT),
  "experiences": [{ "title": string, "company": string, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" | null, "isCurrent": boolean, "description": string }],
  "education": [{ "institution": string, "degree": string, "field": string, "startYear": number, "endYear": number | null }]
}

Resume text:
${resumeText.slice(0, 6000)}`,
      },
    ],
    SMART_MODEL,
    2048
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function calculateJobMatch(
  jobDescription: string,
  candidateProfile: {
    skills: string[];
    yearsExperience?: number | null;
    summary?: string | null;
    experiences?: Array<{ title: string; company: string; description?: string | null }>;
  }
): Promise<{
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}> {
  const response = await chat(
    [
      {
        role: "system",
        content:
          "You are an expert Australian recruiter. Analyse job fit objectively. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `Score this candidate's fit for the job (0-100). Return JSON:
{
  "score": number (0-100),
  "strengths": string[] (3-5 bullet points of matching strengths),
  "gaps": string[] (2-3 skill/experience gaps),
  "recommendation": string (one sentence advice for the candidate)
}

JOB:
${jobDescription.slice(0, 2000)}

CANDIDATE:
Skills: ${candidateProfile.skills.join(", ")}
Experience: ${candidateProfile.yearsExperience ?? "unknown"} years
Summary: ${candidateProfile.summary ?? "not provided"}
Recent roles: ${candidateProfile.experiences?.slice(0, 3).map((e) => `${e.title} at ${e.company}`).join(", ") ?? "not provided"}`,
      },
    ],
    DEFAULT_MODEL
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      score: 0,
      strengths: [],
      gaps: ["Unable to calculate match"],
      recommendation: "Please review your profile and try again.",
    };
  }
}

export async function generateCoverLetter(params: {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  candidateName: string;
  candidateSummary: string;
  candidateSkills: string[];
  experiences: Array<{ title: string; company: string }>;
}): Promise<string> {
  return chat(
    [
      {
        role: "system",
        content:
          "You are an expert Australian career coach. Write professional, concise cover letters tailored to Australian workplace culture. Do not use flowery language. Be direct and specific.",
      },
      {
        role: "user",
        content: `Write a cover letter for:
Name: ${params.candidateName}
Applying for: ${params.jobTitle} at ${params.companyName}
Job description: ${params.jobDescription.slice(0, 1500)}
My skills: ${params.candidateSkills.join(", ")}
My background: ${params.candidateSummary}
Recent roles: ${params.experiences.slice(0, 3).map((e) => `${e.title} at ${e.company}`).join(", ")}

Write a 3-paragraph cover letter (250-350 words) in Australian English. No "Dear Sir/Madam" — use the role title instead. End with "Kind regards, ${params.candidateName}".`,
      },
    ],
    SMART_MODEL,
    800
  );
}

export async function generateResumeBullets(params: {
  jobTitle: string;
  jobDescription: string;
  existingBullets: string;
}): Promise<string[]> {
  const response = await chat(
    [
      {
        role: "system",
        content:
          "You are an Australian resume expert. Rewrite experience bullets to align with job requirements using the STAR method. Use action verbs and quantify where possible.",
      },
      {
        role: "user",
        content: `Rewrite these resume bullet points for a ${params.jobTitle} role. Return a JSON array of strings.

Job requirements: ${params.jobDescription.slice(0, 1000)}

Existing bullets:
${params.existingBullets}

Return JSON: { "bullets": ["bullet1", "bullet2", ...] } (5-6 bullets)`,
      },
    ],
    DEFAULT_MODEL,
    600
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.bullets ?? [];
  } catch {
    return [];
  }
}
