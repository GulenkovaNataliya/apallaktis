/**
 * Smart Voice Input Parser
 * Parses voice input and extracts: amount, date, category, description
 * Supports: el, ru, en, uk, sq, bg, ro, ar
 */

export interface ParsedVoiceInput {
  amount: number | null;
  date: string | null; // ISO format YYYY-MM-DD
  category: string | null;
  description: string;
}

// Month names in all supported languages
const MONTHS: Record<string, Record<string, number>> = {
  // Greek
  el: {
    'ιανουαρίου': 1, 'ιανουάριο': 1, 'γενάρη': 1,
    'φεβρουαρίου': 2, 'φεβρουάριο': 2, 'φλεβάρη': 2,
    'μαρτίου': 3, 'μάρτιο': 3, 'μάρτη': 3,
    'απριλίου': 4, 'απρίλιο': 4, 'απρίλη': 4,
    'μαΐου': 5, 'μάιο': 5, 'μάη': 5,
    'ιουνίου': 6, 'ιούνιο': 6, 'ιούνη': 6,
    'ιουλίου': 7, 'ιούλιο': 7, 'ιούλη': 7,
    'αυγούστου': 8, 'αύγουστο': 8,
    'σεπτεμβρίου': 9, 'σεπτέμβριο': 9, 'σεπτέμβρη': 9,
    'οκτωβρίου': 10, 'οκτώβριο': 10, 'οκτώβρη': 10,
    'νοεμβρίου': 11, 'νοέμβριο': 11, 'νοέμβρη': 11,
    'δεκεμβρίου': 12, 'δεκέμβριο': 12, 'δεκέμβρη': 12,
  },
  // Russian
  ru: {
    'января': 1, 'январь': 1, 'янв': 1,
    'февраля': 2, 'февраль': 2, 'фев': 2,
    'марта': 3, 'март': 3, 'мар': 3,
    'апреля': 4, 'апрель': 4, 'апр': 4,
    'мая': 5, 'май': 5,
    'июня': 6, 'июнь': 6, 'июн': 6,
    'июля': 7, 'июль': 7, 'июл': 7,
    'августа': 8, 'август': 8, 'авг': 8,
    'сентября': 9, 'сентябрь': 9, 'сен': 9,
    'октября': 10, 'октябрь': 10, 'окт': 10,
    'ноября': 11, 'ноябрь': 11, 'ноя': 11,
    'декабря': 12, 'декабрь': 12, 'дек': 12,
  },
  // English
  en: {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
  },
  // Ukrainian
  uk: {
    'січня': 1, 'січень': 1,
    'лютого': 2, 'лютий': 2,
    'березня': 3, 'березень': 3,
    'квітня': 4, 'квітень': 4,
    'травня': 5, 'травень': 5,
    'червня': 6, 'червень': 6,
    'липня': 7, 'липень': 7,
    'серпня': 8, 'серпень': 8,
    'вересня': 9, 'вересень': 9,
    'жовтня': 10, 'жовтень': 10,
    'листопада': 11, 'листопад': 11,
    'грудня': 12, 'грудень': 12,
  },
  // Albanian
  sq: {
    'janar': 1, 'shkurt': 2, 'mars': 3, 'prill': 4,
    'maj': 5, 'qershor': 6, 'korrik': 7, 'gusht': 8,
    'shtator': 9, 'tetor': 10, 'nëntor': 11, 'dhjetor': 12,
  },
  // Bulgarian
  bg: {
    'януари': 1, 'февруари': 2, 'март': 3, 'април': 4,
    'май': 5, 'юни': 6, 'юли': 7, 'август': 8,
    'септември': 9, 'октомври': 10, 'ноември': 11, 'декември': 12,
  },
  // Romanian
  ro: {
    'ianuarie': 1, 'februarie': 2, 'martie': 3, 'aprilie': 4,
    'mai': 5, 'iunie': 6, 'iulie': 7, 'august': 8,
    'septembrie': 9, 'octombrie': 10, 'noiembrie': 11, 'decembrie': 12,
  },
  // Arabic
  ar: {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4,
    'مايو': 5, 'يونيو': 6, 'يوليو': 7, 'أغسطس': 8,
    'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12,
  },
};

// Relative date words
const RELATIVE_DATES: Record<string, Record<string, number>> = {
  el: { 'σήμερα': 0, 'χθες': -1, 'προχθές': -2 },
  ru: { 'сегодня': 0, 'вчера': -1, 'позавчера': -2 },
  en: { 'today': 0, 'yesterday': -1 },
  uk: { 'сьогодні': 0, 'вчора': -1, 'позавчора': -2 },
  sq: { 'sot': 0, 'dje': -1, 'pardje': -2 },
  bg: { 'днес': 0, 'вчера': -1, 'завчера': -2 },
  ro: { 'azi': 0, 'ieri': -1, 'alaltăieri': -2 },
  ar: { 'اليوم': 0, 'أمس': -1 },
};

// Currency words to remove from description
const CURRENCY_WORDS = [
  'евро', 'euro', 'euros', 'ευρώ',
  'долларов', 'доллар', 'dollars', 'dollar', 'δολάρια',
  'лева', 'лев', 'лей', 'леи',
  '€', '$', '₴', '₽',
];

