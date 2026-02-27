# IdeaTech Event Timer 2026

IdeaTech Event Timer 2026 is a Vite + React Single Page Application built for managing live event rounds with reliable, synchronized countdowns.  
It provides a public **Display** view for audiences and a protected **Admin** view for organizers to control rounds and phases in real time.

## Live Deployment Links

- **Display URL:** `https://ideatech-event-timer-2026.vercel.app/display`
- **Admin URL:** `https://ideatech-event-timer-2026.vercel.app/admin`

Admin password is shared separately with authorized organizers only.

## Features

- Separate **Display** and **Admin** routes
- Timestamp-based countdown logic
- Cross-tab synchronization
- Phase selection with immediate sync across routes
- Password-protected admin access

## Tech Stack

- React
- Vite
- React Router
- Vercel (deployment)

## Local Development Setup

```bash
npm install
npm run dev
npm run build
npm run preview
```


## Operational Instructions for Event

1. Open `/display` on the projector or main display system.
2. Open `/admin` on the organizer control laptop.
3. Run a full timer flow test before the event starts.
4. Avoid code/config changes during live operations.
