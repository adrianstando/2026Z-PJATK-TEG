"""Błędy domenowe i ich mapowanie na odpowiedzi HTTP.

Serwisy zgłaszają wyłącznie wyjątki z tego modułu. Routery ich nie łapią –
robi to handler zarejestrowany w `install_error_handlers`. Każda odpowiedź
z błędem ma ten sam kształt:

    {"error": {"code": "loan_already_returned", "message": "..."}}

`code` to stały identyfikator (snake_case, po angielsku) – klienci na nim
polegają, więc nie zmieniaj istniejących kodów. `message` jest dla ludzi.
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class DomainError(Exception):
    """Naruszenie reguły biznesowej. Domyślnie 409 Conflict."""

    status_code = 409

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class NotFoundError(DomainError):
    """Brak obiektu o podanym identyfikatorze. Zawsze 404 z kodem `not_found`."""

    status_code = 404

    def __init__(self, entity: str, entity_id: object):
        super().__init__("not_found", f"Nie znaleziono: {entity} #{entity_id}")
        self.entity = entity


class InvalidInputError(DomainError):
    """Dane formalnie poprawne, ale bez sensu w domenie (np. data z przyszłości)."""

    status_code = 422


def error_body(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


async def _domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message))


async def _validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(p) for p in first.get("loc", []) if p != "body")
    message = f"{field}: {first.get('msg', 'niepoprawne dane')}" if field else "niepoprawne dane"
    return JSONResponse(status_code=422, content=error_body("invalid_input", message))


def install_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(DomainError, _domain_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)
