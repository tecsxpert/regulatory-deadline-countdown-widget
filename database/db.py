import sqlite3
import os

DB_PATH = "data/history.db"


def get_connection():
    os.makedirs("data", exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            days_left INTEGER NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def save_deadline(date, days_left, status, priority):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO history (date, days_left, status, priority)
        VALUES (?, ?, ?, ?)
    """, (date, days_left, status, priority))

    conn.commit()
    conn.close()


def get_history():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT date, days_left, status, priority
        FROM history
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    history = []

    for row in rows:
        history.append({
            "date": row[0],
            "days_left": row[1],
            "status": row[2],
            "priority": row[3]
        })

    return history


def search_history(priority=None, start=None, end=None, page=1, limit=5):
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT date, days_left, status, priority
        FROM history
        WHERE 1=1
    """

    params = []

    if priority:
        query += " AND priority = ?"
        params.append(priority)

    if start and end:
        query += " AND date BETWEEN ? AND ?"
        params.extend([start, end])

    offset = (page - 1) * limit

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)

    rows = cursor.fetchall()
    conn.close()

    result = []

    for row in rows:
        result.append({
            "date": row[0],
            "days_left": row[1],
            "status": row[2],
            "priority": row[3]
        })

    return result


def get_analytics():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM history")
    total = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM history WHERE status = 'upcoming'"
    )
    upcoming = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM history WHERE status = 'due today'"
    )
    due_today = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM history WHERE status = 'overdue'"
    )
    overdue = cursor.fetchone()[0]

    conn.close()

    return {
        "total": total,
        "upcoming": upcoming,
        "due_today": due_today,
        "overdue": overdue
    }