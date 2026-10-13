# Google Scholar Metadata Testing & Verification Guide

## Quick Start: Verify Your Setup

### 1. Check Sitemap Generation
```bash
# Access your sitemap
curl https://yoursite.com/sitemap.xml

# Should return XML with all published papers
```

Expected output includes:
- Static pages (/, /guides, /search, /paper)
- All papers with status PUBLISH, PUBLISHED, or ACCEPTED
- Proper dates and priorities

### 2. Test Individual Paper Metadata

#### Using Browser Developer Tools
1. Go to a published paper page: `https://yoursite.com/paper/[paper-id]`
2. Right-click → "View Page Source"
3. Search for these meta tags (Ctrl+F):
   - `citation_title`
   - `citation_author`
   - `citation_publication_date`
   - `citation_pdf_url`
   - `citation_doi`

#### Using curl Command
```bash
curl -s https://yoursite.com/paper/PAPER_ID | grep -i "citation_"
```

Should return output like:
```html
<meta name="citation_title" content="Paper Title">
<meta name="citation_author" content="Author Name">
<meta name="citation_publication_date" content="2026-10-13">
```

### 3. Validate JSON-LD Schema
Use Google's Rich Results Test:
1. Go to https://search.google.com/test/rich-results
2. Enter your paper URL: `https://yoursite.com/paper/[paper-id]`
3. Check for "ScholarlyArticle" type
4. Verify all required fields are present

Alternatively, test in browser console:
```javascript
// In browser console on paper page
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach(s => console.log(JSON.parse(s.textContent)));
```

---

## Comprehensive Testing Checklist

### ✅ Paper Metadata Requirements

For each published paper, verify:

#### Basic Information
- [ ] Paper has a title (required)
- [ ] Paper has an abstract (50+ characters)
- [ ] Paper has keywords (3-5 recommended)
- [ ] Paper status is PUBLISH, PUBLISHED, or ACCEPTED

#### Author Information
- [ ] Paper has at least one author or contributor
- [ ] Contributor format: `[{ "fullName": "Name", "email": "email@example.com", "affiliation": "University" }]`
- [ ] Author names are not empty
- [ ] Email addresses are valid format

#### Publication Details
- [ ] Publication date exists (acceptedDate or submissionDate)
- [ ] DOI is assigned (recommended, not required)
- [ ] DOI format is correct: `10.xxxx/xxxxx` or full URL

#### File Access
- [ ] PDF file path exists and is accessible
- [ ] File path is publicly readable by search engines
- [ ] File is in PDF format

---

## Testing Methods

### Method 1: Automated Audit Endpoint

**Endpoint**: `GET /api/admin/metadata-audit`

**Requirements**: Admin or Editor authentication

**Usage**:
```bash
# Summary report
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://yoursite.com/api/admin/metadata-audit

# Detailed results
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://yoursite.com/api/admin/metadata-audit?format=detailed
```

**Response Example**:
```json
{
  "success": true,
  "timestamp": "2026-10-13T10:30:00Z",
  "totalPapers": 10,
  "readyForGoogleScholar": 8,
  "issues": [
    {
      "paper": "Paper Title",
      "issues": [
        "Missing DOI - recommended for Google Scholar indexing",
        "Missing keywords"
      ]
    }
  ],
  "summary": "8/10 papers are ready for Google Scholar indexing. 2 papers have issues."
}
```

### Method 2: Browser Inspection

**Step 1**: Open a published paper
- URL: `https://yoursite.com/paper/[paper-id]`
- Paper must be in PUBLISH/PUBLISHED/ACCEPTED status

**Step 2**: View page source (Ctrl+U or Right-click → View Page Source)

**Step 3**: Search for these sections:

#### Google Scholar Meta Tags
```html
<meta name="citation_title" content="...">
<meta name="citation_author" content="...">
<meta name="citation_publication_date" content="...">
```

#### JSON-LD Script
```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    ...
  }
</script>
```

#### Open Graph Tags
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="article">
```

### Method 3: Google Tools

#### A. Google Rich Results Test
1. Visit: https://search.google.com/test/rich-results
2. Paste your paper URL
3. Click "Test URL"
4. Should show green checkmarks for ScholarlyArticle

#### B. Google Search Console
1. Add your domain to Search Console
2. Go to "Sitemaps" section
3. Submit: `https://yoursite.com/sitemap.xml`
4. Monitor indexing status over next 2 weeks

