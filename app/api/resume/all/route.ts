import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(
        "[API/RESUME/ALL] User ID is missing (unauthenticated request)."
      );
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    console.log(`[API/RESUME/ALL] Fetching resumes for userId: ${userId}`);

    // Fetch resumes for the specific user, ordered by creation date descending
    const resumes = await prisma.resume.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        atsScore: true,
        createdAt: true, // Prisma returns DateTime objects
      },
      orderBy: {
        createdAt: "desc", // Order by most recent first
      },
    });

    // Format the createdAt date for display on the frontend
    const formattedResumes = resumes.map((resume) => ({
      ...resume,
      uploadedAt: resume.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      // Ensure atsScore is a number, default to 0 if null
      atsScore: resume.atsScore ?? 0,
    }));

    console.log(`[API/RESUME/ALL] Found ${formattedResumes.length} resumes.`);
    return NextResponse.json(formattedResumes, { status: 200 });
  } catch (error: any) {
    console.error("[API/RESUME/ALL] Unhandled Server Error:", error.message);
    return NextResponse.json(
      {
        error: "Internal Server Error while fetching resumes.",
        details: error.message || "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
