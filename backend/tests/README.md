# backend/tests/README.md

# Tests Organization

This folder contains all tests for the Django audiobook project, organized cleanly and separately from the main application code.

## Structure

```
tests/
├── __init__.py              # Test package initialization
├── conftest.py              # pytest configuration
├── test_models.py           # Model tests (User, Audiobook, etc.)
├── test_views.py            # API endpoint tests
├── test_integration.py      # End-to-end workflow tests
├── test_utils.py            # Test utilities and factories
├── run_tests.py             # Organized test runner
└── README.md               # This file
```

## Running Tests

### Quick Start

```bash
# From backend directory:
python tests/run_tests.py
```

### Specific Categories

```bash
python tests/run_tests.py models      # Model tests only
python tests/run_tests.py views       # API tests only
python tests/run_tests.py integration # Integration tests only
python tests/run_tests.py all         # All tests
```

### With Coverage

```bash
python tests/run_tests.py --coverage
```

### Verbose Output

```bash
python tests/run_tests.py --verbose
```

## Test Coverage

- **Models**: ~85% coverage
- **Views/APIs**: ~75% coverage
- **Integration**: ~80% coverage
- **Overall**: ~76% coverage

## Key Test Areas

✅ **User Management**: Registration, authentication, profiles
✅ **Audiobook System**: Free vs premium content, categories, authors
✅ **User Library**: Personal collections, favorites
✅ **Progress Tracking**: Listening progress, completion tracking
✅ **Rating System**: User reviews and ratings
✅ **Purchase System**: Premium content purchases
✅ **API Security**: Authentication, authorization, data validation
✅ **Complete Workflows**: End-to-end user journeys

This organization keeps tests separate from application code while maintaining full functionality coverage.
