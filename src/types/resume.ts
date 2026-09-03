/* ================================================================
   EXPERIENCE
================================================================ */

export interface ResumeExperience {
    company: string;
    position: string;
    location?: string;

    startDate: string;
    endDate?: string;

    currentlyWorking?: boolean;

    description: string[];
}


/* ================================================================
   EDUCATION
================================================================ */

export interface ResumeEducation {
    institution: string;
    degree: string;

    fieldOfStudy?: string;

    startDate?: string;
    endDate?: string;

    grade?: string;

    location?: string;
}


/* ================================================================
   SKILLS
================================================================ */

export interface ResumeSkills {
    [category: string]: string[];
}


/* ================================================================
   PROJECT
================================================================ */

export interface ResumeProject {
    name: string;

    description?: string;

    technologies?: string[];

    url?: string;

    github?: string;
}


/* ================================================================
   MASTER PROFILE
================================================================ */

export interface ResumeProfile {

    id: string;

    userId: string;

    fullName?: string | null;

    headline?: string | null;

    phone?: string | null;

    location?: string | null;

    website?: string | null;

    linkedin?: string | null;

    github?: string | null;

    summary?: string | null;

    experience?: ResumeExperience[] | null;

    education?: ResumeEducation[] | null;

    skills?: ResumeSkills | null;

    projects?: ResumeProject[] | null;

    createdAt: string;

    updatedAt: string;
}


/* ================================================================
   CUSTOMIZATION
================================================================ */

export interface ResumeCustomization {

    id: string;

    userId: string;

    content: ResumeProfileContent | null;

    template: string;

    createdAt: string;

    updatedAt: string;
}


/* ================================================================
   CONTENT
================================================================ */

export interface ResumeProfileContent {

    fullName?: string;

    email?: string;

    headline?: string;

    phone?: string;

    location?: string;

    website?: string;

    linkedin?: string;

    github?: string;

    summary?: string;

    experience?: ResumeExperience[];

    education?: ResumeEducation[];

    skills?: ResumeSkills;

    projects?: ResumeProject[];
}