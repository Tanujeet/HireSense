import { spawn } from "child_process";

// Use full path to pdftotext.exe with double backslashes (Windows escape)
const pdftotextPath =
  "C:\\Users\\singh\\OneDrive\\Desktop\\poppler-24.08.0\\Library\\bin\\pdftotext.exe";

const child = spawn(pdftotextPath, ["-v"]);

child.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
