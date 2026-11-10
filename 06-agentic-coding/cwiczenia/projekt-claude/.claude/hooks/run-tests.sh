#!/usr/bin/env bash
# Hook PostToolUse: po każdej edycji pliku .py uruchamia testy.
# Kod wyjścia 2 = Claude Code oddaje stderr modelowi jako informację zwrotną; agent musi naprawić testy.
input=$(cat)
case "$input" in
  *'.py"'*) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! out=$(python -m pytest -q -x 2>&1); then
  echo "$out" | tail -20 >&2
  exit 2
fi
