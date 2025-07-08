import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Extracts ATS score from AI feedback string (caps at 100).
 */
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
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          {
            role: "system",
            content: `You are an ATS (Applicant Tracking System) and resume evaluator.
    
    You must ALWAYS reply in the following format:
    
    **ATS Score:** X/100
    
    **Strengths**
    - ...
    - ...
    
    **Weaknesses**
    - ...
    - ...
    
    **Suggestions**
    - ...
    - ...
    
    Do NOT skip sections. Do NOT reply with generic advice. Focus only on the resume provided.`,
          },
          {
            role: "user",
            content: `Here is the resume:\n\n${resumeText}`,
          },
        ],
      }),
    });
    

    const result = await response.json();
    console.log(
      "🧠 OpenRouter AI Raw Result:",
      JSON.stringify(result, null, 2)
    );

    if (!result.choices || !result.choices[0]?.message?.content) {
      return NextResponse.json(
        {
          atsScore: 60,
          aiFeedback:
            "⚠️ AI did not return valid feedback. Please try again later.",
        },
        { status: 200 }
      );
    }

    const aiFeedback = result.choices[0].message.content.trim();
    const atsScore = extractAtsScore(aiFeedback);

    return NextResponse.json({ atsScore, aiFeedback });
  } catch (error) {
    console.error("❌ AI analysis failed:", error);

    return NextResponse.json(
      {
        atsScore: 60,
        aiFeedback:
          "❌ We couldn't analyze your resume due to a server or API issue. Please try again later.",
      },
      { status: 500 }
    );
  }
}
