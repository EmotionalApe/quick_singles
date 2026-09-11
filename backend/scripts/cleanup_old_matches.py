#!/usr/bin/env python3
"""
CLI Script to clean up old cricket matches and their associated events from the database.

Usage examples:
    # Delete matches older than 24 hours:
    python scripts/cleanup_old_matches.py --hours 24

    # Delete matches older than 7 days (dry run to preview):
    python scripts/cleanup_old_matches.py --days 7 --dry-run

    # Delete only COMPLETED matches older than 48 hours:
    python scripts/cleanup_old_matches.py --hours 48 --only-completed
"""

import argparse
import sys
from datetime import timedelta
from pathlib import Path

# Ensure backend root is on sys.path when running from scripts/ directory
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.database import SessionLocal
from app.services.cleanup import cleanup_old_matches


def main():
    parser = argparse.ArgumentParser(
        description="Clean up old matches and events from the database."
    )
    parser.add_argument(
        "--hours",
        type=float,
        default=None,
        help="Delete matches older than this many hours (e.g. --hours 24)",
    )
    parser.add_argument(
        "--days",
        type=float,
        default=None,
        help="Delete matches older than this many days (e.g. --days 7)",
    )
    parser.add_argument(
        "--only-completed",
        action="store_true",
        help="Only delete matches that have status == 'COMPLETED'",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview how many records would be deleted without actually deleting them",
    )

    args = parser.parse_args()

    # Calculate total duration
    total_hours = 0.0
    if args.days is not None:
        total_hours += args.days * 24.0
    if args.hours is not None:
        total_hours += args.hours

    # Default to 24 hours if neither is specified
    if total_hours <= 0:
        total_hours = 24.0
        print("[INFO] No timeframe specified. Defaulting to 24 hours.")

    older_than = timedelta(hours=total_hours)

    print("=" * 60)
    print("Database Cleanup Job")
    print(f"Time threshold: Older than {total_hours:g} hour(s) ({older_than})")
    print(f"Filter mode:    {'Only COMPLETED matches' if args.only_completed else 'All matches'}")
    print(f"Dry run mode:   {args.dry_run}")
    print("=" * 60)

    db = SessionLocal()
    try:
        result = cleanup_old_matches(
            db=db,
            older_than=older_than,
            only_completed=args.only_completed,
            dry_run=args.dry_run,
        )

        print("\nResults:")
        print(f"  Cutoff Timestamp:     {result['cutoff']} UTC")
        print(f"  Matches Found:        {result['matches_found']}")

        if result["dry_run"]:
            print(f"  Matches would delete: {result['would_delete_matches']}")
            print(f"  Events would delete:  {result['would_delete_events']}")
            print("\n[DRY RUN COMPLETE] No records were deleted.")
        else:
            print(f"  Matches Deleted:      {result['deleted_matches']}")
            print(f"  Events Deleted:       {result['deleted_events']}")
            print("\n[CLEANUP COMPLETE] Database successfully cleaned up.")

    except Exception as e:
        print(f"\n[ERROR] Cleanup failed: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
