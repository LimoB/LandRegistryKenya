import multer from "multer";

// We store the file in memory (RAM) temporarily 
// so we can pass the buffer directly to our ipfs.ts utility
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit: 5MB (plenty for a PDF)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs and Images are allowed"));
    }
  },
});