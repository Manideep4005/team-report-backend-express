import PDFDocument from "pdfkit";
import type { Response } from "express";
import fs from "fs";
import path from "path";


/* ================================================================
   TYPES
================================================================ */

export interface ResumeExperience {
    company?: string;
    position?: string;
    location?: string;

    startDate?: string;
    endDate?: string;

    currentlyWorking?: boolean;

    description?: unknown;
}


export interface ResumeEducation {
    institution?: string;
    degree?: string;

    fieldOfStudy?: string;

    startDate?: string;
    endDate?: string;

    grade?: string;

    location?: string;
}


export interface ResumeProject {
    name?: string;
    description?: unknown;
    technologies?: unknown;
    url?: string;
    github?: string;
}


export interface ResumePdfData {

    fullName?: string;

    headline?: string;

    email?: string;

    phone?: string;

    location?: string;

    website?: string;

    linkedin?: string;

    github?: string;

    summary?: string;

    experience?: unknown;

    education?: unknown;

    skills?: unknown;

    /*
     * Kept here so the existing API/data structure
     * does not break.
     *
     * Projects are intentionally NOT rendered.
     */
    projects?: unknown;
}


/* ================================================================
   A4 PAGE
================================================================ */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;


/*
 * 1 cm = 28.3465 points
 *
 * IMPORTANT:
 * Previous version used 0.5 cm.
 * This version intentionally uses 1 cm.
 */

const MARGIN = 28.35;


const CONTENT_WIDTH =
    PAGE_WIDTH - (MARGIN * 2);


/* ================================================================
   COLORS
================================================================ */

const BLACK = "#111111";
const TEXT = "#222222";
const MUTED = "#555555";
const LINE = "#555555";


/* ================================================================
   CALIBRI FONTS
================================================================ */

const FONT_DIR =
    path.join(
        __dirname,
        "fonts"
    );


const FONT_REGULAR =
    path.join(
        FONT_DIR,
        "CALIBRI.TTF"
    );


const FONT_BOLD =
    path.join(
        FONT_DIR,
        "CALIBRIB.TTF"
    );


const FONT_ITALIC =
    path.join(
        FONT_DIR,
        "CALIBRII.TTF"
    );


const FONT_BOLD_ITALIC =
    path.join(
        FONT_DIR,
        "CALIBRIZ.TTF"
    );


/* ================================================================
   VERIFY FONTS
================================================================ */

const requiredFonts = [
    FONT_REGULAR,
    FONT_BOLD,
    FONT_ITALIC,
    FONT_BOLD_ITALIC,
];


for (const fontFile of requiredFonts) {

    if (!fs.existsSync(fontFile)) {

        throw new Error(
            `Calibri font file not found: ${fontFile}`
        );

    }

}


/* ================================================================
   BASIC HELPERS
================================================================ */

function text(
    value: unknown
): string {

    if (
        typeof value !== "string"
    ) {

        return "";

    }


    return value.trim();

}


function asArray(
    value: unknown
): unknown[] {

    return Array.isArray(value)
        ? value
        : [];

}


function stringArray(
    value: unknown
): string[] {

    if (
        !Array.isArray(value)
    ) {

        return [];

    }


    return value
        .filter(
            item =>
                typeof item === "string"
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);

}


/* ================================================================
   BULLET NORMALIZATION
================================================================ */

