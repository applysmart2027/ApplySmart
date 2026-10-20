// Parsing moves through these in order; Failed can follow Processing when parsing cannot finish.
export const PARSE_STATUSES = ['Processing', 'Needs review', 'Confirmed', 'Failed'] as const;

export type ParseStatus = (typeof PARSE_STATUSES)[number];

export const RESUME_VERSION_LIMIT = 10;

export type ResumeVersion = {
  id: string;
  versionName: string;
  parseStatus: ParseStatus;
  isPrimary: boolean;
  uploaded: string; // YYYY-MM-DD
};
