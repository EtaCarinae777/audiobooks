# Endpointy API

## GET /audiobooks

Zwraca listę audiobooków.

### Odpowiedź:

```json
[
  {
    "id": 1,
    "title": "Example",
    "author": "Author",
    "filepath": "/path/to/file.mp3"
  }
]
```


Jeśli używasz **FastAPI**, automatycznie masz Swaggera pod `/docs`. W dokumentacji warto o tym wspomnieć.

---

## ✅ KROK 4: SCHEMAT BAZY DANYCH

Plik: `docs/db_schema.md`

Opis tabel SQLAlchemy lub modeli Pydantic.

Przykład:
```markdown
# Schemat bazy danych

## Audiobook
- `id: int` – ID audiobooka
- `title: str` – tytuł
- `author: str` – autor
- `filepath: str` – ścieżka do pliku
