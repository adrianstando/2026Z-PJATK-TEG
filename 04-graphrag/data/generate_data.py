"""Syntetyczne dane TalentMatch: CV i zapytania ofertowe (RFP) jako tekst.

    python 04-graphrag/data/generate_data.py

Bez LLM i bez losowania: wynik jest zawsze ten sam. Teksty celowo różnią się
formą (narracja, lista punktów) i nazwami tych samych technologii
(„K8s” i „Kubernetes”, „Postgres” i „PostgreSQL”), żeby ekstrakcja grafu
i deduplikacja encji miały co robić.

Zapisuje:
- cv/*.md, rfp/*.md: dokumenty źródłowe (dane nieustrukturyzowane),
- ground_truth.json: fakty, z których powstały teksty; służy do sprawdzenia
  ekstrakcji i do wyliczenia poprawnych odpowiedzi na pytania testowe.
"""

import json
from pathlib import Path

HERE = Path(__file__).parent

# skill: (nazwa kanoniczna, warianty zapisu używane w tekstach)
ALIASES = {
    "Python": ["Python", "Python 3", "python"],
    "Kubernetes": ["Kubernetes", "K8s", "k8s"],
    "PostgreSQL": ["PostgreSQL", "Postgres", "postgres"],
    "JavaScript": ["JavaScript", "JS"],
    "TypeScript": ["TypeScript", "TS"],
    "React": ["React", "React.js", "ReactJS"],
    "AWS": ["AWS", "Amazon Web Services"],
    "Docker": ["Docker"],
    "Java": ["Java"],
    "Spring": ["Spring", "Spring Boot"],
    "Go": ["Go", "Golang"],
    "Terraform": ["Terraform"],
    "PyTorch": ["PyTorch"],
    "Machine Learning": ["Machine Learning", "uczenie maszynowe", "ML"],
    "Azure": ["Azure", "Microsoft Azure"],
    "Kafka": ["Kafka", "Apache Kafka"],
    "Node.js": ["Node.js", "Node", "NodeJS"],
}

# opis najważniejszego projektu: treść spoza schematu grafu (do wyszukiwania semantycznego);
# domena w ground_truth.json służy tylko do wyliczenia poprawnych odpowiedzi
PROJECTS = {
    "Anna Kowalska": ("płatności", "system płatności online (BLIK, karty) dla sieci sklepów internetowych"),
    "Piotr Nowak": ("płatności", "infrastruktura bramki płatniczej operatora kart z dostępnością 99,99%"),
    "Katarzyna Wiśniewska": ("medycyna", "medyczny model wykrywający zmiany na zdjęciach RTG dla sieci szpitali"),
    "Tomasz Wójcik": ("e-commerce", "frontend sklepu internetowego z elektroniką i koszyk zakupowy"),
    "Magdalena Kamińska": ("płatności", "system rozliczania transakcji kartowych w banku"),
    "Michał Lewandowski": ("medycyna", "klasyfikacja dokumentacji medycznej pacjentów modelami językowymi"),
    "Agnieszka Zielińska": ("energetyka", "chmura dla systemu zdalnych odczytów liczników energii"),
    "Krzysztof Szymański": ("e-commerce", "aplikacja mobilna programu lojalnościowego sieci sklepów"),
    "Ewa Woźniak": ("logistyka", "śledzenie przesyłek kurierskich w czasie rzeczywistym"),
    "Paweł Dąbrowski": ("medycyna", "API do rejestracji wizyt w przychodniach"),
    "Joanna Kozłowska": ("płatności", "zespół rozwijający platformę płatności odroczonych"),
    "Marcin Jankowski": ("płatności", "przetwarzanie strumienia transakcji płatniczych pod kątem wykrywania nadużyć"),
    "Natalia Mazur": ("medycyna", "portal pacjenta z wynikami badań laboratoryjnych"),
    "Bartosz Krawczyk": ("medycyna", "monitoring i niezawodność platformy telemedycznej"),
}

