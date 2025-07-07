// lib/uploadthing.ts
import { generateReactHelpers } from "@uploadthing/react";
import { UploadButton, UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core"; // <-- This type

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export { UploadButton, UploadDropzone };
