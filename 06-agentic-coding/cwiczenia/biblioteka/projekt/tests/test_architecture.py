"""Testy pilnujące konwencji projektu (warstwy, migracje, zegar)."""

import importlib
import re
from pathlib import Path

from app import main

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
SQL_LINE = re.compile(r"\.execute\(|\b(SELECT|INSERT|UPDATE|DELETE)\s")


def _sources(folder: str) -> list[Path]:
    return sorted(p for p in (APP / folder).glob("*.py") if p.name != "__init__.py")


def test_sql_only_in_repositories():
    for path in _sources("services") + _sources("routers"):
        found = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if SQL_LINE.search(line)]
        assert not found, f"SQL poza repozytorium w {path.name}: {found}"


def test_routers_do_not_use_repositories():
    for path in _sources("routers"):
        assert "repositories" not in path.read_text(encoding="utf-8"), path.name


def test_all_routers_registered():
    registered = [router for router, _, _ in main.ROUTERS]
    for path in _sources("routers"):
        module = importlib.import_module(f"app.routers.{path.stem}")
        assert any(module.router is r for r in registered), (
            f"app/routers/{path.name} nie jest w main.ROUTERS"
        )


def test_no_direct_today_outside_clock():
    for path in APP.rglob("*.py"):
        if path.name == "clock.py":
            continue
        text = path.read_text(encoding="utf-8")
        assert "date.today(" not in text and "datetime.now(" not in text, path


def test_migrations_are_numbered_without_gaps():
    numbers = []
    for path in sorted((ROOT / "migrations").glob("*.sql")):
        assert re.fullmatch(r"\d{3}_[a-z0-9_]+\.sql", path.name), f"zła nazwa migracji: {path.name}"
        numbers.append(int(path.name[:3]))
    assert numbers == list(range(1, len(numbers) + 1))
