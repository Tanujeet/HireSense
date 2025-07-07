"use client";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";

interface Props {
  fileUrl: string;
}

const AiFeedbackModal = ({ fileUrl }: Props) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      // Step 1: Parse
      const parseRes = await axiosInstance.post("/resume/parse", {
        fileUrl,
      });
      const resumeText = parseRes.data.resumeText;

      // Step 2: Analyze
      const analyzeRes = await axiosInstance.post("/resume/analyze", {
        resumeText,
      });
      setSummary(analyzeRes.data.result);
    } catch (err) {
      setSummary("Error loading AI feedback.");
    }
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(isOpen) => isOpen && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-blue-600">
          View AI Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <h2 className="text-xl font-semibold mb-4">AI Feedback</h2>
        <p className="whitespace-pre-line text-gray-800 text-sm">
          {loading ? "Analyzing..." : summary}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AiFeedbackModal;
