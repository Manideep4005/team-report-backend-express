import { prisma } from "../prisma/client";

import type {
    ResumeProfileContent,
} from "../types/resume";


class ResumeRepository {

    /* ============================================================
       PROFILE
    ============================================================ */

    async findProfileByUserId(
        userId: string,
    ) {
        return prisma.resumeProfile.findUnique({
            where: {
                userId,
            },
        });
    }


    async createProfile(
        userId: string,
        data: ResumeProfileContent,
    ) {
        return prisma.resumeProfile.create({
            data: {
                userId,

                fullName: data.fullName ?? null,

                email: data.email ?? null,

                headline: data.headline ?? null,

                phone: data.phone ?? null,

                location: data.location ?? null,

                website: data.website ?? null,

                linkedin: data.linkedin ?? null,

                github: data.github ?? null,

                sections: (data.sections ?? []) as any,
            },
        });
    }


    async updateProfile(
        userId: string,
        data: ResumeProfileContent,
    ) {
        return prisma.resumeProfile.update({
            where: {
                userId,
            },

            data: {
                fullName: data.fullName ?? null,

                email: data.email ?? null,

                headline: data.headline ?? null,

                phone: data.phone ?? null,

                location: data.location ?? null,

                website: data.website ?? null,

                linkedin: data.linkedin ?? null,

                github: data.github ?? null,

                sections: (data.sections ?? []) as any,
            },
        });
    }


    /* ============================================================
       CUSTOMIZATION
    ============================================================ */

    async findCustomizationByUserId(
        userId: string,
    ) {
        return prisma.resumeCustomization.findUnique({
            where: {
                userId,
            },
        });
    }


    async createCustomization(
        userId: string,
        content: ResumeProfileContent,
        template = "PROFESSIONAL",
    ) {
        return prisma.resumeCustomization.create({
            data: {
                userId,

                content: content as any,

                template,
            },
        });
    }


    async updateCustomization(
        userId: string,
        content: ResumeProfileContent,
    ) {
        return prisma.resumeCustomization.update({
            where: {
                userId,
            },

            data: {
                content: content as any,
            },
        });
    }


    async upsertCustomization(
        userId: string,
        content: ResumeProfileContent,
        template = "PROFESSIONAL",
    ) {
        return prisma.resumeCustomization.upsert({
            where: {
                userId,
            },

            create: {
                userId,

                content: content as any,

                template,
            },

            update: {
                content: content as any,
            },
        });
    }
}


export default new ResumeRepository();