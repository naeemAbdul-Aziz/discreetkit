# Database change management

This repository uses Supabase migrations as the single source of truth for schema changes.

- Canonical change log: `supabase/migrations/`
- Snapshot (reference only): `schema.sql` – generated; do not edit by hand
- One-off/maintenance scripts: put under `supabase/sql/` (not applied automatically)

## Workflow

1) Create a migration

Use Supabase CLI to diff against your remote project or local DB and create a new migration.

```powershell
# Link once (you'll be prompted to choose your project)
supabase link --project-ref <your-project-ref>

# Generate a migration based on differences (edit name as needed)
supabase db diff -f add_orders_index

# OR create an empty migration and write SQL manually
supabase migration new add_orders_index
```

2) Apply migration

```powershell
# Push all pending migrations to the remote database
supabase db push
```

3) Snapshot (optional, for code review)

Regenerate `schema.sql` to reflect the current DB state. Commit changes for reviewers.

```powershell
supabase db dump --schema-only --file schema.sql
```

> Tip: Do not hand-edit `schema.sql`. Always regenerate.

## Seeds and scripts

- Put one-off scripts under `supabase/sql/` with clear names, e.g. `scripts/2025-11-backfill-status.sql`.
- Do not place ad-hoc SQL files at repo root.
- Avoid using scripts for DDL—prefer migrations so they are applied consistently across environments.

## Squashing (optional)

Over time you may squash older migrations to a baseline to reduce deploy time:

- Freeze a release; export the full schema snapshot.
- Create a new baseline migration from the snapshot; remove prior migrations post-release.
- Coordinate carefully to avoid drift across environments.

## Environments

- Local: you can run `supabase start` for local Postgres or diff against remote.
- Remote: `supabase db push` applies migrations to your linked project.

## Policies

- All DDL must go through migrations.
- `schema.sql` is for reference only.
- Never commit secrets; use environment variables.
