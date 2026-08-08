# Civic Connect Hub

Build a modern, production-grade, highly aesthetic web application for "AI Smart Civic Services" — an intelligent municipal complaint triage and civic service platform for Pakistani cities.

The application connects to an existing live FastAPI backend:

API Base URL: https://ai-smart-civic-services-sd5w.onrender.com

Use React, TypeScript, Tailwind CSS, Lucide Icons, shadcn/ui components, and Recharts. The design should feel premium, modern, responsive, and intuitive, featuring vibrant municipal color accents (Emerald Green, Sapphire Blue, Amber Warning, Ruby Critical), subtle glassmorphism cards, smooth animations, and bilingual Urdu/English friendly typography.

---

### GLOBAL API SERVICE & AUTHENTICATION STATE

Create an `api.ts` client with Axios/Fetch:

- API Base URL: `https://ai-smart-civic-services-sd5w.onrender.com`

- Store `citizen_token`, `citizen_id`, and `citizen_cnic` in `localStorage` upon citizen login/signup.

- Store `admin_token` in `localStorage` upon admin login.

- Automatically attach `Authorization: Bearer <token>` to respective requests.

- Provide clear toast notifications (Sonner) on errors (401, 409, 422, 500) and successes.

---

### NAVIGATION & APP STRUCTURE

1. **Header / Navbar**:

   - Logo: "AI Smart Civic Services" with a sleek Pakistani municipal badge icon.

   - Navigation links:

     - "Submit Complaint" (Citizen Portal)

     - "My Complaints" (Citizen Dashboard)

     - "Public Tracker" (Track by ID or Phone)

     - "AI Assistant" (Floating or tabbed chatbot)

     - "Admin Command Center" (Admin Portal)

   - User profile dropdown / Login / Signup buttons with active session indicator.

   - Dark/Light mode toggle.

---

### 1. CITIZEN AUTHENTICATION (Signup & Login)

- **Modal / Page with Tabs**: "Sign In" and "Create Citizen Account".

- **Signup Form (`POST /auth/signup`)**:

  - Pakistani CNIC input with automatic formatting helper: accepts `12345-1234567-1` or `1234512345671` (13 digits).

  - Password input (masked with eye toggle).

  - Full Name (optional).

  - Phone Number (optional).

  - On 201 success: automatically store `token` + `citizen_id` and redirect to "Submit Complaint" with a welcome toast.

  - On 409: show "CNIC already registered. Please log in."

- **Login Form (`POST /auth/login`)**:

  - CNIC + Password inputs.

  - On success: store token and redirect to citizen dashboard.

---

### 2. CITIZEN COMPLAINT SUBMISSION (`POST /submit-complaint`)

*Requires citizen authentication. If not logged in, prompt citizen login modal.*

**Form Fields**:

1. **Complaint Description (Textarea)**:

   - Placeholder in English, Urdu, and Roman Urdu: e.g., *"Describe the issue in English, Urdu (اردو), or Roman Urdu (e.g., 'Gali mein kachra jama hai aur paani leak ho raha hai...')*".

   - Multilingual quick-starter tags: "Broken Streetlight", "Water Pipe Burst / گٹر ابل رہا ہے", "Pothole on Main Road", "Garbage Heap / کچرا".

2. **Location / Address**:

   - Text input for street, sector, or landmark (e.g. *Street 14, Sector G-9/2, Islamabad*).

   - "Use My Current GPS Location" button (fetches browser geolocation and populates `latitude` and `longitude`).

3. **Contact Phone (Optional)**: pre-filled from citizen profile.

4. **Photo / Image URL (Optional)**:

   - Text input for external Image URL or image upload preview demonstration.

**Submission Flow & Live AI Results Card**:

Upon clicking "Submit Complaint":

- Show an animated loading state: *"AI Triage Engine analyzing multilingual text & checking duplicate clusters..."*

- Call `POST /submit-complaint` with `Authorization: Bearer <citizen_token>`.

