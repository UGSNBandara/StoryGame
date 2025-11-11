#!/usr/bin/env python3
"""
Database initialization script for SQLite
Run this script to set up the initial database schema
"""

import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_PATH = os.getenv("DATABASE_URL", "storygame.db")

def init_database():
    """Initialize the SQLite database with required tables"""

    print(f"Initializing database at: {DATABASE_PATH}")

    # Connect to database (creates file if it doesn't exist)
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            credits INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create levels table (for game levels)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS levels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level_number INTEGER UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create user_progress table (for tracking game progress)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            level_id INTEGER NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            score INTEGER DEFAULT 0,
            completed_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (level_id) REFERENCES levels (id),
            UNIQUE(user_id, level_id)
        )
    """)

    # Insert some sample levels
    sample_levels = [
        (1, "The Pyramids of Giza", "Enter the ancient pyramids and solve the riddle of the Sphinx to find your first sacred key."),
        (2, "The Nile River", "Navigate the mighty Nile and uncover the secrets hidden in the river's ancient temples."),
        (3, "The Valley of Kings", "Explore the tombs of pharaohs and decipher hieroglyphs to reveal the path forward."),
        (4, "The Temple of Karnak", "Traverse the grand temple complex and solve the puzzle of the sacred obelisks."),
        (5, "The Final Chamber", "Face the ultimate challenge in the hidden chamber to repair your time machine.")
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO levels (level_number, title, description)
        VALUES (?, ?, ?)
    """, sample_levels)

    # Commit changes
    conn.commit()

    # Verify tables were created
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Created tables: {[table[0] for table in tables]}")

    # Show sample data
    cursor.execute("SELECT COUNT(*) FROM levels")
    level_count = cursor.fetchone()[0]
    print(f"Sample levels inserted: {level_count}")

    conn.close()
    print("Database initialization complete!")

if __name__ == "__main__":
    init_database()