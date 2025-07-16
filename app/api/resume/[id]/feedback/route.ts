import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const resumeId = context.params.id;

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId,
      userId,
    },
    select: {
      id: true,
      aiFeedback: true,
    },
  });

  if (!resume) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  return NextResponse.json(resume);
}
