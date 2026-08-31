To run backend — `uv run uvicorn app.main:app --reload` (from `api/`)
To run web — `npm run dev` (from `web/`)
To run mobile — `npx expo start` (from `mobile/`)

# HEALTHAI DEMO — AI-ASSISTED SYMPTOM TRIAGE PLATFORM
### Project Documentation

**By:** Cardozo "Fola" Shofolarin Carrinson
**Institution:** Aptech Computer Education, Lagos
**Stack:** FastAPI · PostgreSQL · React · React Native (Expo) · Ollama (Qwen2.5) · Docker · nginx

---

## TABLE OF CONTENTS
1. Acknowledgement
2. Project Synopsis
   - Introduction
   - Scope
   - Key Features
3. Project Analysis
   - Problem Statement
   - Problem Solution
   - Constraints
   - Goals
4. System Requirements
   - Functional Requirements
   - Hardware Requirements
   - Software Requirements
5. Project Architecture
   - System Overview
   - Component Breakdown
   - Data Flow
6. Backend Documentation
7. Frontend Documentation (Web + Mobile)
8. Developer Guide
9. User Guide
10. Conclusion

---

## 1. ACKNOWLEDGEMENT

This project was developed as a full-stack AI-assisted health triage platform,
built and deployed end to end — including a hardened self-managed server,
three trained ML models, a self-hosted retrieval-augmented chatbot, and two
client applications talking to one shared backend. Thanks to the open-source
communities behind FastAPI, scikit-learn, Ollama, Expo, and React for the
tools that made this possible.

---

## 2. PROJECT SYNOPSIS

### Introduction
HealthAI Demo is an AI-assisted health triage platform built around a
deliberate two-audience split: a **patient-facing mobile app** and a
**clinician-facing web console**, both served by a single FastAPI backend.
Patients register, run an AI symptom check, view their records, book
appointments against real doctor availability, message their doctor, and ask
a general health-information assistant questions. Doctors and hospital
administrators review a live patient queue sorted by urgency, manage
availability and appointment requests, and oversee AI usage and outcomes
across the platform.

The system is a demonstration project — every AI surface displays a clear
disclaimer, and the deterministic safety layer (not the ML model) is what
guarantees an emergency symptom combination is always escalated correctly.

### Scope
The project covers:
- AI symptom triage with a rule-based emergency safety layer
- Two supplementary ML risk models (diabetes, heart disease) with live,
  per-prediction SHAP explanations
- A self-hosted RAG chatbot for general health questions, with automatic
  escalation to a doctor when a question touches an emergency-relevant topic
- Full patient record-keeping, generated automatically from every AI
  interaction
- Real, slot-based appointment scheduling against doctor-set availability
- Real-time chat between patient and doctor
- Role-based staff console: doctor, hospital administrator, and platform
  administrator views
- A hardened, self-managed production deployment across three independently
  running services (API/database on a VPS, web console on Vercel, mobile app
  via EAS/Play Store)

### Key Features
- **Deterministic safety layer:** ten red-flag rules that can only escalate
  urgency, never a model's guess
- **Honest ML evaluation:** a documented data-leakage finding in the
  standard triage dataset, with two additional real-world risk datasets
  added specifically to provide genuine, non-trivial performance evidence
- **Self-hosted RAG chatbot:** Qwen2.5 3B via Ollama, grounded in a
  60-entry curated medical corpus, with automatic doctor escalation on
  emergency-tagged topics
- **Role-based access control**, enforced server-side and independently
  verified (not just hidden in the UI)
- **Full audit trail:** every AI prediction and chatbot interaction logged
  with model name, version, and outcome
- **Real scheduling:** doctors set recurring weekly availability; patients
  book only genuinely free slots
- **Multi-surface, multi-service deployment:** three independently deployed
  components, communicating over one shared, hardened backend

---

## 3. PROJECT ANALYSIS

### Problem Statement
Health systems — particularly in regions with limited doctor availability —
face recurring challenges:
- **Access:** many patients cannot easily reach a clinician for a first
  assessment of common symptoms
- **Triage inefficiency:** clinics spend real time on cases that could be
  pre-screened or safely deferred
- **Fragmented records:** patients and clinicians lack a single, persistent
  view of a patient's history and past AI-assisted assessments
- **Scheduling friction:** appointment booking without visibility into real
  availability leads to conflicts and wasted clinician time
- **Trust in AI systems:** health-adjacent AI tools risk either over-claiming
  certainty or under-explaining their reasoning

### Problem Solution
- **AI symptom triage** gives patients an immediate, explained assessment
  with a clear urgency level, backed by a safety layer that cannot be
  overridden by model uncertainty
- **A self-hosted chatbot** answers general health questions from a curated,
  trustworthy corpus rather than free-form generation, with citations and a
  documented refusal behaviour for anything outside its knowledge
