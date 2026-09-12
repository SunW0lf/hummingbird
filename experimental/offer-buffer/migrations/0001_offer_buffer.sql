PRAGMA foreign_keys = ON;

CREATE TABLE experimental_offers (
  id TEXT PRIMARY KEY,
  body TEXT,
  reference_url TEXT,
  question_id TEXT,
  receipt_hash TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'received'
    CHECK (state IN ('received','grouped','synthesized','deferred','surfaced','withdrawn','expired')),
  state_reason TEXT,
  cluster_id TEXT,
  synthesis_ref TEXT,
  resulting_record_id TEXT,
  content_sha256 TEXT,
  received_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  withdrawn_at TEXT,
  CHECK (body IS NULL OR (length(body) BETWEEN 1 AND 4000)),
  CHECK (reference_url IS NULL OR length(reference_url) <= 2048),
  CHECK (question_id IS NULL OR length(question_id) <= 120),
  CHECK (length(receipt_hash) = 64),
  CHECK (state_reason IS NULL OR length(state_reason) <= 512),
  CHECK (content_sha256 IS NULL OR length(content_sha256) = 64),
  CHECK (
    state != 'withdrawn'
    OR (body IS NULL AND reference_url IS NULL AND content_sha256 IS NULL)
  )
);

CREATE INDEX experimental_offers_state_idx
  ON experimental_offers(state, received_at);

CREATE INDEX experimental_offers_expiry_idx
  ON experimental_offers(expires_at);

CREATE INDEX experimental_offers_question_idx
  ON experimental_offers(question_id, received_at)
  WHERE question_id IS NOT NULL;

CREATE TABLE offer_clusters (
  id TEXT PRIMARY KEY,
  working_summary TEXT,
  state TEXT NOT NULL DEFAULT 'active'
    CHECK (state IN ('active','synthesized','closed','expired')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  CHECK (working_summary IS NULL OR length(working_summary) <= 4000)
);

CREATE TABLE offer_cluster_members (
  cluster_id TEXT NOT NULL REFERENCES offer_clusters(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL REFERENCES experimental_offers(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (cluster_id, offer_id)
);

CREATE INDEX offer_cluster_members_offer_idx
  ON offer_cluster_members(offer_id);
