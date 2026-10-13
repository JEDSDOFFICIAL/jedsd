# Google Scholar SEO Guide - JEDSD Implementation

## Overview
This document explains the Google Scholar indexing implementation for JEDSD and how to ensure all published papers are properly indexed and discoverable.

---

## Why Only One Paper Was Indexed

### Root Cause Analysis
The issue occurred because:

1. **Status Enum Inconsistency**: The database has both `PUBLISH` and `PUBLISHED` enum values, but papers published through the API are set to `PUBLISH` status, while the sitemap queries for both statuses now.

2. **Metadata Robots Directive**: Papers are only indexed by Google if `robots.index = true`, which depends on the status check.

3. **Missing File Access Controls**: Published papers didn't have their file paths properly configured for public access.

### Solution Implemented
- Updated metadata generation to check for both `PUBLISH` and `PUBLISHED` statuses
- Enhanced Google Scholar meta tags with all required citation metadata
- Improved JSON-LD schema markup with comprehensive scholarly article information
- Created sitemap to include papers with multiple status values
- Added audit tools to verify metadata compliance

---

## How Google Scholar Discovery Works

### Discovery Methods (in order of importance)

#### 1. **Sitemap.xml** (Primary)
- Google Scholar discovers papers through `sitemap.xml`
- Our sitemap is at `/sitemap.xml` (auto-generated)
- Includes all papers with status: `PUBLISH`, `PUBLISHED`, or `ACCEPTED`
- Priority: 0.95 for fully published, 0.8 for accepted

#### 2. **Metadata Meta Tags** (Critical)
Google Scholar specifically looks for these meta tags:
- `citation_title` - Paper title
- `citation_author` - Authors (can repeat for multiple authors)
- `citation_publication_date` - Publication date in YYYY-MM-DD format
- `citation_journal_title` - Journal name
- `citation_volume` - Volume number
- `citation_issue` - Issue number
- `citation_pdf_url` - Direct URL to PDF file
- `citation_doi` - Digital Object Identifier

#### 3. **Schema.org Markup** (Secondary)
- JSON-LD structured data with `@type: ScholarlyArticle`
- Helps search engines understand paper content
- Includes all author information, publication dates, DOI, etc.

#### 4. **robots.txt** (Crawlability)
- Allows Google Scholar bot to crawl `/paper/` paths
- Disallows `/api/` to prevent unnecessary crawling
- Allows PDF files to be crawled

---

## Metadata Implementation Details

### Google Scholar Meta Tags (in page header)

These tags are automatically generated and must be present:

```html
<meta name="citation_title" content="Paper Title">
<meta name="citation_author" content="Author Name 1">
<meta name="citation_author" content="Author Name 2">
<meta name="citation_publication_date" content="2026-10-13">
<meta name="citation_journal_title" content="JEDSD - Journal of Embedded and Digital System Design">
<meta name="citation_journal_abbreviation" content="JEDSD">
<meta name="citation_volume" content="2026">
<meta name="citation_issue" content="10">
<meta name="citation_firstpage" content="1">
<meta name="citation_lastpage" content="100">
<meta name="citation_pdf_url" content="https://yoursite.com/papers/file.pdf">
<meta name="citation_doi" content="10.xxx/xxxxx">
<meta name="citation_abstract_html_url" content="https://yoursite.com/paper/paper-id">
<meta name="citation_language" content="en">
<meta name="citation_keywords" content="keyword1, keyword2">
```

### Dublin Core / Highwire Press Tags

Alternative metadata format supported by Google Scholar:

```html
<meta name="DC.title" content="Paper Title">
<meta name="DC.creator" content="Author Name">
<meta name="DC.subject" content="keyword1; keyword2">
<meta name="DC.description" content="Abstract text">
<meta name="DC.publisher" content="JEDSD">
<meta name="DC.date" content="2026-10-13">
<meta name="DC.type" content="Text.Journal.Article">
<meta name="DC.format" content="application/pdf">
<meta name="DC.identifier" content="10.xxx/xxxxx">
```

### PRISM Tags

Publishing industry standard supported by Google Scholar:

```html
<meta name="prism.publicationName" content="Journal of Embedded and Digital System Design">
<meta name="prism.volume" content="2026">
<meta name="prism.number" content="10">
<meta name="prism.publicationDate" content="2026-10-13">
<meta name="prism.doi" content="10.xxx/xxxxx">
```

### JSON-LD Schema

Example minimal schema (automatically generated):

```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "Paper Title",
  "author": [
    {
      "@type": "Person",
      "name": "Author Name",
      "affiliation": {
        "@type": "Organization",
        "name": "University Name"
      }
    }
  ],
  "datePublished": "2026-10-13",
  "publisher": {
    "@type": "Organization",
    "name": "JEDSD - Journal of Embedded and Digital System Design"
  },
  "isAccessibleForFree": true,
  "encoding": {
    "@type": "MediaObject",
    "contentUrl": "https://yoursite.com/papers/file.pdf",
    "encodingFormat": "application/pdf"
  }
}
```

---

## Requirements for Papers to Be Indexed

### Required Fields
✅ Paper must be in one of these statuses: `PUBLISH`, `PUBLISHED`, or `ACCEPTED`
✅ Paper must have a title (required)
✅ Paper must have an abstract (50+ characters recommended)
✅ Paper must have at least one author or contributor with full name
✅ Paper must have a publication/acceptance date
✅ Paper must have keywords (at least 3-5 recommended)
✅ Paper must have a file path pointing to the PDF

### Highly Recommended
✅ Paper should have a DOI assigned (increases indexing speed)
✅ Authors should have email addresses
✅ Authors should have affiliation information
✅ Contributors should be properly formatted JSON

