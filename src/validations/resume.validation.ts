import { z } from "zod";

import {
    RESUME_SECTION_TYPES,
} from "../types/resume";


/*
 * ============================================================
 * COMMON
 * ============================================================
 */

const optionalNullableString =
    z
        .string()
        .trim()
        .nullable()
        .optional();


/*
 * ============================================================
 * RESUME SECTION
 * ============================================================
 */

const resumeSectionSchema =
    z.object({

        id:
            z
                .string()
                .trim()
                .min(1, "Section ID is required")
                .max(100, "Section ID is too long"),

        type:
            z.enum(RESUME_SECTION_TYPES),

        title:
            z
                .string()
                .trim()
                .min(1, "Section title is required")
                .max(150, "Section title is too long"),

        visible:
            z.boolean(),

        /*
         * We intentionally allow section-specific structures.
         *
         * The backend controls the outer structure while
         * individual section types can have different content.
         */

        content:
            z.unknown(),
    });


/*
 * ============================================================
 * PROFILE
 * ============================================================
 */

export const resumeProfileSchema =
    z.object({

        fullName:
            optionalNullableString,

        email:
            optionalNullableString,

        headline:
            optionalNullableString,

        phone:
            optionalNullableString,

        location:
            optionalNullableString,

        website:
            optionalNullableString,

        linkedin:
            optionalNullableString,

        github:
            optionalNullableString,

        /*
         * IMPORTANT:
         *
         * The order of this array is the resume section order.
         */

        sections:
            z
                .array(resumeSectionSchema)
                .superRefine((sections, ctx) => {

                    const ids = new Set<string>();

                    sections.forEach((section, index) => {

                        if (ids.has(section.id)) {

                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,

                                message:
                                    `Duplicate section id "${section.id}".`,

                                path: [
                                    index,
                                    "id",
                                ],
                            });

                        }

                        ids.add(section.id);
                    });

                })
                .optional(),
    });


/*
 * ============================================================
 * CUSTOMIZATION
 * ============================================================
 */

export const resumeCustomizationSchema =
    z.object({

        fullName:
            optionalNullableString,

        email:
            optionalNullableString,

        headline:
            optionalNullableString,

        phone:
            optionalNullableString,

        location:
            optionalNullableString,

        website:
            optionalNullableString,

        linkedin:
            optionalNullableString,

        github:
            optionalNullableString,

        /*
         * The order of this array is the customization's
         * section order.
         */

        sections:
            z
                .array(resumeSectionSchema)
                .superRefine((sections, ctx) => {

                    const ids = new Set<string>();

                    sections.forEach((section, index) => {

                        if (ids.has(section.id)) {

                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,

                                message:
                                    `Duplicate section id "${section.id}".`,

                                path: [
                                    index,
                                    "id",
                                ],
                            });

                        }

                        ids.add(section.id);
                    });

                })
                .optional(),
    });