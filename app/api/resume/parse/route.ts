import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL not provided." },
        { status: 400 }
      );
    }

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const pdfBuffer = Buffer.from(response.data); // ✅ Use PDF from URL, not local file

    const data = await pdfParse(pdfBuffer);
    const parsedText = data.text;

    if (!parsedText || parsedText.trim().length < 10) {
      return NextResponse.json(
        { error: "Resume text is missing or invalid." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Resume parsed successfully!",
      resumeText: parsedText,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to parse PDF",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
