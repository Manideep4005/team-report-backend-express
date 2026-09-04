import resumeRepository from "../repositories/resume.repository";

import { ApiError } from "../utils/ApiError";

class ResumeService {
  /* ============================================================
       SKILLS ORDER
    ============================================================ */

  private normalizeSkillsOrder(skills: any) {
    /*
     * --------------------------------------------------------
     * Invalid / empty skills
     * --------------------------------------------------------
     */

    if (!skills || typeof skills !== "object" || Array.isArray(skills)) {
      return {};
    }

    /*
     * --------------------------------------------------------
     * Get actual skill categories.
     *
     * __order is metadata and must NEVER be treated
     * as a skill category.
     * --------------------------------------------------------
     */

    const categories = Object.keys(skills).filter(
      (category) => category !== "__order",
    );

    /*
     * --------------------------------------------------------
     * Read existing explicit order.
     *
     * Older records will not have __order.
     * --------------------------------------------------------
     */

    const storedOrder = Array.isArray(skills.__order)
      ? skills.__order.filter(
          (category: unknown): category is string =>
            typeof category === "string" &&
            category.trim().length > 0 &&
            category !== "__order",
        )
      : [];

    /*
     * --------------------------------------------------------
     * Build final order.
     *
     * 1. Categories from __order
     * 2. Any new categories not yet in __order
     *
     * This makes the code backwards compatible.
     * --------------------------------------------------------
     */

    const orderedCategories = [
      ...storedOrder.filter((category: any) => categories.includes(category)),

      ...categories.filter((category) => !storedOrder.includes(category)),
    ];

    /*
     * --------------------------------------------------------
     * Rebuild skills object.
     * --------------------------------------------------------
     */

    const result: Record<string, any> = {};

    for (const category of orderedCategories) {
      result[category] = skills[category];
    }

    /*
     * --------------------------------------------------------
     * Save explicit order.
     * --------------------------------------------------------
     */

    result.__order = orderedCategories;

    return result;
  }

  /* ============================================================
       MASTER PROFILE
    ============================================================ */

  async getProfile(userId: string) {
    const profile = await resumeRepository.findProfileByUserId(userId);

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

  async saveProfile(userId: string, data: any) {
    /*
     * --------------------------------------------------------
     * Normalize skills before saving.
     *
     * This is the first important backend protection.
     * --------------------------------------------------------
     */

    const normalizedData = {
      ...data,

      skills: this.normalizeSkillsOrder(data.skills),
    };

    const existing = await resumeRepository.findProfileByUserId(userId);

    if (existing) {
      return resumeRepository.updateProfile(userId, normalizedData);
    }

    return resumeRepository.createProfile(userId, normalizedData);
  }

  /* ============================================================
       CUSTOMIZATION
    ============================================================ */

  async getCustomization(userId: string) {
    return resumeRepository.findCustomizationByUserId(userId);
  }

  /* ============================================================
       CREATE CUSTOMIZATION FROM MASTER
    ============================================================ */

  async createCustomizationFromProfile(userId: string) {
    const profile = await resumeRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new ApiError(
        404,
        "Resume profile not found. Please complete your master resume first.",
      );
    }

    /*
     * Only copy resume content.
     *
     * Database IDs and timestamps from the
     * master profile are NOT copied.
     */

    const content = {
      fullName: profile.fullName ?? "",

      email: profile.email ?? "",

      headline: profile.headline ?? "",

      phone: profile.phone ?? "",

      location: profile.location ?? "",

      website: profile.website ?? "",

      linkedin: profile.linkedin ?? "",

      github: profile.github ?? "",

      summary: profile.summary ?? "",

      experience: profile.experience ?? [],

      education: profile.education ?? [],

      skills: this.normalizeSkillsOrder(profile.skills),

      projects: profile.projects ?? [],
    };

    /*
     * Upsert guarantees:
     *
     * One user
     *     ↓
     * One customization
     */

    return resumeRepository.upsertCustomization(userId, content as any);
  }

  /* ============================================================
       SAVE CUSTOMIZATION
    ============================================================ */

  async saveCustomization(userId: string, content: any) {
    const existing = await resumeRepository.findCustomizationByUserId(userId);

    if (!existing) {
      throw new ApiError(
        404,
        "Resume customization not found. Create it from your master resume first.",
      );
    }

    /*
     * Normalize skills before saving customized resume.
     */

    const normalizedContent = {
      ...content,

      skills: this.normalizeSkillsOrder(content?.skills),
    };

    return resumeRepository.updateCustomization(userId, normalizedContent);
  }

  /* ============================================================
       GET RESUME FOR PDF
    ============================================================ */

  async getResumeForPdf(userId: string) {
    const profile = await resumeRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new ApiError(404, "Resume profile not found");
    }

    const customization =
      await resumeRepository.findCustomizationByUserId(userId);

    /*
     * ========================================================
     * CUSTOMIZATION EXISTS
     * ========================================================
     */

    if (customization && customization.content) {
      return {
        ...this.toPdfData(customization.content, profile),
      };
    }

    /*
     * ========================================================
     * MASTER PROFILE
     * ========================================================
     */

    return {
      ...this.toPdfData(profile, profile),
    };
  }

  /* ============================================================
       MAP TO PDF DATA
    ============================================================ */

  private toPdfData(content: any, profile: any) {
    const getValue = (field: string) => {
      const customValue = content?.[field];

      if (customValue !== undefined && customValue !== null) {
        return customValue;
      }

      return profile?.[field];
    };

    return {
      fullName: getValue("fullName") ?? "",

      headline: getValue("headline") ?? "",

      email: getValue("email") ?? "",

      phone: getValue("phone") ?? "",

      location: getValue("location") ?? "",

      website: getValue("website") ?? "",

      linkedin: getValue("linkedin") ?? "",

      github: getValue("github") ?? "",

      summary: getValue("summary") ?? "",

      experience: getValue("experience") ?? [],

      education: getValue("education") ?? [],

      /*
       * Normalize one more time before PDF generation.
       *
       * This guarantees that even old/customized data
       * reaches the PDF generator with the correct order.
       */

      skills: this.normalizeSkillsOrder(getValue("skills")),

      projects: getValue("projects") ?? [],
    };
  }
}

export default new ResumeService();
