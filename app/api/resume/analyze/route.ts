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
/**
 * Handles POST requests to analyze resume text using OpenAI.
 * It expects a JSON body with 'resumeText'.
 * Returns an ATS score and AI feedback.
 */
export async function POST(req: NextRequest) {
  // Authenticate user using Clerk
  const { userId } = await auth();
  if (!userId) {
    // Return 401 Unauthorized if no user ID is found
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
    // Call OpenAI's chat completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o for better analysis
      messages: [
        {
          role: "system",
          content: `You are an ATS and career coach. Analyze resumes. Provide:
            - An ATS score out of 100 (e.g., "ATS Score: 75/100")
            - Strengths (bullet points)
            - Weaknesses (bullet points)
            - Suggestions to improve (bullet points)`,
        },
        {
          role: "user",
          content: `Here is a resume:\n\n${resumeText}\n\nGive:
            - An ATS score out of 100
            - Strengths
            - Weaknesses
            - Suggestions to improve`,
        },
      ],
    });

    // Get the content from the AI's response
    const aiFeedback = completion.choices[0].message.content;

    // Extract the ATS score using the helper function
    const atsScore = aiFeedback ? extractAtsScore(aiFeedback) : 0;

    // Return the ATS score and the full AI feedback
    return NextResponse.json({ atsScore, aiFeedback });
  } catch (err) {
    // Log any errors that occur during the AI analysis
    console.error("Failed to get AI analysis:", err);
    // Return 500 Internal Server Error
    return new NextResponse("Error analyzing resume with AI", { status: 500 });
  }
}
