# How to Update Google Search Results

Since we have overhauled the SEO configuration, you need to tell Google to re-scan your site to see the changes immediately. Otherwise, it may take weeks for them to recrawl naturally.

## Prerequisite: Google Search Console (GSC)

Ensure you have access to [Google Search Console](https://search.google.com/search-console) for `https://discreetkit.com`.

### 1. Verify Your Domain (If not already done)
1. Go to GSC and click **"Add propery"**.
2. Select **"Domain"** and enter `discreetkit.com`.
3. Copy the TXT record verification code.
4. Add this TXT record to your DNS settings (where you bought your domain, e.g., Namecheap or Vercel).
5. Click **Verify** in GSC.

---

## Step 1: Submit the New Sitemap
We cleaned up the sitemap and made it build-safe. It includes dynamic product URLs when Supabase envs are present; otherwise falls back to static categories to keep CI builds reliable.

1. In GSC, go to **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter `sitemap.xml`.
3. Click **Submit**.
4. **Verify**: It should say "Success" and show the correct "Discovered URLs" count.
   - Note: If your CI build lacked Supabase envs, the count will reflect static category pages only.
   - To include product URLs, add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to the build environment and redeploy.

## Step 2: Force Re-indexing (The "Fast Track")
To fix the "gibberish" or old favicon *immediately* for the homepage:

1. In GSC, paste `https://discreetkit.com` into the top search bar (**URL Inspection**).
2. Wait for the data to load.
3. Click **"TEST LIVE URL"** (Top right).
   - This checks the *current* version of the site, not the cached one.
4. Once the test allows, click **"REQUEST INDEXING"**.
   - *Note: This adds it to a priority queue. Changes usually reflect in 24-48 hours.*

## Step 3: Validate Rich Results
To ensure the new JSON-LD (Social profiles, Sitelinks search box) is working:

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results).
2. Enter `https://discreetkit.com`.
3. Run the test.
4. You should see "Merchant Listings", "Sitelinks Searchbox", and "Organization" detected validly.

## Common Questions
**Q: Why does the favicon still look like a world map in my browser?**
A: Browsers cache favicons aggressively. Try opening the site in an Incognito window or clear your browser cache. Google will update its search result icon after the next crawl (Step 2).

**Q: How long for the Instagram title to change in Google?**
A: After "Requesting Indexing", it typically takes a few days. The "gibberish" was likely Google trying to guess the content because it couldn't read the metadata correctly before.
