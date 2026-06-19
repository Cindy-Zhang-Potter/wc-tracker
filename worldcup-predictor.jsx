import { useState, useMemo, useEffect } from "react";

// 你部署的 GitHub 仓库里 team_form.json 的原始地址
// 改成你自己的：https://raw.githubusercontent.com/<你的用户名>/<仓库名>/main/data/team_form.json
const DATA_SOURCE_URL =
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data/team_form.json";

// ---- 兜底快照：fetch失败时使用（来源 openfootball/worldcup.json，6/19快照）----
// 正常运行时这份数据会被 fetch 回来的最新数据覆盖，不需要手动维护
const FALLBACK_TEAM_FORM = {"Mexico": {"played": 2, "gf": 3, "ga": 0, "gd": 3, "results": "WW"}, "South Africa": {"played": 2, "gf": 1, "ga": 3, "gd": -2, "results": "LD"}, "South Korea": {"played": 2, "gf": 2, "ga": 2, "gd": 0, "results": "WL"}, "Czech Republic": {"played": 2, "gf": 2, "ga": 3, "gd": -1, "results": "LD"}, "Canada": {"played": 2, "gf": 7, "ga": 1, "gd": 6, "results": "DW"}, "Bosnia & Herzegovina": {"played": 2, "gf": 2, "ga": 5, "gd": -3, "results": "DL"}, "Qatar": {"played": 2, "gf": 1, "ga": 7, "gd": -6, "results": "DL"}, "Switzerland": {"played": 2, "gf": 5, "ga": 2, "gd": 3, "results": "DW"}, "Brazil": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Morocco": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Haiti": {"played": 1, "gf": 0, "ga": 1, "gd": -1, "results": "L"}, "USA": {"played": 1, "gf": 4, "ga": 1, "gd": 3, "results": "W"}, "Paraguay": {"played": 1, "gf": 1, "ga": 4, "gd": -3, "results": "L"}, "New Zealand": {"played": 1, "gf": 2, "ga": 2, "gd": 0, "results": "D"}, "Argentina": {"played": 1, "gf": 3, "ga": 0, "gd": 3, "results": "W"}, "Algeria": {"played": 1, "gf": 0, "ga": 3, "gd": -3, "results": "L"}, "Ecuador": {"played": 1, "gf": 0, "ga": 1, "gd": -1, "results": "L"}, "Netherlands": {"played": 1, "gf": 2, "ga": 2, "gd": 0, "results": "D"}, "Germany": {"played": 1, "gf": 7, "ga": 1, "gd": 6, "results": "W"}, "Uzbekistan": {"played": 1, "gf": 1, "ga": 3, "gd": -2, "results": "L"}, "Croatia": {"played": 1, "gf": 2, "ga": 4, "gd": -2, "results": "L"}, "England": {"played": 1, "gf": 4, "ga": 2, "gd": 2, "results": "W"}, "Ghana": {"played": 1, "gf": 1, "ga": 0, "gd": 1, "results": "W"}, "Panama": {"played": 1, "gf": 0, "ga": 1, "gd": -1, "results": "L"}, "Colombia": {"played": 1, "gf": 3, "ga": 1, "gd": 2, "results": "W"}, "Iraq": {"played": 1, "gf": 1, "ga": 4, "gd": -3, "results": "L"}, "Portugal": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"},
  "DR Congo": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Spain": {"played": 1, "gf": 0, "ga": 0, "gd": 0, "results": "D"}, "Cape Verde": {"played": 1, "gf": 0, "ga": 0, "gd": 0, "results": "D"}, "Saudi Arabia": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Uruguay": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Norway": {"played": 1, "gf": 4, "ga": 1, "gd": 3, "results": "W"}, "Senegal": {"played": 1, "gf": 1, "ga": 3, "gd": -2, "results": "L"}, "Belgium": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Egypt": {"played": 1, "gf": 1, "ga": 1, "gd": 0, "results": "D"}, "Iran": {"played": 1, "gf": 2, "ga": 2, "gd": 0, "results": "D"}, "Turkey": {"played": 1, "gf": 0, "ga": 2, "gd": -2, "results": "L"}, "Australia": {"played": 1, "gf": 2, "ga": 0, "gd": 2, "results": "W"}, "France": {"played": 1, "gf": 3, "ga": 1, "gd": 2, "results": "W"}, "Austria": {"played": 1, "gf": 3, "ga": 1, "gd": 2, "results": "W"}, "Jordan": {"played": 1, "gf": 1, "ga": 3, "gd": -2, "results": "L"}, "Scotland": {"played": 1, "gf": 1, "ga": 0, "gd": 1, "results": "W"}, "Ivory Coast": {"played": 1, "gf": 1, "ga": 0, "gd": 1, "results": "W"}, "Tunisia": {"played": 1, "gf": 1, "ga": 5, "gd": -4, "results": "L"}, "Sweden": {"played": 1, "gf": 5, "ga": 1, "gd": 4, "results": "W"}, "Curaçao": {"played": 1, "gf": 1, "ga": 7, "gd": -6, "results": "L"}, "Japan": {"played": 1, "gf": 2, "ga": 2, "gd": 0, "results": "D"}};