- **Every interaction becomes a record**, automatically, giving both patient
  and clinician a persistent, structured history
- **Real availability-based scheduling** removes the double-booking and
  guesswork of a fixed-slot placeholder system
- **Full audit logging and RBAC** give the platform accountability and
  correctly scoped access by role

### Constraints
- Requires an internet connection for both AI inference (ML models loaded
  server-side) and chatbot inference (self-hosted, but still server-side)
- CPU-only inference for the chatbot — no GPU on the deployment VPS — so
  response latency (several seconds) is a genuine, accepted trade-off
  against the cost of self-hosting rather than an inconsistency
- Mobile push notifications and Google OAuth backend logic are complete and
  tested via direct API calls, but full mobile-client integration was
  finalised after the initial submission window under an approved extension
- The triage model's near-perfect accuracy on its primary dataset is a
  documented artifact of that public dataset's structure, not a claim of
  clinical predictive skill (see Section 6)

### Goals
- Provide an honest, safety-conscious demonstration of an AI-assisted
  triage and care-coordination platform
- Make every AI decision explainable and auditable, not a black box
- Ensure the one guaranteed safety mechanism in the system is deterministic
  and testable, independent of model behaviour
- Deploy the full system to real, publicly reachable infrastructure rather
  than a local-only demo

---

## 4. SYSTEM REQUIREMENTS

### Functional Requirements
- User registration and authentication (JWT, plus Google OAuth) with
  role-based access (patient, doctor, hospital administrator, platform
  administrator)
- AI symptom checker with ranked condition predictions, urgency
  classification, and red-flag detection
- Risk screening (diabetes, heart disease) with SHAP-based factor
  explanations
- Medical record storage, generated automatically from AI interactions and
  document uploads (with OCR text extraction)
- Appointment booking against real, doctor-configured availability
- Real-time messaging between patient and assigned doctor
- AI health-information assistant with source citation and automatic
  doctor escalation for emergency-relevant queries
- Staff console: patient queue, full patient detail view, appointment
  management, analytics, AI monitoring, hospital-wide dashboard, CSV
  reporting, platform administration

### Hardware Requirements
- Deployment: any VPS with 8 GB RAM minimum (12 GB used in this
  deployment) to comfortably run the database, API, and a quantized 3B
  LLM simultaneously
- Development machine: any modern laptop capable of running Docker, Node,
  and Python

### Software Requirements

**Backend:**
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.13 | Backend language |
| FastAPI | Latest | REST + WebSocket API framework |
| SQLAlchemy / Alembic | Latest | ORM and database migrations |
| PostgreSQL | 16 | Primary database |
| scikit-learn / XGBoost / LightGBM / CatBoost | Latest | ML model training and benchmarking |
| SHAP | Latest | Model explainability |
| sentence-transformers | Latest | Embedding model for RAG retrieval |
| Ollama (Qwen2.5 3B) | Latest | Self-hosted LLM inference |
| pytesseract | Latest | OCR text extraction |
| python-jose / bcrypt | Latest | JWT auth and password hashing |
| uv | Latest | Python dependency management |

**Web frontend:**
| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | Latest | Build tool |
| React Router | Latest | Client-side routing |
| Axios | Latest | HTTP client |

**Mobile frontend:**
| Tool | Version | Purpose |
|---|---|---|
| React Native | 0.86 | Mobile framework |
| Expo / Expo Router | SDK 57 | Managed workflow and file-based routing |
| Axios | Latest | HTTP client |
| Expo Notifications / Auth Session | Latest | Push notifications, Google OAuth |

