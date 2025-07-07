import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return new NextResponse("Unauthorised",{status:404})
    }

    try {const resumes = await prisma.resume.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
        return NextResponse.json(resumes)


    } catch (err) {
        console.error("Error fetching resumes:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}