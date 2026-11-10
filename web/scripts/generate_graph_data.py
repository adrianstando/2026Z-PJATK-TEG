"""Dane wizualizacji zajęć 4 (TalentMatch) -> src/data/talentmatch.json.

    python web/scripts/generate_graph_data.py

Źródło: wyniki notebooka 04-graphrag/notebook.ipynb zapisane w 04-graphrag/data/
(extracted.json: ekstrakcja CV przez LLM, results.json: porównanie RAG i GraphRAG).
Nie wywołuje żadnego modelu. Graf budowany jest z tej samej ekstrakcji i tej samej
mapy nazw kanonicznych co w notebooku, więc rysunek pokazuje graf, który trafił do Neo4j.
Układ: kolumny według typu węzła, kolejność w kolumnie metodą barycentrum,
współrzędne w [0, 1].
"""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "04-graphrag" / "data"
OUT = ROOT / "web" / "src" / "data" / "talentmatch.json"

extracted = json.loads((DATA / "extracted.json").read_text(encoding="utf-8"))
res = json.loads((DATA / "results.json").read_text(encoding="utf-8"))
truth = json.loads((DATA / "ground_truth.json").read_text(encoding="utf-8"))
CANON = res["canonical"]
canon = lambda s: CANON.get(s, s)

# ---------- graf: osoby, umiejętności, firmy, RFP ----------
nodes, edges = {}, []


def node(kind, name, **extra):
    nid = f"{kind}:{name}"
    nodes.setdefault(nid, {"id": nid, "kind": kind, "label": name, **extra})
    return nid


people = {}
for key, cv in extracted.items():
    pid = node("Person", cv["name"], title=cv["title"], available=cv["available_from"], city=cv["city"])
    people[cv["name"]] = cv
    for s in cv["skills"]:
        edges.append({"s": pid, "t": node("Skill", canon(s["name"])), "rel": "HAS_SKILL", "years": s["years"]})
    for j in cv["jobs"]:
        edges.append({"s": pid, "t": node("Company", j["company"]), "rel": "WORKED_AT",
                      "years": None, "span": f"{j['start_year']}–{j['end_year'] or 'obecnie'}"})
for r in res["rfps"]:
    rid = node("RFP", r["id"], title=r["title"], start=r["start_date"])
    for q in r["requirements"]:
        edges.append({"s": rid, "t": node("Skill", canon(q["skill"])), "rel": "REQUIRES", "years": q["min_years"]})
for i, e in enumerate(edges):
    e["id"] = i


COLUMNS = {"RFP": 0.0, "Skill": 0.33, "Person": 0.67, "Company": 1.0}


def layout():
    """Układ kolumnowy: RFP → umiejętności → osoby → firmy, tak jak biegną zapytania.
    Kolejność w kolumnie: kilka przebiegów metodą barycentrum (średnia pozycja sąsiadów),
    żeby ograniczyć przecięcia krawędzi."""
    nbr = {n: [] for n in nodes}
    for e in edges:
        nbr[e["s"]].append(e["t"])
        nbr[e["t"]].append(e["s"])
    cols = {k: sorted(n for n in nodes if nodes[n]["kind"] == k) for k in COLUMNS}
    y = {}
    for k, ns in cols.items():
        for i, n in enumerate(ns):
            y[n] = i / max(1, len(ns) - 1)
    for _ in range(12):
        for k in ["Person", "Skill", "RFP", "Company", "Person"]:
            ns = sorted(cols[k], key=lambda n: sum(y[m] for m in nbr[n]) / max(1, len(nbr[n])))
            cols[k] = ns
            for i, n in enumerate(ns):
                y[n] = i / max(1, len(ns) - 1) if len(ns) > 1 else 0.5
    # krótkie kolumny wyśrodkowane w pionie
    for k, ns in cols.items():
        if len(ns) < 6:
            for i, n in enumerate(ns):
                y[n] = 0.5 + (i - (len(ns) - 1) / 2) * 0.3
    return {n: [COLUMNS[nodes[n]["kind"]], round(y[n], 4)] for n in nodes}


