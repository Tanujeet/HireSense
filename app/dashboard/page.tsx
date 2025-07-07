"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

// mock data (replace with real API call)
const mockResumes = [
  {
    id: "1",
    title: "Software Engineer Resume",
    atsScore: 85,
    uploadedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Project Manager Resume",
    atsScore: 72,
    uploadedAt: "2023-12-20",
  },
  {
    id: "3",
    title: "Marketing Specialist Resume",
    atsScore: 91,
    uploadedAt: "2023-11-05",
  },
];

const DashboardPage = () => {
  const [resumes, setResumes] = useState<typeof mockResumes>([]);

  useEffect(() => {
    // Replace with real API call
    setResumes(mockResumes);
  }, []);

  return (
    <main className="px-4 md:px-10 py-10 max-w-6xl mx-auto">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-12 bg-white">
        <h2 className="text-lg font-semibold mb-2">
          Drag and drop your resume here
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          PDF only. Max file size: 10MB
        </p>
        <Button variant="secondary">Browse files</Button>
      </div>

      {/* History Table */}
      <h2 className="text-2xl font-semibold mb-4">History</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>ATS Score</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumes.map((resume) => (
              <TableRow key={resume.id}>
                <TableCell className="font-medium">{resume.title}</TableCell>
                <TableCell className="text-blue-600 font-semibold">
                  {resume.atsScore}%
                </TableCell>
                <TableCell>{resume.uploadedAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-blue-600 px-0">
                    View AI Feedback
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default DashboardPage;
