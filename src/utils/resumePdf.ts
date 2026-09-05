import PDFDocument from "pdfkit";
import type { Response } from "express";
import fs from "fs";
import path from "path";

/* ================================================================
   TYPES
================================================================ */

export type ResumeSectionType =
  | "SUMMARY"
  | "EXPERIENCE"
  | "EDUCATION"
  | "SKILLS"
  | "PROJECTS"
  | "ACHIEVEMENTS"
  | "CERTIFICATIONS"
  | "AWARDS"
  | "LANGUAGES"
  | "PUBLICATIONS"
  | "VOLUNTEER"
  | "CUSTOM";

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  title: string;
  visible: boolean;
  content: unknown;
}

export interface ResumePdfData {
  fullName?: string | null;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;

  sections?: ResumeSection[] | null;
}

/* ================================================================
   PAGE
================================================================ */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

/*
 * 0.5 cm = approximately 14.17 points
 *
 * This restores the requested compact margin.
 */

const MARGIN = 14.17;

const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/* ================================================================
   COLORS
================================================================ */

const BLACK = "#111111";
const TEXT = "#222222";
const MUTED = "#555555";
const LINE = "#555555";

/* ================================================================
   CALIBRI
================================================================ */

const FONT_DIR = path.join(__dirname, "fonts");

const FONT_REGULAR = path.join(FONT_DIR, "CALIBRI.TTF");
const FONT_BOLD = path.join(FONT_DIR, "CALIBRIB.TTF");
const FONT_ITALIC = path.join(FONT_DIR, "CALIBRII.TTF");
const FONT_BOLD_ITALIC = path.join(FONT_DIR, "CALIBRIZ.TTF");

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
    throw new Error(`Calibri font file not found: ${fontFile}`);
  }
}

/* ================================================================
   BASIC HELPERS
================================================================ */

function text(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function objectValue(
  value: unknown,
): Record<string, unknown> | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* ================================================================
   BULLET NORMALIZATION
================================================================ */

function bullets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) =>
        item
          .replace(/^\s*[-•*]\s*/, "")
          .trim(),
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) =>
        item
          .replace(/^\s*[-•*]\s*/, "")
          .trim(),
      )
      .filter(Boolean);
  }

  return [];
}

/* ================================================================
   SECTION CONTENT HELPERS
================================================================ */

function sectionObject(
  content: unknown,
): Record<string, unknown> {
  return objectValue(content) ?? {};
}

function sectionString(
  content: unknown,
  key: string,
): string {
  const object = objectValue(content);

  if (!object) {
    return "";
  }

  return text(object[key]);
}

function sectionArray(content: unknown): unknown[] {
  if (Array.isArray(content)) {
    return content;
  }

  const object = objectValue(content);

  if (object && Array.isArray(object.items)) {
    return object.items;
  }

  return [];
}

/* ================================================================
   PAGE SPACE
================================================================ */

function ensureSpace(
  doc: PDFKit.PDFDocument,
  requiredHeight: number,
): void {
  const bottom = PAGE_HEIGHT - MARGIN;

  if (doc.y + requiredHeight > bottom) {
    doc.addPage({
      size: "A4",

      margins: {
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN,
      },
    });

    doc.x = MARGIN;
    doc.y = MARGIN;
  }
}

/* ================================================================
   SECTION TITLE
================================================================ */

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
): void {
  const SECTION_TOP_SPACE = 7;
  const LINE_TO_CONTENT_SPACE = 8;

  ensureSpace(doc, 32);

  doc.y += SECTION_TOP_SPACE;

  const titleY = doc.y;

  doc
    .font(FONT_BOLD)
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      text(title).toUpperCase(),
      MARGIN,
      titleY,
      {
        width: CONTENT_WIDTH,
        lineBreak: false,
      },
    );

  const lineY = titleY + 14;

  doc
    .moveTo(MARGIN, lineY)
    .lineTo(PAGE_WIDTH - MARGIN, lineY)
    .lineWidth(0.55)
    .strokeColor(LINE)
    .stroke();

  doc.y = lineY + LINE_TO_CONTENT_SPACE;
}

/* ================================================================
   HEADER
================================================================ */

