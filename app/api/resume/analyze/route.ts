import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Extracts the ATS score (a number) from a given text summary.
 * It looks for patterns like "ATS score XX" or "score out of 100: XX".
 * @param summary The text content returned by the AI.
 * @returns 
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
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Parse the request body to get resumeText
  const { resumeText } = await req.json();
  if (!resumeText) {
    // Return 400 Bad Request if resumeText is missing
    return NextResponse.json(
      { error: "Resume text is missing" },
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
          "HTTP-Referer": "http://localhost:3000", // ✅ change to your domain in prod
          "X-Title": "HireSense", // ✅ optional title
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // or mistral, mixtral, llama3, etc.
          messages: [
            {
              role: "system",
              content: `You are an ATS and career coach. Analyze resumes. Provide:
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

    const result = await response.json();
    const aiFeedback = result.choices?.[0]?.message?.content ?? "";
    const atsScore = extractAtsScore(aiFeedback);

    return NextResponse.json({ atsScore, aiFeedback });
  } catch (err: any) {
    console.error("Failed to get AI analysis:", err);

    if (err.status === 429) {
      return NextResponse.json(
        {
          error: "Quota exceeded. Please try later or switch models.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      atsScore: 65,
      aiFeedback: `
        **ATS Score: 65/100**
  
        **Strengths**
        - Clear layout
        - Relevant experience
  
        **Weaknesses**
        - No quantifiable metrics
        - Lacks certifications
  
        **Suggestions**
        - Add numbers to show impact
        - Include relevant keywords from job description
      `,
    });
  }
}  