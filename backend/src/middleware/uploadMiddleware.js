
const multer = require("multer");
const ApiError = require("../utils/ApiError");

// Maximum image size: 2 MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Store files in memory, not on public disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3,
    fields: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "Only JPG, PNG or WEBP images are allowed"
        )
      );
    }

    cb(null, true);
  },
});

// Verify the real image type using file signatures
const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  // JPEG
  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  // PNG
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  if (
    buffer.subarray(0, 8).equals(pngSignature)
  ) {
    return "image/png";
  }

  // WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
};

// Run multer and validate the actual contents of every image
const runImageUpload = (fields) => {
  const uploadFields = upload.fields(fields);

  return (req, res, next) => {
    uploadFields(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new ApiError(
                400,
                "Each image must be 2 MB or smaller"
              )
            );
          }

          if (
            err.code === "LIMIT_UNEXPECTED_FILE"
          ) {
            return next(
              new ApiError(
                400,
                "Unexpected image field or too many images"
              )
            );
          }

          return next(
            new ApiError(
              400,
              "Invalid upload. Please try again"
            )
          );
        }

        return next(err);
      }

      const files = req.files || {};

      for (const key of Object.keys(files)) {
        for (const file of files[key]) {
          const realType = detectImageType(file.buffer);

          if (!realType) {
            return next(
              new ApiError(
                400,
                `The ${key} file is not a valid JPG, PNG or WEBP image`
              )
            );
          }

          // Save the detected type, not the browser-provided type
          file.mimetype = realType;
        }
      }

      next();
    });
  };
};

// Existing PAN/Aadhaar upload — keep this compatible
const uploadKycImages = runImageUpload([
  { name: "pan", maxCount: 1 },
  { name: "aadhaar", maxCount: 1 },
]);

// New bank proof upload — accepts only the "bank" field
const uploadBankKycImage = runImageUpload([
  { name: "bank", maxCount: 1 },
]);

module.exports = {
  uploadKycImages,
  uploadBankKycImage,
  MAX_FILE_SIZE,
  detectImageType,
};
