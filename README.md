<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ApVwcaYLRwCvQqBEimahhy2cokr21XnI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies: `npm install`
2. Create [.env.local](.env.local) with:
   - `VITE_GEMINI_API_KEY` — your Gemini API key
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
3. In Supabase Dashboard → SQL Editor, run the script in [supabase/schema.sql](supabase/schema.sql) to create the `prompts` table and RLS policies.
4. Run the app: `npm run dev`
