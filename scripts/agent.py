#!/usr/bin/env python3
"""Portfolio Live Agent — fetches live metrics and writes portfolio.json."""

import argparse
import copy
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

PORTFOLIO_PATH = Path(__file__).parent.parent / "portfolio.json"
CURRENT_PROJECTS_PATH = Path(__file__).parent.parent / "_data" / "current-projects.json"

GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
SEMANTIC_SCHOLAR_URL = "https://api.semanticscholar.org/graph/v1/paper"
ROBOFLOW_API_URL = "https://api.roboflow.com"


def _calc_streak(weeks: list) -> int:
    """Calculate current consecutive-day commit streak from contribution calendar weeks."""
    days = [day for week in weeks for day in week["contributionDays"]]
    days.sort(key=lambda d: d["date"], reverse=True)

    today = datetime.now(timezone.utc).date().isoformat()
    # Allow today to not yet have contributions (streak looks at yesterday as anchor)
    streak = 0
    for day in days:
        if day["date"] > today:
            continue
        if day["contributionCount"] > 0:
            streak += 1
        else:
            break
    return streak


def _contributions_last_30_days(weeks: list) -> int:
    """Sum contribution counts for the most recent 30 calendar days."""
    days = [day for week in weeks for day in week["contributionDays"]]
    days.sort(key=lambda d: d["date"], reverse=True)
    return sum(d["contributionCount"] for d in days[:30])


