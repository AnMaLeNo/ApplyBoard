import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from app.llm import create_llm_client_from_env
from app.nodes.analyze_offer import analyze_offer

REPO_ROOT = Path(__file__).resolve().parents[2]

OFFER_COLUMNS = [
    "id",
    "url",
    "title",
    "company",
    "short_description",
    "full_description",
    "salary",
    "contract_type",
    "email",
    "address",
    "availability",
    "campus",
    "expertises",
    "target",
    "created_at",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze real offers stored in the local Postgres database."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--offer-id", type=int, help="Analyze one offer by ID.")
    group.add_argument("--latest", action="store_true", help="Analyze the latest offers.")
    parser.add_argument(
        "--limit",
        type=int,
        default=1,
        help="Number of latest offers to analyze when using --latest.",
    )
    return parser.parse_args()


def run_psql_json(sql: str) -> list[dict[str, Any]]:
    command = [
        "docker",
        "compose",
        "exec",
        "-T",
        "database",
        "psql",
        "-U",
        "admin",
        "-d",
        "offers_db",
        "-t",
        "-A",
        "-c",
        sql,
    ]
    completed = subprocess.run(
        command,
        cwd=REPO_ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    output = completed.stdout.strip()
    if not output:
        return []
    parsed = json.loads(output)
    if not isinstance(parsed, list):
        raise ValueError("Expected the SQL query to return a JSON array.")
    return parsed


def build_sql(args: argparse.Namespace) -> str:
    columns = ", ".join(OFFER_COLUMNS)
    if args.offer_id is not None:
        where = f"WHERE id = {args.offer_id}"
        limit = 1
    else:
        where = ""
        limit = max(1, min(args.limit, 20))

    return f"""
      SELECT COALESCE(json_agg(row_to_json(offer_rows)), '[]'::json)
      FROM (
        SELECT {columns}
        FROM offers
        {where}
        ORDER BY created_at DESC
        LIMIT {limit}
      ) AS offer_rows;
    """


async def main() -> None:
    args = parse_args()
    offers = run_psql_json(build_sql(args))
    if not offers:
        print(json.dumps({"offers": [], "analyses": []}, ensure_ascii=False, indent=2))
        return

    llm = create_llm_client_from_env()
    analyses = []
    for offer in offers:
        analysis = await analyze_offer(offer, llm)
        analyses.append(
            {
                "offer": {
                    "id": offer.get("id"),
                    "title": offer.get("title"),
                    "company": offer.get("company"),
                },
                "offer_analysis": analysis.model_dump(mode="json"),
            }
        )

    print(json.dumps({"analyses": analyses}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