### How to Check
Use the metadata audit endpoint:
```
GET /api/admin/metadata-audit?format=detailed
```

This requires admin/editor authentication and returns a detailed report of any metadata issues.

---

## Ensuring All Papers Get Indexed

### Step 1: Audit Current Metadata
```bash
# Check summary of metadata compliance
curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  https://yoursite.com/api/admin/metadata-audit

# Get detailed results
curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  https://yoursite.com/api/admin/metadata-audit?format=detailed
```

### Step 2: Fix Any Issues Found
Common issues and fixes:

**Issue: Missing contributors**
- Solution: Ensure `contributors` field is populated with valid JSON array
- Format: `[{ "fullName": "Name", "email": "email@example.com", "affiliation": "University" }]`

**Issue: Missing keywords**
- Solution: Add relevant keywords to the `keywords` field
- Minimum: 3-5 keywords
- Separate by commas or as array

**Issue: Missing or malformed DOI**
- Solution: Assign DOI to paper or format correctly
- Format: `10.xxx/xxxxx` or full URL `https://doi.org/10.xxx/xxxxx`

**Issue: Wrong status**
- Solution: Ensure papers are set to `PUBLISH`, `PUBLISHED`, or `ACCEPTED`

### Step 3: Verify PDF Accessibility
- PDF file path must be a valid, publicly accessible URL
- File should be directly downloadable by Google's bot
- Consider adding cache headers: `Cache-Control: public, max-age=31536000`

---

## Google Scholar Reindexing Timeline

### First Submission
- Google Scholar typically crawls new papers within **24-48 hours** after first discovery
- Discovery happens through:
  1. Sitemap submission (via Google Search Console)
  2. Backlinks from indexed pages
  3. Direct crawling of papers with proper metadata

### Updates and Corrections
- Changes to existing papers are reindexed within **1-2 weeks**
- Adding new metadata tags may take up to 2 weeks to take effect
- Removing incorrect metadata is faster (2-3 days)

### Accelerating Indexing
1. Submit sitemap in Google Search Console:
   - Go to `search.google.com`
   - Add property for your domain
   - Submit `/sitemap.xml`

2. Ensure robots.txt is properly configured:
   - Allows `Googlebot-Scholar` user agent
   - Disallows `/api/` paths
   - Not blocking PDF files

3. Maintain regular update cadence:
   - Publish new papers regularly
   - Update existing papers when needed
   - Keep metadata current

---

## Monitoring and Maintenance

### Regular Checks
- Run metadata audit **weekly** or after each new publication
- Check Google Search Console for crawl errors
- Monitor Google Scholar directly for your papers

### Automated Monitoring
- The sitemap auto-generates with all published papers
- Metadata is dynamically generated per page load
- No manual intervention needed after initial setup

### Tools for Verification
1. **Google Search Console**
   - Monitor indexing status
   - Submit sitemap
   - Check for crawl errors

2. **Metadata Audit Endpoint**
   - `/api/admin/metadata-audit`
   - Identifies missing metadata
   - Shows papers not ready for indexing

3. **Schema Markup Tester**
   - Use Google's rich results test
   - Validates JSON-LD structure

---

## Important Notes

### Status Values
The system now handles these paper statuses for indexing:
- `PUBLISH` - Fully published papers ✅
- `PUBLISHED` - Alternative status for published papers ✅
- `ACCEPTED` - Accepted for publication ✅

Papers in other statuses (DRAFT, REVIEW, REJECTED, etc.) are NOT indexed.

### PDF URL Handling
- PDFs can be stored at external URLs (Firebase, S3, etc.)
- The full URL is included in `citation_pdf_url` meta tag
- Google Scholar will crawl and cache the PDF

### DOI Assignment
- While not required, DOI assignment significantly improves indexing
- DOI provides permanent identifier for paper
- Recommended: Assign DOI before or immediately after publication

### Contributor Data Format
Must be stored as JSON:
```json
[
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "affiliation": "MIT",
    "contactNumber": "+1-xxx-xxx-xxxx"
  }
]
```

---

## Troubleshooting

### Papers not appearing in Google Scholar
1. Check paper status: Should be `PUBLISH`, `PUBLISHED`, or `ACCEPTED`
2. Verify metadata: Run `/api/admin/metadata-audit?format=detailed`
3. Check PDF URL: Ensure `citation_pdf_url` is publicly accessible
4. Wait for reindexing: May take up to 2 weeks
5. Submit to Google Search Console if still not indexed

### Only one paper indexed
- This was the original issue - now fixed by:
  - Handling multiple status values
  - Improving metadata completeness
  - Better sitemap generation

### Duplicate papers in Google Scholar
- Ensure each paper has unique `paperId`
- Use DOI for identification if available
- Avoid publishing same paper multiple times

---

## Configuration

### Environment Variables
Ensure these are set in `.env`:
```
NEXTAUTH_URL=https://yoursite.com
DATABASE_URL=your-database-url
```

### Meta Tags Configuration
Current configuration:
- Journal Name: "JEDSD - Journal of Embedded and Digital System Design"
- ISSN: "2582-0605" (update if different)
- License: "CC BY 4.0" (update if different)
- Language: English

Update these in:
- `src/app/(withNav)/paper/[id]/page.tsx` - Paper metadata generation
- `src/app/layout.tsx` - Global site metadata

---

## References
- [Google Scholar Inclusion Guidelines](https://scholar.google.com/intl/en/scholar/inclusion.html)
- [Schema.org ScholarlyArticle](https://schema.org/ScholarlyArticle)
- [Dublin Core Metadata Initiative](http://dublincore.org/)
- [PRISM Standard](https://prismstandard.org/)
