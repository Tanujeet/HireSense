"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "./Spinner";
import { axiosInstance } from "@/lib/axios";

interface Props {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean; // ✅ add this
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

const AiFeedbackModal = ({ resumeId, open, onOpenChange }: Props) => {
  const [feedbackRaw, setFeedbackRaw] = useState<string>("");
  const [parsedFeedback, setParsedFeedback] = useState<ReturnType<
    typeof parseFeedback
  > | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchFeedback = async () => {
      setLoading(true);
      setFeedbackRaw("");
      setParsedFeedback(null);

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

    fetchFeedback();
  }, [open, resumeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
