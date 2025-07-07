// app/api/resume/parse/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as pdf_to_text from "pdf-to-text";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, resumeTitle } = body;

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

    // 1. Download the PDF content from the provided URL (e.g., Uploadthing URL)
    // pdf-to-text can work with a local file path or a Buffer.
    // For a URL, we'll download it and save it temporarily, then parse.
    // NOTE: Saving to a temporary file is necessary for pdf-to-text's typical usage.
    // This adds file system operations, which can be tricky in serverless.
    // A more robust serverless solution might involve piping the stream directly if pdf-to-text supported it,
    // or using a dedicated parsing service.

    let tempFilePath: string | undefined;
    let parsedText = "";

    try {
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const pdfBuffer = Buffer.from(response.data);

      // Create a temporary file to save the PDF
      // You'll need Node.js 'fs' and 'path' modules
      const fs = require("fs");
      const path = require("path");
      const os = require("os"); // For os.tmpdir()

      // Generate a unique temporary file name
      tempFilePath = path.join(
        os.tmpdir(),
        `${Date.now()}-${fileName || "resume"}.pdf`
      );

      // Write the buffer to the temporary file
      fs.writeFileSync(tempFilePath, pdfBuffer);
      console.log(
        `[API/RESUME/PARSE] PDF saved to temporary file: ${tempFilePath}`
      );

      // 2. Parse the PDF content using pdf-to-text
      // pdf_to_text.pdfToText takes a file path
      parsedText = await new Promise((resolve, reject) => {
        pdf_to_text.pdfToText(tempFilePath!, (err: any, data: string) => {
          if (err) {
            console.error("[API/RESUME/PARSE] pdf-to-text error:", err);
            return reject(new Error(`pdf-to-text failed: ${err.message}`));
          }
          resolve(data);
        });
      });
      console.log(
        `[API/RESUME/PARSE] Successfully parsed PDF content. Length: ${parsedText.length}`
      );
    } catch (downloadOrParseError: any) {
      console.error(
        "[API/RESUME/PARSE] Error in download or pdf-to-text parsing:",
        downloadOrParseError.message
      );
      return NextResponse.json(
        {
          error: "Failed to process PDF content.",
          details: downloadOrParseError.message,
        },
        { status: 500 }
      );
    } finally {
      // Clean up the temporary file
      if (tempFilePath && require("fs").existsSync(tempFilePath)) {
        try {
          require("fs").unlinkSync(tempFilePath);
          console.log(
            `[API/RESUME/PARSE] Cleaned up temporary file: ${tempFilePath}`
          );
        } catch (cleanupError: any) {
          console.error(
            "[API/RESUME/PARSE] Error cleaning up temporary file:",
            cleanupError.message
          );
          // This error is not critical enough to return a 500
        }
      }
    }

    // Return the parsed text to the frontend
    return NextResponse.json(
      {
        message: "Resume parsed successfully!",
        resumeText: parsedText, // Send the extracted text back
      },
      { status: 200 }
    );
  } catch (error: any) {
    // Catch any unexpected errors during the process
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
