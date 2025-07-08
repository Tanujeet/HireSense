import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Extracts the ATS score (a number) from a given AI response text.
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
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "HireSense",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an ATS and career coach. Analyze resumes and give:
              - ATS score out of 100
              - Strengths
              - Weaknesses
              - Suggestions`,
            },
            {
              role: "user",
              content: `Here is a resume:\n\n${resumeText}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const result = await response.json();
    console.log("OpenRouter raw result:", result); // 👈 log this

    const aiFeedback = data?.choices?.[0]?.message?.content ?? "";

    if (!aiFeedback) {
      return NextResponse.json({
        atsScore: 60,
        aiFeedback: `⚠️ AI didn't return valid feedback. Please try again later.`,
      });
    }
    const atsScore = extractAtsScore(aiFeedback);

    return NextResponse.json({ atsScore, aiFeedback });
  } catch (error: any) {
    console.error("AI analysis failed:", error);

    return NextResponse.json({
      atsScore: 0,
      aiFeedback: `We couldn’t analyze your resume due to a server issue. Please try again later.`,
    });
  }
}
