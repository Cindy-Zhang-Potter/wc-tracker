#!/usr/bin/env python3
"""
拉取 openfootball/worldcup.json 的2026世界杯数据，
统计每队近期战绩，生成 team_form.json 供前端使用。

数据源：https://github.com/openfootball/worldcup.json
更新频率：该repo人工维护，通常每个比赛日结束后更新（不保证实时）
"""
import json
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

SOURCE_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json"
OUTPUT_PATH = "data/team_form.json"


def fetch_source():
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "wc-tracker-bot"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def build_team_form(data):
    completed = [m for m in data["matches"] if "score" in m]
    upcoming = [m for m in data["matches"] if "score" not in m]

    stats = defaultdict(lambda: {"gf": 0, "ga": 0, "w": 0, "d": 0, "l": 0, "played": 0, "results": []})

    # 按日期排序，确保 results 字符串是按时间顺序的（最近的在最后）
    completed_sorted = sorted(completed, key=lambda m: m.get("date", ""))

    for m in completed_sorted:
        t1, t2 = m["team1"], m["team2"]
        s1, s2 = m["score"]["ft"]
        stats[t1]["gf"] += s1
        stats[t1]["ga"] += s2
        stats[t1]["played"] += 1
        stats[t2]["gf"] += s2
        stats[t2]["ga"] += s1
        stats[t2]["played"] += 1
        if s1 > s2:
            stats[t1]["w"] += 1
            stats[t1]["results"].append("W")
            stats[t2]["l"] += 1
            stats[t2]["results"].append("L")
        elif s1 < s2:
            stats[t2]["w"] += 1
            stats[t2]["results"].append("W")
            stats[t1]["l"] += 1
            stats[t1]["results"].append("L")
        else:
            stats[t1]["d"] += 1
            stats[t1]["results"].append("D")
            stats[t2]["d"] += 1
            stats[t2]["results"].append("D")

    out = {}
    for team, s in stats.items():
        out[team] = {
            "played": s["played"],
            "gf": s["gf"],
            "ga": s["ga"],
            "gd": s["gf"] - s["ga"],
            "results": "".join(s["results"]),
        }

    next_matches = []
    for m in sorted(upcoming, key=lambda x: x.get("date", ""))[:10]:
        next_matches.append(
            {
                "date": m.get("date"),
                "team1": m.get("team1"),
                "team2": m.get("team2"),
                "group": m.get("group"),
            }
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "completed_matches": len(completed),
        "total_matches": len(data["matches"]),
        "team_form": out,
        "next_matches": next_matches,
    }


def main():
    print(f"Fetching {SOURCE_URL} ...")
    data = fetch_source()
    result = build_team_form(data)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Completed matches: {result['completed_matches']} / {result['total_matches']}")
    print(f"Teams tracked: {len(result['team_form'])}")


if __name__ == "__main__":
    main()