pos = layout()
for n in nodes.values():
    n["p"] = pos[n["id"]]

# ---------- zapytania krok po kroku ----------
def eids(pred):
    return [e["id"] for e in edges if pred(e)]


def P(name):
    return f"Person:{name}"


k8s = "Skill:Kubernetes"
k8s_people = [e["s"] for e in edges if e["t"] == k8s and e["rel"] == "HAS_SKILL"]

anna = P("Anna Kowalska")
anna_cos = [e["t"] for e in edges if e["s"] == anna and e["rel"] == "WORKED_AT"]
anna_col = sorted({e["s"] for e in edges if e["t"] in anna_cos and e["rel"] == "WORKED_AT" and e["s"] != anna})

rfp = next(r for r in res["rfps"] if r["id"] == "RFP-002")
req = {canon(q["skill"]): q["min_years"] for q in rfp["requirements"]}
req_ids = [f"Skill:{s}" for s in req]
cand_edges = eids(lambda e: e["rel"] == "HAS_SKILL" and e["t"] in req_ids and (e["years"] or 0) >= req[e["t"][6:]])
cands = sorted({edges[i]["s"] for i in cand_edges})
full = [p for p in cands if all(any(e["s"] == p and e["t"] == s and (e["years"] or 0) >= req[s[6:]] for e in edges) for s in req_ids)]
ok = [p for p in full if nodes[p]["available"] <= rfp["start_date"]]

QUERIES = [
    {
        "id": "count", "label": "Ile osób zna Kubernetes?",
        "cypher": ["MATCH (s:Skill {name: 'Kubernetes'})", "MATCH (p:Person)-[:HAS_SKILL]->(s)", "RETURN count(p)"],
        "steps": [
            {"line": 0, "nodes": [k8s], "edges": [], "text": "Start od jednego węzła umiejętności."},
            {"line": 1, "nodes": [k8s, *k8s_people], "edges": eids(lambda e: e["t"] == k8s and e["rel"] == "HAS_SKILL"),
             "text": f"Wszystkie relacje HAS_SKILL prowadzące do węzła: {len(k8s_people)} osób, także z CV, w których było „K8s”."},
            {"line": 2, "nodes": [k8s, *k8s_people], "edges": eids(lambda e: e["t"] == k8s and e["rel"] == "HAS_SKILL"),
             "result": k8s_people, "text": f"count(p) = {len(k8s_people)}. Wynik liczy baza, nie model."},
        ],
    },
    {
        "id": "hop", "label": "Kto pracował z Anną Kowalską?",
        "cypher": ["MATCH (a:Person {name: 'Anna Kowalska'})", "MATCH (a)-[:WORKED_AT]->(c:Company)", "MATCH (c)<-[:WORKED_AT]-(p:Person)", "RETURN c.name, collect(p.name)"],
        "steps": [
            {"line": 0, "nodes": [anna], "edges": [], "text": "Start od osoby."},
            {"line": 1, "nodes": [anna, *anna_cos], "edges": eids(lambda e: e["s"] == anna and e["rel"] == "WORKED_AT"),
             "text": "Pierwszy krok: firmy, w których pracowała."},
            {"line": 2, "nodes": [anna, *anna_cos, *anna_col],
             "edges": eids(lambda e: e["t"] in anna_cos and e["rel"] == "WORKED_AT"),
             "text": "Drugi krok: wstecz po WORKED_AT do innych osób z tych firm."},
            {"line": 3, "nodes": [anna, *anna_cos, *anna_col],
             "edges": eids(lambda e: e["t"] in anna_cos and e["rel"] == "WORKED_AT"),
             "result": anna_col, "text": f"{len(anna_col)} osób. Żadne CV nie zawiera tej informacji wprost."},
        ],
    },
    {
        "id": "match", "label": "Kto pasuje do RFP-002?",
        "cypher": ["MATCH (r:RFP {id: 'RFP-002'})-[q:REQUIRES]->(s:Skill)", "MATCH (p:Person)-[h:HAS_SKILL]->(s) WHERE h.years >= q.min_years",
                   "WITH p, count(s) AS met WHERE met = 3", "AND p.available_from <= r.start_date"],
        "steps": [
            {"line": 0, "nodes": ["RFP:RFP-002", *req_ids], "edges": eids(lambda e: e["s"] == "RFP:RFP-002"),
             "text": "Wymagania: " + ", ".join(f"{s} ≥ {y} l." for s, y in req.items()) + "."},
            {"line": 1, "nodes": ["RFP:RFP-002", *req_ids, *cands], "edges": eids(lambda e: e["s"] == "RFP:RFP-002") + cand_edges,
             "text": f"{len(cands)} osób spełnia co najmniej jedno wymaganie z wymaganym stażem."},
            {"line": 2, "nodes": ["RFP:RFP-002", *req_ids, *full],
             "edges": eids(lambda e: e["s"] == "RFP:RFP-002") + [i for i in cand_edges if edges[i]["s"] in full],
             "text": "Wszystkie trzy wymagania: " + ", ".join(nodes[p]["label"] for p in full) + "."},
            {"line": 3, "nodes": ["RFP:RFP-002", *req_ids, *ok],
             "edges": eids(lambda e: e["s"] == "RFP:RFP-002") + [i for i in cand_edges if edges[i]["s"] in ok],
             "result": ok, "text": "Dostępność przed startem (" + rfp["start_date"] + "): " + ", ".join(nodes[p]["label"] for p in ok)
             + ". " + ", ".join(f"{nodes[p]['label']} od {nodes[p]['available']}" for p in full if p not in ok) + "."},
        ],
    },
]

