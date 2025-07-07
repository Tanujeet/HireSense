import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Missing resume text" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a smart job search assistant. Your task is to analyze resumes and generate a short, powerful search query to find relevant jobs online.

The query should include:
- Target job role (e.g. React Developer, Backend Engineer)
- Experience level (e.g. Fresher, 2+ years)
- Location preference (e.g. Remote, Bangalore)
- Key technical skills (e.g. Next.js, SQL, Tailwind)

Avoid full sentences. Make the query concise and search-friendly.
        `,
        },
        {
          role: "user",
          content: `Here's the resume:\n\n${resumeText}\n\nNow generate the optimized job search query.`,
        },
      ],
    });

    const query: string | undefined =
      completion.choices[0].message.content?.trim();

      

      const joobleRes = await axios.post(
        "https://jooble.p.rapidapi.com/job-search",
        {
          keywords: query,
          location: "India",
        },
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": process.env.JOOBLE_API_KEY!,
            "X-RapidAPI-Host": "jooble.p.rapidapi.com",
          },
        }
      );

      const jobs = joobleRes.data.jobs || [];

      // ✨ Step 3: Clean top 8 jobs
      const cleanedJobs = jobs.slice(0, 8).map((job: any) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.link,
        snippet: job.snippet,
      }));
  
    

      return NextResponse.json({ jobs: cleanedJobs, searchQuery: query });
      
      
  } catch (error) {
    console.error("Job query generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate job query" },
      { status: 500 }
    );
    }
    
}
