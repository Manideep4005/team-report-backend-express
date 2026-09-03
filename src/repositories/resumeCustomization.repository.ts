import { prisma } from "../prisma/client";

class ResumeCustomizationRepository {

    /*
     * ============================================================
     * FIND BY USER
     * ============================================================
     */

    async findByUserId(userId: string) {

        return prisma.resumeCustomization.findUnique({
            where: {
                userId,
            },
        });

    }


    /*
     * ============================================================
     * CREATE
     * ============================================================
     */

    async create(
        userId: string,
        content: any,
        template = "PROFESSIONAL"
    ) {

        return prisma.resumeCustomization.create({

            data: {
                userId,
                content,
                template,
            },

        });

    }


    /*
     * ============================================================
     * UPDATE CONTENT
     *
     * We will use this later when the user edits
     * the customized resume.
     * ============================================================
     */

    async updateContent(
        userId: string,
        content: any
    ) {

        return prisma.resumeCustomization.update({

            where: {
                userId,
            },

            data: {
                content,
            },

        });

    }


    /*
     * ============================================================
     * DELETE
     *
     * Not required by the current workflow, but useful later.
     * ============================================================
     */

    async deleteByUserId(
        userId: string
    ) {

        return prisma.resumeCustomization.delete({

            where: {
                userId,
            },

        });

    }

}


export default new ResumeCustomizationRepository();