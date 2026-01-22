import os
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

load_dotenv()

# SQLite database path
DATABASE_PATH = os.getenv("DATABASE_URL", "storygame.db")

# MongoDB connection (optional; used for local dev + future features)
MONGODB_URI = os.getenv("MONGODB_URI", "").strip()

_mongo_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _mongo_client
    if not MONGODB_URI:
        raise HTTPException(status_code=500, detail="MONGODB_URI is not configured")
    if _mongo_client is None:
        _mongo_client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=2000,
        )
    return _mongo_client

app = FastAPI()

# Allow the frontend dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    return sqlite3.connect(DATABASE_PATH)


def normalize_key(value: str) -> str:
    return (value or "").strip().upper()

def init_db():
    """Initialize database and create tables if they don't exist"""
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                credits INTEGER DEFAULT 0
            )
        """)
        conn.commit()

# Initialize database on startup
init_db()


class RegisterRequest(BaseModel):
    email: str
    username: str

class LoginRequest(BaseModel):
    email: str
    username: str


class CompleteLevelRequest(BaseModel):
    user_id: int


class SubmitKeyRequest(BaseModel):
    user_id: int
    key: str


class LevelResponse(BaseModel):
    id: int
    level_number: int
    title: str
    description: str | None = None


class DialogueLine(BaseModel):
    id: int
    sequence: int
    speaker: str
    text: str
    gives_key: bool
    character_name: str
    character_title: str | None = None


class SubmitKeyResponse(BaseModel):
    correct: bool
    message: str
    reward_credits_awarded: int
    new_credits: int
    keys_collected: int
    completed_levels: int
    next_level_id: int | None = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the User Management API"}


@app.get("/debug/mongo")
def debug_mongo():
    """Simple connectivity check for MongoDB from inside the backend container."""
    client = get_mongo_client()
    try:
        result = client.admin.command("ping")
        ok = bool(result.get("ok"))
        return {"ok": ok, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mongo ping failed: {e}")

@app.post("/register")
def register(req: RegisterRequest):
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email=? OR username=?", (req.email, req.username))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="User already exists")
            # Insert user (default credits = 0)
            cur.execute(
                "INSERT INTO users (email, username, credits) VALUES (?, ?, ?) RETURNING id, credits",
                (req.email, req.username, 0)
            )
            user = cur.fetchone()
            conn.commit()
            return {"id": user[0], "credits": user[1]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(req: LoginRequest):
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, credits FROM users WHERE email=? AND username=?",
                (req.email, req.username)
            )
            user = cur.fetchone()
            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            return {"id": user[0], "credits": user[1]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/levels", response_model=list[LevelResponse])
def get_levels():
    """Return all levels in order. Used by the game UI/book."""
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, level_number, title, description FROM levels ORDER BY level_number"
            )
            rows = cur.fetchall()
            return [
                LevelResponse(
                    id=row[0],
                    level_number=row[1],
                    title=row[2],
                    description=row[3],
                )
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/levels/{level_id}/submit-key", response_model=SubmitKeyResponse)
def submit_level_key(level_id: int, req: SubmitKeyRequest):
    """Validate a user's entered key for a level, award credits once, and unlock next level."""
    try:
        entered = normalize_key(req.key)
        if not entered:
            raise HTTPException(status_code=400, detail="Key is required")

        with get_conn() as conn:
            cur = conn.cursor()

            # Ensure user exists
            cur.execute("SELECT id, credits FROM users WHERE id = ?", (req.user_id,))
            user_row = cur.fetchone()
            if not user_row:
                raise HTTPException(status_code=404, detail="User not found")
            current_credits = int(user_row[1] or 0)

            # Load level expected key + reward
            cur.execute(
                "SELECT id, level_number, key_code, reward_credits FROM levels WHERE id = ?",
                (level_id,),
            )
            level_row = cur.fetchone()
            if not level_row:
                raise HTTPException(status_code=404, detail="Level not found")

            level_number = int(level_row[1])
            expected_key = normalize_key(level_row[2] or "")
            reward = int(level_row[3] or 0)

            if not expected_key:
                raise HTTPException(status_code=500, detail="Level key not configured")

            if entered != expected_key:
                return SubmitKeyResponse(
                    correct=False,
                    message="Incorrect key. Try again.",
                    reward_credits_awarded=0,
                    new_credits=current_credits,
                    keys_collected=0,
                    completed_levels=0,
                    next_level_id=None,
                )

            # Check if already completed (to avoid double rewards)
            cur.execute(
                "SELECT completed FROM user_progress WHERE user_id = ? AND level_id = ?",
                (req.user_id, level_id),
            )
            progress_row = cur.fetchone()
            already_completed = bool(progress_row and progress_row[0])

            # Mark completed
            cur.execute(
                """
                INSERT INTO user_progress (user_id, level_id, completed, score, completed_at)
                VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, level_id) DO UPDATE SET
                    completed = 1,
                    completed_at = CURRENT_TIMESTAMP
                """,
                (req.user_id, level_id),
            )

            awarded = 0
            new_credits = current_credits
            if not already_completed and reward > 0:
                awarded = reward
                new_credits = current_credits + reward
                cur.execute(
                    "UPDATE users SET credits = ? WHERE id = ?",
                    (new_credits, req.user_id),
                )

            # Count completed levels
            cur.execute(
                "SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1",
                (req.user_id,),
            )
            completed_count = int(cur.fetchone()[0] or 0)

            # Determine next level id
            cur.execute(
                "SELECT id FROM levels WHERE level_number = ?",
                (level_number + 1,),
            )
            next_row = cur.fetchone()
            next_level_id = int(next_row[0]) if next_row else None

            conn.commit()

            return SubmitKeyResponse(
                correct=True,
                message="Correct! Key accepted.",
                reward_credits_awarded=awarded,
                new_credits=new_credits,
                keys_collected=completed_count,
                completed_levels=completed_count,
                next_level_id=next_level_id,
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/levels/{level_id}/dialogue", response_model=list[DialogueLine])
def get_level_dialogue(level_id: int):
    """Return ordered dialogue lines for a given level."""
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT d.id, d.sequence, d.speaker, d.text, d.gives_key,
                       c.name, c.title
                FROM dialogues d
                JOIN characters c ON d.character_id = c.id
                WHERE d.level_id = ?
                ORDER BY d.sequence
                """,
                (level_id,),
            )
            rows = cur.fetchall()
            if not rows:
                raise HTTPException(status_code=404, detail="No dialogue for this level")

            return [
                DialogueLine(
                    id=row[0],
                    sequence=row[1],
                    speaker=row[2],
                    text=row[3],
                    gives_key=bool(row[4]),
                    character_name=row[5],
                    character_title=row[6],
                )
                for row in rows
            ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/levels/{level_id}/complete")
def complete_level(level_id: int, req: CompleteLevelRequest):
    """Mark a level as completed for a user and return simple progress info."""
    try:
        with get_conn() as conn:
            cur = conn.cursor()

            # Ensure level exists
            cur.execute("SELECT id FROM levels WHERE id = ?", (level_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Level not found")

            # Upsert user_progress row
            cur.execute(
                """
                INSERT INTO user_progress (user_id, level_id, completed, score, completed_at)
                VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, level_id) DO UPDATE SET
                    completed = 1,
                    completed_at = CURRENT_TIMESTAMP
                """,
                (req.user_id, level_id),
            )

            # Calculate how many levels this user has completed (keys collected)
            cur.execute(
                "SELECT COUNT(*) FROM user_progress WHERE user_id = ? AND completed = 1",
                (req.user_id,),
            )
            completed_count = cur.fetchone()[0] or 0

            conn.commit()

            return {
                "user_id": req.user_id,
                "completed_levels": completed_count,
                "keys_collected": completed_count,
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{user_id}/progress")
def get_user_progress(user_id: int):
    """Return per-level completion status for a given user."""
    try:
        with get_conn() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT l.id, l.level_number, l.title,
                       COALESCE(up.completed, 0) as completed
                FROM levels l
                LEFT JOIN user_progress up
                    ON up.level_id = l.id AND up.user_id = ?
                ORDER BY l.level_number
                """,
                (user_id,),
            )
            rows = cur.fetchall()

            levels = [
                {
                    "id": row[0],
                    "level_number": row[1],
                    "title": row[2],
                    "completed": bool(row[3]),
                }
                for row in rows
            ]

            completed_count = sum(1 for r in levels if r["completed"])

            # Unlock next level: completed + 1 (always at least 1)
            next_unlocked_level_number = max(1, min(len(levels), completed_count + 1))

            return {
                "user_id": user_id,
                "levels": levels,
                "completed_levels": completed_count,
                "keys_collected": completed_count,
                "next_unlocked_level_number": next_unlocked_level_number,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))