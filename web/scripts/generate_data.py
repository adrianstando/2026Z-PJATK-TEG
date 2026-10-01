"""Generuje dane do wizualizacji w aplikacji (web/src/data/*.json).

Aplikacja jest statyczna (GitHub Pages), więc nie woła żadnego API.
Embeddingi i tokeny liczymy tutaj, raz, i zapisujemy jako JSON.

Wymaga działającej Ollamy z modelem EmbeddingGemma:
    ollama pull embeddinggemma

Uruchomienie (z katalogu web/):
    npm run data

Dwa modele, celowo:
- mapa słów: paraphrase-multilingual-mpnet-base-v2 (fastembed, CPU). Model
  "parafrazowy" ładnie grupuje pojedyncze słowa (najbliższy sąsiad z tej samej
  grupy: 18/24 słów).
- wyszukiwanie: EmbeddingGemma (Ollama, 768 wymiarów). Model "retrievalowy" —
  świetny do par pytanie→fragment, ale pojedyncze słowa grupuje słabo (16/24,
  silhouette 0.03 vs 0.17). To samo w sobie jest lekcją: model embeddingów
  dobiera się do zadania.
"""

import json
from pathlib import Path

import numpy as np
import tiktoken
import urllib.request

from fastembed import TextEmbedding
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA

OUT = Path(__file__).resolve().parent.parent / "src" / "data"
WORD_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
MODEL = "embeddinggemma"
OLLAMA = "http://localhost:11434/api/embed"
# EmbeddingGemma była trenowana z prefiksami zadań — bez nich wyszukiwanie działa gorzej.
QUERY_PREFIX = "task: search result | query: "
DOC_PREFIX = "title: none | text: "

WORD_GROUPS = {
    "Zwierzęta": ["kot", "pies", "kotek", "szczeniak", "ptak", "ryba"],
    "Jedzenie": ["jabłko", "pizza", "sushi", "chleb", "czekolada", "sałatka"],
    "Transport": ["samochód", "rower", "samolot", "pociąg", "łódź", "autobus"],
    "Emocje": ["radość", "smutek", "złość", "ekscytacja", "spokój", "zaskoczenie"],
}

# Mała "baza wiedzy" — te same postacie co w danych do zajęć z RAG.
CORPUS = [
    ("Maria Skłodowska-Curie", "Maria Skłodowska-Curie jako pierwsza osoba otrzymała dwie Nagrody Nobla w dwóch różnych dziedzinach."),
    ("Maria Skłodowska-Curie", "Skłodowska odkryła polon i rad, a polon nazwała na cześć Polski."),
    ("Maria Skłodowska-Curie", "Urodziła się w Warszawie, a studiowała fizykę na Sorbonie w Paryżu."),
    ("Albert Einstein", "Einstein sformułował szczególną teorię względności w 1905 roku."),
    ("Albert Einstein", "Nagrodę Nobla Einstein dostał za wyjaśnienie efektu fotoelektrycznego."),
    ("Albert Einstein", "Równanie E = mc² opisuje równoważność masy i energii."),
    ("Isaac Newton", "Newton opisał prawo powszechnego ciążenia i trzy zasady dynamiki."),
    ("Isaac Newton", "Newton rozwinął rachunek różniczkowy niezależnie od Leibniza."),
    ("Isaac Newton", "Pryzmat pozwolił Newtonowi pokazać, że białe światło składa się z kolorów."),
    ("Ada Lovelace", "Ada Lovelace napisała pierwszy algorytm przeznaczony dla maszyny analitycznej Babbage'a."),
    ("Ada Lovelace", "Lovelace przewidziała, że komputery będą mogły tworzyć muzykę, a nie tylko liczyć."),
    ("Charles Darwin", "Darwin opisał ewolucję drogą doboru naturalnego w dziele O powstawaniu gatunków."),
    ("Charles Darwin", "Podróż na statku Beagle i obserwacje zięb z Galapagos zainspirowały Darwina."),
    ("Charles Darwin", "Darwin przez lata badał dżdżownice i ich wpływ na glebę."),
]

QUERIES = [
    "Kto dostał dwa Noble?",
    "Skąd się wzięła teoria ewolucji?",
    "Pierwszy programista w historii",
    "Dlaczego jabłko spada na ziemię?",
    "Związek masy z energią",
]

# Ten sam eksperyment co w notebooku (sekcja "Kontekst"): słowo samo i w zdaniach.
CONTEXT_TEMPLATES = ["{}", "The {} is sleeping peacefully", "I love my {} very much", "Training a {} requires patience"]
CONTEXT_WORDS = ["cat", "dog", "kitten"]

TOKEN_SAMPLES = [
    ("pl", "Modele językowe przewidują kolejny token."),
    ("en", "Language models predict the next token."),
    ("pl", "Konstantynopolitańczykowianeczka"),
    ("code", "print(f\"Hello, {name}!\")"),
]