function drawHeader(
  doc: PDFKit.PDFDocument,
  resume: ResumePdfData,
): void {
  const fullName = text(resume.fullName) || "Resume";

  doc
    .font(FONT_BOLD)
    .fontSize(19)
    .fillColor(BLACK)
    .text(
      fullName,
      MARGIN,
      doc.y,
      {
        width: CONTENT_WIDTH,
        align: "center",
        lineBreak: false,
      },
    );

  const headline = text(resume.headline);

  if (headline) {
    doc.moveDown(0.08);

    doc
      .font(FONT_REGULAR)
      .fontSize(9)
      .fillColor(TEXT)
      .text(
        headline,
        MARGIN,
        doc.y,
        {
          width: CONTENT_WIDTH,
          align: "center",
          lineBreak: false,
        },
      );
  }

  const contact = [
    text(resume.location),
    text(resume.phone),
    text(resume.email),
    text(resume.linkedin),
    text(resume.github),
    text(resume.website),
  ].filter(Boolean);

  if (contact.length > 0) {
    doc.moveDown(0.1);

    doc
      .font(FONT_REGULAR)
      .fontSize(8.5)
      .fillColor(TEXT)
      .text(
        contact.join("  |  "),
        MARGIN,
        doc.y,
        {
          width: CONTENT_WIDTH,
          align: "center",
          lineBreak: false,
        },
      );
  }

  doc.moveDown(0.48);
}

/* ================================================================
   BULLET
================================================================ */

function drawBullet(
  doc: PDFKit.PDFDocument,
  value: string,
): void {
  if (!value) {
    return;
  }

  const bulletWidth = 11;
  const textX = MARGIN + bulletWidth;

  ensureSpace(doc, 15);

  const startY = doc.y;

  doc
    .font(FONT_REGULAR)
    .fontSize(8.7)
    .fillColor(TEXT)
    .text(
      "•",
      MARGIN + 2,
      startY,
      {
        width: 6,
        lineBreak: false,
      },
    );

  doc
    .font(FONT_REGULAR)
    .fontSize(8.7)
    .fillColor(TEXT)
    .text(
      value,
      textX,
      startY,
      {
        width: CONTENT_WIDTH - bulletWidth,
        lineGap: 1.2,
        paragraphGap: 0,
      },
    );

  doc.moveDown(0.035);
}

/* ================================================================
   SUMMARY
================================================================ */

function drawSummary(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  let summary = "";

  if (typeof section.content === "string") {
    summary = text(section.content);
  } else {
    summary = sectionString(
      section.content,
      "text",
    );

    if (!summary) {
      summary = sectionString(
        section.content,
        "summary",
      );
    }

    if (!summary) {
      summary = sectionString(
        section.content,
        "description",
      );
    }
  }

  if (!summary) {
    return;
  }

  drawSectionTitle(doc, section.title);

  doc
    .font(FONT_REGULAR)
    .fontSize(8.7)
    .fillColor(TEXT)
    .text(
      summary,
      MARGIN,
      doc.y,
      {
        width: CONTENT_WIDTH,
        lineGap: 1.15,
        align: "left",
      },
    );

  doc.moveDown(0.05);
}

/* ================================================================
   SKILLS
================================================================ */

interface ResumeSkillCategory {
  id?: string;
  name?: string;
  items?: unknown;
}

function normalizeSkillCategories(
  content: unknown,
): ResumeSkillCategory[] {
  /*
   * New structure:
   *
   * {
   *   categories: [
   *     {
   *       id,
   *       name,
   *       items: []
   *     }
   *   ]
   * }
   *
   * Array order is the source of truth.
   */

  const object = objectValue(content);

  if (!object) {
    return [];
  }

  const categories = asArray(object.categories);

  return categories
    .filter(
      (category) =>
        category &&
        typeof category === "object" &&
        !Array.isArray(category),
    )
    .map((category: any) => ({
      id: text(category.id),
      name: text(category.name),
      items: stringArray(category.items),
    }))
    .filter(
      (category) =>
        !!category.name &&
        Array.isArray(category.items) &&
        category.items.length > 0,
    );
}

function drawSkills(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const categories = normalizeSkillCategories(
    section.content,
  );

  if (categories.length === 0) {
    return;
  }

  drawSectionTitle(doc, section.title);

  for (const category of categories) {
    if (
      !category.name ||
      !Array.isArray(category.items) ||
      category.items.length === 0
    ) {
      continue;
    }

    ensureSpace(doc, 14);

    const startY = doc.y;

    doc
      .font(FONT_BOLD)
      .fontSize(8.7)
      .fillColor(BLACK)
      .text(
        `${category.name}:`,
        MARGIN,
        startY,
        {
          continued: true,
          width: CONTENT_WIDTH,
          lineBreak: false,
        },
      );

    doc
      .font(FONT_REGULAR)
      .fontSize(8.7)
      .fillColor(TEXT)
      .text(
        ` ${category.items.join(", ")}`,
        {
          width: CONTENT_WIDTH,
          lineGap: 1,
        },
      );

    doc.moveDown(0.015);
  }

  doc.moveDown(0.05);
}

