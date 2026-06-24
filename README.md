# 💖 Eternal Love — Valentine's Proposal Web App

![License](https://img.shields.io/badge/license-MIT-pink?style=flat-square)
![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ecf8e?style=flat-square&logo=supabase)

A premium, full-stack, multi-tenant Valentine's Day surprise creation platform. Users can create a gorgeous, secure, custom proposal site for their partners with galleries, games, mystery gift boxes, love letters, and countdowns.

> 🔗 **Live Demo**: [your-site.netlify.app](https://your-site.netlify.app) ← replace with your link after deployment

This project uses **Vite**, **Vanilla JavaScript**, **Tailwind CSS v4**, and **Supabase** (Auth, Postgres RLS, and Storage).

---

## Key Features

### 🌟 Creator Experience (Creator Mode)
- **Luxurious Authentication**: Romantic Glassmorphic Register and Login forms with strict formatting validations (Name, @gmail.com validation, Alphanumeric password validation) and Toast notices.
- **Wizard Builder**: Step-by-step editor for Partner Profile, Photo Gallery uploads, Love Stories/milestones timeline, countdown date, custom relationship quizzes, and gift boxes.
- **PIN-Protected Link**: Generates a shareable URL and QR code protected by a 4-digit PIN.
- **Live Activity Feed**: Tabbed dashboard to view:
  - Captured camera photos sent by the partner.
  - Corner-displayed emoji reactions and comments on galleries and text cards.
  - Handwritten letters/feedback left by the partner.

### 💖 Receiver Experience (Surprise Mode)
- **Pin Screen Entry**: Clean passcode entry gate with animated flirty error feedback.
- **Cinematic Proposal**: A flirty "YES/NO" game where the "NO" button escapes and shrinks, and the "YES" button grows larger.
- **Magic Mirror Frame**: Live webcam view inside a gold mirror heart frame, taking a camera snap and showing a custom toast message.
- **Slideshow & Interactive Stories**: Chronological memory timelines where partners can react (emoji toolbar) or comment in real-time.
- **Relationship Mini Games**:
  - *Heart Catch*: Catch falling hearts with mouse/touch to hit score 15.
  - *Relationship Trivia Quiz*: A multiple-choice trivia game.
  - *Memory Match*: A flip-matching card game.
- **Mystery Gift Boxes**: Question-gated gift boxes. Correct answers unlock secret letters or reward images.
- **Wax-Sealed Envelope**: A beautiful 3D wax-seal envelope that breaks open to slide out your love letter.
- **Letters Feedback Box**: Text box for writing replies back to the creator.

---

## Project Structure

```
├── supabase/
│   └── schema.sql            # Database schema, RLS policies & aggregates RPC
├── src/
│   ├── app.js                # Core JS for Creator Dashboard and Wizard
│   ├── surprise.js           # Core JS for Receiver Experience & Games
│   └── style.css             # Tailwind v4 theme, heart keyframes, grids
├── index.html                # Creator Home & Auth Page
├── surprise.html             # Receiver Surprise Page
├── vite.config.js            # Vite multi-page routing configurations
├── tailwind.config.js        # Tailwind v3 fallback configuration
├── postcss.config.js         # PostCSS configuration
├── package.json              # App dependencies & run scripts
└── README.md                 # Deployment & setup documentation
```

---

## Getting Started

### 1. Local Development (Sandbox Demo Mode)

By default, the application runs in a **Sandbox Mock Mode** if no Supabase environment keys are detected. All records are securely saved to local storage, and uploaded images are converted to local data URLs. This allows testing the complete creation and receiver flows immediately.

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start local development server**:
   ```bash
   npm run dev
   ```
3. **Open the browser**:
   Navigate to the local URL (usually `http://localhost:5173`).
4. **Test the Surprise Flow**:
   - Register a mock account and build a proposal in the wizard.
   - Go to step 5, click **Compile & Deploy**, and copy the generated link (which will contain `&demo=true`).
   - Open that URL in a new private window to experience the receiver flow. Try entering wrong PINs, taking snapshots, commenting on pictures, playing games, and writing feedback.
   - Return to your creator dashboard and click the **Receiver Activity** tab to check the results!

---

## 2. Production Database Setup (Supabase)

To connect this to a live Supabase production backend:

### Step A: Setup Database & RLS
1. Go to your [Supabase Dashboard](https://supabase.com) and create a new project.
2. In the left sidebar, open the **SQL Editor**.
3. Create a new query, paste the contents of `supabase/schema.sql`, and click **Run**.
4. This creates all multi-tenant tables, indexes, automatic signup triggers, the secure aggregates RPC, and RLS policies.

### Step B: Create Storage Buckets
1. In the Supabase sidebar, click on **Storage**.
2. Click **New Bucket** and name it `couple-assets`. Make it **Public**.
3. Create another bucket named `captured-images` and make it **Public**.
4. Set up the following policies on both buckets to allow uploads:
   - **Allowed operations**: SELECT and INSERT.
   - Policy condition: Allow public inserts/selects.

### Step C: Configure Client Credentials
1. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase connection keys:
   - `VITE_SUPABASE_URL`: Your Project URL (from Project Settings > API).
   - `VITE_SUPABASE_ANON_KEY`: Your Anon Public API Key.
3. Restart your dev server (`npm run dev`). Vite will automatically pick up the production credentials, and the application will connect to your real Supabase instance.

---

## 3. Production Deployment

You can host this project on **Vercel**, **Netlify**, or **GitHub Pages**.

### Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Set the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add your Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the host settings panel.
4. Deploy!

---

## 🤝 Contributing

This is a personal project, but feel free to fork it and customize it for your own romantic surprise! Pull requests are welcome for bug fixes.

1. Fork the repo
2. Create your feature branch: `git checkout -b fix/my-fix`
3. Commit your changes: `git commit -m 'Fix: description'`
4. Push to the branch: `git push origin fix/my-fix`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<p align="center">Made with ❤️ for someone special</p>
