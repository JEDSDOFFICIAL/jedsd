# Metadata Audit Dashboard - User Guide

## Overview

The Metadata Audit Dashboard is a comprehensive admin tool for monitoring Google Scholar indexing compliance of all published papers. It provides real-time insights into metadata completeness and helps identify papers that need updates.

## Accessing the Dashboard

### Login Required
- Must be logged in as **Admin** or **Editor**
- Navigate to: `Dashboard → Admin → Metadata Audit`
- Or direct URL: `/dashboard/admin/metadata-audit`

### Permissions
- **Admin**: Full access (can perform all actions)
- **Editor**: Full read access to audit results

## Dashboard Components

### 1. Summary Cards (Top Section)

Four key metrics displayed at the top:

#### Total Papers
- Shows total number of published papers
- Papers with status: PUBLISH, PUBLISHED, or ACCEPTED

#### Ready for Indexing
- Papers with complete metadata
- Required: all meta tags, authors, abstract, keywords, PDF, publication date
- Shows percentage of completeness

#### Need Fixes
- Papers with missing or incomplete metadata
- Clicking on issues shows detailed problems

#### Last Audit
- Timestamp of the last audit run
- Shows both date and time

### 2. View Modes

#### Summary View (Default)
Shows comprehensive overview:
- Compliance progress bar
- Status summary cards
- Common issues across all papers
- Next steps recommendations

**Best for**: Quick overview, identifying priority issues, executive reporting

#### Detailed View
Shows paper-by-paper analysis:
- Searchable paper list
- Filter by status (All, Issues, Ready)
- Individual metadata checklist per paper
- Detailed issue descriptions
- Links to edit papers

**Best for**: Finding specific papers, fixing individual issues, detailed audits

### 3. Control Buttons

#### Summary/Detailed Toggle
- Switch between two viewing modes
- Automatically loads data for selected view
- First-time detailed view loading may take a few seconds

#### Refresh Button
- Updates data from current mode
- Shows loading spinner during refresh
- Always gets latest data from API

#### Export Button
- Downloads audit report as JSON
- Includes all papers and their metadata status
- Useful for: external analysis, record-keeping, trend monitoring
- Filename: `metadata-audit-YYYY-MM-DD.json`

### 4. Search and Filter

#### Search Box
- Search by paper title
- Search by paper ID
- Real-time filtering

#### Filter Options
- **All**: Show all papers (regardless of status)
- **Issues**: Show only papers with metadata problems
- **Ready**: Show only papers ready for indexing

### 5. Compliance Overview Card

Shows comprehensive status:
- **Progress Bar**: Visual representation of completion
- **Ready for Indexing**: Papers with complete metadata
- **Need Attention**: Papers requiring updates

### 6. Issues Summary Card

Lists most common metadata problems:
- Shows up to 10 most problematic papers
- Lists all issues for each paper
- "View All Issues" button for detailed view

### 7. Recommendations Card

Provides actionable next steps:
1. **Fix Missing Metadata**: Update specific number of papers
2. **Submit Sitemap**: Submit to Google Search Console
3. **Assign DOIs**: Accelerates indexing
4. **Monitor Indexing**: Timeline expectations

---

## Detailed View Features

### Paper List Table

Columns displayed:
- **Title**: Paper title (truncated, click to view full)
- **Status**: Publication status (PUBLISH, PUBLISHED, ACCEPTED)
- **Ready**: ✓ or ✗ indicating Google Scholar readiness
- **Issues**: Count and preview of metadata problems
- **Action**: Eye icon to view paper details

### Individual Paper Cards

When issues exist, expandable cards show:

#### Metadata Checklist
- Author ✓/✗
- Contributors ✓/✗
- Abstract ✓/✗
- Keywords ✓/✗
- PDF File ✓/✗
- DOI ✓/✗
- Publication Date ✓/✗
- Status

#### Issues Section
- Red alert box listing all problems
- Each issue with detailed explanation
- "View Paper" button to edit and fix issues

---

## Common Issues and Solutions

### Issue: "Missing or too short abstract"
**Solution**: Add or expand paper abstract to 50+ characters
- Go to paper details
- Edit abstract field
- Save changes
- Re-run audit

### Issue: "Missing keywords"
**Solution**: Add 3-5 relevant keywords
- Go to paper details
- Add keywords field
- Separate by commas
- Save and re-audit

### Issue: "Missing DOI"
**Solution**: This is optional but recommended
- Assign DOI from your DOI provider
- Update paper record
- Helps with faster indexing

### Issue: "No author information"
**Solution**: Add either primary author or contributors
- Add author details if missing
- Or populate contributors JSON with full author info
- Format: `[{ "fullName": "Name", "email": "email@example.com", "affiliation": "Org" }]`

### Issue: "Missing PDF file path"
**Solution**: Upload and link PDF file
- Upload PDF to storage
- Add file path to paper record
- Ensure file is publicly accessible