/* ================================================================
   EXPERIENCE
================================================================ */

interface ResumeExperience {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: unknown;
}

function normalizeExperience(
  content: unknown,
): ResumeExperience[] {
  return sectionArray(content)
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .map((item: any) => ({
      company: text(item.company),
      position: text(item.position),
      location: text(item.location),
      startDate: text(item.startDate),
      endDate: text(item.endDate),
      currentlyWorking:
        item.currentlyWorking === true,
      description: bullets(item.description),
    }));
}

function drawExperience(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const experience = normalizeExperience(
    section.content,
  );

  if (experience.length === 0) {
    return;
  }

  drawSectionTitle(doc, section.title);

  for (const item of experience) {
    ensureSpace(doc, 45);

    const position = text(item.position);
    const company = text(item.company);
    const location = text(item.location);

    let endDate = text(item.endDate);

    if (item.currentlyWorking) {
      endDate = "Present";
    }

    const date = [
      text(item.startDate),
      endDate,
    ]
      .filter(Boolean)
      .join(" – ");

    const heading = [
      position,
      company,
    ]
      .filter(Boolean)
      .join(" — ");

    const headingY = doc.y;

    if (heading) {
      doc
        .font(FONT_BOLD)
        .fontSize(8.9)
        .fillColor(BLACK)
        .text(
          heading,
          MARGIN,
          headingY,
          {
            width: CONTENT_WIDTH - 135,
            lineBreak: false,
          },
        );
    }

    if (location) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.4)
        .fillColor(TEXT)
        .text(
          location,
          MARGIN + 135,
          headingY,
          {
            width: CONTENT_WIDTH - 135,
            align: "right",
            lineBreak: false,
          },
        );
    }

    if (date) {
      doc
        .font(FONT_ITALIC)
        .fontSize(8.1)
        .fillColor(MUTED)
        .text(
          date,
          MARGIN,
          headingY + 13,
          {
            width: CONTENT_WIDTH,
            align: "right",
            lineBreak: false,
          },
        );
    }

    doc.y = headingY + 25;

    const description = bullets(
      item.description,
    );

    for (const bullet of description) {
      drawBullet(doc, bullet);
    }

    doc.moveDown(0.13);
  }
}

/* ================================================================
   EDUCATION
================================================================ */

interface ResumeEducation {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  location?: string;
}

function normalizeEducation(
  content: unknown,
): ResumeEducation[] {
  return sectionArray(content)
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .map((item: any) => ({
      institution: text(item.institution),
      degree: text(item.degree),
      fieldOfStudy: text(item.fieldOfStudy),
      startDate: text(item.startDate),
      endDate: text(item.endDate),
      grade: text(item.grade),
      location: text(item.location),
    }));
}

function drawEducation(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const education = normalizeEducation(
    section.content,
  );

  if (education.length === 0) {
    return;
  }

  drawSectionTitle(doc, section.title);

  for (const item of education) {
    ensureSpace(doc, 22);

    const degree = text(item.degree);
    const field = text(item.fieldOfStudy);
    const institution = text(item.institution);

    const qualification = [
      degree,
      field ? `(${field})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const heading = [
      qualification,
      institution
        ? `— ${institution}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const headingY = doc.y;

    if (heading) {
      doc
        .font(FONT_BOLD)
        .fontSize(8.8)
        .fillColor(BLACK)
        .text(
          heading,
          MARGIN,
          headingY,
          {
            width: CONTENT_WIDTH - 145,
            lineBreak: false,
          },
        );
    }

    const startDate = text(
      item.startDate,
    );

    const endDate = text(
      item.endDate,
    );

    const date = [
      startDate,
      endDate,
    ]
      .filter(Boolean)
      .join(" – ");

    const grade = text(item.grade);

    const formattedGrade = grade
      ? `CGPA: ${grade.replace(
        /^CGPA:\s*/i,
        "",
      )}`
      : "";

    const right = [
      date,
      formattedGrade,
    ]
      .filter(Boolean)
      .join(" | ");

    if (right) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.2)
        .fillColor(TEXT)
        .text(
          right,
          MARGIN + 145,
          headingY,
          {
            width: CONTENT_WIDTH - 145,
            align: "right",
            lineBreak: false,
          },
        );
    }

    doc.y = headingY + 13;

    doc.moveDown(0.02);
  }
}

