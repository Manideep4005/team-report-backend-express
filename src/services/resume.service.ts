import resumeRepository
    from "../repositories/resume.repository";

import { ApiError }
    from "../utils/ApiError";


class ResumeService {


    /* ============================================================
       MASTER PROFILE
    ============================================================ */

    async getProfile(
        userId: string
    ) {

        const profile =
            await resumeRepository.findProfileByUserId(
                userId
            );


        /*
         * No profile yet is not an error.
         *
         * Frontend can show an empty profile form.
         */

        if (!profile) {

            return null;

        }


        return profile;

    }


    async saveProfile(
        userId: string,
        data: any
    ) {

        const existing =
            await resumeRepository.findProfileByUserId(
                userId
            );


        if (existing) {

            return resumeRepository.updateProfile(
                userId,
                data
            );

        }


        return resumeRepository.createProfile(
            userId,
            data
        );

    }


    /* ============================================================
       CUSTOMIZATION
    ============================================================ */

    async getCustomization(
        userId: string
    ) {

        return resumeRepository.findCustomizationByUserId(
            userId
        );

    }


    /* ============================================================
       CREATE CUSTOMIZATION FROM MASTER
    ============================================================ */

    async createCustomizationFromProfile(
        userId: string
    ) {

        const profile =
            await resumeRepository.findProfileByUserId(
                userId
            );


        if (!profile) {

            throw new ApiError(
                404,
                "Resume profile not found. Please complete your master resume first."
            );

        }


        /*
         * Only copy resume content.
         *
         * Database IDs and timestamps from the
         * master profile are NOT copied.
         */

        const content = {

            fullName:
                profile.fullName ?? "",

            email:
                profile.email ?? "",

            headline:
                profile.headline ?? "",

            phone:
                profile.phone ?? "",

            location:
                profile.location ?? "",

            website:
                profile.website ?? "",

            linkedin:
                profile.linkedin ?? "",

            github:
                profile.github ?? "",

            summary:
                profile.summary ?? "",

            experience:
                profile.experience ?? [],

            education:
                profile.education ?? [],

            skills:
                profile.skills ?? {},

            projects:
                profile.projects ?? [],

        };


        /*
         * Upsert guarantees:
         *
         * One user
         *     ↓
         * One customization
         */

        return resumeRepository.upsertCustomization(
            userId,
            content as any
        );

    }


    /* ============================================================
       SAVE CUSTOMIZATION
    ============================================================ */

    async saveCustomization(
        userId: string,
        content: any
    ) {

        const existing =
            await resumeRepository.findCustomizationByUserId(
                userId
            );


        if (!existing) {

            throw new ApiError(
                404,
                "Resume customization not found. Create it from your master resume first."
            );

        }


        return resumeRepository.updateCustomization(
            userId,
            content
        );

    }

    async getResumeForPdf(
        userId: string
    ) {

        const profile =
            await resumeRepository.findProfileByUserId(
                userId
            );


        if (!profile) {

            throw new ApiError(
                404,
                "Resume profile not found"
            );
        }


        const customization =
            await resumeRepository.findCustomizationByUserId(
                userId
            );


        /*
         * ========================================================
         * CUSTOMIZATION EXISTS
         * ========================================================
         */

        if (
            customization &&
            customization.content
        ) {

            return {
                ...this.toPdfData(
                    customization.content,
                    profile
                ),
            };
        }


        /*
         * ========================================================
         * MASTER PROFILE
         * ========================================================
         */

        return {
            ...this.toPdfData(
                profile,
                profile
            ),
        };
    }


    /* ============================================================
       MAP TO PDF DATA
    ============================================================ */

    private toPdfData(
        content: any,
        profile: any
    ) {

        const getValue = (
            field: string
        ) => {

            const customValue =
                content?.[field];

            if (
                customValue !== undefined &&
                customValue !== null
            ) {
                return customValue;
            }

            return profile?.[field];
        };


        return {

            fullName:
                getValue("fullName") ?? "",

            headline:
                getValue("headline") ?? "",

            email:
                getValue("email") ?? "",

            phone:
                getValue("phone") ?? "",

            location:
                getValue("location") ?? "",

            website:
                getValue("website") ?? "",

            linkedin:
                getValue("linkedin") ?? "",

            github:
                getValue("github") ?? "",

            summary:
                getValue("summary") ?? "",

            experience:
                getValue("experience") ?? [],

            education:
                getValue("education") ?? [],

            skills:
                getValue("skills") ?? {},

            projects:
                getValue("projects") ?? [],
        };
    }

}


export default new ResumeService();