/**
 * Parse voice input text and extract structured data
 */
export function parseVoiceInput(
  text: string,
  locale: string,
  categoryNames?: string[]
): ParsedVoiceInput {
  let workingText = text.toLowerCase().trim();
  let amount: number | null = null;
  let date: string | null = null;
  let category: string | null = null;

  // 1. Extract amount (number + optional currency)
  // Pattern: number followed by optional currency word
  const amountPatterns = [
    /(\d+[.,]?\d*)\s*(евро|euro|euros|ευρώ|долларов|доллар|dollars|dollar|δολάρια|лева|лев|лей|леи|€|\$|₴|₽)/gi,
    /(\d+[.,]?\d*)\s+/g, // Just numbers
  ];

  for (const pattern of amountPatterns) {
    const match = workingText.match(pattern);
    if (match && match[0]) {
      const numMatch = match[0].match(/(\d+[.,]?\d*)/);
      if (numMatch) {
        const numStr = numMatch[1].replace(',', '.');
        const parsed = parseFloat(numStr);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          // Remove the amount from working text
          workingText = workingText.replace(match[0], ' ');
          break;
        }
      }
    }
  }

  // 2. Extract date
  const today = new Date();

  // Check relative dates first
  const relativeDates = RELATIVE_DATES[locale] || RELATIVE_DATES['en'];
  for (const [word, offset] of Object.entries(relativeDates)) {
    if (workingText.includes(word)) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + offset);
      date = targetDate.toISOString().split('T')[0];
      workingText = workingText.replace(new RegExp(word, 'gi'), ' ');
      break;
    }
  }

  // Check for "day month" pattern if no relative date found
  if (!date) {
    const months = { ...MONTHS[locale], ...MONTHS['en'] }; // Include English as fallback

    for (const [monthName, monthNum] of Object.entries(months)) {
      const dayMonthPattern = new RegExp(`(\\d{1,2})\\s*${monthName}`, 'gi');
      const monthDayPattern = new RegExp(`${monthName}\\s*(\\d{1,2})`, 'gi');

      let match = workingText.match(dayMonthPattern);
      if (match) {
        const dayMatch = match[0].match(/(\d{1,2})/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (day >= 1 && day <= 31) {
            const year = today.getFullYear();
            const month = monthNum;
            date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            workingText = workingText.replace(match[0], ' ');
            break;
          }
        }
      }

      match = workingText.match(monthDayPattern);
      if (match) {
        const dayMatch = match[0].match(/(\d{1,2})/);
        if (dayMatch) {
          const day = parseInt(dayMatch[1]);
          if (day >= 1 && day <= 31) {
            const year = today.getFullYear();
            const month = monthNum;
            date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            workingText = workingText.replace(match[0], ' ');
            break;
          }
        }
      }
    }
  }

  // 3. Extract category if category names provided
  if (categoryNames && categoryNames.length > 0) {
    const lowerCategoryNames = categoryNames.map(c => c.toLowerCase());
    for (let i = 0; i < lowerCategoryNames.length; i++) {
      if (workingText.includes(lowerCategoryNames[i])) {
        category = categoryNames[i]; // Return original case
        workingText = workingText.replace(new RegExp(lowerCategoryNames[i], 'gi'), ' ');
        break;
      }
    }
  }

  // 4. Clean up remaining text for description
  // Remove currency words
  for (const currencyWord of CURRENCY_WORDS) {
    workingText = workingText.replace(new RegExp(currencyWord, 'gi'), ' ');
  }

  // Remove common filler words
  const fillerWords: Record<string, string[]> = {
    el: ['για', 'στις', 'στο', 'στη', 'στα', 'τον', 'την', 'το'],
    ru: ['за', 'на', 'для', 'в', 'во'],
    en: ['for', 'on', 'at', 'the', 'a', 'an'],
    uk: ['за', 'на', 'для', 'в', 'у'],
    sq: ['për', 'në', 'me'],
    bg: ['за', 'на', 'в', 'във'],
    ro: ['pentru', 'la', 'în', 'pe'],
    ar: ['على', 'في', 'من', 'إلى'],
  };

  const fillers = fillerWords[locale] || fillerWords['en'];
  for (const filler of fillers) {
    // Only remove if it's a standalone word
    workingText = workingText.replace(new RegExp(`\\b${filler}\\b`, 'gi'), ' ');
  }

  // Clean up whitespace
  const description = workingText
    .replace(/\s+/g, ' ')
    .trim();

  return {
    amount,
    date,
    category,
    description: description || text.trim(), // Fallback to original if nothing left
  };
}

/**
 * Format parsed result for display/debugging
 */
export function formatParsedResult(parsed: ParsedVoiceInput, locale: string): string {
  const parts: string[] = [];

  if (parsed.amount !== null) {
    parts.push(`Amount: €${parsed.amount}`);
  }
  if (parsed.date) {
    parts.push(`Date: ${parsed.date}`);
  }
  if (parsed.category) {
    parts.push(`Category: ${parsed.category}`);
  }
  if (parsed.description) {
    parts.push(`Description: ${parsed.description}`);
  }

  return parts.join(' | ');
}