# ---------- ekstrakcja jednego CV: tekst -> encje -> węzły ----------
SAMPLE = "01_anna_kowalska"
text = (DATA / "cv" / f"{SAMPLE}.md").read_text(encoding="utf-8").replace("# ", "", 1).strip()
cv = extracted[SAMPLE]
ents = [("Person", cv["name"], cv["name"]), ("City", cv["city"], cv["city"]), ("University", cv["university"], cv["university"])]
ents += [("Company", j["company"], j["company"]) for j in cv["jobs"]]
# certyfikaty przed umiejętnościami: „AWS” w „AWS Certified …” nie jest osobną encją
ents += [("Certification", c, c) for c in cv["certifications"]]
ents += [("Skill", s["name"], canon(s["name"])) for s in cv["skills"]]
spans, seen = [], set()
for kind, raw, can in ents:
    if (kind, can) in seen:
        continue
    seen.add((kind, can))
    for m in re.finditer(re.escape(raw), text):
        if not any(a < m.end() and m.start() < b for a, b, *_ in spans):
            spans.append((m.start(), m.end(), kind, can))
spans.sort()
rels = {"City": "LIVES_IN", "University": "STUDIED_AT", "Company": "WORKED_AT", "Skill": "HAS_SKILL", "Certification": "HAS_CERT"}
years = {canon(s["name"]): s["years"] for s in cv["skills"]}
extraction = {
    "text": text,
    "spans": [{"a": a, "b": b, "kind": k, "canon": c} for a, b, k, c in spans],
    "entities": [{"kind": k, "label": c, "raw": r, "rel": rels.get(k), "years": years.get(c) if k == "Skill" else None}
                 for k, r, c in ents],
}

# ---------- porównanie RAG i GraphRAG ----------
names = {f"{i + 1:02d}": p["name"] for i, p in enumerate(truth["people"])}


def trim_rows(rows, n=6):
    out = json.dumps(rows[:n], ensure_ascii=False)
    return out + (f" … (+{len(rows) - n})" if len(rows) > n else "")


def hits(hs):
    return [{"name": h[0], "score": h[1]} for h in hs]


