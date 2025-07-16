import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fileUrl } = body;

  if (!fileUrl) {
    return NextResponse.json(
      { error: "File URL not provided." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const pdfBuffer = new Uint8Array(response.data);

    // ✅ Dynamically import the ESM-compatible PDF parser
    // @ts-ignore – pdfjs-dist legacy has no types
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");

    // @ts-ignore – pdfjs-dist version has no types
    const pdfjsDist = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsDist.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    let parsedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      parsedText += pageText + "\n";
    }

    if (!parsedText || parsedText.trim().length < 10) {
      return NextResponse.json(
        { error: "Resume text is missing or invalid." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Parsed successfully",
      resumeText: parsedText,
    });
  } catch (error: any) {
    console.error("[Parse Error]", error.message);
    return NextResponse.json(
      { error: "Failed to parse PDF", details: error.message },
      { status: 500 }
    );
  }
}
