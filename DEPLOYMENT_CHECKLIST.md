# 🚀 Quick Deployment & SEO Checklist

## Before Deployment

- [ ] Set `NEXTAUTH_URL=https://yourdomain.com` in production environment
- [ ] Update [public/robots.txt](public/robots.txt) line 13 with your domain
- [ ] Test build locally: `npm run build && npm run start`
- [ ] Verify `http://localhost:3000/sitemap.xml` works
- [ ] Verify `http://localhost:3000/robots.txt` works

## Immediately After Deployment

- [ ] Visit `https://yourdomain.com` - Homepage loads
- [ ] Visit `https://yourdomain.com/sitemap.xml` - Shows all published papers with paperId URLs
- [ ] Visit `https://yourdomain.com/robots.txt` - Shows robots.txt content
- [ ] Pick a paper and visit `https://yourdomain.com/paper/[paperId]`
- [ ] Right-click → View Page Source → Check for meta tags and JSON-LD

## Google Search Console Setup (Day 1)

- [ ] Go to https://search.google.com/search-console
- [ ] Add property: `https://yourdomain.com`
- [ ] Copy Google verification code
- [ ] Add code to [src/app/layout.tsx](src/app/layout.tsx) line 23
- [ ] Redeploy site
- [ ] Click "Verify" in Google Search Console
- [ ] Submit sitemap: `sitemap.xml`
- [ ] Request indexing for top 5 papers via URL Inspection tool

## Validation Tools (Day 1)

- [ ] Test with Rich Results: https://search.google.com/test/rich-results
- [ ] Test mobile-friendly: https://search.google.com/test/mobile-friendly
- [ ] Test PageSpeed: https://pagespeed.web.dev/

## Check After 48-72 Hours

- [ ] Google Search Console → Coverage Report (any errors?)
- [ ] Google Search Console → Sitemaps (status = Success?)
- [ ] Search Google: `site:yourdomain.com` (papers appearing?)
- [ ] Search Google: `"paper title" site:yourdomain.com`

## Check After 1 Week

- [ ] Google Search Console → Performance (getting impressions?)
- [ ] Google Search Console → Coverage (pages indexed count)
- [ ] Google Scholar: Search for paper title
- [ ] Request indexing for more papers if needed

## Weekly Monitoring

- [ ] Check Coverage Report for errors
- [ ] Monitor Performance metrics
- [ ] Check which search queries bring visitors
- [ ] Verify new papers are being indexed

## Success Indicators ✅

Your SEO is working when you see:
- ✅ Papers in `site:yourdomain.com` search
- ✅ "Valid" pages in Coverage Report  
- ✅ Search queries in Performance Report
- ✅ Papers in Google Scholar
- ✅ "URL is on Google" in URL Inspection
- ✅ Rich Results Test detects ScholarlyArticle

## Common Issues

**Sitemap not found?**
→ Check NEXTAUTH_URL environment variable

**Papers not indexing?**
→ Verify status = "PUBLISH" in database
→ Check robots.txt doesn't block /paper/
→ Use URL Inspection tool for specific error

**Old sitemap data?**
→ Normal, Google caches it. Wait a few days.

## Important URLs

- **paperId is used everywhere** for SEO-friendly URLs
- Format: `/paper/JEDSD001`, `/paper/JEDSD002`, etc.
- Much better than UUID: `/paper/550e8400-e29b-41d4-a716-...`

## Files Modified for SEO

1. [src/app/(withNav)/paper/[id]/page.tsx](src/app/(withNav)/paper/[id]/page.tsx) - Metadata + JSON-LD
2. [src/app/sitemap.ts](src/app/sitemap.ts) - Dynamic sitemap with paperId
3. [public/robots.txt](public/robots.txt) - Search engine rules
4. [src/app/layout.tsx](src/app/layout.tsx) - Site-wide SEO metadata

## Timeline

| Day | Expected Result |
|-----|----------------|
| 0 | Deploy + verify site works |
| 1 | Submit to Google Search Console |
| 2-3 | Google reads sitemap |
| 3-7 | Papers appear in search |
| 7-14 | Most papers indexed |
| 14-30 | Google Scholar indexing |
| 30+ | Regular search traffic |

---

📖 **Detailed Guide**: See [GOOGLE_SEARCH_CONSOLE_SETUP.md](GOOGLE_SEARCH_CONSOLE_SETUP.md)
📋 **Implementation Details**: See [SEO_IMPLEMENTATION_GUIDE.md](SEO_IMPLEMENTATION_GUIDE.md)
