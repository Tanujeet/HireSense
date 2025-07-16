import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function extractAtsScore(summary: string): number {
  const match = summary.match(
    /(?:ATS[\s-]?score|score(?: out of)? 100)?[^\d]{0,5}(\d{1,3})/i
  );
  return match ? Math.min(parseInt(match[1], 10), 100) : 0;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeText } = await req.json();

  if (!resumeText || typeof resumeText !== "string") {
    return NextResponse.json(
      { error: "Resume text is missing or invalid." },
      { status: 400 }
    );
  }

  try {
    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command-r-plus",
        prompt: `You are an ATS (Applicant Tracking System) and resume evaluator.

You must ALWAYS reply in the following format:

**ATS Score:** X/100

**Strengths**
- ...

**Weaknesses**
- ...

**Suggestions**
- ...

Do NOT skip sections. Do NOT reply with generic advice. Focus only on the resume provided.

Resume:
"""
${resumeText}
"""`,
        temperature: 0.5,
        max_tokens: 700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiFeedback = cohereRes.data.generations?.[0]?.text?.trim();

    if (!aiFeedback) {
      return NextResponse.json(
        {
          atsScore: 60,
          aiFeedback: "⚠️ Cohere AI did not return valid feedback.",
        },
        { status: 200 }
      );
    }

    const atsScore = extractAtsScore(aiFeedback);

    return NextResponse.json({ atsScore, aiFeedback });
  } catch (error) {
    console.error("❌ Cohere analysis failed:", error);

    return NextResponse.json(
      {
        atsScore: 60,
        aiFeedback: "❌ Resume analysis failed due to API error. Try again.",
      },
      { status: 500 }
    );
  }
}
