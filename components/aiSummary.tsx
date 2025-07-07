"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";

const AiSummary = () => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
   
      const fileUrl = "URL_TO_LATEST_UPLOADED_RESUME";


      const parseRes = await axiosInstance.post("/api/resume/parse", {
        fileUrl,
      });
      const resumeText = parseRes.data.resumeText;

      
      const analyzeRes = await axiosInstance.post("/api/resume/analyze", {
        resumeText,
      });
      const result = analyzeRes.data.result;

      setSummary(result);
    } catch (err) {
      console.error("Error generating AI summary:", err);
      setSummary("Unable to load summary. Please try again.");
    }
    setLoading(false);
  };
  
  return (
    <Dialog onOpenChange={(isOpen) => isOpen && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline">View AI Summary</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-semibold mb-4">AI Summary</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {loading ? "Generating summary..." : summary}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AiSummary;
