# Architektura projektu Audiobooks

Projekt napisany w Pythonie z użyciem FastAPI. Główne komponenty:

- **`main.py`** – punkt wejściowy aplikacji
- **`routers/`** – definicje endpointów
- **`schemas/`** – modele Pydantic do walidacji danych
- **`services/`** – logika biznesowa (obsługa bazy, logiki audio)
- **`utils/`** – pomocnicze funkcje (np. transkrypcja audio)
- **`database.py`** – konfiguracja bazy danych SQLite

Architektura oparta o podział na warstwy (Routery → Serwisy → Baza).
