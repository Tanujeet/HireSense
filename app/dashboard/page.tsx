"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadDropzone } from "@uploadthing/react";
import AiFeedbackModal from "@/components/AiFeedbackModal ";
import { ResumeUploader } from "@/components/UploadZone";

const mockResumes = [
  {
    id: "1",
    title: "Software Engineer Resume",
    atsScore: 85,
    uploadedAt: "2024-01-15",
    fileUrl: "https://cdn.uploadthing.com/resume1.pdf",
  },
  {
    id: "2",
    title: "Project Manager Resume",
    atsScore: 72,
    uploadedAt: "2023-12-20",
    fileUrl: "https://cdn.uploadthing.com/resume2.pdf",
  },
  {
    id: "3",
    title: "Marketing Specialist Resume",
    atsScore: 91,
    uploadedAt: "2023-11-05",
    fileUrl: "https://cdn.uploadthing.com/resume3.pdf",
  },
];

const DashboardPage = () => {
  const [resumes, setResumes] = useState<typeof mockResumes>([]);

  useEffect(() => {
    setResumes(mockResumes); // Replace with real API call in future
  }, []);

  return (
    <main className="px-4 md:px-10 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      <div className="mb-12">
        <ResumeUploader />
      </div>

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
                <TableCell>{resume.title}</TableCell>
                <TableCell className="text-blue-600 font-semibold">
                  {resume.atsScore}%
                </TableCell>
                <TableCell>{resume.uploadedAt}</TableCell>
                <TableCell className="text-right">
                  <AiFeedbackModal fileUrl={resume.fileUrl} />
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
