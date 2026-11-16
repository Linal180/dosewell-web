# Dosewell

Next.js clinic for the Dosewell API. Doctors prescribe, patients mark doses, and pharmacists get a read-only view of schedules, adherence, and the audit log.

The API is a separate repo, `dosewell-api`. Clone the two repos side by side.

## Setup

From `dosewell-api`:

```bash
docker compose up --build
```

Open http://localhost:3001. The API is http://localhost:3000.

To run the UI on its own against an API already listening on port 3000:

```bash
cp .env.example .env.local
npm install
npm run dev
```

`API_URL` is read on the server. The browser talks only to this Next app, which keeps the token in an httpOnly cookie.

Demo password: `Password1!`

| Name | Email | Role |
| --- | --- | --- |
| Maya Chen | maya.chen@dosewell.test | doctor |
| Ava Shah | ava.shah@dosewell.test | patient |
| Sam Okonkwo | sam.okonkwo@dosewell.test | patient |
| Priya Nair | priya.nair@dosewell.test | pharmacist |

Ava already has a lisinopril course and allergies to ibuprofen and amoxicillin. Signing in as Maya and prescribing ibuprofen or amoxicillin for Ava is blocked. Warfarin plus aspirin is blocked. Lisinopril plus ibuprofen asks the doctor to acknowledge a moderate interaction.

## What the UI does

Pages are server-rendered. The prescribe form is loaded separately, and medication search waits 300ms and cancels the previous request. Dose buttons stay disabled while a save is in flight. Route changes show a skeleton.

Times on the schedule are the local times the API stored, with the UTC instant beside them, so a daylight-saving shift is visible. Adherence is the API's percentage of due doses marked taken.

## Design decisions

The UI does not rebuild the schedule in the browser. Timezone and daylight-saving rules stay in the API, which is the place with the tests.

Auth sits in an httpOnly cookie set by a route handler. Server components forward that token to Rails. The cookie is marked secure when the request arrives over HTTPS, which is what Vercel and Netlify do, and left unset for local HTTP.

Pharmacist screens hide write actions. The API still rejects those writes.

## Trade-offs

There is no client cache. Each page asks the API again, which keeps role and audit data current and avoids a second source of truth.

The medication list is small, so search hits the API on a short debounce instead of loading a local catalog.

## Hosting

Import this repo on Vercel or Netlify. Set `API_URL` to the deployed Rails origin. `netlify.toml` selects the Next.js runtime. Vercel detects Next.js without extra config.

The Rails API needs a host that runs a container (Fly, Render, or Railway). Vercel and Netlify are for this frontend.

## What I would do next

- A prescription detail page with the same dose timeline.
- Empty, blocked, and warning states covered with a browser test.
- Pagination once a patient has more than a few courses.
