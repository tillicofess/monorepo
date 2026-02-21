export type User = {
  /** Preferred public-facing name */
  displayName: string;
  /** Handle/username used in links or mentions */
  gender: 'male' | 'female' | 'non-binary';
  /** Short phrases rotated in UI (e.g., homepage flip effect) */
  flipSentences: string[];
  /** base64 encoded (https://t.io.vn/base64-string-converter) */
  email: string;
  /** Personal/homepage URL */
  website: string;
  /** Primary/current role shown on profile */
  jobTitle: string;
  /** Public URL to avatar image */
  avatar: string;
};
