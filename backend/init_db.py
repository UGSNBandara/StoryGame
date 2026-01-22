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


def _ensure_column(cursor: sqlite3.Cursor, table: str, column: str, ddl: str) -> None:
    cursor.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cursor.fetchall()}  # row[1] = name
    if column not in existing:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {ddl}")

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

    # Add gameplay columns to levels (idempotent)
    _ensure_column(cursor, "levels", "key_code", "key_code TEXT")
    _ensure_column(cursor, "levels", "reward_credits", "reward_credits INTEGER DEFAULT 10")

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

    # Characters table (NPCs the player can talk to)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT,
            level_id INTEGER NOT NULL,
            FOREIGN KEY (level_id) REFERENCES levels (id)
        )
    """)

    # Dialogues table (simple ordered conversation lines per level/character)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dialogues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level_id INTEGER NOT NULL,
            character_id INTEGER NOT NULL,
            sequence INTEGER NOT NULL,
            speaker TEXT NOT NULL,
            text TEXT NOT NULL,
            gives_key BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (level_id) REFERENCES levels (id),
            FOREIGN KEY (character_id) REFERENCES characters (id)
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

    # Set key codes + rewards (only if not already set)
    keys_and_rewards = {
        1: ("HUMAN", 25),
        2: ("NILE", 25),
        3: ("PHARAOH", 30),
        4: ("KARNAK", 30),
        5: ("CHRONOS", 50),
    }
    for level_number, (key_code, reward) in keys_and_rewards.items():
        cursor.execute(
            """
            UPDATE levels
            SET key_code = COALESCE(NULLIF(key_code, ''), ?),
                reward_credits = COALESCE(reward_credits, ?)
            WHERE level_number = ?
            """,
            (key_code, reward, level_number),
        )

    # Map level_number -> level.id so we can seed characters & dialogue reliably
    cursor.execute("SELECT id, level_number FROM levels")
    level_rows = cursor.fetchall()
    level_id_by_number = {row[1]: row[0] for row in level_rows}

    def seed_level(level_number: int, character_name: str, character_title: str, dialogue_lines: list[tuple[int, str, str, int]]):
        level_id = level_id_by_number.get(level_number)
        if level_id is None:
            return

        cursor.execute(
            "SELECT id FROM characters WHERE level_id = ? AND name = ?",
            (level_id, character_name),
        )
        row = cursor.fetchone()
        if row:
            character_id = row[0]
        else:
            cursor.execute(
                "INSERT INTO characters (name, title, level_id) VALUES (?, ?, ?)",
                (character_name, character_title, level_id),
            )
            character_id = cursor.lastrowid

        cursor.execute("SELECT COUNT(*) FROM dialogues WHERE level_id = ?", (level_id,))
        if (cursor.fetchone()[0] or 0) > 0:
            return

        cursor.executemany(
            """
            INSERT INTO dialogues (level_id, character_id, sequence, speaker, text, gives_key)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [
                (level_id, character_id, seq, speaker, text, gives_key)
                for (seq, speaker, text, gives_key) in dialogue_lines
            ],
        )

    # Level 1: Sphinx
    seed_level(
        1,
        "Sphinx Guardian",
        "Riddle Keeper of Giza",
        [
            (1, "npc", "Traveler, you stand before the pyramids. Speak your purpose.", 0),
            (2, "player", "I am stranded in time. I need the first sacred key.", 0),
            (3, "npc", "Then earn it. My riddle guards the path.", 0),
            (4, "npc", "What walks on four legs in the morning, two at noon, and three in the evening?", 0),
            (5, "player", "A HUMAN: crawling, walking, then using a staff.", 0),
            (6, "npc", "Correct. Remember the answer. It is the key word.", 1),
        ],
    )

    # Level 2: Nile
    seed_level(
        2,
        "River Priestess",
        "Keeper of the Flow",
        [
            (1, "npc", "The river decides who may pass.", 0),
            (2, "player", "I seek the second key.", 0),
            (3, "npc", "Then listen. The key is the name of the lifeline itself.", 0),
            (4, "npc", "It feeds the fields, it carries the boats, it shapes the kingdom.", 0),
            (5, "player", "You mean the NILE.", 0),
            (6, "npc", "Hold that word. You will need to enter it to claim the key.", 1),
        ],
    )

    # Level 3: Valley of Kings
    seed_level(
        3,
        "Tomb Scribe",
        "Reader of Stone",
        [
            (1, "npc", "These walls speak in silence.", 0),
            (2, "player", "I need the third key. What is your hint?", 0),
            (3, "npc", "The ruler of rulers. Say the title carried through dynasties.", 0),
            (4, "npc", "Not a name. A rank.", 0),
            (5, "player", "PHARAOH.", 0),
            (6, "npc", "Yes. Enter that title to unlock your key.", 1),
        ],
    )

    # Level 4: Karnak
    seed_level(
        4,
        "Obelisk Sentinel",
        "Guardian of the Temple",
        [
            (1, "npc", "The stones remember every footstep.", 0),
            (2, "player", "I want the fourth key.", 0),
            (3, "npc", "Then name this sacred place of pillars and sun.", 0),
            (4, "npc", "It begins with the temple you stand within.", 0),
            (5, "player", "KARNAK.", 0),
            (6, "npc", "Good. Prove it by entering the word.", 1),
        ],
    )

    # Level 5: Final
    seed_level(
        5,
        "Time Warden",
        "Keeper of the Final Seal",
        [
            (1, "npc", "Five keys. One escape.", 0),
            (2, "player", "This is the last chamber. I need the final key.", 0),
            (3, "npc", "Then speak the name of time itself  not hours, but the ancient force.", 0),
            (4, "npc", "A word older than empires.", 0),
            (5, "player", "CHRONOS.", 0),
            (6, "npc", "Enter it, and the time machine will awaken.", 1),
        ],
    )

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