# name, city, title, available_from, university,
# skills [(skill, years, wariant zapisu)], jobs [(company, role, from, to)], certs
PEOPLE = [
    ("Anna Kowalska", "Warszawa", "Senior Backend Developer", "2027-01-01", "Politechnika Warszawska",
     [("Python", 8, 0), ("PostgreSQL", 6, 1), ("Docker", 5, 0), ("Kubernetes", 3, 1), ("AWS", 4, 0)],
     [("Datawise", "Backend Developer", 2017, 2021), ("Northbyte", "Senior Backend Developer", 2021, None)],
     ["AWS Certified Solutions Architect"]),
    ("Piotr Nowak", "Kraków", "DevOps Engineer", "2026-11-01", "AGH",
     [("Kubernetes", 5, 0), ("Docker", 6, 0), ("Terraform", 4, 0), ("Go", 3, 1), ("AWS", 5, 1)],
     [("Cloudforge", "DevOps Engineer", 2019, None)],
     ["Certified Kubernetes Administrator"]),
    ("Katarzyna Wiśniewska", "Gdańsk", "Data Scientist", "2027-03-01", "Uniwersytet Gdański",
     [("Python", 6, 1), ("Machine Learning", 5, 1), ("PyTorch", 3, 0), ("PostgreSQL", 2, 0)],
     [("Baltic Analytics", "Data Analyst", 2019, 2022), ("Datawise", "Data Scientist", 2022, None)],
     []),
    ("Tomasz Wójcik", "Warszawa", "Full-stack Developer", "2026-12-01", "PJATK",
     [("JavaScript", 7, 1), ("TypeScript", 5, 0), ("React", 5, 1), ("Node.js", 5, 2), ("PostgreSQL", 3, 2)],
     [("Pixel Harbor", "Frontend Developer", 2018, 2022), ("Northbyte", "Full-stack Developer", 2022, None)],
     []),
    ("Magdalena Kamińska", "Wrocław", "Java Developer", "2027-02-01", "Politechnika Wrocławska",
     [("Java", 9, 0), ("Spring", 7, 1), ("Kafka", 4, 1), ("Docker", 4, 0), ("Kubernetes", 2, 0)],
     [("FinCore", "Java Developer", 2016, None)],
     ["Oracle Certified Professional Java"]),
    ("Michał Lewandowski", "Kraków", "ML Engineer", "2026-11-15", "AGH",
     [("Python", 7, 0), ("PyTorch", 4, 0), ("Machine Learning", 6, 2), ("Docker", 3, 0), ("Kubernetes", 2, 2)],
     [("Cloudforge", "Python Developer", 2018, 2021), ("Baltic Analytics", "ML Engineer", 2021, None)],
     []),
    ("Agnieszka Zielińska", "Poznań", "Cloud Architect", "2027-04-01", "Politechnika Poznańska",
     [("Azure", 8, 1), ("Terraform", 5, 0), ("Kubernetes", 6, 1), ("Python", 4, 2), ("Docker", 6, 0)],
     [("FinCore", "System Engineer", 2014, 2019), ("Cloudforge", "Cloud Architect", 2019, None)],
     ["Microsoft Certified: Azure Solutions Architect Expert"]),
    ("Krzysztof Szymański", "Warszawa", "Frontend Developer", "2026-10-15", "Uniwersytet Warszawski",
     [("React", 4, 0), ("TypeScript", 4, 1), ("JavaScript", 5, 0)],
     [("Pixel Harbor", "Frontend Developer", 2021, None)],
     []),
    ("Ewa Woźniak", "Gdańsk", "Backend Developer", "2027-01-15", "Politechnika Gdańska",
     [("Go", 4, 0), ("PostgreSQL", 5, 0), ("Kafka", 3, 0), ("Docker", 4, 0), ("Kubernetes", 3, 0)],
     [("Baltic Analytics", "Backend Developer", 2020, None)],
     []),
    ("Paweł Dąbrowski", "Wrocław", "Python Developer", "2026-12-15", "Politechnika Wrocławska",
     [("Python", 3, 0), ("PostgreSQL", 3, 1), ("AWS", 2, 1), ("Docker", 2, 0)],
     [("Datawise", "Junior Python Developer", 2023, None)],
     []),
    ("Joanna Kozłowska", "Poznań", "Engineering Manager", "2027-05-01", "Politechnika Poznańska",
     [("Java", 10, 0), ("Spring", 8, 0), ("AWS", 6, 0), ("Kubernetes", 4, 2)],
     [("FinCore", "Team Leader", 2013, 2020), ("Northbyte", "Engineering Manager", 2020, None)],
     ["AWS Certified Solutions Architect"]),
    ("Marcin Jankowski", "Kraków", "Data Engineer", "2026-11-01", "Uniwersytet Jagielloński",
     [("Python", 5, 2), ("Kafka", 4, 0), ("AWS", 3, 0), ("PostgreSQL", 4, 0)],
     [("Baltic Analytics", "Data Engineer", 2021, None)],
     []),
    ("Natalia Mazur", "Warszawa", "Full-stack Developer", "2027-02-15", "PJATK",
     [("TypeScript", 3, 0), ("React", 3, 2), ("Node.js", 3, 0), ("Python", 2, 0)],
     [("Pixel Harbor", "Junior Developer", 2022, 2024), ("Datawise", "Full-stack Developer", 2024, None)],
     []),
    ("Bartosz Krawczyk", "Gdańsk", "Site Reliability Engineer", "2027-03-15", "Politechnika Gdańska",
     [("Go", 5, 0), ("Kubernetes", 4, 0), ("Terraform", 3, 0), ("Python", 3, 0), ("Azure", 2, 0)],
     [("Northbyte", "SRE", 2019, 2023), ("Cloudforge", "Senior SRE", 2023, None)],
     ["Certified Kubernetes Administrator"]),
]