function bullets(
    value: unknown
): string[] {

    if (
        Array.isArray(value)
    ) {

        return value
            .filter(
                item =>
                    typeof item === "string"
            )
            .map(
                item =>
                    item
                        .replace(
                            /^\s*[-•*]\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);

    }


    if (
        typeof value === "string"
    ) {

        return value
            .split(/\r?\n/)
            .map(
                item =>
                    item
                        .replace(
                            /^\s*[-•*]\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* ================================================================
   NORMALIZE EXPERIENCE
================================================================ */

function normalizeExperience(
    experienceValue: unknown
): ResumeExperience[] {

    return asArray(
        experienceValue
    )
        .filter(
            item =>
                item &&
                typeof item === "object"
        )
        .map(
            (item: any) => {

                return {

                    company:
                        text(
                            item.company
                        ),

                    position:
                        text(
                            item.position
                        ),

                    location:
                        text(
                            item.location
                        ),

                    startDate:
                        text(
                            item.startDate
                        ),

                    endDate:
                        text(
                            item.endDate
                        ),

                    currentlyWorking:
                        item.currentlyWorking === true,

                    description:
                        bullets(
                            item.description
                        ),

                };

            }
        );

}


/* ================================================================
   NORMALIZE EDUCATION
================================================================ */

function normalizeEducation(
    educationValue: unknown
): ResumeEducation[] {

    return asArray(
        educationValue
    )
        .filter(
            item =>
                item &&
                typeof item === "object"
        )
        .map(
            (item: any) => {

                return {

                    institution:
                        text(
                            item.institution
                        ),

                    degree:
                        text(
                            item.degree
                        ),

                    fieldOfStudy:
                        text(
                            item.fieldOfStudy
                        ),

                    startDate:
                        text(
                            item.startDate
                        ),

                    endDate:
                        text(
                            item.endDate
                        ),

                    grade:
                        text(
                            item.grade
                        ),

                    location:
                        text(
                            item.location
                        ),

                };

            }
        );

}


/* ================================================================
   NORMALIZE SKILLS
================================================================ */

function normalizeSkills(
    skillsValue: unknown
): Record<string, string[]> {

    if (
        !skillsValue ||
        typeof skillsValue !== "object" ||
        Array.isArray(skillsValue)
    ) {

        return {};

    }


    const result:
        Record<string, string[]> = {};


    const skillsObject =
        skillsValue as Record<string, unknown>;


    for (
        const [
            category,
            categoryValue,
        ] of Object.entries(
            skillsObject
        )
    ) {

        const items =
            stringArray(
                categoryValue
            );


        if (
            items.length > 0
        ) {

            result[category] =
                items;

        }

    }


    return result;

}


/* ================================================================
   SKILL TITLE
================================================================ */

function skillTitle(
    value: string
): string {

    return value
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );

}


/* ================================================================
   PAGE SPACE
================================================================ */

function ensureSpace(
    doc: PDFKit.PDFDocument,
    requiredHeight: number
): void {

    const bottom =
        PAGE_HEIGHT - MARGIN;


    if (
        doc.y + requiredHeight >
        bottom
    ) {

        doc.addPage({

            size:
                "A4",

            margins: {

                top:
                    MARGIN,

                bottom:
                    MARGIN,

                left:
                    MARGIN,

                right:
                    MARGIN,

            },

        });


        doc.x =
            MARGIN;

        doc.y =
            MARGIN;

    }

}


/* ================================================================
   SECTION TITLE
================================================================ */

/* ================================================================
   SECTION TITLE
================================================================ */

function drawSectionTitle(
    doc: PDFKit.PDFDocument,
    title: string
): void {

    /*
     * Extra vertical breathing room before every section.
     *
     * The reference layout is compact, but sections should
     * still have a clear visual separation.
     */

    const SECTION_TOP_SPACE = 7;
    const TITLE_TO_LINE_SPACE = 3;
    const LINE_TO_CONTENT_SPACE = 8;


    /*
     * Make sure the section heading itself does not
     * get stranded at the bottom of a page.
     */

    ensureSpace(
        doc,
        32
    );


    /*
     * ------------------------------------------------------------
     * SPACE BEFORE SECTION
     * ------------------------------------------------------------
     */

    doc.y += SECTION_TOP_SPACE;


    /*
     * ------------------------------------------------------------
     * SECTION TITLE
     * ------------------------------------------------------------
     */

    const titleY =
        doc.y;


    doc
        .font(
            FONT_BOLD
        )
        .fontSize(
            10
        )
        .fillColor(
            BLACK
        )
        .text(
            title.toUpperCase(),
            MARGIN,
            titleY,
            {
                width:
                    CONTENT_WIDTH,

                lineBreak:
                    false,
            }
        );


    /*
     * ------------------------------------------------------------
     * SECTION DIVIDER
     * ------------------------------------------------------------
     */

    const lineY =
        titleY + 14;


    doc
        .moveTo(
            MARGIN,
            lineY
        )
        .lineTo(
            PAGE_WIDTH - MARGIN,
            lineY
        )
        .lineWidth(
            0.55
        )
        .strokeColor(
            LINE
        )
        .stroke();


    /*
     * ------------------------------------------------------------
     * SPACE AFTER DIVIDER
     * ------------------------------------------------------------
     */

    doc.y =
        lineY +
        LINE_TO_CONTENT_SPACE;

}


/* ================================================================
   HEADER
================================================================ */

function drawHeader(
    doc: PDFKit.PDFDocument,
    resume: ResumePdfData
): void {

    const fullName =
        text(
            resume.fullName
        ) ||
        "Resume";


    /*
     * ------------------------------------------------------------
     * NAME
     * ------------------------------------------------------------
     */

    doc
        .font(
            FONT_BOLD
        )
        .fontSize(
            19
        )
        .fillColor(
            BLACK
        )
        .text(
            fullName,
            MARGIN,
            doc.y,
            {
                width:
                    CONTENT_WIDTH,

                align:
                    "center",

                lineBreak:
                    false,
            }
        );


    /*
     * ------------------------------------------------------------
     * HEADLINE
     * ------------------------------------------------------------
     *
     * Keep this small and close to the name.
     */

    const headline =
        text(
            resume.headline
        );


    if (
        headline
    ) {

        doc.moveDown(
            0.08
        );


        doc
            .font(
                FONT_REGULAR
            )
            .fontSize(
                9
            )
            .fillColor(
                TEXT
            )
            .text(
                headline,
                MARGIN,
                doc.y,
                {
                    width:
                        CONTENT_WIDTH,

                    align:
                        "center",

                    lineBreak:
                        false,
                }
            );

    }


    /*
     * ------------------------------------------------------------
     * CONTACT
     * ------------------------------------------------------------
     */

    const contact = [

        text(
            resume.location
        ),

        text(
            resume.phone
        ),

        text(
            resume.email
        ),

        text(
            resume.linkedin
        ),

        text(
            resume.github
        ),

        text(
            resume.website
        ),

    ].filter(Boolean);


    if (
        contact.length
    ) {

        doc.moveDown(
            0.10
        );


        doc
            .font(
                FONT_REGULAR
            )
            .fontSize(
                8.5
            )
            .fillColor(
                TEXT
            )
            .text(
                contact.join(
                    "  |  "
                ),
                MARGIN,
                doc.y,
                {
                    width:
                        CONTENT_WIDTH,

                    align:
                        "center",

                    lineBreak:
                        false,
                }
            );

    }


    /*
     * Larger breathing room after
     * the header before the first section.
     */

    doc.moveDown(
        0.48
    );

}


/* ================================================================
   BULLET
================================================================ */

function drawBullet(
    doc: PDFKit.PDFDocument,
    value: string
): void {

    if (
        !value
    ) {

        return;

    }


    /*
     * Hanging bullet layout.
     */

    const bulletWidth =
        11;


    const textX =
        MARGIN +
        bulletWidth;


    ensureSpace(
        doc,
        15
    );


    const startY =
        doc.y;


    /*
     * Bullet
     */

    doc
        .font(
            FONT_REGULAR
        )
        .fontSize(
            8.7
        )
        .fillColor(
            TEXT
        )
        .text(
            "•",
            MARGIN + 2,
            startY,
            {
                width:
                    6,

                lineBreak:
                    false,
            }
        );


    /*
     * Bullet text
     */

    doc
        .font(
            FONT_REGULAR
        )
        .fontSize(
            8.7
        )
        .fillColor(
            TEXT
        )
        .text(
            value,
            textX,
            startY,
            {
                width:
                    CONTENT_WIDTH -
                    bulletWidth,

                lineGap:
                    1.2,

                paragraphGap:
                    0,
            }
        );


    /*
     * Very small gap between bullets.
     */

    doc.moveDown(
        0.035
    );

}


/* ================================================================
   SUMMARY
================================================================ */

function drawSummary(
    doc: PDFKit.PDFDocument,
    summary: string
): void {

    if (
        !summary
    ) {

        return;

    }


    drawSectionTitle(
        doc,
        "Professional Summary"
    );


    doc
        .font(
            FONT_REGULAR
        )
        .fontSize(
            8.7
        )
        .fillColor(
            TEXT
        )
        .text(
            summary,
            MARGIN,
            doc.y,
            {
                width:
                    CONTENT_WIDTH,

                lineGap:
                    1.15,

                align:
                    "left",
            }
        );


    /*
     * Space before next section.
     */

    doc.moveDown(
        0.05
    );

}


/* ================================================================
   SKILLS
================================================================ */

function drawSkills(
    doc: PDFKit.PDFDocument,
    skills: Record<string, string[]>
): void {

    const categories =
        Object.entries(
            skills
        );


    if (
        categories.length === 0
    ) {

        return;

    }


    drawSectionTitle(
        doc,
        "Technical Skills"
    );


    for (
        const [
            category,
            values,
        ] of categories
    ) {

        if (
            !Array.isArray(values) ||
            values.length === 0
        ) {

            continue;

        }


        ensureSpace(
            doc,
            14
        );


        const label =
            skillTitle(
                category
            );


        const startY =
            doc.y;


        /*
         * Category label
         */

        doc
            .font(
                FONT_BOLD
            )
            .fontSize(
                8.7
            )
            .fillColor(
                BLACK
            )
            .text(
                `${label}:`,
                MARGIN,
                startY,
                {
                    continued:
                        true,

                    width:
                        CONTENT_WIDTH,

                    lineBreak:
                        false,
                }
            );


        /*
         * Category values
         */

        doc
            .font(
                FONT_REGULAR
            )
            .fontSize(
                8.7
            )
            .fillColor(
                TEXT
            )
            .text(
                ` ${values.join(", ")}`,
                {
                    width:
                        CONTENT_WIDTH,

                    lineGap:
                        1.0,
                }
            );


        doc.moveDown(
            0.015
        );

    }


    doc.moveDown(
        0.05
    );

}


/* ================================================================
   EXPERIENCE
================================================================ */

function drawExperience(
    doc: PDFKit.PDFDocument,
    experience: ResumeExperience[]
): void {

    if (
        experience.length === 0
    ) {

        return;

    }


    drawSectionTitle(
        doc,
        "Professional Experience"
    );


    for (
        const item of experience
    ) {

        /*
         * Keep enough room for the
         * beginning of an entry.
         */

        ensureSpace(
            doc,
            45
        );


        const position =
            text(
                item.position
            );


        const company =
            text(
                item.company
            );


        const location =
            text(
                item.location
            );


        let endDate =
            text(
                item.endDate
            );


        if (
            item.currentlyWorking
        ) {

            endDate =
                "Present";

        }


        const date =
            [
                text(
                    item.startDate
                ),

                endDate,

            ]
                .filter(Boolean)
                .join(
                    " – "
                );


        /*
         * --------------------------------------------------------
         * TOP ROW
         * --------------------------------------------------------
         *
         * Left:
         *   Position — Company
         *
         * Right:
         *   Location
         */

        const heading =
            [
                position,
                company,
            ]
                .filter(Boolean)
                .join(
                    " — "
                );


        const headingY =
            doc.y;


        /*
         * Left side
         */

        if (
            heading
        ) {

            doc
                .font(
                    FONT_BOLD
                )
                .fontSize(
                    8.9
                )
                .fillColor(
                    BLACK
                )
                .text(
                    heading,
                    MARGIN,
                    headingY,
                    {
                        width:
                            CONTENT_WIDTH -
                            135,

                        lineBreak:
                            false,
                    }
                );

        }


        /*
         * Right side location
         */

        if (
            location
        ) {

            doc
                .font(
                    FONT_REGULAR
                )
                .fontSize(
                    8.4
                )
                .fillColor(
                    TEXT
                )
                .text(
                    location,
                    MARGIN + 135,
                    headingY,
                    {
                        width:
                            CONTENT_WIDTH -
                            135,

                        align:
                            "right",

                        lineBreak:
                            false,
                    }
                );

        }


        /*
         * --------------------------------------------------------
         * DATE ROW
         * --------------------------------------------------------
         */

        if (
            date
        ) {

            doc
                .font(
                    FONT_ITALIC
                )
                .fontSize(
                    8.1
                )
                .fillColor(
                    MUTED
                )
                .text(
                    date,
                    MARGIN,
                    headingY + 13,
                    {
                        width:
                            CONTENT_WIDTH,

                        align:
                            "right",

                        lineBreak:
                            false,
                    }
                );

        }


        /*
         * Move below the heading/date area.
         */

        doc.y =
            headingY +
            25;


        /*
         * --------------------------------------------------------
         * DESCRIPTION
         * --------------------------------------------------------
         */

        const description =
            bullets(
                item.description
            );


        for (
            const bullet of description
        ) {

            drawBullet(
                doc,
                bullet
            );

        }


        /*
         * Space between experience entries.
         */

        doc.moveDown(
            0.13
        );

    }

}


/* ================================================================
   EDUCATION
================================================================ */

function drawEducation(
    doc: PDFKit.PDFDocument,
    education: ResumeEducation[]
): void {

    if (
        education.length === 0
    ) {

        return;

    }


    drawSectionTitle(
        doc,
        "Education"
    );


    for (
        const item of education
    ) {

        ensureSpace(
            doc,
            22
        );


        const degree =
            text(
                item.degree
            );


        const field =
            text(
                item.fieldOfStudy
            );


        const institution =
            text(
                item.institution
            );


        /*
         * Build:
         *
         * Master of Business Administration (Finance)
         * — Sri Indu P.G. College
         */

        const qualification =
            [
                degree,

                field
                    ? `(${field})`
                    : "",

            ]
                .filter(Boolean)
                .join(
                    " "
                );


        const heading =
            [
                qualification,

                institution
                    ? `— ${institution}`
                    : "",

            ]
                .filter(Boolean)
                .join(
                    " "
                );


        const headingY =
            doc.y;


        /*
         * Left side
         */

        if (
            heading
        ) {

            doc
                .font(
                    FONT_BOLD
                )
                .fontSize(
                    8.8
                )
                .fillColor(
                    BLACK
                )
                .text(
                    heading,
                    MARGIN,
                    headingY,
                    {
                        width:
                            CONTENT_WIDTH -
                            145,

                        lineBreak:
                            false,
                    }
                );

        }


        /*
         * Right side
         */

        const startDate =
            text(
                item.startDate
            );


        const endDate =
            text(
                item.endDate
            );


        /*
         * For education, if only one
         * date/year exists, use it.
         */

        const date =
            [
                startDate,
                endDate,
            ]
                .filter(Boolean)
                .join(
                    " – "
                );


        const grade =
            text(
                item.grade
            );


        const formattedGrade =
            grade
                ? `CGPA: ${grade.replace(
                    /^CGPA:\s*/i,
                    ""
                )}`
                : "";


        const right =
            [
                date,
                formattedGrade,
            ]
                .filter(Boolean)
                .join(
                    " | "
                );


        if (
            right
        ) {

            doc
                .font(
                    FONT_REGULAR
                )
                .fontSize(
                    8.2
                )
                .fillColor(
                    TEXT
                )
                .text(
                    right,
                    MARGIN + 145,
                    headingY,
                    {
                        width:
                            CONTENT_WIDTH -
                            145,

                        align:
                            "right",

                        lineBreak:
                            false,
                    }
                );

        }


        /*
         * Move to next education item.
         */

        doc.y =
            headingY +
            13;


        doc.moveDown(
            0.02
        );

    }

}


/* ================================================================
   GENERATE RESUME PDF
================================================================ */

export function generateResumePdf(
    res: Response,
    resume: ResumePdfData,
    filename = "resume.pdf"
): void {


    /* ============================================================
       CREATE PDF
    ============================================================ */

    const doc =
        new PDFDocument({

            size:
                "A4",

            margins: {

                top:
                    MARGIN,

                bottom:
                    MARGIN,

                left:
                    MARGIN,

                right:
                    MARGIN,

            },

            /*
             * Buffer pages because we are
             * intentionally not adding page
             * numbers anymore.
             */

            bufferPages:
                true,

            info: {

                Title:
                    `${text(
                        resume.fullName
                    ) || "Resume"} - Resume`,

                Author:
                    text(
                        resume.fullName
                    ) ||
                    "Resume",

            },

        });


    /* ============================================================
       REGISTER CALIBRI
    ============================================================ */

    doc.registerFont(
        "Calibri",
        FONT_REGULAR
    );


    doc.registerFont(
        "Calibri-Bold",
        FONT_BOLD
    );


    doc.registerFont(
        "Calibri-Italic",
        FONT_ITALIC
    );


    doc.registerFont(
        "Calibri-BoldItalic",
        FONT_BOLD_ITALIC
    );


    /* ============================================================
       RESPONSE HEADERS
    ============================================================ */

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );


    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
    );


    res.setHeader(
        "Cache-Control",
        "no-store"
    );


    /* ============================================================
       PIPE PDF
    ============================================================ */

    doc.pipe(
        res
    );


    /* ============================================================
       NORMALIZE DATA
    ============================================================ */

    const experience =
        normalizeExperience(
            resume.experience
        );


    const education =
        normalizeEducation(
            resume.education
        );


    const skills =
        normalizeSkills(
            resume.skills
        );


    const summary =
        text(
            resume.summary
        );


    /*
     * IMPORTANT:
     *
     * resume.projects is deliberately NOT normalized
     * and NOT rendered.
     *
     * This removes:
     *
     * - Professional Projects
     * - Personal Projects
     *
     * from the generated PDF.
     *
     * Training is also not rendered because
     * it is not part of the PDF data/sections.
     */


    /* ============================================================
       HEADER
    ============================================================ */

    drawHeader(
        doc,
        resume
    );


    /* ============================================================
       PROFESSIONAL SUMMARY
    ============================================================ */

    drawSummary(
        doc,
        summary
    );


    /* ============================================================
       TECHNICAL SKILLS
    ============================================================ */

    drawSkills(
        doc,
        skills
    );


    /* ============================================================
       PROFESSIONAL EXPERIENCE
    ============================================================ */

    drawExperience(
        doc,
        experience
    );


    /* ============================================================
       EDUCATION
    ============================================================ */

    drawEducation(
        doc,
        education
    );


    /* ============================================================
       FINISH
    ============================================================ */

    doc.end();

}