import os
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# SQLite database path
DATABASE_PATH = os.getenv("DATABASE_URL", "storygame.db")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the User Management API"}

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