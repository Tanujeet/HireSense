import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const { resumeText } = await req.json();

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
}