def fetch_github(token: str) -> dict | None:
    """Fetch pinned repos, recent repos, commit streak, and 30-day contributions."""
    if not token:
        print("[GITHUB]        ✗  No token provided (set PORTFOLIO_GH_PAT)")
        return None
    try:
        query = """
        query {
          viewer {
            recentRepos: repositories(
              first: 5
              orderBy: {field: PUSHED_AT, direction: DESC}
              isFork: false
              privacy: PUBLIC
            ) {
              nodes {
                name
                description
                url
                primaryLanguage { name }
                stargazerCount
                pushedAt
              }
            }
            allRepos: repositories(first: 1) {
              totalCount
            }
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  primaryLanguage { name }
                  stargazerCount
                  pushedAt
                }
              }
            }
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
        """
        resp = requests.post(
            GITHUB_GRAPHQL_URL,
            json={"query": query},
            headers={"Authorization": f"Bearer {token}"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        if "errors" in data:
            print(f"[GITHUB]        ✗  GraphQL errors: {data['errors']}")
            return None

        viewer = data["data"]["viewer"]
        weeks = viewer["contributionsCollection"]["contributionCalendar"]["weeks"]

        def _repo_node(node: dict) -> dict:
            return {
                "name": node["name"],
                "description": node.get("description") or "",
                "url": node["url"],
                "primary_language": (node.get("primaryLanguage") or {}).get("name"),
                "stars": node["stargazerCount"],
                "pushed_at": node["pushedAt"],
            }

        pinned = [_repo_node(n) for n in viewer["pinnedItems"]["nodes"]]
        recent = [_repo_node(n) for n in viewer["recentRepos"]["nodes"]]
        total_repos = viewer["allRepos"]["totalCount"]
        streak = _calc_streak(weeks)
        contributions_30d = _contributions_last_30_days(weeks)

        print(
            f"[GITHUB]        ✓  commit_streak={streak}, "
            f"contributions_30d={contributions_30d}, total_repos={total_repos}"
        )
        return {
            "commit_streak": streak,
            "contributions_30d": contributions_30d,
            "total_repos": total_repos,
            "pinned_repos": pinned,
            "recent_repos": recent,
        }
    except Exception as e:
        print(f"[GITHUB]        ✗  {type(e).__name__}: {e}")
        return None


def fetch_semantic_scholar(paper_id: str) -> dict | None:
    """Fetch citation count for the AIES-26 paper."""
    if not paper_id or paper_id == "[PLACEHOLDER]":
        print("[SEMANTIC]      ✗  paper_id is a placeholder — skipping")
        return None
    try:
        resp = requests.get(
            f"{SEMANTIC_SCHOLAR_URL}/{paper_id}",
            params={"fields": "citationCount"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        count = data.get("citationCount", 0)
        print(f"[SEMANTIC]      ✓  citation_count={count}")
        return {"citation_count": count}
    except Exception as e:
        print(f"[SEMANTIC]      ✗  {type(e).__name__}: {e}")
        return None


def fetch_roboflow(api_key: str, workspace: str, project: str) -> dict | None:
    """Fetch latest model version metrics from Roboflow."""
    if not api_key:
        print("[ROBOFLOW]      ✗  No API key provided (set ROBOFLOW_API_KEY)")
        return None
    if workspace == "[PLACEHOLDER]" or project == "[PLACEHOLDER]":
        print("[ROBOFLOW]      ✗  workspace/project are placeholders — skipping")
        return None
    try:
        resp = requests.get(
            f"{ROBOFLOW_API_URL}/{workspace}/{project}",
            params={"api_key": api_key},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        versions = data.get("versions", [])
        if not versions:
            print("[ROBOFLOW]      ✗  No trained versions found")
            return None

        latest = versions[0]
        model = latest.get("model", {})
        map_val = model.get("map")
        precision = model.get("precision")
        recall = model.get("recall")
        version = latest.get("id", "").split("/")[-1] if latest.get("id") else None

        print(f"[ROBOFLOW]      ✓  mAP={map_val}, version={version}")
        return {
            "model_version": version,
            "mAP": map_val,
            "precision": precision,
            "recall": recall,
        }
    except Exception as e:
        print(f"[ROBOFLOW]      ✗  {type(e).__name__}: {e}")
        return None


def fetch_current_projects(data_path: Path) -> list | None:
    """Load and validate manually-maintained current-projects.json."""
    try:
        import jsonschema

        schema = {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["project_name", "one_liner", "status", "last_updated"],
                "properties": {
                    "project_name": {"type": "string"},
                    "one_liner": {"type": "string"},
                    "status": {"type": "string", "enum": ["active", "paused", "completed"]},
                    "last_updated": {"type": "string"},
                },
                "additionalProperties": False,
            },
        }

        data = json.loads(data_path.read_text())
        jsonschema.validate(data, schema)
        count = len(data)
        active = sum(1 for p in data if p.get("status") == "active")
        print(f"[CURR_PROJECTS] ✓  {count} projects ({active} active)")
        return data
    except Exception as e:
        print(f"[CURR_PROJECTS] ✗  {type(e).__name__}: {e}")
        return None


def merge_with_existing(baseline: dict, results: dict) -> dict:
    """Merge fetched updates into existing portfolio data.

    Failed sources (None values in results) retain their last-known-good values.
    """
    merged = copy.deepcopy(baseline)

    if results.get("github") is not None:
        merged["github"] = results["github"]

    if results.get("semantic_scholar") is not None:
        merged.setdefault("research", {}).setdefault("aies26", {})
        merged["research"]["aies26"].update(results["semantic_scholar"])

    if results.get("roboflow") is not None:
        merged.setdefault("projects", {})["ftc_analyzer"] = results["roboflow"]

    if results.get("current_projects") is not None:
        merged["current_projects"] = results["current_projects"]

    merged["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return merged


def write_portfolio(data: dict, path: Path) -> bool:
    """Write portfolio.json; return True if content changed, False otherwise."""
    serialized = json.dumps(data, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if path.read_text() == serialized:
            return False
    path.write_text(serialized)
    return True


def main(dry_run: bool = False) -> None:
    token = os.environ.get("PORTFOLIO_GH_PAT", "")
    roboflow_key = os.environ.get("ROBOFLOW_API_KEY", "")
    roboflow_workspace = os.environ.get("ROBOFLOW_WORKSPACE", "[PLACEHOLDER]")
    roboflow_project = os.environ.get("ROBOFLOW_PROJECT", "[PLACEHOLDER]")

    existing = json.loads(PORTFOLIO_PATH.read_text()) if PORTFOLIO_PATH.exists() else {}

    paper_id = (
        existing.get("research", {}).get("aies26", {}).get("paper_id", "[PLACEHOLDER]")
    )

    results = {
        "github": fetch_github(token),
        "semantic_scholar": fetch_semantic_scholar(paper_id),
        "roboflow": fetch_roboflow(roboflow_key, roboflow_workspace, roboflow_project),
        "current_projects": fetch_current_projects(CURRENT_PROJECTS_PATH),
    }

    merged = merge_with_existing(existing, results)

    sources_ok = sum(1 for v in results.values() if v is not None)
    sources_total = len(results)
    print(f"\nFetch summary: {sources_ok}/{sources_total} sources succeeded")

    if dry_run:
        print("\n--- DRY RUN: candidate portfolio.json ---")
        print(json.dumps(merged, indent=2, sort_keys=True))
        sys.exit(0)

    changed = write_portfolio(merged, PORTFOLIO_PATH)
    if changed:
        print("portfolio.json updated.")
    else:
        print("portfolio.json unchanged — no commit needed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Portfolio Live Agent")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print candidate JSON to stdout without writing any file.",
    )
    args = parser.parse_args()
    main(dry_run=args.dry_run)