- Display a **Stunning Interactive AI Triage Result Card**:

  - **Category Badge**: with custom icons (Road 🛣️, Water/Drainage 🚰, Waste 🗑️, Electricity ⚡, Safety 🛡️, Other 🏛️).

  - **Priority Badge**: color-coded (`Low` - Green, `Medium` - Blue, `High` - Orange, `Critical` - Red Pulse).

  - **Responsible Department**: e.g., *WASA, TEPA / Roads Authority, LESCO/K-Electric, Waste Management Company*.

  - **Actionable AI Summary**: 1-sentence English dispatch summary.

  - **AI Explainability Keywords**: clickable tag chips highlighting words from the complaint that triggered the classification.

  - **Duplicate Cluster Alert**: if `duplicate_of` is not null, display an amber badge: *"⚡ Clustered Issue: This complaint matches an active report in your area and priority has been escalated for rapid dispatch!"*

  - Buttons: "View My Complaints", "Track Live Status", "Submit Another".

---

### 3. CITIZEN DASHBOARD ("My Complaints" — `GET /my-complaints`)

*Requires citizen authentication.*

- Call `GET /my-complaints` with `Authorization: Bearer <citizen_token>`.

- Responsive grid of complaint cards showing:

  - Complaint ID (`#104`), Date submitted (formatted nicely).

  - Category icon, Priority badge, and Status pill (`Open`, `Assigned`, `In Progress`, `Resolved`).

  - AI Summary and Location.

  - Photo thumbnail (if `image_url` is present).

  - "View Details" modal showing full description, AI explainability keywords, assigned department, and resolution timestamp if resolved.

---

### 4. PUBLIC COMPLAINT TRACKER (`GET /track`)

*Completely public — no login required.*

- Toggle tab: "Track by Complaint ID" or "Track by Citizen Phone".

- Search input with quick submit.

- Calls `GET /track?complaint_id=<id>` or `GET /track?phone=<phone>`.

- Displays complaint progress timeline (Submitted → AI Triaged → Department Assigned → In Progress → Resolved).

---

### 5. AI CIVIC ASSISTANT CHATBOT (`POST /ask`)

- Clean floating or drawer chat widget available on all pages.

- Allows citizens or operators to ask questions in plain English or Roman Urdu:

  - e.g., *"How many water leakage complaints are currently open?"*

  - e.g., *"What is the status of my complaint #2?"* (auto-passes `complaint_id` or citizen phone from active session).

  - e.g., *"Which department handles dangling electrical wires in Rawalpindi?"*

- Calls `POST /ask` with `{ "question": text, "phone": ..., "complaint_id": ... }` and renders streaming-style plain-text response bubbles.

---

### 6. MUNICIPAL ADMIN COMMAND CENTER (Admin Portal)

- **Admin Login (`POST /admin/login`)**:

  - Password modal for municipal operators (uses `ADMIN_PASSWORD`).

  - Stores `admin_token`.

- **Analytics Dashboard (`GET /stats`)**:

  - Header KPI Cards: Total Complaints, Resolved Complaints, Open Critical Hazards, Average Resolution Time (in hours), Linked Duplicates.

  - **Recharts Visualizations**:

    1. Bar Chart: Complaints distribution by Category (`Road`, `Water/Drainage`, `Waste`, `Electricity`, `Safety`).

    2. Pie / Donut Chart: Priority breakdown (`Low`, `Medium`, `High`, `Critical`).

    3. Status Progress Bar: `Open` vs `Assigned` vs `In Progress` vs `Resolved`.

- **Complaints Management Table (`GET /complaints`)**:

  - Multi-criteria filter bar: Filter by Category, Priority, Status, Department, Location search, Date range.

  - Table columns: ID, Citizen CNIC/Phone, Category, Priority, Location, Status, Department, Date, Actions.

  - **Action Controls (`PATCH /complaints/{id}`)**:

    - Quick dropdown to change status (`Open` → `Assigned` → `In Progress` → `Resolved`).

    - Input to re-assign or update department (e.g. *TEPA Rapid Road Repair Unit*).

    - Auto-refreshes stats and table on change with success toast.

---

### ERROR HANDLING & REFINEMENT

- Handle all HTTP status codes gracefully (401 triggers login modal, 404 displays friendly not-found banner, 422 highlights invalid form fields, 500 shows retry button).

- Include sample mock data / placeholder examples for quick testing if backend is cold-starting on Render.

- Clean responsive layout that looks incredible on mobile phones, tablets, and wide screens.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pak-civic-pulse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/95ed1ca5-fc0f-437d-b8e6-93ee4724c8aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
