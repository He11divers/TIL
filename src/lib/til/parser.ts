import matter from "gray-matter";

import type { ParsedTilMarkdown, TilFrontmatter } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function frontmatterError(message: string, sourcePath?: string): never {
  const location = sourcePath ? ` in ${sourcePath}` : "";

  throw new Error(`Invalid TIL frontmatter${location}: ${message}`);
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidCalendarDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return day <= daysInMonth[month - 1];
}

function parseTilFrontmatter(
  data: unknown,
  sourcePath?: string,
): TilFrontmatter {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return frontmatterError("frontmatter must be an object.", sourcePath);
  }

  const fields = data as Record<string, unknown>;

  if (fields.title === undefined || fields.title === null) {
    return frontmatterError('"title" is required.', sourcePath);
  }

  if (typeof fields.title !== "string") {
    return frontmatterError('"title" must be a string.', sourcePath);
  }

  const title = fields.title.trim();

  if (!title) {
    return frontmatterError('"title" must be a non-empty string.', sourcePath);
  }

  if (fields.date === undefined || fields.date === null) {
    return frontmatterError('"date" is required.', sourcePath);
  }

  if (typeof fields.date !== "string") {
    return frontmatterError('"date" must be a string.', sourcePath);
  }

  if (!DATE_PATTERN.test(fields.date)) {
    return frontmatterError(
      '"date" must use YYYY-MM-DD format.',
      sourcePath,
    );
  }

  if (!isValidCalendarDate(fields.date)) {
    return frontmatterError(
      '"date" must be a valid calendar date.',
      sourcePath,
    );
  }

  if (fields.description === undefined) {
    return {
      title,
      date: fields.date,
    };
  }

  if (typeof fields.description !== "string") {
    return frontmatterError('"description" must be a string.', sourcePath);
  }

  const description = fields.description.trim();

  if (!description) {
    return frontmatterError(
      '"description" must be a non-empty string.',
      sourcePath,
    );
  }

  return {
    title,
    date: fields.date,
    description,
  };
}

export function parseTilMarkdown(
  source: string,
  sourcePath?: string,
): ParsedTilMarkdown {
  let parsed: ReturnType<typeof matter>;

  try {
    parsed = matter(source);
  } catch {
    return frontmatterError("YAML could not be parsed.", sourcePath);
  }

  return {
    frontmatter: parseTilFrontmatter(parsed.data, sourcePath),
    content: parsed.content.replace(/^(?:\r\n|\n|\r)/, ""),
  };
}