def r(v, nd=4):
    return [round(float(x), nd) for x in v]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    def embed(texts, prefix=""):
        body = json.dumps({"model": MODEL, "input": [prefix + t for t in texts]}).encode()
        req = urllib.request.Request(OLLAMA, body, {"Content-Type": "application/json"})
        vecs = np.array(json.load(urllib.request.urlopen(req))["embeddings"])
        return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)

    # --- słowa i klastry ---
    words = [(w, g) for g, ws in WORD_GROUPS.items() for w in ws]
    wv = np.array(list(TextEmbedding(WORD_MODEL).embed([w for w, _ in words])))
    wv = wv / np.linalg.norm(wv, axis=1, keepdims=True)
    # t-SNE zamiast PCA: PCA zachowuje tu ~20% wariancji i grupy się nakładają.
    # t-SNE dba o sąsiedztwa, więc lepiej pokazuje klastry (odległości między
    # klastrami nic jednak nie znaczą — mówimy o tym na zajęciach).
    w2d = TSNE(n_components=2, perplexity=5, metric="cosine", init="pca", random_state=7).fit_transform(wv)
    w2d = (w2d - w2d.min(0)) / (w2d.max(0) - w2d.min(0))
    sims = wv @ wv.T
    (OUT / "words.json").write_text(json.dumps({
        "model": WORD_MODEL,
        "dim": int(wv.shape[1]),
        "groups": list(WORD_GROUPS),
        "words": [
            {"word": w, "group": g, "x": round(float(p[0]), 4), "y": round(float(p[1]), 4),
             "preview": r(v[:8], 3)}
            for (w, g), p, v in zip(words, w2d, wv)
        ],
        "similarity": [r(row, 3) for row in sims],
    }, ensure_ascii=False, indent=1))

    # --- wyszukiwanie w "bazie wektorowej" ---
    cv = embed([t for _, t in CORPUS], DOC_PREFIX)
    qv = embed(QUERIES, QUERY_PREFIX)
    pca = PCA(n_components=2, random_state=0).fit(np.vstack([cv, qv]))
    c2d, q2d = pca.transform(cv), pca.transform(qv)
    allp = np.vstack([c2d, q2d])
    lo, hi = allp.min(0), allp.max(0)
    norm = lambda p: (p - lo) / (hi - lo)
    (OUT / "search.json").write_text(json.dumps({
        "model": MODEL,
        "dim": int(cv.shape[1]),
        "docs": [
            {"id": i, "source": s, "text": t, "x": round(float(p[0]), 4), "y": round(float(p[1]), 4), "v": r(v)}
            for i, ((s, t), p, v) in enumerate(zip(CORPUS, norm(c2d), cv))
        ],
        "queries": [
            {"text": q, "x": round(float(p[0]), 4), "y": round(float(p[1]), 4), "v": r(v)}
            for q, p, v in zip(QUERIES, norm(q2d), qv)
        ],
    }, ensure_ascii=False))

    # --- kontekst: kot / pies / kotek w dwóch modelach, rzut PCA ---
    texts = [t.format(w) for t in CONTEXT_TEMPLATES for w in CONTEXT_WORDS]
    mpnet = TextEmbedding(WORD_MODEL)
    models = {
        "embeddinggemma": embed(texts),
        WORD_MODEL.split("/")[-1]: (lambda v: v / np.linalg.norm(v, axis=1, keepdims=True))(np.array(list(mpnet.embed(texts)))),
    }
    # Trzy punkty zawsze leżą na jednej płaszczyźnie, więc trójkąt kot–pies–kotek da się
    # narysować z dokładnymi odległościami (bez zniekształceń rzutu). Zapisujemy cosinusy,
    # a geometrię liczy komponent (twierdzenie cosinusów).
    context = {"templates": CONTEXT_TEMPLATES, "words": CONTEXT_WORDS, "models": []}
    for name, vecs in models.items():
        sims = []
        for ti in range(len(CONTEXT_TEMPLATES)):
            c, d, k = vecs[ti * 3: ti * 3 + 3]
            sims.append({"cat_dog": round(float(c @ d), 4), "cat_kitten": round(float(c @ k), 4), "dog_kitten": round(float(d @ k), 4)})
        context["models"].append({"name": name, "dim": int(vecs.shape[1]), "sims": sims})
        print("kontekst", name, [(x["cat_dog"], x["cat_kitten"]) for x in sims])
    (OUT / "context.json").write_text(json.dumps(context, ensure_ascii=False, indent=1))

    # --- tokenizacja ---
    enc = tiktoken.get_encoding("o200k_base")
    samples = []
    for lang, text in TOKEN_SAMPLES:
        ids = enc.encode(text)
        samples.append({
            "lang": lang,
            "text": text,
            "tokens": [{"id": i, "t": enc.decode_single_token_bytes(i).decode("utf-8", errors="replace")} for i in ids],
        })
    (OUT / "tokens.json").write_text(json.dumps({"encoding": "o200k_base", "samples": samples}, ensure_ascii=False, indent=1))

    # podgląd w konsoli
    for q, v in zip(QUERIES, qv):
        best = np.argsort(-(cv @ v))[:3]
        print(q, "->", [CORPUS[b][1][:40] for b in best])
    for s in samples:
        print(s["lang"], len(s["tokens"]), [t["t"] for t in s["tokens"]])


if __name__ == "__main__":
    main()
