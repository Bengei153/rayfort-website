# Rayfort Investment Website (Node.js)

Node.js + Express + PostgreSQL site for **Rayfort Investment Co. Ltd. (RC 1414179)** with:

- **Bags** catalogue (separate division)
- **Classes** academy (separate division)
- **Blog** stories
- **Testimonials** from satisfied clients
- **Admin CMS** to post designs, stories, classes, and testimonials

## Quick start

1. Create a Postgres database (local or hosted).
2. Copy `.env.example` → `.env` and set `DATABASE_URL`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/rayfort
```

For hosted providers that need SSL, also set:

```env
DATABASE_SSL=true
```

3. Install, seed, and run:

```bash
cd rayfort-website
npm install
npm run seed
npm start
```

Open:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

### Default admin (from `.env`)

- Email: `admin@rayfortltd.com`
- Password: `RayfortAdmin2025!`

Change these in `.env` before going live, then run `npm run seed` again.

## Admin capabilities

| Section | What you can do |
|---------|-----------------|
| Bag Designs | Post new designs with image upload or URL |
| Classes | Manage executive programmes separately from bags |
| Blog Stories | Publish editorial / craft stories |
| Testimonials | Add client quotes after satisfaction |
| Inquiries | Read contact form submissions |

## Stack

- Express + EJS
- PostgreSQL (`pg`) via `DATABASE_URL`
- Sessions + bcrypt for admin auth
- Multer for image uploads → `public/uploads/`

## Company details

- Address: **4, Badejo Street**
- Phone: +234 803 528 1272
- Email: rayfortltd@gmail.com
