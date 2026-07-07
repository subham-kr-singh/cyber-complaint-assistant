# Smart Cyber Complaint Support — Starter Codebase

Team CyberSetu — Safe Click Hackathon 2.0

A guided assistant that helps cybercrime victims document incidents, collect evidence,
generate a complaint summary, and get routed to the right authority.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **AI:** Google Gemini API for crime classification (with a keyword-based fallback)
- **Evidence storage:** Local disk in dev (swap for Cloudinary/S3 in production)
- **PDF generation:** pdf-lib

## Project Structure

```
smart-cyber-complaint/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # Mongoose schemas (User, Complaint, Evidence, RoutingAuthority)
│   ├── controllers/               # Route logic
│   ├── routes/                   # Express route definitions
│   ├── middleware/                # auth (JWT) + error handler
│   ├── utils/                    # Gemini classifier + PDF generator
│   ├── seed/routingAuthorities.js # Seeds the crime-type → authority lookup table
│   └── server.js                 # App entry point
│
└── frontend/
    └── src/
        ├── context/
        │   ├── ApiContext.jsx     # Central axios instance + all API calls
        │   └── AuthContext.jsx    # Global login state
        ├── components/            # Navbar, ProtectedRoute, EvidenceUpload
        ├── pages/                 # Login, Register, Dashboard, NewComplaint, ComplaintDetail
        └── App.jsx                # Routes
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, CLOUDINARY_* in .env
npm run seed     # populates the routing authority lookup table
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # starts on http://localhost:5173
```

## How the guided flow works

1. `POST /api/complaints/start` → creates a draft complaint, returns the first scripted question.
2. `POST /api/complaints/:id/answer` → saves each answer, returns the next question (see
   `GUIDED_QUESTIONS` in `complaintController.js` — expand this array as your flow grows).
3. Once all scripted questions are answered, the frontend calls
   `POST /api/complaints/:id/classify`, which sends the victim's description to Gemini
   (or falls back to keyword matching) and auto-routes to the correct authority via the
   `RoutingAuthority` lookup table.
4. Victim uploads evidence (`POST /api/complaints/:id/evidence`).
5. `POST /api/complaints/:id/submit` locks the complaint and generates a downloadable PDF.

## What's already wired up vs. what your team should build on

**Already working (scaffold level):**
- Auth (register/login/JWT), protected routes on both ends
- Complaint CRUD + guided Q&A state machine
- Evidence upload (local disk storage)
- Gemini classification with fallback
- Routing lookup table + seed data
- PDF generation
- Frontend pages for the whole flow, wired to real API calls (no mock data)

**Good next steps for your team to extend:**
- Replace local disk evidence storage with Cloudinary (`CLOUDINARY_*` env vars are already
  in `.env.example` — the SDK is in `package.json`, just needs wiring in `evidenceRoutes.js`)
- Expand `GUIDED_QUESTIONS` into a smarter branching flow (ask different questions based
  on crime type, once known)
- Build the admin/police panel using the existing `PATCH /api/complaints/:id/status`
  (admin-only) route
- Add real-time status notifications (Socket.io or polling)
- Add multilingual support (Phase 3 on your roadmap slide)

## Team

Subham Kumar Singh · Siddharth Rai · Tushar Pawar · Deepak Singh · Ayush Singh · Badal Singh
Oriental College of Technology, Bhopal — B.Tech CSE
