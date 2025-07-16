import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as pdf_to_text from "pdf-to-text";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileName } = body;

    // --- Input Validation ---
    if (!fileUrl) {
      console.error(
        "[API/RESUME/PARSE] File URL not provided in request body."
      );
      return NextResponse.json(
        { error: "File URL not provided." },
        { status: 400 }
      );
    }

    console.log(
      `[API/RESUME/PARSE] Attempting to parse PDF from URL using pdf-to-text: ${fileUrl}`
    );

    let tempFilePath: string | undefined;
    let parsedText = "";

    try {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const pdfBuffer = Buffer.from(response.data);

      tempFilePath = path.join(
        os.tmpdir(),
        `${Date.now()}-${fileName || "resume"}.pdf`
      );

      fs.writeFileSync(tempFilePath, pdfBuffer);
      console.log(
        `[API/RESUME/PARSE] PDF saved to temporary file: ${tempFilePath}`
      );

      parsedText = await new Promise<string>((resolve, reject) => {
        const pdftotextPath =
          "C:\\Users\\singh\\OneDrive\\Desktop\\poppler-24.08.0\\Library\\bin\\pdftotext.exe";
        pdf_to_text.pdfToText(
          tempFilePath!,
          { pdftotext_path: pdftotextPath } as any,
          (err: Error | null, data: string) => {
            if (err) {
              console.error("[API/RESUME/PARSE] pdf-to-text error:", err);
              return reject(new Error(`pdf-to-text failed: ${err.message}`));
            }
            resolve(data);
          }
        );
      });

      console.log(
        `[API/RESUME/PARSE] Successfully parsed PDF. Length: ${parsedText.length}`
      );
    } catch (parseError: unknown) {
      const error = parseError as Error;
      console.error(
        "[API/RESUME/PARSE] Error during download or parse:",
        error.message
      );
      return NextResponse.json(
        {
          error: "Failed to process PDF content.",
          details: error.message,
        },
        { status: 500 }
      );
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          console.log(`[API/RESUME/PARSE] Deleted temp file: ${tempFilePath}`);
        } catch (cleanupError: unknown) {
          const error = cleanupError as Error;
          console.error(
            "[API/RESUME/PARSE] Failed to delete temp file:",
            error.message
          );
        }
      }
    }

    return NextResponse.json(
      {
        message: "Resume parsed successfully!",
        resumeText: parsedText,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[API/RESUME/PARSE] Unhandled Server Error:", error.message);
    return NextResponse.json(
      {
        error: "Internal Server Error during resume parsing.",
        details: error.message || "An unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