/* ================================================================
   PROJECTS
================================================================ */

interface ResumeProject {
  id?: string;
  name?: string;
  description?: unknown;
  technologies?: unknown;
  url?: string;
  github?: string;
}

function normalizeProjects(
  content: unknown,
): ResumeProject[] {
  return sectionArray(content)
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .map((item: any) => ({
      id: text(item.id),
      name: text(item.name),
      description: item.description,
      technologies: item.technologies,
      url: text(item.url),
      github: text(item.github),
    }))
    .filter(
      (item) => !!item.name,
    );
}

function drawProjects(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const projects = normalizeProjects(
    section.content,
  );

  if (projects.length === 0) {
    return;
  }

  drawSectionTitle(doc, section.title);

  for (const project of projects) {
    ensureSpace(doc, 45);

    const name = text(project.name);

    const projectUrl =
      text(project.github) ||
      text(project.url);

    const headingY = doc.y;

    if (name) {
      doc
        .font(FONT_BOLD)
        .fontSize(8.9)
        .fillColor(BLACK)
        .text(
          name,
          MARGIN,
          headingY,
          {
            width: CONTENT_WIDTH - 180,
            lineBreak: false,
          },
        );
    }

    if (projectUrl) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.1)
        .fillColor(MUTED)
        .text(
          projectUrl,
          MARGIN + 180,
          headingY,
          {
            width: CONTENT_WIDTH - 180,
            align: "right",
            lineBreak: false,
          },
        );
    }

    doc.y = headingY + 12;

    const technologies = stringArray(
      project.technologies,
    );

    if (technologies.length > 0) {
      const technologyY = doc.y;

      doc
        .font(FONT_BOLD)
        .fontSize(8.5)
        .fillColor(BLACK)
        .text(
          "Technologies:",
          MARGIN,
          technologyY,
          {
            continued: true,
            width: CONTENT_WIDTH,
            lineBreak: false,
          },
        );

      doc
        .font(FONT_REGULAR)
        .fontSize(8.5)
        .fillColor(TEXT)
        .text(
          ` ${technologies.join(", ")}`,
          {
            width: CONTENT_WIDTH,
            lineGap: 1,
          },
        );

      doc.moveDown(0.05);
    }

    const description = bullets(
      project.description,
    );

    for (const bullet of description) {
      drawBullet(doc, bullet);
    }

    doc.moveDown(0.5);
  }
}

/* ================================================================
   GENERIC LIST SECTION
================================================================ */

interface GenericListItem {
  id?: string;
  title?: string;
  name?: string;
  description?: unknown;
  date?: string;
  issuer?: string;
  organization?: string;
  institution?: string;
  url?: string;
  [key: string]: unknown;
}

function normalizeGenericItems(
  content: unknown,
): GenericListItem[] {
  return sectionArray(content)
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item),
    )
    .map(
      (item: any) => ({
        ...item,
        id: text(item.id),
        title: text(item.title),
        name: text(item.name),
        description: item.description,
        date: text(item.date),
        issuer: text(item.issuer),
        organization: text(item.organization),
        institution: text(item.institution),
        url: text(item.url),
      }),
    );
}

/* ================================================================
   ACHIEVEMENTS
================================================================ */

function drawAchievements(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  drawGenericListSection(
    doc,
    section,
    {
      titleKeys: ["title", "name"],
      metadataKeys: [
        "date",
        "organization",
      ],
      descriptionAsBullet: true,
    },
  );
}

/* ================================================================
   CERTIFICATIONS
================================================================ */

function drawCertifications(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  drawGenericListSection(
    doc,
    section,
    {
      titleKeys: ["name", "title"],
      metadataKeys: [
        "issuer",
        "date",
      ],
      descriptionAsBullet: false,
    },
  );
}

/* ================================================================
   AWARDS
================================================================ */

function drawAwards(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  drawGenericListSection(
    doc,
    section,
    {
      titleKeys: ["title", "name"],
      metadataKeys: [
        "organization",
        "date",
      ],
      descriptionAsBullet: true,
    },
  );
}

