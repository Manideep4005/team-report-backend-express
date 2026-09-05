/*
 * ============================================================
 * RESUME SECTION TYPES
 * ============================================================
 */

export const RESUME_SECTION_TYPES = [
    "SUMMARY",
    "EXPERIENCE",
    "EDUCATION",
    "SKILLS",
    "PROJECTS",
    "ACHIEVEMENTS",
    "CERTIFICATIONS",
    "AWARDS",
    "LANGUAGES",
    "PUBLICATIONS",
    "VOLUNTEER",
    "CUSTOM",
] as const;

export type ResumeSectionType =
    (typeof RESUME_SECTION_TYPES)[number];


/*
 * ============================================================
 * GENERIC RESUME SECTION
 * ============================================================
 */

export interface ResumeSection {
    /*
     * Unique identifier for this section.
     *
     * Example:
     * "experience"
     * "projects"
     * "achievements"
     * "custom-abc123"
     */

    id: string;

    /*
     * Determines how the section is interpreted/rendered.
     */

    type: ResumeSectionType;

    /*
     * User-visible heading.
     *
     * Example:
     * "Experience"
     * "Personal Projects"
     */

    title: string;

    /*
     * Whether this section should currently be shown.
     */

    visible: boolean;

    /*
     * Section-specific data.
     *
     * Ordering inside arrays is preserved.
     */

    content: unknown;
}


/*
 * ============================================================
 * SKILLS
 * ============================================================
 */

export interface ResumeSkillCategory {
    /*
     * Unique category ID.
     */

    id: string;

    /*
     * Display name.
     *
     * Example:
     * "Programming Languages"
     */

    name: string;

    /*
     * Array order determines skill order.
     */

    items: string[];
}


export interface ResumeSkillsContent {
    /*
     * Array order determines category order.
     */

    categories: ResumeSkillCategory[];
}


/*
 * ============================================================
 * PERSONAL / HEADER INFORMATION
 * ============================================================
 */

export interface ResumePersonalInfo {
    fullName?: string | null;

    email?: string | null;

    headline?: string | null;

    phone?: string | null;

    location?: string | null;

    website?: string | null;

    linkedin?: string | null;

    github?: string | null;
}


/*
 * ============================================================
 * MASTER PROFILE CONTENT
 * ============================================================
 */

export interface ResumeProfileContent
    extends ResumePersonalInfo {

    /*
     * Array order determines section order.
     */

    sections?: ResumeSection[];
}


/*
 * ============================================================
 * CUSTOMIZATION CONTENT
 * ============================================================
 */

export interface ResumeCustomizationContent
    extends ResumeProfileContent { }