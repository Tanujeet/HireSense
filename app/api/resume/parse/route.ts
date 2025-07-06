import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorised", { status: 404 });
  }

  try {
    const body = await req.json();
    const { fileUrl } = body;
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const result = await pdfParse(buffer);
    const resumeText = result.text;

    return NextResponse.json({ resumeText });
  } catch (err) {
    console.error("Failed to Parse ", err);
  }
}
