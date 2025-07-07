// app/api/resume/parse/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as pdfjs from "pdfjs-dist/build/pdf.js";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { prisma } from "@/lib/prisma";

pdfjs.GlobalWorkerOptions.workerSrc = `node_modules/pdfjs-dist/build/pdf.worker.mjs`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, userId, resumeTitle } = body;

    if (!fileUrl || !userId) {
      return NextResponse.json(
        { error: "Missing file URL or user ID." },
        { status: 400 }
      );
    }

    console.log(`[API/RESUME/PARSE] Received request for URL: ${fileUrl}`);

    let pdfBuffer: ArrayBuffer;
    try {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      pdfBuffer = response.data;
      console.log(
        `[API/RESUME/PARSE] Downloaded PDF buffer size: ${pdfBuffer.byteLength} bytes`
      );
    } catch (downloadError) {
      console.error("[API/RESUME/PARSE] Error downloading PDF:", downloadError);
      return NextResponse.json(
        { error: "Failed to download PDF from storage." },
        { status: 500 }
      );
    }

    let parsedText = "";
    try {
      const loadingTask = pdfjs.getDocument({ data: pdfBuffer });

      const pdfDocument = await loadingTask.promise;

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item) => (item as TextItem).str)
          .join(" ");

        parsedText += pageText + "\n\n";
      }
      console.log(
        `[API/RESUME/PARSE] Successfully parsed PDF content. Length: ${parsedText.length}`
      );
    } catch (parseError) {
      console.error(
        "[API/RESUME/PARSE] Error parsing PDF with pdfjs-dist:",
        parseError
      );

      return NextResponse.json(
        { error: "Failed to parse PDF content." },
        { status: 500 }
      );
    }

    const atsScore = Math.floor(Math.random() * 100);

    const aiFeedback =
      "This is dummy AI feedback based on your resume content. Remember to tailor your resume to specific job descriptions for better ATS scores and relevance.";

    const newResume = await prisma.resume.create({
      data: {
        userId: userId,
        title: resumeTitle || fileName,
        fileUrl: fileUrl,
        content: parsedText,
        atsScore: atsScore,
        aiFeedback: aiFeedback,
      },
    });

    console.log(`[API/RESUME/PARSE] Resume ID ${newResume.id} created in DB.`);

    return NextResponse.json(
      {
        message: "Resume parsed and processed successfully!",
        resumeId: newResume.id,
        parsedContent: parsedText,
        atsScore: atsScore,
        aiFeedback: aiFeedback,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[API/RESUME/PARSE] Unhandled Server Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error during resume processing.",
        details: error.message || "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