#### C. Google Scholar Manual Verification
1. Search for paper title on https://scholar.google.com
2. Should appear within 1-4 weeks (first time)
3. Updates appear within 1-2 weeks (subsequent times)

### Method 4: Manual Meta Tag Verification

**Critical Tags** - All must be present:
```html
<!-- MUST HAVE -->
<meta name="citation_title" content="Paper Title">
<meta name="citation_author" content="Author Name">
<meta name="citation_publication_date" content="YYYY-MM-DD">
<meta name="citation_journal_title" content="JEDSD">

<!-- HIGHLY RECOMMENDED -->
<meta name="citation_pdf_url" content="https://...">
<meta name="citation_doi" content="10.xxxx/xxxxx">
<meta name="citation_keywords" content="keyword1, keyword2">

<!-- OPTIONAL but helpful -->
<meta name="citation_volume" content="2026">
<meta name="citation_issue" content="10">
<meta name="citation_firstpage" content="1">
```

---

## Step-by-Step Testing Workflow

### Weekly Testing Routine

#### Step 1: Check Sitemap (5 minutes)
```bash
curl -s https://yoursite.com/sitemap.xml | head -30
# Verify papers are listed with proper dates and priorities
```

#### Step 2: Run Metadata Audit (2 minutes)
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://yoursite.com/api/admin/metadata-audit
# Check summary for any issues
```

#### Step 3: Test a Sample Paper (5 minutes)
1. Pick a recently published paper
2. Open in browser
3. Right-click → View Source
4. Search for `citation_title` to verify meta tags present
5. Search for `ScholarlyArticle` to verify JSON-LD

#### Step 4: Detailed Audit When Issues Found (10 minutes)
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://yoursite.com/api/admin/metadata-audit?format=detailed > audit.json
# Review audit.json for specific paper issues
# Fix issues in database or paper page
```

#### Step 5: Check Google Search Console Monthly
1. Login to search.google.com
2. Check Indexing coverage
3. Review any crawl errors
4. Verify papers appear in "Indexed pages"

---

## Common Issues and Solutions

### Issue 1: "citation_author is empty"

**Cause**: Paper has no contributors or contributor JSON is malformed

**Solution**:
```javascript
// Check contributors format
const contributors = JSON.parse(paper.contributors);
// Must be array of objects with fullName property
// Example: [{ fullName: "John Doe", email: "john@example.com", affiliation: "MIT" }]
```

**Fix**: Update paper in database with valid contributors JSON

### Issue 2: "citation_pdf_url is empty"

**Cause**: Paper has no filePath or PDF is not publicly accessible

**Solution**:
1. Verify paper has filePath in database
2. Test PDF URL directly in browser - should download
3. Ensure PDF is in public Firebase Storage bucket
4. Check Firebase CORS settings if needed

**Fix**: Assign PDF file path or upload PDF to storage

### Issue 3: "Missing keywords"

**Cause**: Paper keywords array is empty

**Solution**: Add relevant 3-5 keywords to paper record

```javascript
// Keywords should be stored as array
paper.keywords = ["embedded systems", "digital design", "IoT", "microcontrollers"];
```

### Issue 4: Only old papers indexed, new ones not showing

**Cause**: New papers not appearing in sitemap yet

**Solution**:
1. Verify paper status is PUBLISH/PUBLISHED/ACCEPTED
2. Wait 24-48 hours for initial crawl
3. Resubmit sitemap in Google Search Console
4. Check Search Console for any crawl errors

### Issue 5: Papers indexed but not appearing in Google Scholar search

**Cause**: Missing or incomplete metadata

**Solution**:
1. Run metadata audit for specific paper
2. Check `citation_title`, `citation_author`, `citation_publication_date`
3. Verify PDF is downloadable from `citation_pdf_url`
4. Wait 1-2 weeks for reindexing

---

## Performance Metrics to Monitor

### Tracking Indexing Success

**Metric 1: Sitemap Coverage**
```
Target: 100% of published papers in sitemap
Check: curl https://yoursite.com/sitemap.xml | wc -l
```

**Metric 2: Metadata Completeness**
```
Target: 100% of published papers have all required metadata
Check: /api/admin/metadata-audit
Formula: readyForGoogleScholar / totalPapers * 100
```

**Metric 3: Google Scholar Presence**
```
Target: 80%+ of published papers appear in Google Scholar within 2 weeks
Check: Search Google Scholar for paper titles
Timeline: First week 20%, Second week 80%, Month 100%
```

