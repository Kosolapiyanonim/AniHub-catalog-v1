/**
 * Тесты для функции normalizeShikimoriImageUrl
 * Запуск: npx tsx lib/normalizeShikimoriImageUrl.test.ts
 */

import { normalizeShikimoriImageUrl } from "./normalizeShikimoriImageUrl";

// Вспомогательная функция для вывода результатов тестов
function testCase(name: string, input: string | null | undefined, expected: string | null) {
  const result = normalizeShikimoriImageUrl(input);
  const passed = result === expected;
  const status = passed ? "✅ PASS" : "❌ FAIL";
  
  console.log(`${status}: ${name}`);
  if (!passed) {
    console.log(`  Input:    ${input}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Got:      ${result}`);
  }
  
  return passed;
}

console.log("🧪 Тестирование normalizeShikimoriImageUrl\n");

let passed = 0;
let total = 0;

// Тест 1: URL с поддоменом nyaa.shikimori.one
total++;
if (testCase(
  "Поддомен nyaa.shikimori.one → shiki.one",
  "https://nyaa.shikimori.one/uploads/poster/animes/11757/x.jpeg",
  "https://shiki.one/uploads/poster/animes/11757/x.jpeg"
)) passed++;

// Тест 2: URL с поддоменом dere.shikimori.one
total++;
if (testCase(
  "Поддомен dere.shikimori.one → shiki.one",
  "https://dere.shikimori.one/uploads/poster/animes/16498/x.jpeg",
  "https://shiki.one/uploads/poster/animes/16498/x.jpeg"
)) passed++;

// Тест 3: Относительный путь начинающийся с "/"
total++;
if (testCase(
  "Относительный путь с '/' → добавляется https://shiki.one",
  "/uploads/poster/animes/199/x.jpeg",
  "https://shiki.one/uploads/poster/animes/199/x.jpeg"
)) passed++;

// Тест 4: URL уже на shiki.one (должен остаться без изменений)
total++;
if (testCase(
  "URL уже на shiki.one (без изменений)",
  "https://shiki.one/uploads/poster/animes/199/x.jpeg",
  "https://shiki.one/uploads/poster/animes/199/x.jpeg"
)) passed++;

// Тест 5: null
total++;
if (testCase(
  "null → null",
  null,
  null
)) passed++;

// Тест 6: undefined
total++;
if (testCase(
  "undefined → null",
  undefined,
  null
)) passed++;

// Тест 7: пустая строка
total++;
if (testCase(
  "пустая строка → null",
  "",
  null
)) passed++;

// Тест 8: URL с протоколом "//"
total++;
if (testCase(
  "URL начинающийся с '//' → добавляется 'https:'",
  "//shiki.one/uploads/poster/animes/199/x.jpeg",
  "https://shiki.one/uploads/poster/animes/199/x.jpeg"
)) passed++;

// Тест 9: URL с другим доменом (должен остаться без изменений)
total++;
if (testCase(
  "URL с другим доменом (без изменений)",
  "https://example.com/image.jpg",
  "https://example.com/image.jpg"
)) passed++;

// Тест 10: URL с query параметрами
total++;
if (testCase(
  "URL с query параметрами сохраняются",
  "https://nyaa.shikimori.one/uploads/poster/animes/11757/x.jpeg?version=1&size=large",
  "https://shiki.one/uploads/poster/animes/11757/x.jpeg?version=1&size=large"
)) passed++;

// Тест 11: Невалидный URL
total++;
if (testCase(
  "Невалидный URL → null",
  "not a valid url",
  null
)) passed++;

// Тест 12: Пробелы в начале и конце (trim)
total++;
if (testCase(
  "Пробелы обрезаются (trim)",
  "  https://nyaa.shikimori.one/uploads/poster/animes/11757/x.jpeg  ",
  "https://shiki.one/uploads/poster/animes/11757/x.jpeg"
)) passed++;

// Тест 13: URL на старом корневом домене shikimori.one
total++;
if (testCase(
  "Корневой shikimori.one → shiki.one",
  "https://shikimori.one/uploads/poster/animes/199/x.jpeg",
  "https://shiki.one/uploads/poster/animes/199/x.jpeg"
)) passed++;

// Тест 14: URL с поддоменом shiki.one
total++;
if (testCase(
  "Поддомен images.shiki.one → shiki.one",
  "https://images.shiki.one/system/animes/original/1.jpg",
  "https://shiki.one/system/animes/original/1.jpg"
)) passed++;

console.log(`\n📊 Результаты: ${passed}/${total} тестов пройдено`);

if (passed === total) {
  console.log("🎉 Все тесты прошли успешно!");
  process.exit(0);
} else {
  console.log("⚠️  Некоторые тесты не прошли");
  process.exit(1);
}

