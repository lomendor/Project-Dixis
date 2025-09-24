#!/usr/bin/env python3
"""
Generate a concise Markdown report of CI failures in the last 7 days
related to cart/checkout flows and selectors (product-card, cart-item)
for the current GitHub repo, using public GitHub Actions APIs.

Writes: docs/reports/CI-CART-CHECKOUT-PATTERNS.md
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple
import html as htmlmod


GITHUB_API = "https://api.github.com"


def sh(cmd: str) -> str:
    import subprocess
    out = subprocess.check_output(cmd, shell=True, text=True)
    return out.strip()


def http_json(url: str) -> Any:
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "ci-cart-checkout-report/1.0",
    })
    with urllib.request.urlopen(req, timeout=30) as rsp:
        data = rsp.read()
        return json.loads(data.decode("utf-8"))


def get_owner_repo() -> Tuple[str, str]:
    try:
        remote = sh("git remote get-url origin")
    except Exception:
        print("Unable to determine git remote origin", file=sys.stderr)
        sys.exit(1)
    # supports https and ssh
    m = re.search(r"github.com[:/](.+?)\.git$", remote)
    if not m:
        print(f"Unexpected origin URL: {remote}", file=sys.stderr)
        sys.exit(1)
    full = m.group(1)
    owner, repo = full.split("/", 1)
    return owner, repo


def iso_to_dt(s: str) -> dt.datetime:
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(dt.timezone.utc)


KEYWORDS = [
    "cart",
    "checkout",
    "product-card",
    "cart-item",
]


def contains_keywords(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in KEYWORDS)


def classify_failure(text: str) -> str:
    t = text.lower()
    # API failures
    if (
        re.search(r"\b(5\d\d|4\d\d)\b", t) and ("fetch" in t or "response" in t or "http" in t)
    ) or any(x in t for x in [
        "econnrefused",
        "econnreset",
        "etimedout",
        "connection refused",
        "network error",
        "net::err_",
        "socket hang up",
        "bad gateway",
        "service unavailable",
        "internal server error",
        "failed to fetch",
        "timeout while fetching",
    ]):
        return "API failures"

    # Test selector issues
    if any(x in t for x in [
        "strict mode violation",
        "selector resolved to",
        "unknown engine",
        "invalid selector",
        "data-testid",
        "getbytestid",
        "getbyrole(",
        "not found matching selector",
        "unknown selector",
        "matches more than one element",
        ".product-card",
        ".cart-item",
        "[data-testid=\"product-card\"]",
        "[data-testid=\"cart-item\"]",
    ]):
        return "Test selector issues"

    # UI rendering failures (timeouts / not visible / dom issues)
    if any(x in t for x in [
        "tobevisible",
        "tohavetext",
        "element is not attached",
        "not visible",
        "timeout",
        "waiting for locator",
        "waitforselector",
        "evaluation failed",
        "hydration failed",
        "reading '",
    ]):
        return "UI rendering failures"

    # Fallback
    return "UI rendering failures"


def extract_signature(text: str) -> str:
    # Try to extract a stable signature line
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    for ln in lines:
        if ln.lower().startswith("error:"):
            return re.sub(r"\s+\(.*?\)$", "", ln)[:180]
    # Try to find a 'waiting for locator(...)' pattern
    for ln in lines:
        m = re.search(r"waiting for locator\((.+?)\)", ln, re.IGNORECASE)
        if m:
            return f"Timeout waiting for locator({m.group(1)})"
    # Use first non-empty line as fallback
    return (lines[0] if lines else text)[:180]


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={
        "User-Agent": "ci-cart-checkout-report/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=60) as rsp:
        return rsp.read().decode("utf-8", errors="ignore")


def collect_from_actions_html(owner: str, repo: str, max_pages: int = 3, max_runs: int = 60) -> List[Dict[str, Any]]:
    """Fallback collector scraping GitHub Actions HTML pages without using API rate limit."""
    runs_seen: List[str] = []
    entries: List[Dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        list_url = f"https://github.com/{owner}/{repo}/actions?page={page}"
        try:
            html = fetch_html(list_url)
        except Exception:
            continue
        run_ids = list(dict.fromkeys(re.findall(r"/" + re.escape(owner) + "/" + re.escape(repo) + r"/actions/runs/(\d+)", html)))
        for rid in run_ids:
            if rid in runs_seen:
                continue
            runs_seen.append(rid)
            run_url = f"https://github.com/{owner}/{repo}/actions/runs/{rid}"
            try:
                rhtml = fetch_html(run_url)
            except Exception:
                continue
            # Find all lines with our keywords
            cleaned_entries: List[str] = []
            for raw in rhtml.splitlines():
                raw = raw.strip()
                if not raw:
                    continue
                # Strip HTML tags and unescape entities
                plain = re.sub(r"<[^>]+>", " ", raw)
                plain = re.sub(r"\s+", " ", plain).strip()
                plain = htmlmod.unescape(plain)
                if not plain:
                    continue
                if contains_keywords(plain):
                    cleaned_entries.append(plain)
            lines = cleaned_entries
            if not lines:
                continue
            # For each matching line, produce an entry. Use basic classification.
            for ln in lines:
                cat = classify_failure(ln)
                sig = extract_signature(ln)
                entries.append({
                    "run_html": run_url,
                    "run_id": rid,
                    "created_at": "",
                    "workflow_name": "",
                    "job_name": "",
                    "category": cat,
                    "signature": sig,
                    "source": "html",
                    "line": ln[:240],
                })
            if len(runs_seen) >= max_runs:
                break
        if len(runs_seen) >= max_runs:
            break
    return entries


def main() -> None:
    owner, repo = get_owner_repo()
    base = f"{GITHUB_API}/repos/{owner}/{repo}"
    now = dt.datetime.now(dt.timezone.utc)
    cutoff = now - dt.timedelta(days=7)

    matched_entries: List[Dict[str, Any]] = []

    # First try API path, fall back to HTML scraping on 403
    try:
        runs = http_json(f"{base}/actions/runs?per_page=100").get("workflow_runs", [])
        # Filter runs: last 7 days, failed conclusion
        target_runs: List[Dict[str, Any]] = []
        for r in runs:
            created = iso_to_dt(r.get("created_at"))
            if created < cutoff:
                continue
            if r.get("conclusion") != "failure":
                continue
            name = (r.get("name") or "").lower()
            if any(x in name for x in [
                "ci pipeline",
                "frontend-e2e",
                "pull request quality gates",
                "frontend-ci",
                "nightly quality",
            ]):
                target_runs.append(r)

        rate_guard = 0
        for r in target_runs:
            check_suite_id = r.get("check_suite_id")
            if not check_suite_id:
                continue
            suite = http_json(f"{base}/check-suites/{check_suite_id}/check-runs")
            rate_guard += 1
            for cr in suite.get("check_runs", []):
                if cr.get("conclusion") != "failure":
                    continue
                cr_name = (cr.get("name") or "").lower()
                if not any(x in cr_name for x in ["e2e", "smoke", "quality", "frontend"]):
                    continue
                cr_id = cr.get("id")
                try:
                    annotations = http_json(f"{base}/check-runs/{cr_id}/annotations?per_page=100")
                    rate_guard += 1
                except urllib.error.HTTPError:
                    continue

                for a in annotations:
                    level = a.get("annotation_level")
                    title = a.get("title") or ""
                    message = a.get("message") or ""

                    if title.strip().startswith("🎭 Playwright Run Summary") and message:
                        for ln in message.splitlines():
                            if contains_keywords(ln):
                                cat = classify_failure(ln)
                                sig = extract_signature(ln)
                                matched_entries.append({
                                    "run_html": r.get("html_url"),
                                    "run_id": r.get("id"),
                                    "created_at": r.get("created_at"),
                                    "workflow_name": r.get("name"),
                                    "job_name": cr.get("name"),
                                    "category": cat,
                                    "signature": sig,
                                    "source": "summary",
                                    "line": ln.strip(),
                                })
                        continue

                    text_blob = f"{title}\n{message}"
                    if contains_keywords(text_blob):
                        cat = classify_failure(text_blob)
                        sig = extract_signature(text_blob)
                        matched_entries.append({
                            "run_html": r.get("html_url"),
                            "run_id": r.get("id"),
                            "created_at": r.get("created_at"),
                            "workflow_name": r.get("name"),
                            "job_name": cr.get("name"),
                            "category": cat,
                            "signature": sig,
                            "source": level,
                            "line": (title or message).strip(),
                        })

            if rate_guard > 45:
                time.sleep(2)
                rate_guard = 0
    except urllib.error.HTTPError as e:
        # Fallback to HTML scraping if API rate-limited
        matched_entries = collect_from_actions_html(owner, repo, max_pages=3, max_runs=60)

    # Classify and count signatures
    by_category: Dict[str, List[Dict[str, Any]]] = {"API failures": [], "UI rendering failures": [], "Test selector issues": []}
    signature_counts: Dict[str, int] = {}
    signature_examples: Dict[str, str] = {}
    category_run_links: Dict[str, List[str]] = {k: [] for k in by_category.keys()}

    for e in matched_entries:
        cat = e["category"]
        if cat not in by_category:
            by_category[cat] = []
            category_run_links[cat] = []
        by_category[cat].append(e)
        sig = e["signature"].strip()
        signature_counts[sig] = signature_counts.get(sig, 0) + 1
        if sig not in signature_examples:
            signature_examples[sig] = e["line"]
        # Collect unique run links (max 3)
        link = e["run_html"]
        if link and link not in category_run_links[cat]:
            if len(category_run_links[cat]) < 3:
                category_run_links[cat].append(link)

    # Prepare Markdown
    md_lines: List[str] = []
    md_lines.append("# CI Cart/Checkout Failure Patterns (Last 7 Days)\n")
    md_lines.append(f"Repo: {owner}/{repo}")
    md_lines.append(f"Generated: {now.strftime('%Y-%m-%d %H:%M:%SZ')}\n")

    total_hits = len(matched_entries)
    md_lines.append(f"- Matches found: {total_hits}")
    md_lines.append(f"- Keywords: {', '.join(KEYWORDS)}\n")

    # Categories
    for cat in ["API failures", "UI rendering failures", "Test selector issues"]:
        items = by_category.get(cat, [])
        md_lines.append(f"## {cat} ({len(items)})")
        # Representative runs
        links = category_run_links.get(cat, [])
        if links:
            md_lines.append("- Representative failed runs:")
            for l in links:
                md_lines.append(f"  - {l}")
        else:
            md_lines.append("- Representative failed runs: (none)")
        md_lines.append("")

    # Recurring signatures
    md_lines.append("## Recurring Error Signatures")
    if signature_counts:
        # Top signatures first
        for sig, cnt in sorted(signature_counts.items(), key=lambda kv: kv[1], reverse=True)[:20]:
            example = signature_examples.get(sig, "")
            md_lines.append(f"- {cnt}× — {sig}")
            if example and example != sig:
                md_lines.append(f"  - Example: {example}")
    else:
        md_lines.append("- None found")

    # Save to file
    out_path = os.path.join("docs", "reports", "CI-CART-CHECKOUT-PATTERNS.md")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines) + "\n")

    print(out_path)


if __name__ == "__main__":
    main()
