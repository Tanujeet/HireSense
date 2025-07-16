"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
} from "@/components/ui/table";


import { ResumeUploader } from "@/components/UploadZone";
import { axiosInstance } from "@/lib/axios";
import AiFeedbackModal from "@/components/AiFeedbackModal ";

type Resume = {
  id: string;
  title: string;
  atsScore: number;
  uploadedAt: string;
  fileUrl: string;
};

const DashboardPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await axiosInstance.get("/resume/all");
      setResumes(res.data);
    } catch (err) {
      console.error("Error fetching resumes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return (
    <main className="px-4 md:px-10 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      <div className="mb-12">
        <ResumeUploader onUploadSuccess={fetchResumes} />
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-400"
                >
                  Loading resumes...
                </TableCell>
              </TableRow>
            ) : resumes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-gray-500 py-6"
                >
                  No resumes uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              resumes.slice(0, 3).map((resume) => (
                <TableRow key={resume.id}>
                  <TableCell className="font-medium">{resume.title}</TableCell>
                  <TableCell className="text-blue-600 font-semibold">
                    {resume.atsScore}%
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {resume.uploadedAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <AiFeedbackModal resumeId={resume.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default DashboardPage;
