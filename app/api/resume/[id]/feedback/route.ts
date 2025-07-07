// app/api/resume/[id]/feedback/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: params.id,
      userId,
    },
    select: {
      aiFeedback: true,
    },
  });

  if (!resume) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  return NextResponse.json({ aiFeedback: resume.aiFeedback });
}
