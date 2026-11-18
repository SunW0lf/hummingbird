#!/usr/bin/env python3
"""Exercise the actual offer SQL against the pilot migration in SQLite."""
import pathlib
import re
import sqlite3

root = pathlib.Path(__file__).resolve().parents[1]
source = (root / "functions/offer/index.js").read_text()
schema = (root / "experimental/offer-buffer/migrations/0001_offer_buffer.sql").read_text()
statements = re.findall(r"`([^`]+)`", source, re.DOTALL)


def sql(prefix):
    matches = [s for s in statements if s.lstrip().startswith(prefix)]
    assert len(matches) == 1, (prefix, len(matches))
    return matches[0]


insert = sql("INSERT INTO experimental_offers")
cluster_insert = sql("INSERT OR IGNORE INTO offer_clusters")
cluster_extend = sql("UPDATE offer_clusters")
group = sql("UPDATE experimental_offers SET state = 'grouped'")
membership = sql("INSERT OR IGNORE INTO offer_cluster_members")
now = "2026-09-12T00:00:00.000Z"
early = "2026-10-12T00:00:00.000Z"
late = "2026-10-13T00:00:00.000Z"
content_hash = "b" * 64
cluster_id = "exact:" + content_hash


def db():
    conn = sqlite3.connect(":memory:")
    conn.executescript(schema)
    return conn


def add(conn, identifier, expiry=early, state="received"):
    conn.execute(
        "INSERT INTO experimental_offers "
        "(id, body, receipt_hash, state, content_sha256, received_at, expires_at) "
        "VALUES (?, 'same text', ?, ?, ?, ?, ?)",
        (identifier, f"{int(identifier):064x}", state, content_hash, now, expiry),
    )


conn = db()
for i in range(249):
    add(conn, str(i + 1))
args = ("new", "same text", None, None, "f" * 64, content_hash, now, late, now, 250)
before = conn.total_changes
conn.execute(insert, args)
assert conn.total_changes - before == 1
before = conn.total_changes
conn.execute(insert, ("overflow", *args[1:]))
assert conn.total_changes - before == 0, "conditional insert must enforce capacity"
assert conn.execute("SELECT COUNT(*) FROM experimental_offers").fetchone()[0] == 250
conn.close()

conn = db()
add(conn, "1")
add(conn, "2", late)
add(conn, "3", late, "deferred")
conn.execute(cluster_insert, (cluster_id, now, now, early))
conn.execute(cluster_extend, (now, late, cluster_id))
conn.execute(group, (cluster_id, content_hash, now, cluster_id))
conn.execute(membership, (cluster_id, now, cluster_id, now))
assert conn.execute("SELECT state FROM experimental_offers WHERE id='3'").fetchone()[0] == "deferred"
assert conn.execute("SELECT COUNT(*) FROM offer_cluster_members").fetchone()[0] == 2
assert conn.execute("SELECT expires_at FROM offer_clusters").fetchone()[0] == late
conn.close()

print("PASS: offer SQL enforces capacity and links exact duplicates without rewriting reviewed state")
