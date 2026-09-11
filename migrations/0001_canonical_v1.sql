PRAGMA foreign_keys = ON;

CREATE TABLE canonical_objects (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contribution', 'proposal', 'need', 'event')),
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  created_at TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft', 'published', 'corrected', 'superseded', 'withdrawn', 'archived')),
  content_json TEXT NOT NULL CHECK (json_valid(content_json)),
  attribution_json TEXT CHECK (attribution_json IS NULL OR json_valid(attribution_json)),
  provenance_json TEXT CHECK (provenance_json IS NULL OR json_valid(provenance_json)),
  publication_json TEXT CHECK (publication_json IS NULL OR json_valid(publication_json)),
  event_type TEXT,
  subject_ref TEXT,
  CHECK (
    type != 'event'
    OR (event_type IS NOT NULL AND length(event_type) > 0
        AND subject_ref IS NOT NULL AND length(subject_ref) > 0
        AND publication_json IS NOT NULL)
  )
);

CREATE TABLE canonical_relationships (
  source_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
  type TEXT NOT NULL CHECK (type IN (
    'responds_to',
    'references',
    'supports',
    'challenges',
    'supersedes',
    'duplicates',
    'derives_from',
    'summarizes',
    'implements'
  )),
  target_ref TEXT NOT NULL CHECK (length(target_ref) > 0),
  PRIMARY KEY (source_id, ordinal),
  FOREIGN KEY (source_id) REFERENCES canonical_objects(id) ON DELETE CASCADE
);

CREATE INDEX canonical_objects_type_state_idx
  ON canonical_objects(type, state);

CREATE INDEX canonical_relationships_target_idx
  ON canonical_relationships(target_ref, type);