RFPS = [
    ("RFP-001", "Platforma analityczna dla sieci aptek", "Warszawa", "2027-01-01", 3,
     [("Python", 4), ("PostgreSQL", 3), ("AWS", 2)]),
    ("RFP-002", "Migracja systemu rozliczeń do chmury", "Kraków", "2027-03-01", 2,
     [("Kubernetes", 3), ("Terraform", 2), ("Docker", 3)]),
    ("RFP-003", "Portal klienta dla ubezpieczyciela", "Wrocław", "2027-02-01", 2,
     [("React", 3), ("TypeScript", 3), ("Node.js", 2)]),
]

MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia",
          "września", "października", "listopada", "grudnia"]


def date_pl(iso: str) -> str:
    y, m, d = map(int, iso.split("-"))
    return f"{d} {MONTHS[m - 1]} {y}"


def years_pl(n: int) -> str:
    if n == 1:
        return "rok"
    return f"{n} lata" if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14) else f"{n} lat"


def slug(name: str) -> str:
    tr = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ ", "acelnoszzACELNOSZZ_")
    return name.translate(tr).lower()


def cv_text(i: int, p) -> str:
    name, city, title, avail, uni, skills, jobs, certs = p
    sk = [(ALIASES[s][min(v, len(ALIASES[s]) - 1)], y) for s, y, v in skills]
    total = 2026 - min(j[2] for j in jobs)
    lines = [f"# {name}", ""]
    if i % 2 == 0:  # forma narracyjna
        lines.append(
            f"{title} z {years_pl(total)} doświadczenia zawodowego, mieszka w mieście {city}. "
            f"Absolwent(ka): {uni}. Dostępność od {date_pl(avail)}."
        )
        lines.append("")
        for c, role, a, b in jobs:
            end = "obecnie" if b is None else str(b)
            lines.append(f"W latach {a}–{end} pracował(a) w firmie {c} jako {role}.")
        lines.append("")
        main = ", ".join(f"{s} ({years_pl(y)})" for s, y in sk[:3])
        rest = " oraz ".join(s for s, _ in sk[3:])
        lines.append(f"Najmocniejsze technologie: {main}." + (f" Zna także {rest}." if rest else ""))
        if len(sk) > 3:
            lines.append("Doświadczenie z pozostałymi: " + ", ".join(f"{s} – {years_pl(y)}" for s, y in sk[3:]) + ".")
        lines.append("")
        lines.append(f"Najważniejszy projekt: {PROJECTS[name][1]}.")
        if certs:
            lines.append("")
            lines.append("Certyfikaty: " + "; ".join(certs) + ".")
    else:  # forma listy
        lines += [f"**Stanowisko:** {title}  ", f"**Lokalizacja:** {city}  ", f"**Dostępny(a) od:** {avail}", ""]
        lines.append("## Doświadczenie")
        for c, role, a, b in reversed(jobs):
            lines.append(f"- {a}–{'obecnie' if b is None else b}: {role}, {c}")
        lines += ["", "## Projekty", f"- {PROJECTS[name][1][0].upper()}{PROJECTS[name][1][1:]}"]
        lines += ["", "## Umiejętności"]
        for s, y in sk:
            lines.append(f"- {s}: {years_pl(y)}")
        lines += ["", "## Wykształcenie", f"- {uni}"]
        if certs:
            lines += ["", "## Certyfikaty"] + [f"- {c}" for c in certs]
    return "\n".join(lines) + "\n"


def rfp_text(r) -> str:
    rid, title, city, start, team, reqs = r
    req = "\n".join(f"- {ALIASES[s][0]}: min. {years_pl(y)} doświadczenia" for s, y in reqs)
    return (
        f"# {rid}: {title}\n\n"
        f"Klient szuka zespołu {team} osób do projektu „{title}”. Start prac: {date_pl(start)}. "
        f"Biuro klienta: {city}, praca hybrydowa.\n\n"
        f"## Wymagane umiejętności\n\n{req}\n"
    )


def main():
    (HERE / "cv").mkdir(exist_ok=True)
    (HERE / "rfp").mkdir(exist_ok=True)
    for i, p in enumerate(PEOPLE):
        (HERE / "cv" / f"{i + 1:02d}_{slug(p[0])}.md").write_text(cv_text(i, p), encoding="utf-8")
    for r in RFPS:
        (HERE / "rfp" / f"{r[0]}.md").write_text(rfp_text(r), encoding="utf-8")
    truth = {
        "people": [
            {"name": n, "city": c, "title": t, "available_from": a, "university": u,
             "skills": {s: y for s, y, _ in sk}, "jobs": [{"company": co, "role": r, "from": f, "to": to} for co, r, f, to in jobs],
             "certifications": certs, "project": {"domain": PROJECTS[n][0], "text": PROJECTS[n][1]}}
            for n, c, t, a, u, sk, jobs, certs in PEOPLE
        ],
        "rfps": [{"id": i, "title": t, "city": c, "start": s, "team_size": n, "requirements": dict(req)} for i, t, c, s, n, req in RFPS],
        "aliases": ALIASES,
    }
    (HERE / "ground_truth.json").write_text(json.dumps(truth, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(PEOPLE)} CV, {len(RFPS)} RFP -> {HERE.name}/")


if __name__ == "__main__":
    main()
