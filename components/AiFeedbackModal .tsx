"use client";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";

interface Props {
  resumeId: string;
}

const AiFeedbackModal = ({ resumeId }: Props) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/resume/${resumeId}/feedback`);
      setSummary(res.data.aiFeedback);
    } catch (err) {
      console.error("Error fetching AI feedback:", err);
      setSummary("Error loading AI feedback.");
    } finally {
      setLoading(false);
    }
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
          {loading ? "Loading..." : summary}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AiFeedbackModal;