**Metric 4: Search Console Indexing**
```
Target: 95%+ indexed rate
Check: Google Search Console > Coverage
Monitor: Check monthly for crawl errors or exclusions
```

---

## Advanced Testing

### Testing Different Status Values

Test that all status values work for indexing:

```bash
# Test PUBLISH status papers
curl -s "https://yoursite.com/api/paper?status=PUBLISH" | jq '.papers | length'

# Test PUBLISHED status papers  
curl -s "https://yoursite.com/api/paper?status=PUBLISHED" | jq '.papers | length'

# Test ACCEPTED status papers
curl -s "https://yoursite.com/api/paper?status=ACCEPTED" | jq '.papers | length'

# All three statuses should appear in sitemap
curl -s https://yoursite.com/sitemap.xml | grep "/paper/" | wc -l
```

### Testing PDF Accessibility

```bash
# Get citation_pdf_url from metadata
PDF_URL=$(curl -s https://yoursite.com/paper/PAPER_ID | grep citation_pdf_url | grep -oP 'content="\K[^"]+')

# Test PDF is publicly accessible
curl -I "$PDF_URL"
# Should return 200 OK, not 403 Forbidden

# Download and verify PDF
curl -s "$PDF_URL" | file -
# Should indicate PDF type
```

### Testing Schema.org Compliance

```bash
# Extract JSON-LD and validate
curl -s https://yoursite.com/paper/PAPER_ID | \
  grep -o '<script type="application/ld+json">.*</script>' | \
  sed 's/<[^>]*>//g' | jq '.["@type"]'
# Should output: "ScholarlyArticle"
```

---

## Submitting to Google Scholar

### Official Submission Process

Google Scholar doesn't have manual submission, but you can:

1. **Ensure Crawlability**
   - robots.txt allows crawling
   - Sitemap is accessible
   - Papers are public (no login required)

2. **Register Domain**
   - Add to Google Search Console
   - Verify ownership
   - Submit sitemap

3. **Wait for Natural Discovery**
   - Initial indexing: 1-4 weeks
   - Updates: 1-2 weeks
   - Full catalog: 2-3 months

### Acceleration Tips

**For new papers:**
- Publish with all metadata complete
- Assign DOI before publishing
- Include in sitemap immediately
- Link from main journal page

**For bulk updates:**
- Update all papers with missing metadata
- Resubmit sitemap
- Post on social media (backlinks help)
- Notify interested researchers

---

## Verification Checklist

Before considering indexing complete:

### Initial Setup
- [ ] Sitemap exists at `/sitemap.xml`
- [ ] robots.txt allows Google Scholar bot
- [ ] All published papers have required metadata
- [ ] Metadata audit shows 100% readiness

### Google Search Console
- [ ] Domain verified in GSC
- [ ] Sitemap submitted
- [ ] No crawl errors for `/paper/` paths
- [ ] Coverage shows indexed papers

### Metadata Quality
- [ ] All papers have citation_title
- [ ] All papers have citation_author (contributor or primary author)
- [ ] All papers have citation_publication_date
- [ ] All papers have citation_journal_title
- [ ] All papers have citation_pdf_url or citation_doi

### Google Scholar
- [ ] Papers start appearing in search results
- [ ] Paper titles are searchable
- [ ] Citation counts appear (may take weeks)
- [ ] Author profiles link correctly

---

## Ongoing Maintenance

### Daily
- Monitor for new papers published
- Ensure they're added to appropriate status

### Weekly
- Run metadata audit
- Check for any reported issues
- Review one sample paper's metadata

### Monthly
- Check Google Search Console coverage
- Verify no new crawl errors
- Search Google Scholar for sample papers

### Quarterly
- Update any missing metadata
- Check for Google Scholar algorithm changes
- Review and update documentation

---

## Support and Troubleshooting

### Check These Files
- `src/app/(withNav)/paper/[id]/page.tsx` - Metadata generation
- `src/app/sitemap.ts` - Sitemap generation
- `public/robots.txt` - Crawler access rules
- `src/lib/metadata-audit.ts` - Audit logic

### Endpoints to Check
- `GET /sitemap.xml` - View sitemap
- `GET /robots.txt` - View crawler rules
- `GET /api/admin/metadata-audit` - Run audit (admin only)
- `GET /api/paper/[paperId]` - Get paper data

### Documentation
- See `GOOGLE_SCHOLAR_SEO_GUIDE.md` for comprehensive guide
- Check Next.js docs for metadata API
- Review Schema.org documentation