/* ================================================================
   LANGUAGES
================================================================ */

function drawLanguages(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const items = normalizeGenericItems(
    section.content,
  );

  if (items.length === 0) {
    return;
  }

  drawSectionTitle(
    doc,
    section.title,
  );

  for (const item of items) {
    const object = objectValue(item);

    if (!object) {
      continue;
    }

    const language =
      text(object.language) ||
      text(object.name) ||
      text(object.title);

    const proficiency =
      text(object.proficiency) ||
      text(object.level);

    if (!language) {
      continue;
    }

    ensureSpace(doc, 16);

    const startY = doc.y;

    doc
      .font(FONT_BOLD)
      .fontSize(8.7)
      .fillColor(BLACK)
      .text(
        `${language}:`,
        MARGIN,
        startY,
        {
          continued: true,
          width: CONTENT_WIDTH,
          lineBreak: false,
        },
      );

    if (proficiency) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.7)
        .fillColor(TEXT)
        .text(
          ` ${proficiency}`,
          {
            width: CONTENT_WIDTH,
            lineGap: 1,
          },
        );
    } else {
      doc.text("", {
        width: CONTENT_WIDTH,
      });
    }

    doc.moveDown(0.015);
  }

  doc.moveDown(0.05);
}

/* ================================================================
   PUBLICATIONS
================================================================ */

function drawPublications(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  drawGenericListSection(
    doc,
    section,
    {
      titleKeys: [
        "title",
        "name",
      ],
      metadataKeys: [
        "publisher",
        "date",
      ],
      descriptionAsBullet: false,
    },
  );
}

/* ================================================================
   VOLUNTEER
================================================================ */

function drawVolunteer(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  drawGenericListSection(
    doc,
    section,
    {
      titleKeys: [
        "role",
        "position",
        "title",
        "name",
      ],
      metadataKeys: [
        "organization",
        "location",
        "date",
      ],
      descriptionAsBullet: true,
    },
  );
}

/* ================================================================
   GENERIC LIST RENDERER
================================================================ */

interface GenericListOptions {
  titleKeys: string[];
  metadataKeys: string[];
  descriptionAsBullet: boolean;
}

function firstText(
  object: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = text(object[key]);

    if (value) {
      return value;
    }
  }

  return "";
}

function drawGenericListSection(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
  options: GenericListOptions,
): void {
  const items = normalizeGenericItems(
    section.content,
  );

  if (items.length === 0) {
    return;
  }

  drawSectionTitle(
    doc,
    section.title,
  );

  for (const item of items) {
    const object = objectValue(item);

    if (!object) {
      continue;
    }

    const title = firstText(
      object,
      options.titleKeys,
    );

    const metadataParts = options.metadataKeys
      .map((key) => text(object[key]))
      .filter(Boolean);

    const description = bullets(
      object.description,
    );

    if (
      !title &&
      metadataParts.length === 0 &&
      description.length === 0
    ) {
      continue;
    }

    ensureSpace(doc, 25);

    const headingY = doc.y;

    if (title) {
      doc
        .font(FONT_BOLD)
        .fontSize(8.8)
        .fillColor(BLACK)
        .text(
          title,
          MARGIN,
          headingY,
          {
            width:
              metadataParts.length > 0
                ? CONTENT_WIDTH - 145
                : CONTENT_WIDTH,
            lineBreak: false,
          },
        );
    }

    if (metadataParts.length > 0) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.2)
        .fillColor(TEXT)
        .text(
          metadataParts.join(" | "),
          MARGIN + 145,
          headingY,
          {
            width:
              CONTENT_WIDTH - 145,
            align: "right",
            lineBreak: false,
          },
        );
    }

    doc.y = headingY + 13;

    if (options.descriptionAsBullet) {
      for (const bullet of description) {
        drawBullet(doc, bullet);
      }
    } else {
      for (const bullet of description) {
        ensureSpace(doc, 15);

        doc
          .font(FONT_REGULAR)
          .fontSize(8.7)
          .fillColor(TEXT)
          .text(
            bullet,
            MARGIN,
            doc.y,
            {
              width: CONTENT_WIDTH,
              lineGap: 1.1,
            },
          );

        doc.moveDown(0.035);
      }
    }

    doc.moveDown(0.13);
  }
}

/* ================================================================
   CUSTOM SECTION
================================================================ */

/* ================================================================
   CUSTOM SECTION
================================================================ */