// Elo 实力分基准值（参考值，建议自行核对最新数据）
const ELO_BASE_BY_EN = {
  "Argentina": 1900, "Spain": 1880, "Germany": 1870, "Netherlands": 1840,
  "France": 1810, "England": 1800, "Portugal": 1790, "Brazil": 1780,
  "Belgium": 1720, "Croatia": 1700, "Italy": 1690, "USA": 1640,
  "Switzerland": 1640, "Mexico": 1630, "Morocco": 1620, "Japan": 1610,
  "South Korea": 1600, "Canada": 1590, "Uruguay": 1650, "Colombia": 1630,
  "Senegal": 1580, "Australia": 1560, "Austria": 1610, "Norway": 1600,
  "Sweden": 1570, "Scotland": 1540, "Tunisia": 1520, "Egypt": 1530,
  "Ivory Coast": 1550, "Ghana": 1530, "South Africa": 1480, "Czech Republic": 1560,
  "Bosnia & Herzegovina": 1500, "Qatar": 1450, "Haiti": 1420, "Paraguay": 1500,
  "New Zealand": 1440, "Algeria": 1530, "Ecuador": 1540, "Uzbekistan": 1450,
  "Panama": 1480, "Iraq": 1440, "DR Congo": 1430, "Cape Verde": 1440,
  "Saudi Arabia": 1470, "Turkey": 1560, "Jordan": 1420, "Curaçao": 1400,
};

const CN_NAME = {
  "Argentina": "阿根廷", "Spain": "西班牙", "Germany": "德国", "Netherlands": "荷兰",
  "France": "法国", "England": "英格兰", "Portugal": "葡萄牙", "Brazil": "巴西",
  "Belgium": "比利时", "Croatia": "克罗地亚", "Italy": "意大利", "USA": "美国",
  "Switzerland": "瑞士", "Mexico": "墨西哥", "Morocco": "摩洛哥", "Japan": "日本",
  "South Korea": "韩国", "Canada": "加拿大", "Uruguay": "乌拉圭", "Colombia": "哥伦比亚",
  "Senegal": "塞内加尔", "Australia": "澳大利亚", "Austria": "奥地利", "Norway": "挪威",
  "Sweden": "瑞典", "Scotland": "苏格兰", "Tunisia": "突尼斯", "Egypt": "埃及",
  "Ivory Coast": "象牙海岸", "Ghana": "加纳", "South Africa": "南非", "Czech Republic": "捷克",
  "Bosnia & Herzegovina": "波黑", "Qatar": "卡塔尔", "Haiti": "海地", "Paraguay": "巴拉圭",
  "New Zealand": "新西兰", "Algeria": "阿尔及利亚", "Ecuador": "厄瓜多尔", "Uzbekistan": "乌兹别克斯坦",
  "Panama": "巴拿马", "Iraq": "伊拉克", "DR Congo": "刚果(金)", "Cape Verde": "佛得角",
  "Saudi Arabia": "沙特阿拉伯", "Turkey": "土耳其", "Jordan": "约旦", "Curaçao": "库拉索",
};

