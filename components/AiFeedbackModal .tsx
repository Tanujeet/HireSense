"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";

type AiFeedbackModalProps = {
  fileUrl: string;
};

const AiFeedbackModal = ({ fileUrl }: AiFeedbackModalProps) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const parseRes = await axiosInstance.post("/api/resume/parse", {
        fileUrl,
      });
      const resumeText = parseRes.data.resumeText;

      const analyzeRes = await axiosInstance.post("/api/resume/analyze", {
        resumeText,
      });

      setSummary(analyzeRes.data.result);
    } catch (err) {
      console.error("Error generating AI feedback:", err);
      setSummary("Unable to load feedback. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(isOpen) => isOpen && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-blue-600 px-0">
          View AI Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
        <p className="whitespace-pre-line text-sm text-gray-700">
          {loading ? "Generating feedback..." : summary}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AiFeedbackModal;
