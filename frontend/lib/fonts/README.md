# Arabic Fonts Directory

## Цель папки
Хранение арабских шрифтов в base64 формате для pdfmake.

## Текущий статус
⚠️ **Шрифт еще не добавлен**

Нужно добавить: `NotoSansArabic-Regular.ts`

## Как добавить шрифт

### Быстрый способ:

1. **Скачай шрифт**: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
2. **Положи TTF файл** в эту папку: `frontend/lib/fonts/`
3. **Запусти скрипт**:
   ```bash
   cd frontend
   node scripts/convert-font-to-base64.js lib/fonts/NotoSansArabic-Regular.ttf
   ```
4. **Готово!** Файл `NotoSansArabic-Regular.ts` будет создан автоматически

### Подробная инструкция:
См. файл: `ADD_ARABIC_FONT_STEPS.md` в корне проекта

---

## После добавления шрифта

Файл `generatePDFArabic.ts` уже настроен для использования шрифта.
Просто добавь файл и всё заработает! ✨

---

**Размер**: ~150-200 KB (lazy loading, не влияет на основное приложение)
**Эффект**: Профессиональные арабские лигатуры