function drawCustomSection(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  const content = section.content;

  /* ------------------------------------------------------------
     CUSTOM STRING
  ------------------------------------------------------------ */

  if (typeof content === "string") {
    const value = text(content);

    if (!value) {
      return;
    }

    drawSectionTitle(
      doc,
      section.title,
    );

    doc
      .font(FONT_REGULAR)
      .fontSize(8.7)
      .fillColor(TEXT)
      .text(
        value,
        MARGIN,
        doc.y,
        {
          width: CONTENT_WIDTH,
          lineGap: 1.15,
        },
      );

    doc.moveDown(0.05);

    return;
  }

  /* ------------------------------------------------------------
     NORMALIZE CUSTOM ITEMS
     
     Supports both:
     
     {
       items: [...]
     }
     
     and legacy:
     
     [...]
  ------------------------------------------------------------ */

  let rawItems: unknown[] = [];

  if (Array.isArray(content)) {
    rawItems = content;
  } else {
    const object = objectValue(content);

    if (object && Array.isArray(object.items)) {
      rawItems = object.items;
    }
  }

  const items = normalizeGenericItems(
    rawItems,
  );

  /* ------------------------------------------------------------
     NO ITEMS
  ------------------------------------------------------------ */

  if (items.length === 0) {
    return;
  }

  /* ------------------------------------------------------------
     SECTION TITLE
  ------------------------------------------------------------ */

  drawSectionTitle(
    doc,
    section.title,
  );

  /* ------------------------------------------------------------
     RENDER ITEMS
  ------------------------------------------------------------ */

  for (const item of items) {
    const object = objectValue(item);

    if (!object) {
      continue;
    }

    const title =
      firstText(
        object,
        [
          "title",
          "name",
        ],
      );

    const subtitle =
      text(object.subtitle);

    const date =
      text(object.date);

    const location =
      text(object.location);

    const url =
      text(object.url);

    /*
     * Description can be either:
     *
     * string
     * string[]
     */
    const description =
      bullets(
        object.description,
      );

    /*
     * Some custom entries may explicitly
     * contain bullets[].
     */
    const explicitBullets =
      bullets(
        object.bullets,
      );

    const allBullets = [
      ...description,
      ...explicitBullets,
    ];

    /*
     * Don't render completely empty entries.
     */
    if (
      !title &&
      !subtitle &&
      !date &&
      !location &&
      !url &&
      allBullets.length === 0
    ) {
      continue;
    }

    ensureSpace(
      doc,
      28,
    );

    const startY = doc.y;

    /* ----------------------------------------------------------
    TITLE
 ---------------------------------------------------------- */

    if (title) {
      doc
        .font(FONT_BOLD)
        .fontSize(8.9)
        .fillColor(BLACK)
        .text(
          title,
          MARGIN,
          startY,
          {
            width: CONTENT_WIDTH,
            lineBreak: false,
          },
        );
    }

    /* ----------------------------------------------------------
       SUBTITLE
    ---------------------------------------------------------- */

    if (subtitle) {
      doc
        .font(FONT_REGULAR)
        .fontSize(8.5)
        .fillColor(TEXT)
        .text(
          subtitle,
          MARGIN,
          startY + 13,
          {
            width: CONTENT_WIDTH,
            lineBreak: false,
          },
        );
    }

    /*
     * Move below title + subtitle.
     */
    doc.y =
      startY +
      (title && subtitle
        ? 26
        : title || subtitle
          ? 13
          : 0);

    /* ----------------------------------------------------------
       DATE / LOCATION
    ---------------------------------------------------------- */

    const metadata = [
      date,
      location,
    ].filter(Boolean);

    if (metadata.length > 0) {
      const metadataY = doc.y;

      doc
        .font(FONT_ITALIC)
        .fontSize(8.1)
        .fillColor(MUTED)
        .text(
          metadata.join(" | "),
          MARGIN,
          metadataY,
          {
            width: CONTENT_WIDTH,
            align: "right",
            lineBreak: false,
          },
        );

      doc.y =
        metadataY + 12;
    }

    /* ----------------------------------------------------------
       URL
    ---------------------------------------------------------- */

    if (url) {
      ensureSpace(
        doc,
        14,
      );

      doc
        .font(FONT_REGULAR)
        .fontSize(8)
        .fillColor(MUTED)
        .text(
          url,
          MARGIN,
          doc.y,
          {
            width: CONTENT_WIDTH,
            lineGap: 1,
          },
        );

      doc.moveDown(0.03);
    }

    /* ----------------------------------------------------------
       DESCRIPTION / BULLETS
    ---------------------------------------------------------- */

    for (const bullet of allBullets) {
      drawBullet(
        doc,
        bullet,
      );
    }

    doc.moveDown(0.13);
  }
}

