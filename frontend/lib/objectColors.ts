/**
 * Object Color Utility
 * Детерминированное вычисление цвета объекта по индексу
 */

/**
 * Вычисляет цвет объекта на основе его индекса в списке
 * Градация от #e7f4f1 (светлый) до #c3e2dc (темный)
 *
 * @param index - Индекс объекта в списке (0-based)
 * @param total - Общее количество объектов
 * @returns RGB цвет в формате "rgb(r, g, b)"
 */
export function getObjectColor(index: number, total: number): string {
  const start = { r: 231, g: 244, b: 241 }; // #e7f4f1
  const end = { r: 195, g: 226, b: 220 };   // #c3e2dc

  const ratio = total > 1 ? index / (total - 1) : 0;

  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Преобразует RGB в hex формат
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
