import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });

  }

  try {
    const { title, fileUrl, content, atsScore, aiFeedback } = await req.json();
    if (!title || !fileUrl || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const newResume = await prisma.resume.create({
      data: { userId, title, fileUrl, content, atsScore, aiFeedback },
    });
    // Fetch all resumes for this user, sorted by oldest first
    // 1. Get all resumes of the user (oldest first)
    const userResumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" }, // sorting by creation time
    });

    // 2. If more than 3, delete the oldest ones
    if (userResumes.length > 3) {
      const excessResumes = userResumes.slice(0, userResumes.length - 3);

      for (const resume of excessResumes) {
        await prisma.resume.delete({
          where: { id: resume.id },
        });

        // Optional: also delete from storage using resume.fileUrl if needed
      }
    }

    return NextResponse.json(
      {
        resumeId: newResume.id,
        title: newResume.title,
        atsScore: newResume.atsScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("failed to create", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
