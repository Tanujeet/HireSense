import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const dataBuffer = Buffer.from(response.data);

    const parsed = await pdfParse(dataBuffer);

    return NextResponse.json({
      message: "Resume parsed successfully!",
      resumeText: parsed.text,
    });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
