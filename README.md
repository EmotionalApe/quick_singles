# Quick Singles

Quick Singles is a lightweight live cricket scoring web application designed for casual, club, and recreational matches. The application eliminates operational friction by removing user registration, logins, and player database management. Any user can create a match, share a URL, take over as the active scorer, and allow viewers to monitor live ball-by-ball updates.

---

## Features

- Zero-Friction Architecture: No user accounts, passwords, or authentication requirements.
- Role-Based Match Viewing: Users accessing a match URL act as viewers by default and can assume the temporary scorer role if unassigned.
- Cookie-Based Session Security: Scorer authority is governed by a temporary token stored inside an HttpOnly session cookie, managed entirely by the server.
- Comprehensive Scoring Engine:
  - Standard runs (0, 1, 2, 3, 4, 6).
  - Extras: Wide deliveries and no-balls with support for additional runs scored (byes, overthrows, or boundaries).
  - Dismissals: Wicket registration with support for completed runs on run-outs.
  - Ball Rollback: Immediate undo functionality to reverse misrecorded deliveries.
- Authoritative Lifecycle Management:
  - Automatic calculation of overs, run rates, and target chases.
  - Innings transition management from first innings to innings break, second innings, and match completion.
  - Automatic victory detection when chasing targets are met or overs expire.
- Responsive, Single-Frame User Interface:
  - High-contrast, minimalist card design.
  - Compact layout that presents the live scoreboard, recent delivery chips, and keypad within a single mobile screen frame without requiring vertical scrolling.
  - Local Wi-Fi network support for pitch-side scoring directly from a mobile device.

---

## Technology Stack

### Backend
- Language: Python 3.12
- Web Framework: FastAPI
- Database ORM: SQLAlchemy 2.0
- Migrations: Alembic
- Database: PostgreSQL (Docker)
- Testing: Pytest

### Frontend
- Library: React 19
- Language: TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- HTTP Client: Axios

---

## System Requirements

Before running the application, ensure the following tools are installed:

- Git
- Docker and Docker Compose
- Python 3.12 or newer
- Node.js (version 18 or newer) and npm

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/EmotionalApe/quick_singles.git
cd quick_singles
```

### 2. Start the PostgreSQL Database

Start the PostgreSQL database service using Docker Compose:

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 with the database named `cricket_scorer`.

### 3. Backend Setup

Navigate to the `backend` directory, set up a Python virtual environment, install the dependencies, and apply database migrations.

#### On Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

#### On macOS / Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

#### Start the Backend API Server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- API Root: `http://127.0.0.1:8000`
- Interactive OpenAPI Documentation: `http://127.0.0.1:8000/docs`

#### Run Backend Unit Tests:

```bash
pytest
```

---

### 4. Frontend Setup

Open a new terminal window, navigate to the `frontend` directory, install package dependencies, and launch the development server.

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start and provide two URLs:

- Local URL: `http://localhost:5173/`
- Network URL: `http://<your-local-ip>:5173/`

The frontend automatically proxies API requests from `/matches` to `http://127.0.0.1:8000`, ensuring cross-origin cookies operate securely under the same origin.

To score matches using a mobile phone, open the Network URL in any mobile browser connected to the same local Wi-Fi network.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/matches/` | Creates a new match specifying team names and overs per innings. |
| GET | `/matches/{match_id}` | Retrieves the authoritative match status, scores, role, and recent balls. |
| POST | `/matches/{match_id}/scorer` | Assigns the scorer role to the calling client and sets an HttpOnly cookie. |
| POST | `/matches/{match_id}/scorer/leave` | Releases the active scorer assignment and clears the cookie. |
| POST | `/matches/{match_id}/events` | Records a delivery event (runs, wide, no-ball, or wicket). |
| POST | `/matches/{match_id}/undo` | Reverts the most recent delivery in the current active innings. |
| POST | `/matches/{match_id}/end-innings` | Concludes the active innings manually. |
| POST | `/matches/{match_id}/start-innings` | Initiates the second innings following an innings break. |

---

## Project Structure

```text
.
├── docker-compose.yml          # PostgreSQL container configuration
├── backend/
│   ├── alembic/                # Database migration scripts
│   ├── alembic.ini             # Alembic configuration
│   ├── app/
│   │   ├── api/                # FastAPI endpoint routers
│   │   ├── db/                 # Database connection and session management
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic data validation schemas
│   │   ├── services/           # Authoritative cricket scoring and rule calculation
│   │   └── main.py             # Application entrypoint and CORS middleware
│   ├── tests/                  # Pytest test suite
│   └── requirements.txt        # Python package dependencies
└── frontend/
    ├── src/
    │   ├── api/                # Axios client and match API service functions
    │   ├── components/         # Reusable UI components (Scoreboard, Keypad, etc.)
    │   ├── pages/              # Route pages (Home, Create Match, Match Console)
    │   ├── types/              # TypeScript interfaces and union types
    │   ├── App.tsx             # Application routing configuration
    │   └── main.tsx            # DOM root mounting
    ├── index.html              # HTML template
    ├── vite.config.ts          # Vite configuration with proxy and network host
    └── package.json            # Node.js project manifest and scripts
```

---

## License

This project is open source and available under the terms of the MIT License.
