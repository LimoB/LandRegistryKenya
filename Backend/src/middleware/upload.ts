import multer from "multer";

/* ============================================================
   MEMORY STORAGE (for IPFS / blockchain uploads)
============================================================ */
const storage = multer.memoryStorage();

/* ============================================================
   FILE FILTER (STRICT + SAFE)
============================================================ */
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Only PDF and image files (jpg, png, webp) are allowed."
      )
    );
  }

  cb(null, true);
};

/* ============================================================
   MULTER CONFIG
============================================================ */
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (good for deeds + images)
    files: 1, // only one document per request (important for land registry)
  },
  fileFilter,
});

/* ============================================================
   OPTIONAL: ERROR HANDLER MIDDLEWARE (VERY IMPORTANT)
============================================================ */
export const multerErrorHandler = (
  err: any,
  req: any,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message || "File upload failed",
    });
  }

  next();
};