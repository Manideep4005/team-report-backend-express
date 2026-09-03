import { z } from "zod";


/* ================================================================
   EXPERIENCE
================================================================ */

const experienceSchema =
    z.object({

        company:
            z.string().trim().min(1),

        position:
            z.string().trim().min(1),

        location:
            z.string().trim().optional(),

        startDate:
            z.string().trim().min(1),

        endDate:
            z.string().trim().optional(),

        currentlyWorking:
            z.boolean().optional(),

        description:
            z.array(
                z.string().trim().min(1)
            ),

    });


/* ================================================================
   EDUCATION
================================================================ */

const educationSchema =
    z.object({

        institution:
            z.string().trim().min(1),

        degree:
            z.string().trim().min(1),

        fieldOfStudy:
            z.string().trim().optional(),

        startDate:
            z.string().trim().optional(),

        endDate:
            z.string().trim().optional(),

        grade:
            z.string().trim().optional(),

        location:
            z.string().trim().optional(),

    });


/* ================================================================
   PROJECT
================================================================ */

const projectSchema =
    z.object({

        name:
            z.string().trim().min(1),

        description:
            z.string().trim().optional(),

        technologies:
            z.array(
                z.string().trim()
            ).optional(),

        url:
            z.string().trim().optional(),

        github:
            z.string().trim().optional(),

    });


/* ================================================================
   MASTER PROFILE
================================================================ */

export const resumeProfileSchema =
    z.object({

        fullName:
            z.string().trim().max(150).optional(),
        email: z
            .string()
            .email("Invalid email address")
            .optional()
            .or(z.literal("")),

        headline:
            z.string().trim().max(250).optional(),

        phone:
            z.string().trim().max(40).optional(),

        location:
            z.string().trim().max(150).optional(),

        website:
            z.string().trim().max(500).optional(),

        linkedin:
            z.string().trim().max(500).optional(),

        github:
            z.string().trim().max(500).optional(),

        summary:
            z.string().trim().max(5000).optional(),

        experience:
            z.array(
                experienceSchema
            ).optional(),

        education:
            z.array(
                educationSchema
            ).optional(),

        skills:
            z.record(
                z.string(),
                z.array(
                    z.string().trim()
                )
            ).optional(),

        projects:
            z.array(
                projectSchema
            ).optional(),

    });


/* ================================================================
   CUSTOMIZATION
================================================================ */

export const resumeCustomizationSchema =
    z.object({

        fullName:
            z.string().optional(),

        email: z
            .string()
            .email("Invalid email address")
            .optional()
            .or(z.literal("")),

        headline:
            z.string().optional(),

        phone:
            z.string().optional(),

        location:
            z.string().optional(),

        website:
            z.string().optional(),

        linkedin:
            z.string().optional(),

        github:
            z.string().optional(),

        summary:
            z.string().optional(),

        experience:
            z.array(
                experienceSchema
            ).optional(),

        education:
            z.array(
                educationSchema
            ).optional(),

        skills:
            z.record(
                z.string(),
                z.array(
                    z.string()
                )
            ).optional(),

        projects:
            z.array(
                projectSchema
            ).optional(),

    });