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
