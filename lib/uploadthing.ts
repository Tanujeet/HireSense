import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { userId } = getAuth(req); // ✅ Pass `req` to getAuth
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded:", file.url);
      // Save file URL and userId to DB here if needed
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