/* ================================================================
   SECTION NORMALIZATION
================================================================ */

function normalizeSections(
  sectionsValue: unknown,
): ResumeSection[] {
  if (!Array.isArray(sectionsValue)) {
    return [];
  }

  return sectionsValue
    .filter(
      (section) =>
        section &&
        typeof section === "object" &&
        !Array.isArray(section),
    )
    .map((section: any) => {
      const type = text(
        section.type,
      ).toUpperCase();

      return {
        id: text(section.id),
        type:
          type as ResumeSectionType,
        title:
          text(section.title) ||
          type ||
          "Section",
        visible:
          section.visible !== false,
        content:
          section.content ?? [],
      };
    })
    .filter(
      (section) =>
        !!section.id &&
        !!section.type,
    );
}

/* ================================================================
   RENDER SECTION
================================================================ */

function renderSection(
  doc: PDFKit.PDFDocument,
  section: ResumeSection,
): void {
  /*
   * Hidden sections remain in the
   * stored resume data but are not
   * rendered.
   */

  if (!section.visible) {
    return;
  }

  switch (section.type) {
    case "SUMMARY":
      drawSummary(doc, section);
      break;

    case "EXPERIENCE":
      drawExperience(doc, section);
      break;

    case "EDUCATION":
      drawEducation(doc, section);
      break;

    case "SKILLS":
      drawSkills(doc, section);
      break;

    case "PROJECTS":
      drawProjects(doc, section);
      break;

    case "ACHIEVEMENTS":
      drawAchievements(doc, section);
      break;

    case "CERTIFICATIONS":
      drawCertifications(doc, section);
      break;

    case "AWARDS":
      drawAwards(doc, section);
      break;

    case "LANGUAGES":
      drawLanguages(doc, section);
      break;

    case "PUBLICATIONS":
      drawPublications(doc, section);
      break;

    case "VOLUNTEER":
      drawVolunteer(doc, section);
      break;

    case "CUSTOM":
      drawCustomSection(doc, section);
      break;

    default:
      /*
       * Unknown section types are
       * intentionally ignored.
       *
       * They remain safely stored in
       * the database and can be supported
       * by a future renderer.
       */
      break;
  }
}

/* ================================================================
   GENERATE RESUME PDF
================================================================ */

export function generateResumePdf(
  res: Response,
  resume: ResumePdfData,
  filename = "resume.pdf",
): void {
  const doc = new PDFDocument({
    size: "A4",

    margins: {
      top: MARGIN,
      bottom: MARGIN,
      left: MARGIN,
      right: MARGIN,
    },

    bufferPages: true,

    info: {
      Title:
        `${text(resume.fullName) || "Resume"} - Resume`,

      Author:
        text(resume.fullName) || "Resume",
    },
  });

  /* ============================================================
     REGISTER CALIBRI
  ============================================================ */

  doc.registerFont(
    "Calibri",
    FONT_REGULAR,
  );

  doc.registerFont(
    "Calibri-Bold",
    FONT_BOLD,
  );

  doc.registerFont(
    "Calibri-Italic",
    FONT_ITALIC,
  );

  doc.registerFont(
    "Calibri-BoldItalic",
    FONT_BOLD_ITALIC,
  );

  /* ============================================================
     RESPONSE
  ============================================================ */

  res.setHeader(
    "Content-Type",
    "application/pdf",
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`,
  );

  res.setHeader(
    "Cache-Control",
    "no-store",
  );

  /* ============================================================
     PIPE
  ============================================================ */

  doc.pipe(res);

  /* ============================================================
     HEADER
  ============================================================ */

  drawHeader(doc, resume);

  /* ============================================================
     DYNAMIC SECTIONS
  ============================================================ */

  const sections = normalizeSections(
    resume.sections,
  );

  /*
   * IMPORTANT:
   *
   * No sorting happens here.
   *
   * The database array order is the
   * exact PDF rendering order.
   */

  for (const section of sections) {
    renderSection(doc, section);
  }

  /* ============================================================
     FINISH
  ============================================================ */

  doc.end();
}