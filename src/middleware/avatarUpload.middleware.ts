import multer from "multer";

const storage = multer.memoryStorage();

export const avatarUpload = multer({
    storage,

    limits: {
        fileSize: 2 * 1024 * 1024,
    },

    fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new Error(
                    "Only JPG, PNG, and WEBP images are allowed"
                )
            );
        }

        callback(null, true);
    },
});