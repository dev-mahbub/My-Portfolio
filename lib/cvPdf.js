/**
 * ATS-Friendly CV PDF generator (uses pdf-lib, no native deps).
 *
 * ATS rules respected:
 *  - Single column layout
 *  - No tables, no columns, no text boxes, no graphics/images
 *  - Standard section headings in ALL CAPS
 *    (PROFESSIONAL SUMMARY, CORE SKILLS, EXPERIENCE, EDUCATION)
 *  - Standard, readable font (Helvetica / Helvetica-Bold)
 *  - Real selectable text (no vector outlines)
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const FONT = StandardFonts.Helvetica;
const FONT_BOLD = StandardFonts.HelveticaBold;
const MARGIN = 50;
const PAGE_W = 595.28; // A4 width in points
const PAGE_H = 841.89; // A4 height in points
const LINE_H = 13;

function newPage(doc) {
  return doc.addPage([PAGE_W, PAGE_H]);
}

/**
 * Build an ATS-friendly PDF Buffer from a structured resume object.
 * @param {object} r { name, headline, contactLine, summary, skills[],
 *   experience[{role,company,period,bullets[]}], education[{title,school,period}] }
 * @returns {Promise<Uint8Array>}
 */
export async function buildAtsCvPdf(r = {}) {
  const doc = await PDFDocument.create();
  let page = newPage(doc);
  const font = await doc.embedFont(FONT);
  const bold = await doc.embedFont(FONT_BOLD);

  let y = PAGE_H - MARGIN;
  const left = MARGIN;
  const rightBound = PAGE_W - MARGIN;

  const ensure = (needed) => {
    if (y - needed < MARGIN) {
      page = newPage(doc);
      y = PAGE_H - MARGIN;
    }
  };

  const writeText = (text, size, useBold, gapAfter = 4) => {
    if (!text) return;
    const f = useBold ? bold : font;
    const lines = wrap(text, f, size, rightBound - left);
    for (const line of lines) {
      ensure(LINE_H);
      page.drawText(line, { x: left, y, size, font: f, color: rgb(0, 0, 0) });
      y -= LINE_H;
    }
    y -= gapAfter;
  };

  const heading = (text) => {
    ensure(LINE_H + 6);
    y -= 2;
    page.drawText(text, {
      x: left,
      y,
      size: 11.5,
      font: bold,
      color: rgb(0, 0, 0),
    });
    y -= LINE_H;
    // simple rule line
    page.drawLine({
      start: { x: left, y: y + 3 },
      end: { x: rightBound, y: y + 3 },
      thickness: 0.8,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 6;
  };

  // ---- Header ----
  writeText(r.name || "Your Name", 18, true, 2);
  writeText(r.headline || "", 11, false, 2);
  writeText(r.contactLine || "", 10, false, 8);

  // ---- Summary ----
  if (r.summary) {
    heading("PROFESSIONAL SUMMARY");
    writeText(r.summary, 10, false, 8);
  }

  // ---- Skills ----
  if (Array.isArray(r.skills) && r.skills.length) {
    heading("CORE SKILLS");
    writeText(r.skills.join(", "), 10, false, 8);
  }

  // ---- Experience ----
  if (Array.isArray(r.experience) && r.experience.length) {
    heading("EXPERIENCE");
    for (const e of r.experience) {
      writeText(`${e.role || ""} — ${e.company || ""}`, 11, true, 0);
      writeText(`${e.period || ""}`, 9.5, false, 3);
      for (const b of e.bullets || []) {
        writeText("• " + b, 10, false, 2);
      }
      y -= 4;
    }
  }

  // ---- Education ----
  if (Array.isArray(r.education) && r.education.length) {
    heading("EDUCATION");
    for (const ed of r.education) {
      writeText(`${ed.title || ""} — ${ed.school || ""}`, 11, true, 0);
      writeText(`${ed.period || ""}`, 9.5, false, 6);
    }
  }

  return doc.save();
}

/**
 * Build ATS CV from the online CV data (profile/skills/experience/education).
 * This is used to generate a sensible default downloadable PDF the first time.
 */
export async function buildAtsCvFromData(data = {}) {
  const profile = data.profile || {};
  const contact = data.contact || {};
  return buildAtsCvPdf({
    name: profile.name,
    headline: profile.headline,
    contactLine: [
      profile.location,
      contact.phone,
      contact.email,
      contact.linkedin,
      contact.github,
    ]
      .filter(Boolean)
      .join("  |  "),
    summary: profile.about,
    skills: (data.skills || []).map((s) => s.name),
    experience: (data.experience || []).map((e) => ({
      role: e.role,
      company: e.company,
      period: e.period,
      bullets: e.desc ? [e.desc] : [],
    })),
    education: (data.education || []).map((ed) => ({
      title: ed.degree,
      school: ed.school,
      period: ed.period,
    })),
  });
}

// ---- word wrap helper ----
function wrap(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export default { buildAtsCvPdf, buildAtsCvFromData };
