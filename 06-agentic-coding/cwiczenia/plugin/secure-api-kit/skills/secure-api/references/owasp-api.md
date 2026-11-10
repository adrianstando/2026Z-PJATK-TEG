# OWASP API Security Top 10 (2023): jak to wygląda w tym projekcie

Czytać, gdy reguła ze SKILL.md nie wystarcza albo przy przeglądzie całego API.

| Ryzyko OWASP | Co sprawdzić w app.py |
|---|---|
| API1 Broken Object Level Authorization | każde `SELECT … WHERE id = ?` na zasobie użytkownika ma też `AND user_id = ?` |
| API2 Broken Authentication | `exp` w tokenie, klucz z `os.environ`, hasła z solą (`scrypt`/`bcrypt`) |
| API3 Broken Object Property Level Authorization | odpowiedzi z jawnej listy pól; brak `password`, `answer`, `is_admin` |
| API4 Unrestricted Resource Consumption | `max_length` na tekstach, limit wyników w listach |
| API5 Broken Function Level Authorization | endpointy admina sprawdzają rolę w bazie, nie w tokenie |
| API6 Unrestricted Access to Sensitive Business Flows | „tylko raz” wymusza `UNIQUE` w bazie |
| API8 Security Misconfiguration | `debug=False`, CORS bez `*` z `allow_credentials` |

Pełna lista: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