// 完整球队列表（英文key + 中文显示名 + Elo参考值），按Elo排序
const ALL_TEAMS = Object.keys(ELO_BASE_BY_EN)
  .map((en) => ({ key: en, name: CN_NAME[en] || en, elo: ELO_BASE_BY_EN[en] }))
  .sort((a, b) => b.elo - a.elo);

// 根据已赛数据自动计算"近期状态分"：-10..10
// 逻辑：净胜球 + 战绩(胜=2分/平=0/负=-2分)，按场次归一化，再压缩到-10..10区间
function computeAutoForm(teamForm, teamKey) {
  const f = teamForm[teamKey];
  if (!f || f.played === 0) return 0;
  const resultScore = f.results.split("").reduce((acc, r) => {
    if (r === "W") return acc + 2;
    if (r === "L") return acc - 2;
    return acc;
  }, 0);
  const perGame = (resultScore + f.gd) / f.played; // 战绩+净胜球，按场均
  const scaled = Math.max(-10, Math.min(10, perGame * 1.8));
  return Math.round(scaled * 10) / 10;
}

function formLabel(teamForm, teamKey) {
  const f = teamForm[teamKey];
  if (!f) return "暂无小组赛数据（尚未出场或非48强常驻库）";
  return `近${f.played}场 ${f.results}　${f.gf}进${f.ga}失（净胜${f.gd >= 0 ? "+" : ""}${f.gd}）`;
}

// ---- Poisson + Elo helpers ----
function poissonPMF(lambda, k) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function eloToExpectedGoalDiff(eloDiff) {
  // Rough calibration: ~200 Elo points ≈ 1 expected-goal advantage at this level
  return eloDiff / 200;
}

function computeMatch({
  eloA,
  eloB,
  formA, // -10..10
  formB,
  neutralVenue,
  homeTeam, // "A" | "B" | "neutral"
  injuryA, // 0..3 severity
  injuryB,
}) {
  const baseGoals = 1.35; // baseline expected goals per team at WC level
  let eloDiff = eloA - eloB;

  // home advantage (international tournaments: smaller than club football)
  if (!neutralVenue) {
    if (homeTeam === "A") eloDiff += 60;
    if (homeTeam === "B") eloDiff -= 60;
  }

  // form adjustment (small, capped)
  eloDiff += (formA - formB) * 4;

  // injury/rotation penalty
  eloDiff -= injuryA * 25;
  eloDiff += injuryB * 25;

  const goalDiffExpect = eloToExpectedGoalDiff(eloDiff);

  let lambdaA = baseGoals + goalDiffExpect / 2;
  let lambdaB = baseGoals - goalDiffExpect / 2;
  lambdaA = Math.max(0.25, lambdaA);
  lambdaB = Math.max(0.25, lambdaB);

  // Build scoreline probability grid 0..6 goals each
  const maxGoals = 7;
  const grid = [];
  let pWin = 0,
    pDraw = 0,
    pLoss = 0;
  for (let i = 0; i < maxGoals; i++) {
    const row = [];
    for (let j = 0; j < maxGoals; j++) {
      const p = poissonPMF(lambdaA, i) * poissonPMF(lambdaB, j);
      row.push(p);
      if (i > j) pWin += p;
      else if (i === j) pDraw += p;
      else pLoss += p;
    }
    grid.push(row);
  }
  const total = pWin + pDraw + pLoss;
  pWin /= total;
  pDraw /= total;
  pLoss /= total;

  // most likely scorelines
  const flat = [];
  for (let i = 0; i < maxGoals; i++)
    for (let j = 0; j < maxGoals; j++)
      flat.push({ i, j, p: grid[i][j] / total });
  flat.sort((a, b) => b.p - a.p);

  return {
    lambdaA,
    lambdaB,
    pWin,
    pDraw,
    pLoss,
    topScores: flat.slice(0, 5),
    eloDiff,
  };
}

