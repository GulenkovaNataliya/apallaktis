# Интеграция AFM Validator с формой регистрации

## Краткий обзор

AFM Validator проверяет греческий налоговый номер (ΑΦΜ) через официальный сайт GEMI/AADE.

**Время проверки:** 10-30 секунд
**Источник:** `https://publicity.businessportal.gr/` (официальный)

## Быстрый старт

### 1. Установка backend

```bash
cd backend
npm install
npm start
```

Сервер запустится на `http://localhost:3002`

### 2. Интеграция с формой регистрации

В файле `frontend/app/[locale]/register/page.tsx`:

```typescript
// Добавить состояние для AFM проверки
const [afmLoading, setAfmLoading] = useState(false);
const [afmData, setAfmData] = useState<any>(null);

// Функция проверки AFM
const checkAfm = async (afm: string) => {
  setAfmLoading(true);
  setErrors({ ...errors, afm: "" });

  try {
    const response = await fetch('http://localhost:3002/api/afm/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ afm })
    });

    const result = await response.json();

    if (!result.valid_format) {
      setErrors({ ...errors, afm: t.invalidAfm });
      setAfmLoading(false);
      return false;
    }

    if (!result.found) {
      setErrors({ ...errors, afm: "ΑΦΜ не найден в AADE" });
      setAfmLoading(false);
      return false;
    }

    if (result.error) {
      setErrors({ ...errors, afm: result.message });
      setAfmLoading(false);
      return false;
    }

    // Успешно найден!
    setAfmData(result);

    // Автозаполнение полей
    if (result.name) {
      setFormData({ ...formData, companyName: result.name });
    }
    if (result.doy) {
      setFormData({ ...formData, doy: result.doy });
    }

    setAfmLoading(false);
    return true;

  } catch (error) {
    console.error('AFM check error:', error);
    setErrors({ ...errors, afm: "Ошибка проверки ΑΦΜ" });
    setAfmLoading(false);
    return false;
  }
};
```

### 3. Обновить UI поля ΑΦΜ

```tsx
<div>
  <div className="flex gap-2">
    <input
      type="text"
      placeholder={t.afm}
      value={formData.afm}
      onChange={(e) => {
        setFormData({ ...formData, afm: e.target.value });
        setErrors({ ...errors, afm: "" });
        setAfmData(null);
      }}
      required
      className={`text-body rounded-xl px-6 py-4 border flex-1 focus:outline-none ${
        errors.afm ? "border-red-500" : "border-gray-300 focus:border-blue-500"
      }`}
    />

    {/* Кнопка проверки */}
    <button
      type="button"
      onClick={() => checkAfm(formData.afm)}
      disabled={afmLoading || formData.afm.length !== 9}
      className="px-4 py-2 rounded-xl bg-blue-500 text-white disabled:opacity-50"
    >
      {afmLoading ? "..." : "✓"}
    </button>
  </div>

  {/* Сообщение об ошибке */}
  {errors.afm && (
    <p className="text-sm mt-1 px-2" style={{ color: "#ff6a1a" }}>
      {errors.afm}
    </p>
  )}

  {/* Успешная проверка */}
  {afmData && afmData.found && (
    <p className="text-sm mt-1 px-2" style={{ color: "#4ade80" }}>
      ✓ {afmData.message}
    </p>
  )}
</div>
```

## Варианты использования

### Вариант 1: Проверка по нажатию кнопки (рекомендуется)

Добавить кнопку "Проверить ΑΦΜ" рядом с полем. Пользователь вводит ΑΦΜ и нажимает проверку.

**Плюсы:**
- Не блокирует форму
- Пользователь контролирует когда проверять
- Можно показать статус проверки

**Минусы:**
- Требует дополнительное действие

### Вариант 2: Автоматическая проверка при потере фокуса

Проверять автоматически когда пользователь выходит из поля (onBlur).

```tsx
<input
  onBlur={(e) => {
    if (e.target.value.length === 9) {
      checkAfm(e.target.value);
    }
  }}
  ...
/>
```

**Плюсы:**
- Автоматически
- Удобно для пользователя

**Минусы:**
- Может тормозить интерфейс (10-30 сек)

### Вариант 3: Проверка только при submit

Проверять ΑΦΜ только когда пользователь отправляет форму.

```tsx
const handleSubmit = async (e) => {
  e.preventDefault();

  if (invoiceType === 'invoice') {
    const afmValid = await checkAfm(formData.afm);
    if (!afmValid) return;
  }

  // Продолжить регистрацию...
};
```

**Плюсы:**
- Минимальная нагрузка
- Проверка только когда нужно

**Минусы:**
- Долгое ожидание при submit

## Рекомендуемый подход

**Комбинированный:**

1. **Быстрая валидация формата** (без AADE) при вводе
2. **Полная проверка AADE** только если пользователь нажимает кнопку "Проверить"
3. При submit: если не проверено - требовать проверку

```tsx
// Валидация формата (локально, быстро)
const validateAfmFormat = (afm: string) => {
  const cleaned = afm.replace(/[\s\-]/g, '');
  return /^\d{9}$/.test(cleaned);
};

// В onChange поля AFM
onChange={(e) => {
  const value = e.target.value;
  setFormData({ ...formData, afm: value });

  // Быстрая валидация формата
  if (value.length >= 9 && !validateAfmFormat(value)) {
    setErrors({ ...errors, afm: t.invalidAfm });
  } else {
    setErrors({ ...errors, afm: "" });
  }
}}

// При submit
if (invoiceType === 'invoice' && !afmData) {
  alert('Пожалуйста, проверьте ΑΦΜ через кнопку проверки');
  return;
}
```

## UI/UX советы

### Индикатор загрузки

```tsx
{afmLoading && (
  <div className="flex items-center gap-2 mt-2">
    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
    <span className="text-sm">Проверка ΑΦΜ через AADE...</span>
  </div>
)}
```

### Статусы проверки

```tsx
{afmData && (
  <div className={`mt-2 p-3 rounded-lg ${
    afmData.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'
  }`}>
    <p className="text-sm">
      <strong>Статус:</strong> {afmData.status}
    </p>
    {afmData.name && (
      <p className="text-sm">
        <strong>Компания:</strong> {afmData.name}
      </p>
    )}
  </div>
)}
```

## Сообщения об ошибках

Добавить в `messages.ts`:

```typescript
register: {
  // ... existing fields
  afmChecking: "Проверка ΑΦΜ...",
  afmNotFound: "ΑΦΜ не найден в AADE",
  afmInactive: "ΑΦΜ неактивен",
  afmCheckRequired: "Необходимо проверить ΑΦΜ",
  afmCheckError: "Ошибка проверки ΑΦΜ",
}
```

## Производственные настройки

### 1. Environment Variables

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

fetch(`${BACKEND_URL}/api/afm/verify`, ...)
```

### 2. Кэширование

Backend уже должен кэшировать результаты на 24 часа.

### 3. Rate Limiting

Добавить на backend:
```bash
npm install express-rate-limit
```

### 4. Таймауты

Установить таймаут на фронте:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 sec

fetch(url, { signal: controller.signal })
```

## Тестирование

1. **Невалидный формат:** "123" → должно показать ошибку формата
2. **Несуществующий ΑΦΜ:** "999999999" → должно показать "не найден"
3. **Реальный ΑΦΜ:** использовать настоящий → должно вернуть данные
4. **CAPTCHA:** если появится → показать пользователю ошибку

---

**Готово!** Теперь можно интегрировать проверку ΑΦΜ в форму регистрации.
