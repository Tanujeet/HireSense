import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorised", { status: 404 });
  }

  const { resumeText } = await req.json();
  if (!resumeText) {
    return NextResponse.json(
      { error: "Resume text is missing" },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an ATS and career coach. Analyze resumes.`,
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

    const result = completion.choices[0].message.content;
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Failed to get Ai", err);
    
    return new NextResponse("Error analyzing resume with AI", { status: 500 });
  }
}
