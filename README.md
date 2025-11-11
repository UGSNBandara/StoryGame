# StoryGame - Time Traveler's Escape

A magical story game with ancient Egyptian themes, featuring a beautiful interactive book interface and time travel mechanics.

## 🚀 Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- WSL (if on Windows)

### Running the Application

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StoryGame
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Services

- **Frontend**: React + Vite application with magical book interface
- **Backend**: FastAPI with SQLite database
- **Database**: SQLite (file-based, no external server needed)

## 🛠 Development Setup

### Local Development (without Docker)

1. **Backend Setup:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python init_db.py  # Initialize database
   uvicorn app.main:app --reload
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📊 Database

The application uses SQLite for data persistence:

- **Database file**: `storygame.db` (created automatically)
- **Tables**:
  - `users` - User accounts and credits
  - `levels` - Game levels and descriptions
  - `user_progress` - Player progress tracking

### Database Management

- **Initialize/Reset database:**
  ```bash
  cd backend
  python init_db.py
  ```

- **Access SQLite database:**
  ```bash
  sqlite3 storygame.db
  ```

## 🔧 Configuration

Environment variables are configured in `backend/.env`:

- `DATABASE_URL`: Path to SQLite database file
- Default: `storygame.db`

## 🎮 Features

- **Magical Book Interface**: Interactive 3D book with realistic page turning animations
- **User Authentication**: Registration and login system
- **Credit System**: In-game currency for purchases
- **Level Progression**: 5 ancient Egyptian-themed levels
- **Responsive Design**: Works on desktop and mobile devices

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start with rebuild
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access backend container
docker exec -it storygame-backend-1 bash

# Access database
docker exec -it storygame-backend-1 sqlite3 /app/data/storygame.db
```

## 📁 Project Structure

```
StoryGame/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Book.jsx      # Magical book component
│   │   │   └── UI/           # Reusable UI components
│   │   └── pages/
│   │       └── HomePage.jsx  # Main game page
├── backend/           # FastAPI application
│   ├── app/
│   │   └── main.py           # API endpoints
│   ├── init_db.py            # Database setup script
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml # Multi-service orchestration
└── README.md
```

## 🔄 Migration from PostgreSQL

This project has been migrated from PostgreSQL (Supabase) to SQLite for easier local development:

- **Removed**: External PostgreSQL dependency
- **Added**: SQLite with automatic initialization
- **Updated**: All database queries to use SQLite syntax
- **Enhanced**: Docker Compose with persistent volumes

## 🎨 Frontend Features

- **Treasure Theme**: Custom colors (parchment, treasure gold), fonts (Cinzel for display)
- **3D Book Animation**: Realistic page turning with physics-based effects
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component-Based**: Modular architecture for maintainability

## 🔧 API Endpoints

- `GET /` - Health check
- `POST /register` - User registration
- `POST /login` - User authentication

Default demo credentials:
- username: user
- password: user123
