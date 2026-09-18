import { Readable } from "stream";
import cloudinary from "../config/cloudinary";

class AvatarService {
    async uploadAvatar(
        buffer: Buffer,
        userId: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder: "team-report-tracker/avatars",
                        public_id: userId,
                        overwrite: true,
                        invalidate: true,
                        resource_type: "image",

                        transformation: [
                            {
                                width: 400,
                                height: 400,
                                crop: "fill",
                                gravity: "face",
                            },
                        ],
                    },
                    (error, result) => {
                        if (error || !result) {
                            return reject(
                                error ||
                                new Error(
                                    "Avatar upload failed"
                                )
                            );
                        }

                        resolve(result.secure_url);
                    }
                );

            Readable.from(buffer).pipe(uploadStream);
        });
    }

    async deleteAvatar(
        userId: string
    ): Promise<void> {
        await cloudinary.uploader.destroy(
            `team-report-tracker/avatars/${userId}`,
            {
                resource_type: "image",
            }
        );
    }
}

export default new AvatarService();