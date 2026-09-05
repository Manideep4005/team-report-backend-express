import resumeRepository from "../repositories/resume.repository";

import { ApiError } from "../utils/ApiError";

import type {
  ResumeProfileContent,
  ResumeSection,
} from "../types/resume";


class ResumeService {



  /* ============================================================
     SECTION NORMALIZATION
  ============================================================ */
  private normalizeSections(
    sections: unknown,
  ): ResumeSection[] {

    if (!Array.isArray(sections)) {
      return [];
    }

    return sections.map((section) => {

      if (
        !section ||
        typeof section !== "object" ||
        Array.isArray(section)
      ) {
        throw new ApiError(
          400,
          "Invalid resume section.",
        );
      }

      const value =
        section as Record<string, any>;

      if (
        typeof value.id !== "string" ||
        !value.id.trim()
      ) {
        throw new ApiError(
          400,
          "Every resume section must have an id.",
        );
      }

      if (
        typeof value.type !== "string" ||
        !value.type.trim()
      ) {
        throw new ApiError(
          400,
          `Resume section "${value.id}" must have a type.`,
        );
      }

      if (
        typeof value.title !== "string" ||
        !value.title.trim()
      ) {
        throw new ApiError(
          400,
          `Resume section "${value.id}" must have a title.`,
        );
      }

      return {
        id: value.id.trim(),

        type:
          value.type
            .trim()
            .toUpperCase() as ResumeSection["type"],

        title: value.title.trim(),

        visible:
          typeof value.visible === "boolean"
            ? value.visible
            : true,

        /*
         * DO NOT sort this.
         *
         * Whatever order the client sends is the persisted order.
         */

        content:
          value.content ?? [],
      };
    });
  }

  /* ============================================================
     MASTER PROFILE
  ============================================================ */

  async getProfile(
    userId: string,
  ) {
    const profile =
      await resumeRepository.findProfileByUserId(
        userId,
      );

    if (!profile) {
      return null;
    }

    return {
      ...profile,

      sections:
        this.normalizeSections(
          profile.sections,
        ),
    };
  }


  async saveProfile(
    userId: string,
    data: ResumeProfileContent,
  ) {

    const normalizedData: ResumeProfileContent = {
      ...data,

      sections:
        this.normalizeSections(
          data.sections,
        ),
    };


    const existing =
      await resumeRepository.findProfileByUserId(
        userId,
      );


    if (existing) {
      return resumeRepository.updateProfile(
        userId,
        normalizedData,
      );
    }


    return resumeRepository.createProfile(
      userId,
      normalizedData,
    );
  }


  /* ============================================================
     CUSTOMIZATION
  ============================================================ */

  async getCustomization(
    userId: string,
  ) {

    const customization =
      await resumeRepository.findCustomizationByUserId(
        userId,
      );


    if (!customization) {
      return null;
    }


    /*
     * Normalize returned JSON as well.
     */

    if (
      customization.content &&
      typeof customization.content === "object"
    ) {

      return {
        ...customization,

        content: {
          ...(customization.content as any),

          sections:
            this.normalizeSections(
              (customization.content as any).sections,
            ),
        },
      };
    }


    return customization;
  }


  /* ============================================================
     CREATE CUSTOMIZATION FROM MASTER
  ============================================================ */

  async createCustomizationFromProfile(
    userId: string,
  ) {

    const profile =
      await resumeRepository.findProfileByUserId(
        userId,
      );


    if (!profile) {
      throw new ApiError(
        404,
        "Resume profile not found. Please complete your master resume first.",
      );
    }


    /*
     * ------------------------------------------------------------
     * Deep-copy sections.
     *
     * We deliberately create a new JSON structure so the
     * customization can be modified independently.
     * ------------------------------------------------------------
     */

    const sections =
      this.normalizeSections(
        profile.sections,
      );


    const content: ResumeProfileContent = {

      fullName:
        profile.fullName ?? "",

      email:
        profile.email ?? "",

      headline:
        profile.headline ?? "",

      phone:
        profile.phone ?? "",

      location:
        profile.location ?? "",

      website:
        profile.website ?? "",

      linkedin:
        profile.linkedin ?? "",

      github:
        profile.github ?? "",

      sections:
        JSON.parse(
          JSON.stringify(sections),
        ),
    };


    /*
     * One customization per user.
     *
     * If it already exists, update it.
     */

    return resumeRepository.upsertCustomization(
      userId,
      content,
    );
  }


  /* ============================================================
     SAVE CUSTOMIZATION
  ============================================================ */

  async saveCustomization(
    userId: string,
    content: ResumeProfileContent,
  ) {

    const existing =
      await resumeRepository.findCustomizationByUserId(
        userId,
      );


    if (!existing) {
      throw new ApiError(
        404,
        "Resume customization not found. Create it from your master resume first.",
      );
    }


    const normalizedContent: ResumeProfileContent = {

      ...content,

      sections:
        this.normalizeSections(
          content.sections,
        ),
    };


    return resumeRepository.updateCustomization(
      userId,
      normalizedContent,
    );
  }


  /* ============================================================
     GET RESUME FOR PDF
  ============================================================ */

  async getResumeForPdf(
    userId: string,
  ) {

    const profile =
      await resumeRepository.findProfileByUserId(
        userId,
      );


    if (!profile) {
      throw new ApiError(
        404,
        "Resume profile not found",
      );
    }


    const customization =
      await resumeRepository.findCustomizationByUserId(
        userId,
      );


    /*
     * ------------------------------------------------------------
     * CUSTOMIZATION EXISTS
     * ------------------------------------------------------------
     */

    if (
      customization &&
      customization.content
    ) {

      return this.toPdfData(
        customization.content,
        profile,
      );
    }


    /*
     * ------------------------------------------------------------
     * MASTER PROFILE
     * ------------------------------------------------------------
     */

    return this.toPdfData(
      profile,
      profile,
    );
  }


  /* ============================================================
     MAP TO PDF DATA
  ============================================================ */

  private toPdfData(
    content: any,
    profile: any,
  ) {

    const getValue = (
      field: string,
    ) => {

      const customValue =
        content?.[field];


      if (
        customValue !== undefined &&
        customValue !== null
      ) {
        return customValue;
      }


      return profile?.[field];
    };


    return {

      fullName:
        getValue("fullName") ?? "",

      headline:
        getValue("headline") ?? "",

      email:
        getValue("email") ?? "",

      phone:
        getValue("phone") ?? "",

      location:
        getValue("location") ?? "",

      website:
        getValue("website") ?? "",

      linkedin:
        getValue("linkedin") ?? "",

      github:
        getValue("github") ?? "",

      /*
       * Dynamic sections.
       *
       * The order in this array is the render order.
       */

      sections:
        this.normalizeSections(
          getValue("sections"),
        ),
    };
  }


}


export default new ResumeService();