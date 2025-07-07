"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type ResumeUploaderProps = {
  onUploadSuccess?: () => void;
};

export const ResumeUploader = ({ onUploadSuccess }: ResumeUploaderProps) => {
  const router = useRouter();

  const handleComplete = async (res: any) => {
    const fileUrl = res?.[0]?.url;
    if (!fileUrl) return;

    try {
      const parseRes = await axiosInstance.post("/resume/parse", {
        fileUrl,
      });
      const resumeText = parseRes.data.resumeText;

      const analyzeRes = await axiosInstance.post("/resume/analyze", {
        resumeText,
      });
      const result = analyzeRes.data.result;

      const saveRes = await axiosInstance.post("/resume/save", {
        title: "Uploaded Resume",
        fileUrl,
        content: resumeText,
        atsScore: extractAtsScore(result),
        aiFeedback: result,
      });

      console.log("Saved Resume:", saveRes.data);
      router.refresh();
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  return (
    <UploadDropzone<OurFileRouter, "resumeUploader">
      endpoint="resumeUploader"
      onClientUploadComplete={handleComplete}
      onUploadError={(err: any) => alert(`Upload error: ${err.message}`)}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white "
      config={{ mode: "auto" }}
      appearance={{
        uploadIcon: "w-12 h-12",
      }}
      content={{
        label: "Drag and drop your resume here",
        button: "Browse files",
        allowedContent: "PDF only. Max size: 4MB",
      }}
    />
  );
};

function extractAtsScore(summary: string): number {
  const match = summary.match(/ATS score.*?(\d{1,3})/i);
  return match ? parseInt(match[1]) : 0;
}
