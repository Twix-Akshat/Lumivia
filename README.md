# Lumivia - Your Mental Wellness Partner

A modern mental health therapy platform built with Next.js, connecting patients with licensed therapists through secure video sessions.

## Features

- 🎥 HD video therapy sessions
- 📅 Flexible scheduling system
- 📝 Private journaling and mood tracking
- 🔒 HIPAA-compliant and secure
- 📊 Progress tracking and assessments
- 💬 Real-time notifications
- 🌓 Dark mode support
- 📱 Fully responsive design

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS with shadcn/ui components
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Animations:** Tailwind Animate CSS

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
lumivia/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages (patient, therapist, admin)
│   └── session/           # Video session pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## User Roles

- **Patient:** Book sessions, complete assessments, journal entries
- **Therapist:** Manage availability, accept sessions, add notes
- **Admin:** View analytics, manage users and activities

## Color Theme

Lumivia uses a beautiful yellow gradient theme with OKLCH color space for modern, vibrant colors:
- Primary: Warm yellow tones (hue 85)
- Accent: Complementary yellow shades
- Background: Soft cream/white with subtle yellow tint
- Dark mode: Deep warm tones with yellow accents

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
