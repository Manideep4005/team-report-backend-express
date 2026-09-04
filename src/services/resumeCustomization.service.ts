import resumeCustomizationRepository from "../repositories/resumeCustomization.repository";

import resumeRepository from "../repositories/resume.repository";

import { ApiError } from "../utils/ApiError";

class ResumeCustomizationService {
  private normalizeSkillsOrder(skills: any) {
    if (!skills || typeof skills !== "object" || Array.isArray(skills)) {
      return {};
    }

    const categories = Object.keys(skills).filter(
      (category) => category !== "__order",
    );

    const storedOrder = Array.isArray(skills.__order)
      ? skills.__order.filter(
          (category: unknown): category is string =>
            typeof category === "string" &&
            category.trim().length > 0 &&
            category !== "__order",
        )
      : [];

    const orderedCategories = [
      ...storedOrder.filter((category: any) => categories.includes(category)),

      ...categories.filter((category) => !storedOrder.includes(category)),
    ];

    const result: Record<string, any> = {};

    orderedCategories.forEach((category) => {
      result[category] = skills[category];
    });

    result.__order = orderedCategories;

    return result;
  }
  /*
   * ============================================================
   * CREATE CUSTOMIZATION FROM MASTER PROFILE
   * ============================================================
   *
   * One customization per user.
   *
   * Master:
   *
   * ResumeProfile
   *
   * gets copied into:
   *
   * ResumeCustomization.content
   *
   * The user can then modify the customization without
   * changing the master profile.
   */

  async createFromProfile(userId: string) {
    /*
     * --------------------------------------------------------
     * Check whether customization already exists
     * --------------------------------------------------------
     */

    const existing = await resumeCustomizationRepository.findByUserId(userId);

    if (existing) {
      throw new ApiError(409, "Resume customization already exists.");
    }

    /*
     * --------------------------------------------------------
     * Get master profile
     * --------------------------------------------------------
     */

    const profile = await resumeRepository.findProfileByUserId(userId);

    if (!profile) {
      throw new ApiError(
        404,
        "Resume profile not found. Please create your master resume first.",
      );
    }

    /*
     * --------------------------------------------------------
     * Create a COPY of the master profile.
     *
     * We deliberately do NOT copy:
     *
     * id
     * userId
     * createdAt
     * updatedAt
     *
     * Those belong to ResumeCustomization itself.
     * --------------------------------------------------------
     */

    const content = {
      fullName: profile.fullName,

      headline: profile.headline,

      phone: profile.phone,

      location: profile.location,

      website: profile.website,

      linkedin: profile.linkedin,

      github: profile.github,

      summary: profile.summary,

      experience: profile.experience,

      education: profile.education,

      skills: this.normalizeSkillsOrder(profile.skills),

      projects: profile.projects,
    };

    /*
     * --------------------------------------------------------
     * Save ONE customization
     * --------------------------------------------------------
     */

    return resumeCustomizationRepository.create(
      userId,
      content,
      "PROFESSIONAL",
    );
  }

  /*
   * ============================================================
   * GET CUSTOMIZATION
   * ============================================================
   */

  async getCustomization(userId: string) {
    return resumeCustomizationRepository.findByUserId(userId);
  }
}

export default new ResumeCustomizationService();
