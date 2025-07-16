"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useUser } from "@clerk/nextjs";
import { UploadDropzone } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type ResumeUploaderProps = {
  onUploadSuccess?: () => void;
  onParsedFeedback?: (resumeId: string) => void;
  onUploadStart?: () => void;
};

export const ResumeUploader = ({
  onUploadSuccess,
  onParsedFeedback,
  onUploadStart,
}: ResumeUploaderProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user } = useUser();
  const userId = user?.id;

  const handleComplete = async (res: any) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const fileUrl = res?.[0]?.ufsUrl || res?.[0]?.url;
    const fileName = res?.[0]?.name;
    const resumeTitle = fileName || "Uploaded Resume";

    if (!fileUrl) {
      setErrorMessage("Upload failed: No file URL returned.");
      setIsProcessing(false);
      return;
    }

    if (!userId) {
      setErrorMessage("User not authenticated. Please log in.");
      setIsProcessing(false);
      return;
    }

    try {
      const parseRes = await axiosInstance.post("/resume/parse", {
        fileUrl,
        fileName,
        resumeTitle,
      });
      const resumeText = parseRes.data.resumeText;

      const analyzeRes = await axiosInstance.post("/resume/analyze", {
        resumeText,
      });
      const atsScore = analyzeRes.data.atsScore;
      const aiFeedback = analyzeRes.data.aiFeedback;

      const saveRes = await axiosInstance.post("/resume/save", {
        title: resumeTitle,
        fileUrl,
        content: resumeText,
        atsScore,
        aiFeedback,
        userId,
      });

      console.log("Resume Upload and Analysis Complete!", saveRes.data);
      const newResumeId = saveRes.data.resume.id; // 👈 assuming backend returns ID

      if (onParsedFeedback) onParsedFeedback(newResumeId); // 👈 open modal with that resume
      if (onUploadSuccess) onUploadSuccess();
      router.refresh();
    } catch (err: any) {
      console.error("Upload and Analysis Error:", err);
      const message =
        err.response?.data?.error ||
        err.message ||
        "An unknown error occurred during processing.";
      setErrorMessage(`Error: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="resume-uploader-container">
      <UploadDropzone<OurFileRouter, "resumeUploader">
        endpoint="resumeUploader"
        onClientUploadComplete={handleComplete}
        onUploadError={(err: any) => {
          console.error("Uploadthing Error:", err);
          setErrorMessage(`File upload failed: ${err.message}`);
          setIsProcessing(false);
        }}
        onUploadBegin={() => {
          if (onUploadStart) onUploadStart();
          setIsProcessing(true);
          setErrorMessage(null);
        }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white"
        config={{ mode: "auto" }}
        appearance={{
          uploadIcon: "w-12 h-12",
        }}
        content={{
          label: isProcessing
            ? "Processing your resume..."
            : "Drag and drop your resume here",
          button: isProcessing ? "Please wait..." : "Browse files",
          allowedContent: "PDF only. Max size: 4MB",
        }}
      />

      {isProcessing && (
        <p className="mt-4 text-center text-blue-600">
          Uploading and analyzing your resume. This might take a moment...
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 text-center text-red-600 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

function extractAtsScore(summary: string): number {
  const match = summary.match(/ATS score.*?(\d{1,3})/i);
  return match ? parseInt(match[1]) : 0;
}
