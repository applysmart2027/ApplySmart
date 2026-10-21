// Parsing moves through these in order; Failed can follow Processing when parsing cannot finish.
export const PARSE_STATUSES = ['Processing', 'Needs review', 'Confirmed', 'Failed'] as const;

export type ParseStatus = (typeof PARSE_STATUSES)[number];

export const RESUME_VERSION_LIMIT = 10;

// Parsing the same file more often than this rarely helps, so Retry is no longer offered.
export const MAX_PARSE_ATTEMPTS = 3;

export type ResumeVersion = {
  id: string;
  versionName: string;
  parseStatus: ParseStatus;
  isPrimary: boolean;
  uploaded: string; // YYYY-MM-DD
  parseAttempts: number; // parses tried on the current file, counting the first
  failureReason: string; // empty unless parseStatus is Failed
  sections: ParsedSections; // empty until parsing reads something
};

// Sections made of dated entries. Each names its two main fields for that kind of entry.
export const SECTION_FIELDS = {
  Experience: { title: 'Job title', organization: 'Organization' },
  Education: { title: 'Program', organization: 'School' },
  Projects: { title: 'Project name', organization: 'Organization or course' },
} as const;

export type SectionName = keyof typeof SECTION_FIELDS;

export const SECTION_NAMES = Object.keys(SECTION_FIELDS) as SectionName[];

// Dates are kept as the student typed them, such as "May 2025"; an end date may be "Present".
export type SectionEntry = {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type ParsedSections = Record<SectionName, SectionEntry[]>;

export function emptySections(): ParsedSections {
  return { Experience: [], Education: [], Projects: [] };
}