function TeamPanel({ label, side, team, setTeam, form, setForm, injury, setInjury, accent, autoForm, onSelectTeam, teamForm }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#0F3326",
        border: `1px solid ${accent}33`,
        borderRadius: "4px",
        padding: "20px",
        minWidth: "260px",
      }}
    >
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: "12px",
        }}
      >
        {label}
      </div>

      <select
        value={team.key || ""}
        onChange={(e) => onSelectTeam(e.target.value)}
        style={{
          width: "100%",
          background: "#F5F2E9",
          color: "#0B2B1F",
          border: "none",
          borderRadius: "3px",
          padding: "10px 12px",
          fontFamily: "'Oswald', sans-serif",
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "10px",
        }}
      >
        <option value="">— 选择球队 —</option>
        {ALL_TEAMS.map((t) => (
          <option key={t.key} value={t.key}>
            {t.name} ({t.elo})
          </option>
        ))}
      </select>

      <div
        style={{
          fontSize: "11px",
          color: "#5A7A66",
          marginBottom: "14px",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {team.key ? formLabel(teamForm, team.key) : "请选择球队查看小组赛战绩"}
      </div>

      <label style={{ display: "block", fontSize: "12px", color: "#C9D6CC", marginBottom: "4px" }}>
        Elo 实力分（可手动调整）
      </label>
      <input
        type="number"
        value={team.elo}
        onChange={(e) => setTeam({ ...team, elo: Number(e.target.value) })}
        style={{
          width: "100%",
          background: "#08231A",
          color: "#F5F2E9",
          border: "1px solid #1E5A3F",
          borderRadius: "3px",
          padding: "8px 10px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "14px",
          marginBottom: "16px",
        }}
      />

      <label style={{ display: "block", fontSize: "12px", color: "#C9D6CC", marginBottom: "4px" }}>
        近期状态调整 ({form > 0 ? "+" : ""}{form}){" "}
        {autoForm !== null && (
          <span style={{ color: "#5A7A66" }}>
            （已按小组赛战绩自动填入 {autoForm > 0 ? "+" : ""}{autoForm}，可手动覆盖）
          </span>
        )}
      </label>
      <input
        type="range"
        min="-10"
        max="10"
        value={form}
        onChange={(e) => setForm(Number(e.target.value))}
        style={{ width: "100%", marginBottom: "16px", accentColor: accent }}
      />

      <label style={{ display: "block", fontSize: "12px", color: "#C9D6CC", marginBottom: "6px" }}>
        伤停 / 轮换影响
      </label>
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { v: 0, label: "无" },
          { v: 1, label: "轻微" },
          { v: 2, label: "中等" },
          { v: 3, label: "重大" },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setInjury(opt.v)}
            style={{
              flex: 1,
              padding: "8px 4px",
              fontSize: "12px",
              fontFamily: "'Oswald', sans-serif",
              borderRadius: "3px",
              border: injury === opt.v ? `1px solid ${accent}` : "1px solid #1E5A3F",
              background: injury === opt.v ? accent : "transparent",
              color: injury === opt.v ? "#0B2B1F" : "#C9D6CC",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WorldCupPredictor() {
  const [teamForm, setTeamForm] = useState(FALLBACK_TEAM_FORM);
  const [dataStatus, setDataStatus] = useState("loading"); // loading | live | fallback
  const [dataMeta, setDataMeta] = useState(null); // { generated_at, completed_matches, total_matches }

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_SOURCE_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data && data.team_form) {
          setTeamForm(data.team_form);
          setDataMeta({
            generated_at: data.generated_at,
            completed_matches: data.completed_matches,
            total_matches: data.total_matches,
          });
          setDataStatus("live");
        } else {
          throw new Error("数据格式不符合预期");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("拉取最新数据失败，使用内置兜底快照：", err);
        setDataStatus("fallback");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [teamA, setTeamA] = useState({ key: "Argentina", name: "阿根廷", elo: 1900 });
  const [teamB, setTeamB] = useState({ key: "France", name: "法国", elo: 1810 });
  const [formA, setFormA] = useState(0);
  const [formB, setFormB] = useState(0);
  const [autoFormA, setAutoFormA] = useState(0);
  const [autoFormB, setAutoFormB] = useState(0);
  const [injuryA, setInjuryA] = useState(0);
  const [injuryB, setInjuryB] = useState(0);
  const [neutralVenue, setNeutralVenue] = useState(true);
  const [homeTeam, setHomeTeam] = useState("neutral");

  // 数据加载/更新后，重新计算当前两队的自动状态分
  useEffect(() => {
    setAutoFormA(computeAutoForm(teamForm, teamA.key));
    setFormA(computeAutoForm(teamForm, teamA.key));
    setAutoFormB(computeAutoForm(teamForm, teamB.key));
    setFormB(computeAutoForm(teamForm, teamB.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamForm]);

  const handleSelectA = (key) => {
    const t = ALL_TEAMS.find((x) => x.key === key);
    if (!t) return;
    setTeamA({ key: t.key, name: t.name, elo: t.elo });
    const af = computeAutoForm(teamForm, key);
    setAutoFormA(af);
    setFormA(af);
    setInjuryA(0);
  };

  const handleSelectB = (key) => {
    const t = ALL_TEAMS.find((x) => x.key === key);
    if (!t) return;
    setTeamB({ key: t.key, name: t.name, elo: t.elo });
    const bf = computeAutoForm(teamForm, key);
    setAutoFormB(bf);
    setFormB(bf);
    setInjuryB(0);
  };

  const result = useMemo(
    () =>
      computeMatch({
        eloA: teamA.elo,
        eloB: teamB.elo,
        formA,
        formB,
        neutralVenue,
        homeTeam,
        injuryA,
        injuryB,
      }),
    [teamA, teamB, formA, formB, neutralVenue, homeTeam, injuryA, injuryB]
  );

  const winPct = (result.pWin * 100).toFixed(1);
  const drawPct = (result.pDraw * 100).toFixed(1);
  const lossPct = (result.pLoss * 100).toFixed(1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B2B1F",
        color: "#F5F2E9",
        fontFamily: "'Inter', sans-serif",
        padding: "32px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        input[type=range] { -webkit-appearance: none; height: 4px; background: #1E5A3F; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #F5F2E9; cursor: pointer; }
        select option { background: #F5F2E9; }
      `}</style>

      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "#D98E3C",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            2026 世界杯 · 概率估算工具
          </div>
          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            胜负平统计概率计算器
          </h1>
          <p style={{ color: "#9FB3A6", fontSize: "14px", marginTop: "8px", lineHeight: 1.6 }}>
            基于 Elo 实力分 + 泊松进球分布模型估算。单场淘汰赛/小组赛样本量小，结果仅为统计参考，不构成任何投注建议。
          </p>
        </div>

        {/* Venue selector */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {[
            { v: "neutral", label: "中立场地" },
            { v: "A", label: `${teamA.name || "队伍A"} 主场优势` },
            { v: "B", label: `${teamB.name || "队伍B"} 主场优势` },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => {
                setHomeTeam(opt.v);
                setNeutralVenue(opt.v === "neutral");
              }}
              style={{
                padding: "8px 14px",
                fontSize: "12px",
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: "0.04em",
                borderRadius: "20px",
                border: homeTeam === opt.v ? "1px solid #D98E3C" : "1px solid #1E5A3F",
                background: homeTeam === opt.v ? "#D98E3C" : "transparent",
                color: homeTeam === opt.v ? "#0B2B1F" : "#9FB3A6",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 数据状态提示条 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            background:
              dataStatus === "live" ? "#0F3326" : dataStatus === "fallback" ? "#3A2418" : "#0F3326",
            border: `1px solid ${dataStatus === "fallback" ? "#D98E3C66" : "#1E5A3F"}`,
            color: dataStatus === "fallback" ? "#D98E3C" : "#7FA68C",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                dataStatus === "live" ? "#7FA68C" : dataStatus === "fallback" ? "#D98E3C" : "#5A7A66",
              display: "inline-block",
            }}
          />
          {dataStatus === "loading" && "正在拉取最新赛果数据…"}
          {dataStatus === "live" &&
            dataMeta &&
            `数据已更新（${dataMeta.completed_matches}/${dataMeta.total_matches} 场已完赛，生成于 ${new Date(
              dataMeta.generated_at
            ).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })} 北京时间）`}
          {dataStatus === "fallback" && "无法连接最新数据源，当前使用内置兜底快照（可能不是最新数据）"}
        </div>

        {/* Team panels */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
          <TeamPanel
            label="队伍 A"
            team={teamA}
            setTeam={setTeamA}
            form={formA}
            setForm={setFormA}
            injury={injuryA}
            setInjury={setInjuryA}
            accent="#D98E3C"
            autoForm={autoFormA}
            onSelectTeam={handleSelectA}
            teamForm={teamForm}
          />
          <TeamPanel
            label="队伍 B"
            team={teamB}
            setTeam={setTeamB}
            form={formB}
            setForm={setFormB}
            injury={injuryB}
            setInjury={setInjuryB}
            accent="#7FA68C"
            autoForm={autoFormB}
            onSelectTeam={handleSelectB}
            teamForm={teamForm}
          />
        </div>

        {/* Result: scoreline bar */}
        <div
          style={{
            background: "#08231A",
            border: "1px solid #1E5A3F",
            borderRadius: "4px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.18em",
              color: "#9FB3A6",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            胜负平概率
          </div>

          <div
            style={{
              display: "flex",
              height: "44px",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: `${winPct}%`,
                background: "#D98E3C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0B2B1F",
                transition: "width 0.3s ease",
              }}
            >
              {Number(winPct) > 8 ? `${winPct}%` : ""}
            </div>
            <div
              style={{
                width: `${drawPct}%`,
                background: "#9FB3A6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0B2B1F",
                transition: "width 0.3s ease",
              }}
            >
              {Number(drawPct) > 8 ? `${drawPct}%` : ""}
            </div>
            <div
              style={{
                width: `${lossPct}%`,
                background: "#7FA68C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0B2B1F",
                transition: "width 0.3s ease",
              }}
            >
              {Number(lossPct) > 8 ? `${lossPct}%` : ""}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#D98E3C" }}>● {teamA.name || "A"} 胜 {winPct}%</span>
            <span style={{ color: "#9FB3A6" }}>● 平局 {drawPct}%</span>
            <span style={{ color: "#7FA68C" }}>● {teamB.name || "B"} 胜 {lossPct}%</span>
          </div>
        </div>

        {/* Expected goals + top scorelines */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1",
              minWidth: "240px",
              background: "#08231A",
              border: "1px solid #1E5A3F",
              borderRadius: "4px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "#9FB3A6",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              预期进球数
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#9FB3A6" }}>{teamA.name || "A"}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", color: "#D98E3C" }}>
                  {result.lambdaA.toFixed(2)}
                </div>
              </div>
              <div style={{ color: "#5A7A66", fontSize: "20px" }}>—</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#9FB3A6" }}>{teamB.name || "B"}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "28px", color: "#7FA68C" }}>
                  {result.lambdaB.toFixed(2)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: "#5A7A66" }}>
              有效 Elo 差值：{result.eloDiff.toFixed(0)} 分
            </div>
          </div>

          <div
            style={{
              flex: "1",
              minWidth: "240px",
              background: "#08231A",
              border: "1px solid #1E5A3F",
              borderRadius: "4px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "#9FB3A6",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              最可能比分（前5）
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.topScores.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span>
                    {s.i} - {s.j}
                  </span>
                  <span style={{ color: "#D98E3C" }}>{(s.p * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px 20px",
            background: "#08231A",
            border: "1px solid #1E5A3F",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#5A7A66",
            lineHeight: 1.7,
          }}
        >
          数据说明：球队战绩自动从你部署的 GitHub 仓库拉取（GitHub Actions 每天自动更新一次，数据源为 openfootball/worldcup.json）。"近期状态"已按净胜球+战绩自动填入，可手动覆盖。Elo 实力分为参考估值，建议自行核对最新数据。"伤停影响"为主观调整项，请结合赛前最新消息手动设置。本工具仅做统计概率展示，不构成投注建议，世界杯单场比赛样本量小、变数大，任何模型都无法保证预测准确。
        </div>
      </div>
    </div>
  );
}
