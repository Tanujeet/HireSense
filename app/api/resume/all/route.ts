import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        atsScore: true,
        createdAt: true,
      },
    });

    // Format uploaded date for frontend
    const formatted = resumes.map((r) => ({
      ...r,
      uploadedAt: new Date(r.createdAt).toLocaleDateString(),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
