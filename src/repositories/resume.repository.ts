import { prisma } from "../prisma/client";

import type {
    ResumeProfileContent,
} from "../types/resume";


class ResumeRepository {


    /* ============================================================
       PROFILE
    ============================================================ */

    async findProfileByUserId(
        userId: string
    ) {

        return prisma.resumeProfile.findUnique({

            where: {
                userId,
            },

        });

    }


    async createProfile(
        userId: string,
        data: any
    ) {

        return prisma.resumeProfile.create({

            data: {

                userId,

                fullName:
                    data.fullName,

                email: data.email,

                headline:
                    data.headline,

                phone:
                    data.phone,

                location:
                    data.location,

                website:
                    data.website,

                linkedin:
                    data.linkedin,

                github:
                    data.github,

                summary:
                    data.summary,

                experience:
                    data.experience,

                education:
                    data.education,

                skills:
                    data.skills,

                projects:
                    data.projects,

            },

        });

    }


    async updateProfile(
        userId: string,
        data: any
    ) {

        return prisma.resumeProfile.update({

            where: {
                userId,
            },

            data: {

                fullName:
                    data.fullName,

                email: data.email,

                headline:
                    data.headline,

                phone:
                    data.phone,

                location:
                    data.location,

                website:
                    data.website,

                linkedin:
                    data.linkedin,

                github:
                    data.github,

                summary:
                    data.summary,

                experience:
                    data.experience,

                education:
                    data.education,

                skills:
                    data.skills,

                projects:
                    data.projects,

            },

        });

    }


    /* ============================================================
       CUSTOMIZATION
    ============================================================ */

    async findCustomizationByUserId(
        userId: string
    ) {

        return prisma.resumeCustomization.findUnique({

            where: {
                userId,
            },

        });

    }


    async createCustomization(
        userId: string,
        content: ResumeProfileContent
    ) {

        return prisma.resumeCustomization.create({

            data: {

                userId,

                content: content as any,

                template:
                    "PROFESSIONAL",

            },

        });

    }


    async updateCustomization(
        userId: string,
        content: ResumeProfileContent
    ) {

        return prisma.resumeCustomization.update({

            where: {
                userId,
            },

            data: {

                content:
                    content as any,

            },

        });

    }


    async upsertCustomization(
        userId: string,
        content: ResumeProfileContent
    ) {

        return prisma.resumeCustomization.upsert({

            where: {
                userId,
            },

            create: {

                userId,

                content:
                    content as any,

                template:
                    "PROFESSIONAL",

            },

            update: {

                content:
                    content as any,

            },

        });

    }

}


export default new ResumeRepository();