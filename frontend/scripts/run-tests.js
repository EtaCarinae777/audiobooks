#!/usr/bin/env node

/**
 * Test Runner Script for Audiobook Application
 *
 * Uruchamia testy jednostkowe z różnymi opcjami
 */

const { spawn } = require("child_process");
const path = require("path");

// Kolory dla konsoli
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Funkcja do kolorowego logowania
const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Funkcja do uruchomienia komend
const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
};

// Dostępne komendy testowe
const commands = {
  // Uruchom wszystkie testy
  all: async () => {
    log("🚀 Uruchamianie wszystkich testów...", "cyan");
    await runCommand("npm", ["run", "test:run"]);
  },

  // Uruchom testy w trybie watch
  watch: async () => {
    log("👀 Uruchamianie testów w trybie watch...", "yellow");
    await runCommand("npm", ["run", "test"]);
  },

  // Uruchom testy z coverage
  coverage: async () => {
    log("📊 Uruchamianie testów z coverage...", "blue");
    await runCommand("npm", ["run", "test:coverage"]);
  },

  // Uruchom testy z UI
  ui: async () => {
    log("🎨 Uruchamianie testów z interfejsem UI...", "magenta");
    await runCommand("npm", ["run", "test:ui"]);
  },

  // Uruchom konkretny test
  file: async (filename) => {
    if (!filename) {
      log("❌ Podaj nazwę pliku testowego", "red");
      return;
    }
    log(`🎯 Uruchamianie testów dla: ${filename}`, "green");
    await runCommand("npx", ["vitest", "run", filename]);
  },

  // Uruchom testy dla konkretnego komponentu
  component: async (componentName) => {
    if (!componentName) {
      log("❌ Podaj nazwę komponentu", "red");
      return;
    }
    const testFile = `src/components/__tests__/${componentName}.test.jsx`;
    log(`🧩 Uruchamianie testów dla komponentu: ${componentName}`, "green");
    await runCommand("npx", ["vitest", "run", testFile]);
  },

  // Sprawdź konfigurację testów
  check: async () => {
    log("🔍 Sprawdzanie konfiguracji testów...", "yellow");

    const fs = require("fs");
    const requiredFiles = [
      "vite.config.js",
      "src/test/setup.js",
      "src/test/utils.jsx",
      "src/test/mocks/handlers.js",
      "src/test/mocks/server.js",
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        log(`✅ ${file}`, "green");
      } else {
        log(`❌ ${file} - BRAK`, "red");
        allFilesExist = false;
      }
    }

    if (allFilesExist) {
      log("\n🎉 Wszystkie pliki konfiguracyjne są na miejscu!", "green");
    } else {
      log("\n⚠️  Niektóre pliki konfiguracyjne są niedostępne", "yellow");
    }

    // Sprawdź zależności
    log("\n📦 Sprawdzanie zależności testowych...", "yellow");
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const testDeps = [
        "@testing-library/react",
        "@testing-library/jest-dom",
        "@testing-library/user-event",
        "vitest",
        "jsdom",
        "msw",
      ];

      for (const dep of testDeps) {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          log(`✅ ${dep} - ${packageJson.devDependencies[dep]}`, "green");
        } else {
          log(`❌ ${dep} - BRAK`, "red");
        }
      }
    } catch (error) {
      log(`❌ Błąd podczas czytania package.json: ${error.message}`, "red");
    }
  },

  // Zainstaluj zależności testowe
  install: async () => {
    log("📦 Instalowanie zależności testowych...", "cyan");

    const dependencies = [
      "@testing-library/react@^14.0.0",
      "@testing-library/jest-dom@^6.1.0",
      "@testing-library/user-event@^14.5.0",
      "vitest@^0.34.0",
      "jsdom@^22.1.0",
      "msw@^1.3.0",
      "@vitest/ui@^0.34.0",
      "@vitest/coverage-v8@^0.34.0",
    ];

    await runCommand("npm", ["install", "--save-dev", ...dependencies]);
    log("✅ Zależności zostały zainstalowane!", "green");
  },

  // Wyczyść cache testów
  clean: async () => {
    log("🧹 Czyszczenie cache testów...", "yellow");
    const fs = require("fs");
    const rimraf = require("rimraf");

    const dirsToClean = ["coverage", "node_modules/.vitest", ".vitest"];

    for (const dir of dirsToClean) {
      if (fs.existsSync(dir)) {
        await new Promise((resolve) => rimraf(dir, resolve));
        log(`🗑️  Usunięto: ${dir}`, "green");
      }
    }
    log("✅ Cache wyczyszczony!", "green");
  },

  // Pomoc
  help: () => {
    log("\n🧪 Audiobook App - Test Runner", "bright");
    log("====================================", "cyan");
    log("\nDostępne komendy:", "bright");
    log("  all        - Uruchom wszystkie testy", "green");
    log("  watch      - Uruchom testy w trybie watch", "green");
    log("  coverage   - Uruchom testy z raportem coverage", "green");
    log("  ui         - Uruchom testy z interfejsem UI", "green");
    log("  file <name>    - Uruchom konkretny plik testowy", "green");
    log("  component <name> - Uruchom testy dla komponentu", "green");
    log("  check      - Sprawdź konfigurację testów", "green");
    log("  install    - Zainstaluj zależności testowe", "green");
    log("  clean      - Wyczyść cache testów", "green");
    log("  help       - Pokaż tę pomoc", "green");
    log("\nPrzykłady użycia:", "bright");
    log("  node scripts/run-tests.js all", "yellow");
    log("  node scripts/run-tests.js component Login", "yellow");
    log(
      "  node scripts/run-tests.js file src/components/__tests__/Home.test.jsx",
      "yellow"
    );
    log("  node scripts/run-tests.js coverage", "yellow");
    log("");
  },
};

// Główna funkcja
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const additionalArgs = args.slice(1);

  try {
    if (commands[command]) {
      await commands[command](...additionalArgs);
    } else {
      log(`❌ Nieznana komenda: ${command}`, "red");
      commands.help();
      process.exit(1);
    }
  } catch (error) {
    log(`❌ Błąd: ${error.message}`, "red");
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main();
}

module.exports = { commands, runCommand, log };
