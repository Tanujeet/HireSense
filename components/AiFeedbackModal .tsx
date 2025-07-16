"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "./Spinner";
import { axiosInstance } from "@/lib/axios";

interface Props {
  resumeId: string;
}

const parseFeedback = (feedback: string) => {
  const atsMatch = feedback.match(/\*\*ATS Score:\*\*\s*(.+)/);
  const strengthsMatch = feedback.match(
    /\*\*Strengths\*\*\s*([\s\S]*?)\*\*Weaknesses\*\*/
  );
  const weaknessesMatch = feedback.match(
    /\*\*Weaknesses\*\*\s*([\s\S]*?)\*\*Suggestions\*\*/
  );
  const suggestionsMatch = feedback.match(/\*\*Suggestions\*\*\s*([\s\S]*)/);

  return {
    score: atsMatch?.[1]?.trim() ?? "N/A",
    strengths: strengthsMatch?.[1]?.trim() ?? "None found",
    weaknesses: weaknessesMatch?.[1]?.trim() ?? "None found",
    suggestions: suggestionsMatch?.[1]?.trim() ?? "None found",
  };
};

const AiFeedbackModal = ({ resumeId }: Props) => {
  const [feedbackRaw, setFeedbackRaw] = useState<string>("");
  const [parsedFeedback, setParsedFeedback] = useState<ReturnType<
    typeof parseFeedback
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/resume/${resumeId}/feedback`);
      const feedback = res.data.aiFeedback;
      setFeedbackRaw(feedback);
      setParsedFeedback(parseFeedback(feedback));
    } catch (err) {
      console.error("Error fetching AI feedback:", err);
      setFeedbackRaw("❌ Error loading AI feedback.");
      setParsedFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) handleOpen();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="text-blue-600">
          View AI Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogTitle className="text-center text-xl font-semibold mb-4">
          AI Feedback
        </DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center min-h-[120px]">
            <Spinner />
          </div>
        ) : parsedFeedback ? (
          <div className="space-y-6 text-sm text-gray-800 text-center max-w-md mx-auto">
            <p className="text-lg font-semibold text-blue-600">
              ATS Score: {parsedFeedback.score}
            </p>

            <div className="text-left space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">✅ Strengths</h3>
                <p className="whitespace-pre-wrap text-gray-600">
                  {parsedFeedback.strengths}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">⚠️ Weaknesses</h3>
                <p className="whitespace-pre-wrap text-gray-600">
                  {parsedFeedback.weaknesses}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">💡 Suggestions</h3>
                <p className="whitespace-pre-wrap text-gray-600">
                  {parsedFeedback.suggestions}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-600 text-sm text-center whitespace-pre-line">
            {feedbackRaw}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiFeedbackModal;
