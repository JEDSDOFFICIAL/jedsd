/**
 * Single source of truth for journal information and editorial team.
 * Import from this file everywhere — no hardcoding journal metadata in components.
 */

import { SITE_URL } from './site';

// =============================================================================
// JOURNAL METADATA
// =============================================================================

export const JOURNAL = {
  title: 'Journal of Embedded & Digital System Design',
  shortName: 'JEDSD',
  publisher: 'Digital System Design',
  address: '246, Library Lane, Panda Para Road, Jalpaiguri, West Bengal, 735101',
  frequency: 'Half-yearly (2 issues per volume)',
  publicationModel: 'Continuous online publication',
  issn: '2582-0605',
  canonicalUrl: SITE_URL,
} as const;

// =============================================================================
// PERSON TYPE
// =============================================================================

export interface Person {
  name: string;
  role: string;
  designation: string;
  department?: string;
  institution: string;
  address?: string;
  email?: string;
  photo?: string | null;
  slug: string;
}

// =============================================================================
// EDITORIAL TEAM
// =============================================================================

export const EDITOR_IN_CHIEF: Person = {
  name: 'Dr. Shirshendu Roy',
  role: 'Editor-in-Chief',
  designation: 'Assistant Professor',
  department: 'ECE',
  institution: 'Dayananda Sagar University',
  address: 'Bengaluru – 562112',
  email: 'shirshenduroy-ece@dsu.edu.in',
  photo: null,
  slug: 'shirshendu-roy',
};

export const EDITORIAL_BOARD: Person[] = [
  {
    name: 'Dr. Avik K Das',
    role: 'Editorial Board Member',
    designation: 'Asst. Prof.',
    department: 'CSE (IoT, CS, BT)',
    institution: 'UEM Kolkata',
    address: 'Kolkata – 700160',
    email: 'avikkumar.das@uem.edu.in',
    photo: null,
    slug: 'avik-k-das',
  },
  {
    name: 'Dr. Ardhendu Sarkar',
    role: 'Editorial Board Member',
    designation: 'Asst. Prof.',
    department: 'CSE',
    institution: 'Institute of Engineering & Management',
    address: 'Salt Lake Sector V, Kolkata – 700091',
    email: 'ardhendu.sarkar@iem.edu.in',
    photo: null,
    slug: 'ardhendu-sarkar',
  },
  {
    name: 'Dr. Priyajit Biswas',
    role: 'Editorial Board Member',
    designation: 'Asst. Prof.',
    department: 'Information Technology',
    institution: 'Netaji Subhash Engineering College',
    address: 'Garia, Kolkata – 700152',
    email: 'priyajit.biswas@nsec.ac.in',
    photo: null,
    slug: 'priyajit-biswas',
  },
  {
    name: 'Dr. Abhinav Karan',
    role: 'Editorial Board Member',
    designation: 'Asst. Prof.',
    department: 'ECE',
    institution: 'Dayananda Sagar University',
    address: 'Bengaluru – 562112',
    email: 'abhinav-cse@dsu.edu.in',
    photo: null,
    slug: 'abhinav-karan',
  },
];

export const FACULTY_ADVISERS: Person[] = [
  {
    name: 'Dr. Debiprasad Priyabrata Acharya',
    role: 'Faculty Adviser',
    designation: 'Professor',
    institution: 'NIT Rourkela',
    photo: null,
    slug: 'debiprasad-priyabrata-acharya',
  },
  {
    name: 'Dr. Suraj Prakash Sahoo',
    role: 'Faculty Adviser',
    designation: 'Asst. Prof.',
    institution: 'VIT Vellore',
    photo: null,
    slug: 'suraj-prakash-sahoo',
  },
  {
    name: 'Dr. Jisy N K',
    role: 'Faculty Adviser',
    designation: 'Asst. Prof.',
    institution: 'Dayananda Sagar University',
    photo: null,
    slug: 'jisy-n-k',
  },
  {
    name: 'Dr. Priyadarsan Parida',
    role: 'Faculty Adviser',
    designation: 'Assoc. Prof.',
    institution: 'GIET University',
    photo: null,
    slug: 'priyadarsan-parida',
  },
  {
    name: 'Dr. Shasanka Sekhar Rout',
    role: 'Faculty Adviser',
    designation: 'Asst. Prof.',
    institution: 'GLA University',
    photo: null,
    slug: 'shasanka-sekhar-rout',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extracts initials from a person's name.
 * @example getPersonInitials('Dr. John Doe') => 'JD'
 * @example getPersonInitials('Jane Smith') => 'JS'
 */
export function getPersonInitials(name: string): string {
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '') // Strip titles
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2); // Take first two initials
}

/**
 * Generates a URL-safe slug from a person's name.
 * @example getPersonSlug('Dr. John Doe') => 'john-doe'
 * @example getPersonSlug('Jane Smith-Jones') => 'jane-smith-jones'
 */
export function getPersonSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|ms\.|mrs\.)\s+/i, '') // Strip titles
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric except hyphens and spaces
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens
}