---

## Workflow Examples

### Example 1: Quick Status Check
1. Log in and go to Metadata Audit
2. Check Summary View
3. Review completeness percentage
4. Check "Common Issues" section
5. Done! You have a quick overview

**Time**: 2-3 minutes

### Example 2: Fix All Issues
1. Go to Metadata Audit
2. Switch to Detailed View
3. Filter by "Issues"
4. Go through each paper:
   - Click "View Paper"
   - Fix metadata
   - Save
5. Return to audit dashboard
6. Click "Refresh"
7. Verify all issues resolved

**Time**: 10-30 minutes (depending on number of issues)

### Example 3: Prepare for Google Scholar Submission
1. Run audit from Summary View
2. Note number of "Ready" papers
3. Check Recommendations section
4. Fix any outstanding issues in Detailed View
5. Export report as backup
6. Submit sitemap in Google Search Console
7. Check back after 1-2 weeks

**Time**: 30 minutes

---

## Best Practices

### Regular Maintenance
- **Weekly**: Run audit to catch new papers
- **After publishing**: Audit new papers immediately
- **Monthly**: Review trends and common issues
- **Quarterly**: Update documentation based on findings

### Quality Assurance
1. Ensure all papers have complete metadata before publishing
2. Use audit as final check before marking papers "PUBLISH"
3. Monitor audit trends over time
4. Share reports with editorial team

### Performance Optimization
- Batch fix issues to reduce re-runs
- Prioritize papers by status (PUBLISH first)
- Schedule audits during low-traffic times
- Use filters to focus on specific subsets

### Reporting
- Export report weekly to track progress
- Share summary card screenshots in meetings
- Use trending data for continuous improvement
- Document recurring issues for team training

---

## Metrics to Track

### Key Metrics
1. **Compliance Rate**: (Ready / Total) × 100%
   - Target: 95%+
   - Track: Weekly

2. **Average Issues Per Paper**
   - Target: <1
   - Track: Monthly

3. **Time to Resolution**
   - How long from publish to Google Scholar appearance
   - Target: <2 weeks
   - Track: Per paper

4. **Common Issues**
   - Most frequent problems
   - Use to improve processes
   - Review: Quarterly

### Success Indicators
- ✓ 100% of papers in sitemap
- ✓ 95%+ compliance rate
- ✓ Papers appearing in Google Scholar within 2 weeks
- ✓ Trending towards zero common issues
- ✓ New papers auto-indexed within 1 week

---

## Troubleshooting

### Dashboard Won't Load
- **Check**: Login status - must be Admin/Editor
- **Check**: Database connection
- **Fix**: Refresh page or log out/in

### Audit Takes Too Long
- **Check**: Number of papers in database
- **Note**: First-time detailed audit slower than summary
- **Solution**: Use filters to check specific subsets

### Exported Report Empty
- **Check**: Ensure papers exist in database
- **Check**: Network connection during export
- **Solution**: Try exporting again

### Paper Shows Wrong Issues
- **Cause**: May be displaying cached data
- **Solution**: Click Refresh button to get latest
- **Note**: May take 30 seconds to a minute

### Cannot Find Paper
- **Check**: Search spelling and ID
- **Check**: Paper status (may be draft/rejected)
- **Solution**: Use list view to browse all papers

---

## API Information

### Audit Endpoint
- **URL**: `/api/admin/metadata-audit`
- **Method**: GET
- **Auth**: Admin or Editor session required
- **Parameters**:
  - `format`: "summary" or "detailed"
  - Default: "summary"

### Response Format
```json
{
  "success": true,
  "timestamp": "2026-10-13T10:30:00Z",
  "totalPapers": 25,
  "readyForGoogleScholar": 23,
  "issues": [...],
  "summary": "23/25 papers are ready for Google Scholar indexing"
}
```

### Rate Limiting
- No rate limits for authenticated admin
- Recommended: Max 1 audit per minute
- Use filters to reduce processing time

---

## FAQ

**Q: Can I audit papers automatically?**
A: Currently manual, but API available for integration with external tools

**Q: How often should I run the audit?**
A: Weekly recommended, or after each new publication

**Q: Can I fix all issues at once?**
A: No, must fix individually in paper details

**Q: Will fixing metadata update Google Scholar immediately?**
A: No, takes 1-2 weeks for reindexing

**Q: Can I export the audit report?**
A: Yes, click Export button - saves as JSON

**Q: Who can access this dashboard?**
A: Admin and Editor roles only

**Q: Is the audit real-time?**
A: Yes, it queries current database state

**Q: Can I schedule automated audits?**
A: Not built-in, but API available for custom integration

---

## Contact & Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Contact system administrator
4. Check application logs for errors

---

**Last Updated**: October 13, 2026
**Dashboard Version**: 1.0
**API Version**: 1.0