compare = {
    "model": {"chat": res["chat"], "agent": res["agent"], "embed": res["embed"], "provider": res["provider"]},
    "docs": [p["name"] for p in truth["people"]],
    "items": [
        {
            "kind": r["kind"], "question": r["question"], "expected": r["expected"],
            "rag": {"hits": hits(r["rag"]["hits"]), "answer": r["rag"]["answer"], "correct": r["rag"]["correct"]},
            "structured": {"where": r["structured"]["where"], "query": r["structured"]["query"],
                           "hits": hits(r["structured"]["hits"]), "answer": r["structured"]["answer"],
                           "correct": r["structured"]["correct"]},
            "graph": {"cypher": r["graph"]["cypher"],
                      "rows": [o[:400] + ("…" if len(o) > 400 else "") for o in r["graph"]["observations"]],
                      "answer": r["graph"]["answer"], "correct": r["graph"]["correct"]},
        }
        for r in res["results"]
    ],
}

# ---------- mały graf z sekcji 1 notebooka (komórka web:cypher-create) ----------
NB = json.loads((ROOT / "04-graphrag" / "notebook.ipynb").read_text(encoding="utf-8"))
cell = lambda tag: next(c for c in NB["cells"] if f"web:{tag}" in c["metadata"].get("tags", []))
create = "".join(cell("cypher-create")["source"])
def props(txt):
    return {k: (v.strip("'") if v.startswith("'") else int(v)) for k, v in re.findall(r"(\w+): ('[^']*'|\d+)", txt or "")}


small_nodes = [{"id": v, "kind": k, "label": props(pr)["name"], "props": props(pr)}
               for v, k, pr in re.findall(r"\((\w+):(\w+) \{([^}]*)\}\)", create)]
small_edges = [{"s": a, "rel": r, "props": props(pr), "years": props(pr).get("years"), "t": b}
               for a, r, pr, b in re.findall(r"\((\w+)\)-\[:(\w+)(?: \{([^}]*)\})?\]->\((\w+)\)", create)]

# ---------- deduplikacja: surowe nazwy z ekstrakcji -> nazwy kanoniczne ----------
raw_counts = {}
for cv_ in extracted.values():
    for s_ in cv_["skills"]:
        raw_counts[s_["name"]] = raw_counts.get(s_["name"], 0) + 1
dedup = {"raw": [{"name": k, "n": v, "canon": canon(k)} for k, v in sorted(raw_counts.items(), key=lambda kv: canon(kv[0]).lower())]}

# ---------- dopasowanie do RFP-002 krok po kroku (MATCH_QUERY z notebooka) ----------
reqs = [{"skill": canon(q["skill"]), "min": q["min_years"]} for q in rfp["requirements"]]
match_rows = []
for name, cv_ in people.items():
    have = {canon(s_["name"]): s_["years"] or 0 for s_ in cv_["skills"]}
    checks = [{**r_, "have": have.get(r_["skill"], 0)} for r_ in reqs]
    met = sum(c["have"] >= c["min"] for c in checks)
    match_rows.append({"name": name, "checks": checks, "met": met, "available": cv_["available_from"] <= rfp["start_date"],
                       "available_from": cv_["available_from"],
                       "missing": [f"{c['skill']} {c['have']}/{c['min']}" for c in checks if c["have"] < c["min"]]})
match_rows.sort(key=lambda r_: (-r_["met"], not r_["available"]))
match_explain = {"rfp": rfp["id"], "start": rfp["start_date"], "reqs": reqs, "rows": match_rows}

OUT.write_text(json.dumps({
    "graph": {"nodes": list(nodes.values()), "edges": edges},
    "queries": QUERIES, "extraction": extraction, "compare": compare,
    "small": {"nodes": small_nodes, "edges": small_edges},
    "dedup": dedup, "match": match_explain,
}, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"{len(nodes)} węzłów, {len(edges)} krawędzi, {len(compare['items'])} pytań -> {OUT.relative_to(ROOT)}")