**Infrastructure:**
| Tool | Purpose |
|---|---|
| Docker / Docker Compose | Containerised API and database |
| nginx | Reverse proxy, TLS termination |
| Certbot (Let's Encrypt) | HTTPS certificates |
| ufw / fail2ban | Firewall and intrusion prevention |
| Vercel | Web frontend hosting |
| EAS / Google Play Console | Mobile build and distribution |
| GitHub Actions | CI (automated test suite on push) |

---

## 5. PROJECT ARCHITECTURE

### System Overview
```
Patient (Mobile — Expo/RN)          Clinical Staff (Web — React)
        ↓                                    ↓
        └───────────────┬────────────────────┘
                         ↓
                  nginx (TLS) — VPS
                         ↓
                  FastAPI (Docker)
              ── JWT auth, RBAC
              ── ML inference (triage, risk models)
              ── red-flag safety layer
              ── audit logging
              ── WebSocket chat
              ── RAG chatbot ─────┐
                         ↓         │
              PostgreSQL (Docker)  │
                                   ↓
                     Ollama (Qwen2.5 3B) — VPS host
```

### Component Breakdown

**`ml/train_models.py`**
Trains and benchmarks four algorithms (Random Forest, XGBoost, LightGBM,
CatBoost) across three datasets using 5-fold cross-validation. Saves the
best model per task as a `.joblib` artifact.

**`ml/explain.py`**
Offline SHAP analysis for the symptom triage model.

**`api/app/services/predictor.py`**
Loads trained models and serves predictions, including live SHAP
explanations on the two risk models.

**`api/app/services/red_flags.py`**
Deterministic, rule-based emergency detection. Sits above the ML output
and can only escalate urgency, never reduce it.

**`api/app/services/rag.py`**
In-memory retrieval over the curated medical corpus using
sentence-transformer embeddings and cosine similarity.

**`api/app/services/llm.py`**
Thin HTTP client for the self-hosted Ollama instance, with a strict
system prompt constraining the chatbot to grounded, non-diagnostic
answers.

**`api/app/routers/`**
One router per domain: `auth`, `predictions`, `records`, `appointments`,
`availability`, `chat` (WebSocket + history), `assistant` (RAG chatbot +
escalations), `monitoring`, `admin`, `uploads`, `notifications`.

**`api/app/models/`**
SQLAlchemy models: `User`, `MedicalRecord`, `Appointment`,
`DoctorAvailability`, `ChatMessage`, `PushToken`,
`PredictionAuditLog`, `AssistantEscalation`.

### Data Flow — Symptom Check
1. Patient submits selected symptoms from the mobile app
2. API loads the trained triage model and computes ranked predictions
3. The red-flag rule layer independently evaluates the raw symptoms
4. Urgency is determined: red flag present → `emergency`; otherwise,
   confidence-based `see_a_doctor` or `insufficient_info`
5. A `MedicalRecord` is created automatically with the full result
6. A `PredictionAuditLog` entry is created for accountability
7. Response, including the disclaimer, is returned to the patient

### Data Flow — Chatbot Escalation
1. Patient asks the assistant a question
2. The question is embedded and compared against the 60-entry corpus
3. Top matches are passed to the LLM as grounding context
4. If any matched entry is tagged `emergency: True`, an
   `AssistantEscalation` record is created and a push notification is
   sent to registered doctor accounts
5. The doctor reviews the escalation in the web console's review queue

---

## 6. BACKEND DOCUMENTATION

### Project Structure
```
api/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── core/            (security, RBAC dependencies)
│   ├── models/           (SQLAlchemy tables)
│   ├── schemas/           (Pydantic request/response)
│   ├── routers/            (one file per domain)
│   ├── services/             (predictor, red_flags, rag, llm, push)
│   └── data/                  (medical_corpus.py)
├── alembic/                     (migrations)
├── models/                       (trained .joblib artifacts)
├── tests/                         (pytest — safety layer coverage)
├── Dockerfile
└── pyproject.toml
ml/
├── train_models.py
├── explain.py
├── data/                           (training datasets)
└── artifacts/                       (trained models, benchmark results)
```

### Environment Variables
```
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
SECRET_KEY=<random 32+ byte string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ML_MODEL_DIR=models
OLLAMA_URL=http://<docker-bridge-gateway>:11434/api/generate
```

### Running the Backend
```bash
cd api
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0
```

### Key API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` / `/auth/login` / `/auth/google` | Auth |
| POST | `/predict/triage` | AI symptom check |
| POST | `/predict/risk/diabetes` / `/predict/risk/heart` | Risk screening with SHAP |
| GET/POST | `/records` | Patient medical records |
| GET/POST | `/appointments` | Appointment booking and management |
| GET/POST | `/availability` | Doctor availability, real slot computation |
| WS | `/ws/chat` | Real-time patient↔doctor messaging |
| POST | `/assistant/ask` | RAG chatbot |
| GET | `/assistant/escalations` | Doctor escalation review queue |
| GET | `/monitoring/*` | AI monitoring, analytics, hospital overview |
| GET/PATCH | `/admin/users` | Platform administration |

---

## 7. FRONTEND DOCUMENTATION

### Web (Clinical Staff Console)
```
web/src/
├── App.jsx
├── context/AuthContext.jsx
├── components/DashboardLayout.jsx    (role-filtered sidebar)
├── api/client.js
└── pages/
    ├── Login.jsx
    ├── DoctorDashboard.jsx           (patient queue)
    ├── PatientManagement.jsx          (patient detail view)
    ├── AppointmentManagement.jsx       (availability + confirm/decline)
    ├── Analytics.jsx
    ├── Monitoring.jsx
    ├── HospitalDashboard.jsx
    ├── Reports.jsx
    ├── Chat.jsx
    ├── Assistant.jsx
    ├── Escalations.jsx
    ├── AdminUsers.jsx
    └── AdminCreateDoctor.jsx
```
Run with `npm run dev` from `web/`. Deployed on Vercel with a dedicated
subdomain.

### Mobile (Patient App)
```
mobile/app/
├── index.tsx      (landing)
├── login.tsx       (auth, incl. Google sign-in)
├── home.tsx          (dashboard / shortcuts)
├── checker.tsx         (symptom checker)
├── records.tsx           (medical records, offline-cached)
├── appointments.tsx        (real slot-based booking)
├── chat.tsx                 (real-time chat with doctor)
├── assistant.tsx              (RAG chatbot)
├── upload.tsx                  (camera/document upload)
```
Run with `npx expo start` from `mobile/`. Built to a standalone Android
APK via EAS and submitted to Google Play closed testing.

---

## 8. DEVELOPER GUIDE

### Adding a New ML Model
1. Add training logic to `ml/train_models.py` following the existing
   benchmark pattern
2. Save the trained model to `ml/artifacts/` and copy it to `api/models/`
3. Add a `predict_*` function to `api/app/services/predictor.py`
4. Add a router endpoint and schema, following the existing risk-model
   pattern for SHAP integration

### Updating the Chatbot's Knowledge
1. Add entries to `api/app/data/medical_corpus.py`, following the
   existing `{"topic", "text", "emergency"}` shape
2. Tag genuinely emergency-relevant entries with `"emergency": True` —
   this is what drives automatic doctor escalation
3. No re-embedding step needed for a single addition; embeddings are
   computed at process startup from the current corpus

### Deploying a Backend Change
```bash
git push                                   # from laptop
ssh vps && cd ~/Health-AI && git pull
docker compose up -d --build api
docker compose exec api uv run alembic upgrade head   # if a migration was added
```

---

## 9. USER GUIDE

### For Patients (Mobile App)
**Getting started:** Register or sign in (including with Google). You'll
land on the Home screen with shortcuts to every feature.

**Checking symptoms:** Open the Symptom Checker, select what you're
experiencing, and submit. You'll see ranked possible conditions, an
urgency level, and — if a serious combination is detected — a clear
emergency warning.

**Viewing records:** Every symptom check and risk screening is saved
automatically under Records, viewable even without a connection (from
your last sync).

**Booking care:** Under Appointments, pick a doctor, choose from their
actual available time slots, describe your reason for visiting, and
submit. Your doctor will confirm or decline the request.

**Messaging your doctor:** Once you have a booked appointment, message
them directly and in real time under Messages.

**Asking the assistant:** Use the Assistant for general health
questions. If your question touches on a serious topic, it will tell you
clearly to seek care — and a doctor is automatically notified.

### For Clinical Staff (Web Console)
**Signing in:** Staff accounts only — patients cannot access this
console.

**Reviewing patients:** Your dashboard shows a live queue sorted by
urgency. Click any patient for their full record and appointment
history.

**Managing appointments:** Confirm, decline, or complete requests. Set
your own weekly availability so patients only see real, bookable times.

**Monitoring AI usage:** The AI Monitoring and Analytics pages show
prediction volume, red-flag rates, and urgency distribution, drawn
directly from the platform's audit log.

**Administration (platform admins only):** Add new doctor accounts and
manage user roles from the Admin section.

---

## 10. CONCLUSION

HealthAI Demo delivers a full-stack, honestly-scoped AI health triage
platform: a deterministic safety layer that never depends on model
confidence alone, an ML pipeline that surfaces and documents its own
data-quality findings rather than hiding them, and a self-hosted RAG
chatbot with automatic escalation to a human clinician. The platform is
deployed across three independently running services on real,
production-grade infrastructure rather than kept as a local-only demo.

The two-audience architecture — a lightweight patient mobile app and a
role-gated clinical console — reflects how a real deployment would
actually be used, and the audit logging, RBAC enforcement, and honest
data-limitation reporting throughout are intended to demonstrate not just
what was built, but the judgement behind how it was built.

**Feature Status:**
- ✅ AI symptom triage with deterministic safety layer — Complete
- ✅ Risk screening with live SHAP explanations — Complete
- ✅ RAG chatbot with doctor escalation — Complete
- ✅ Real-time chat — Complete
- ✅ Real slot-based scheduling — Complete
- ✅ Full production deployment (VPS, Vercel, EAS/Play) — Complete
- ⏳ Mobile push notifications & Google OAuth client integration — finalised under approved extension
- 🗺️ Video consultation, medical imaging, model retraining pipeline, Kubernetes — documented roadmap items

**Remaining Work:**
- Video consultation for appointments (in progress — see project roadmap)
- Structured OCR field extraction (BioBERT NER)
- Hospital-wide analytics export enhancements
- Kubernetes deployment migration
