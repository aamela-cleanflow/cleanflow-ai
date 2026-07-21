# CleanFlow AI

CleanFlow AI is a polished operational-intelligence prototype for small commercial cleaning-service businesses. It brings scheduling, service status, cleaner pay estimates, client communication drafts, activity tracking, and role-based demo portals into one responsive workspace.

> All names, companies, locations, contact details, figures, messages, and activity records in this project are fictional demonstration data.

## Private Demo

The Build Week prototype is hosted as a private OpenAI Site. Authorized viewers can open it at:

https://cleanflow-ai-demo.famy1617.chatgpt.site

## Highlights

- Owner/Admin dashboard with interactive daily operations summaries
- Schedule, locations, team, clients, reports, help, and settings views
- Completed, Missed, and Client Closed service statuses
- Hourly, flat-rate, percentage, monthly, and semimonthly pay estimates
- Global search across fictional jobs, locations, cleaners, and clients
- Communication Center with editable client and cleaner drafts
- Polished reply workflow with recent-message context and draft saving
- Cleaner and Client/School demo portals with role-appropriate information
- Session-only editing for services, locations, cleaners, clients, and settings
- Demo notifications, activity history, checklists, and mock photo uploads

No messages are sent, no real files are uploaded, and no production customer or payroll data is stored.

## Built with GPT-5.6 and Codex

GPT-5.6 and Codex were used as collaborative product-development tools throughout the project:

- **GPT-5.6** helped translate the Build Week concept into clear operational workflows, fictional demo content, role-based privacy rules, UX copy, interaction requirements, and focused polish decisions.
- **Codex** worked directly in the project workspace to implement the React interface, preserve the established visual system, connect interactive states, diagnose issues, run production builds, and verify behavior in the browser.
- The project was developed iteratively: requirements were converted into small implementation passes, tested against the production build, and refined without redesigning stable parts of the application.
- Final QA covered navigation, search, role switching, modals, editable forms, notifications, communication drafts, pay estimates, activity records, and responsive interaction behavior.

AI assistance accelerated implementation and review, while all product decisions, demo scope, and publishing actions remained under human direction and approval.

## Technology

- React 19
- TypeScript
- vinext and Vite
- Cloudflare-compatible OpenAI Sites deployment
- CSS with responsive layouts and session-only client state

## Local Setup

### Prerequisites

- Node.js 22.13 or newer
- pnpm

### Install and run

```bash
pnpm install
pnpm run dev
```

Create a production build with:

```bash
pnpm run build
```

The application uses fictional in-memory data. Edits made in the prototype last only for the current browser session.

## Project Structure

```text
app/
  page.tsx       Main CleanFlow AI application and demo interactions
  globals.css    Existing visual system and responsive styling
  layout.tsx     Site metadata and application shell
public/          Static assets
.openai/         Private Sites hosting configuration
```

## Demo Safety

- Do not enter real client, cleaner, payroll, or contact information.
- Communication actions save fictional drafts only.
- Photo uploads are demonstration placeholders.
- The pay calculator provides estimates and is not a payroll system.
- The prototype does not include invoicing, payroll processing, or calendar importing.

## License

This repository is provided as a demonstration project for Build Week.
