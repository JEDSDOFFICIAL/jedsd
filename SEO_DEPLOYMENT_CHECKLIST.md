# SEO Deployment Checklist for JEDSD

This checklist ensures your papers will be discoverable in Google and Google Scholar searches. Follow these steps after deployment.

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `NEXTAUTH_URL` in production environment to your actual domain (e.g., `https://jedsd.com`)
- [ ] Verify domain is set correctly in `.env.production`
- [ ] Update ISSN number in paper metadata (currently set to `2940-3383` - replace with your actual ISSN)

### 2. Content Verification
- [ ] Ensure all published papers have:
  - [ ] Complete titles
  - [ ] Full abstracts
  - [ ] All author names and affiliations
  - [ ] Keywords (minimum 3-5 keywords)
  - [ ] PDF files uploaded and accessible
  - [ ] DOI numbers (if available)
  - [ ] Publication dates

### 3. File Checks
- [ ] Verify PDF files are publicly accessible
- [ ] Check PDF file URLs are absolute (not relative)
- [ ] Ensure PDF files are named descriptively (e.g., `embedded-system-design-2025.pdf`)

## 🚀 Post-Deployment Steps

### Step 1: Google Search Console Setup (Day 1)

1. **Add Your Website**
   - [ ] Go to [Google Search Console](https://search.google.com/search-console)
   - [ ] Click "Add Property"
   - [ ] Enter your domain: `https://jedsd.com`

2. **Verify Ownership**
   - [ ] Choose "HTML tag" verification method
   - [ ] Copy the verification code
   - [ ] Already added in `src/app/layout.tsx` (line 65)
   - [ ] If needed, update the code: `google: 'P2Y8X-_uCxmaPSyTZKfeZsv6tULWuEao05ezrbrwsGk'`
   - [ ] Deploy and click "Verify" in Google Search Console

3. **Submit Sitemap**
   - [ ] In Google Search Console, go to "Sitemaps"
   - [ ] Add sitemap URL: `https://jedsd.com/sitemap.xml`
   - [ ] Click "Submit"
   - [ ] Wait 24-48 hours for Google to crawl

### Step 2: Google Scholar Indexing (Day 1-2)

1. **Verify Meta Tags**
   - [ ] Visit any published paper page
   - [ ] Right-click → "View Page Source"
   - [ ] Verify these meta tags are present:
     - `citation_title`
     - `citation_author`
     - `citation_publication_date`
     - `citation_journal_title`
     - `citation_pdf_url`
     - `citation_doi`
     - `DC.title`, `DC.creator`, etc.

2. **Check JSON-LD Structured Data**
   - [ ] In page source, find `<script type="application/ld+json">`
   - [ ] Verify all fields are populated correctly
   - [ ] Test at [Google Rich Results Test](https://search.google.com/test/rich-results)

3. **Enable Google Scholar Crawling**
   - Google Scholar automatically discovers academic content
   - [ ] Ensure `robots.txt` allows crawling (already configured)
   - [ ] Wait 2-4 weeks for Google Scholar to index your papers
   - [ ] Optional: Contact Google Scholar at scholar@google.com to request indexing

### Step 3: Testing & Validation (Day 1-3)

1. **Test URLs**
   - [ ] Visit: `https://jedsd.com/sitemap.xml` (should show all papers)
   - [ ] Visit: `https://jedsd.com/robots.txt` (should show crawl rules)
   - [ ] Visit a paper URL: `https://jedsd.com/paper/[paper-id]`
   - [ ] Check PDF access directly

2. **SEO Testing Tools**
   - [ ] **Google Rich Results Test**: https://search.google.com/test/rich-results
     - Test each paper URL
     - Verify "ScholarlyArticle" schema is detected
   
   - [ ] **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
     - Ensure mobile compatibility
   
   - [ ] **PageSpeed Insights**: https://pagespeed.web.dev/
     - Check performance scores
     - Aim for 90+ score
   
   - [ ] **Schema.org Validator**: https://validator.schema.org/
     - Paste your paper page URL
     - Verify no errors in structured data

3. **Meta Tags Validation**
   - [ ] Use [OpenGraph.xyz](https://www.opengraph.xyz/) to test Open Graph tags
   - [ ] Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) for Twitter cards

### Step 4: Search Engine Submissions (Day 2-7)

1. **Google**
   - [ ] Already submitted via Search Console
   - [ ] Request indexing for key pages:
     - [ ] Homepage
     - [ ] Top 10 most important papers
     - Use "URL Inspection" → "Request Indexing"

2. **Bing Webmaster Tools** (Optional but recommended)
   - [ ] Sign up at https://www.bing.com/webmasters
   - [ ] Add your site
   - [ ] Submit sitemap: `https://jedsd.com/sitemap.xml`

3. **Academic Indexing Services**
   - [ ] **Google Scholar**: Wait for automatic indexing (2-4 weeks)
   - [ ] **Microsoft Academic**: Automatic via Bing indexing
   - [ ] **Semantic Scholar**: Submit at https://www.semanticscholar.org/
   - [ ] **ResearchGate**: Create organization profile and link papers
   - [ ] **Academia.edu**: Optional, for additional visibility

### Step 5: Monitor & Optimize (Ongoing)

1. **Weekly Checks (First Month)**
   - [ ] Check Google Search Console for:
     - Coverage issues
     - Crawl errors
     - Indexed pages count
   - [ ] Search for your paper titles in Google
   - [ ] Search in Google Scholar

2. **Monthly Monitoring**
   - [ ] Review search performance in Google Search Console
   - [ ] Check which papers are getting impressions
   - [ ] Identify papers not indexed and fix issues
   - [ ] Update sitemap if needed

3. **SEO Best Practices**
   - [ ] Add new papers immediately to maintain freshness
   - [ ] Ensure consistent URL structure
   - [ ] Keep PDF files accessible
   - [ ] Update meta tags if paper details change

## 🎯 Success Metrics

### Week 1-2
- [ ] Sitemap accepted by Google
- [ ] Homepage indexed
- [ ] At least 50% of papers indexed

### Month 1
- [ ] All published papers indexed in Google
- [ ] Papers appear when searching "site:jedsd.com [paper title]"
- [ ] At least 10% of papers showing in Google Scholar

### Month 2-3
- [ ] Papers ranking in Google for specific titles
- [ ] Google Scholar showing most papers
- [ ] Getting organic search traffic

## 🔍 Testing Individual Papers

For each paper, test discoverability:

### Google Search Test
```
1. Search: "exact paper title"
   → Should see your site in results (may take 2-4 weeks)

2. Search: site:jedsd.com "paper title"
   → Should show immediately after indexing

3. Search: author name + keyword from paper
   → Should appear in results (may take 4-8 weeks)
```

### Google Scholar Test
```
1. Search: "exact paper title" in Google Scholar
   → Should appear (may take 2-6 weeks)

2. Search: author name + year
   → Should list papers

3. Check citation tracking
   → Citations should be tracked
```

## 📋 Common Issues & Fixes

### Issue: Papers not appearing in Google
- **Check**: robots.txt not blocking
- **Check**: Papers have status="PUBLISH"
- **Fix**: Request indexing in Search Console
- **Fix**: Ensure NEXTAUTH_URL is correct

### Issue: Google Scholar not indexing
- **Check**: PDF publicly accessible
- **Check**: All meta tags present (especially citation_*)
- **Check**: Full text PDF available
- **Fix**: Email scholar@google.com with site details
- **Wait**: Can take 4-6 weeks

### Issue: Duplicate content warnings
- **Check**: Canonical URLs set correctly
- **Check**: No URL parameter variations
- **Fix**: Use canonical meta tag (already implemented)

### Issue: Slow indexing
- **Fix**: Build internal links between papers
- **Fix**: Add paper listings on homepage
- **Fix**: Share papers on social media
- **Fix**: Submit to academic aggregators

## 🌐 Additional Optimization

### Schema.org Enhancements
- [x] ScholarlyArticle markup
- [x] Author with affiliation
- [x] Publisher information
- [x] PDF encoding
- [x] Citation information
- [ ] Add breadcrumb navigation
- [ ] Add review ratings (if applicable)

### Social Media Optimization
- [x] Open Graph tags
- [x] Twitter Card tags
- [ ] Share papers on LinkedIn
- [ ] Share papers on ResearchGate
- [ ] Create author profiles

### Performance Optimization
- [x] Enabled compression in Next.js
- [x] Proper caching headers
- [ ] Optimize PDF file sizes
- [ ] Use CDN for static files
- [ ] Enable HTTP/2

## 📞 Support Contacts

If you need help with indexing:

- **Google Search Console Help**: https://support.google.com/webmasters
- **Google Scholar Support**: scholar@google.com
- **Bing Webmaster Support**: https://www.bing.com/webmasters/help

## ✨ Pro Tips

1. **Speed Matters**: Faster sites rank better
   - Optimize images
   - Minimize JavaScript
   - Use Next.js Image component

2. **Content Quality**: Better content ranks higher
   - Complete abstracts
   - Detailed keywords
   - Full author information

3. **Consistency**: Regular publishing helps
   - Add papers consistently
   - Update existing papers when needed
   - Keep metadata accurate

4. **Mobile-First**: Most searches are mobile
   - Test on mobile devices
   - Ensure PDFs are mobile-viewable
   - Check responsive design

5. **Build Authority**:
   - Get citations from other papers
   - Build backlinks from academic sites
   - Share on academic social networks

---

## 🎉 Completion Status

Once you've completed all items in this checklist:

- [ ] All pre-deployment items checked
- [ ] Google Search Console verified and sitemap submitted
- [ ] Papers are indexing in Google (may take 1-4 weeks)
- [ ] Monitoring setup for ongoing optimization
- [ ] Papers discoverable via search

**Expected Timeline**: Full SEO benefits visible in 4-8 weeks after deployment.

**Note**: SEO is an ongoing process. Regular monitoring and optimization will improve results over time.
