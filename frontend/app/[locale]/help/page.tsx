"use client";

import { useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import Image from 'next/image';

// Section type
interface HelpSection {
  id: string;
  title: string;
  items: {
    title: string;
    content: string[];
    screenshots: string[];
  }[];
}

// Russian content
const helpContentRu: HelpSection[] = [
  {
    id: 'start',
    title: '1. Начало работы',
    items: [
      {
        title: '1.1 Страница выбора языка',
        content: [
          'Приложение доступно на 8 языках:',
          '🇬🇷 Ελληνικά (Греческий)',
          '🇷🇺 Русский',
          '🇺🇦 Українська (Украинский)',
          '🇦🇱 Shqip (Албанский)',
          '🇧🇬 Български (Болгарский)',
          '🇷🇴 Română (Румынский)',
          '🇬🇧 English (Английский)',
          '🇸🇦 العربية (Арабский)',
          'Выберите ваш язык — интерфейс переключится автоматически.',
        ],
        screenshots: ['language-select.jpg'],
      },
      {
        title: '1.2 Установка на телефон',
        content: [
          'На главной странице есть кнопка «Скачать приложение».',
          'Нажмите на неё — приложение установится на ваш телефон.',
        ],
        screenshots: ['1.ru.jpg'],
      },
      {
        title: '1.3 Главная страница',
        content: [
          'Это первая страница приложения. Здесь вы можете:',
          '• Войти в свой аккаунт',
          '• Зарегистрироваться',
          '• Посмотреть тарифы',
          '• Скачать приложение на телефон',
        ],
        screenshots: ['2.ru.jpg'],
      },
      {
        title: '1.4 Регистрация',
        content: [
          'Чтобы начать работу, создайте аккаунт:',
          '1. Выберите тип документа:',
          '   • ΑΠΟΔΕΙΞΗ — для физических лиц',
          '   • ΤΙΜΟΛΟΓΙΟ — для компаний/юр. лиц',
          '2. Заполните данные: Имя, Email, Телефон, Пароль',
          '3. Для компаний: введите ΑΦΜ — данные заполнятся автоматически',
          '4. Если есть код приглашения — введите его',
          '5. Нажмите «Зарегистрироваться»',
        ],
        screenshots: ['3.ru.jpg', '4.ru.jpg', '5.ru.jpg', '6.ru.jpg'],
      },
      {
        title: '1.5 Вход в систему',
        content: [
          'Для входа введите Email и Пароль, нажмите «Войти».',
        ],
        screenshots: ['7.ru.jpg'],
      },
      {
        title: '1.6 Сброс пароля',
        content: [
          '1. Нажмите «Забыли пароль?»',
          '2. Введите email',
          '3. Нажмите «Отправить ссылку»',
          '4. Проверьте почту',
          '5. Перейдите по ссылке',
          '6. Введите новый пароль',
        ],
        screenshots: ['8.ru.jpg', '9.ru.jpg'],
      },
    ],
  },
  {
    id: 'dashboard',
    title: '2. Главная панель',
    items: [
      {
        title: 'Обзор панели',
        content: [
          'После входа вы попадаете на главную панель:',
          '• Способы оплаты — как вам платят клиенты',
          '• Общие расходы — расходы на бизнес',
          '• Объекты — ваши проекты',
          '• Финансовый анализ — отчёты (Standard/Premium)',
          '• Личный кабинет — настройки',
        ],
        screenshots: ['10.ru.jpg'],
      },
    ],
  },
  {
    id: 'payment-methods',
    title: '3. Способы оплаты',
    items: [
      {
        title: '3.1 Список способов оплаты',
        content: [
          'Здесь отображаются все ваши способы оплаты.',
        ],
        screenshots: ['11.ru.jpg'],
      },
      {
        title: '3.2 Добавление способа оплаты',
        content: [
          '1. Нажмите «Добавить способ оплаты»',
          '2. Выберите тип:',
          '   • Наличные',
          '   • Кредитная карта',
          '   • Дебетовая карта',
          '   • Банковский счёт',
          '3. Введите название',
          '4. Нажмите «Сохранить»',
        ],
        screenshots: ['12.ru.jpg'],
      },
    ],
  },
  {
    id: 'global-expenses',
    title: '4. Общие расходы',
    items: [
      {
        title: '4.1 Управление категориями',
        content: [
          'Создавайте категории для группировки расходов.',
        ],
        screenshots: ['13.ru.jpg', '14.ru.jpg'],
      },
      {
        title: '4.2 Список расходов',
        content: [
          'Все расходы отображаются по категориям.',
        ],
        screenshots: ['15.ru.jpg'],
      },
      {
        title: '4.3 Добавление расхода',
        content: [
          'Удобные функции (Standard/Premium):',
          '• Голосовой ввод — скажите «Купил цемент за 50 евро»',
          '• Фото чека — данные заполнятся автоматически',
        ],
        screenshots: ['16.ru.jpg'],
      },
    ],
  },
  {
    id: 'objects',
    title: '5. Объекты и финансы',
    items: [
      {
        title: '5.1 Список объектов',
        content: [
          'Лимиты по тарифам:',
          '• Basic — 10 объектов',
          '• Standard — 50 объектов',
          '• Premium — безлимит',
        ],
        screenshots: ['17.ru.jpg'],
      },
      {
        title: '5.2 Добавление объекта',
        content: [
          'Создайте новый проект с указанием цены контракта.',
        ],
        screenshots: ['18.ru.jpg'],
      },
      {
        title: '5.3 Дополнительные работы',
        content: [
          'Добавляйте дополнительные работы к объекту.',
        ],
        screenshots: ['26.ru.jpg'],
      },
      {
        title: '5.4 Добавление платежа',
        content: [
          'Записывайте платежи от клиентов.',
        ],
        screenshots: ['27.ru.jpg'],
      },
      {
        title: '5.5 Расходы объекта',
        content: [
          'Расходы привязываются к конкретному объекту.',
        ],
        screenshots: ['26.ru.jpg'],
      },
      {
        title: '5.6 Финансы объекта',
        content: [
          'Цвета баланса:',
          '🟠 Оранжевый — клиент должен',
          '🟢 Зелёный — полностью оплачено',
          '⚪ Светлый — переплата',
        ],
        screenshots: ['26.ru.jpg'],
      },
      {
        title: '5.7 Закрытие объекта',
        content: [
          'После завершения работ закройте объект для расчёта прибыли.',
        ],
        screenshots: ['26.ru.jpg'],
      },
    ],
  },
  {
    id: 'analysis',
    title: '6. Финансовый анализ',
    items: [
      {
        title: 'Общий анализ',
        content: [
          'Доступно для: Standard и Premium',
          '',
          'Цвета прибыли:',
          '🟢 Зелёный — в плюсе',
          '🟠 Оранжевый — в минусе',
        ],
        screenshots: ['26.ru.jpg'],
      },
    ],
  },
  {
    id: 'profile',
    title: '7. Личный кабинет',
    items: [
      {
        title: '7.1 Меню',
        content: [
          'Доступ ко всем настройкам аккаунта.',
        ],
        screenshots: ['26.ru.jpg'],
      },
      {
        title: '7.2 Мои данные',
        content: [
          'Просмотр и редактирование личных данных.',
        ],
        screenshots: ['27.ru.jpg', '28.jpg'],
      },
      {
        title: '7.3 Смена пароля',
        content: [
          'Изменение пароля для входа.',
        ],
        screenshots: ['29.jpg'],
      },
    ],
  },
  {
    id: 'subscription',
    title: '8. Подписка и оплата',
    items: [
      {
        title: '8.1 Моя подписка',
        content: [
          'Информация о текущем тарифе.',
        ],
        screenshots: ['30.jpg'],
      },
      {
        title: '8.2 Покупка аккаунта',
        content: [
          'Цена: 62€ (с ΦΠΑ) + месяц бесплатно',
        ],
        screenshots: ['31.jpg'],
      },
      {
        title: '8.3 Выбор плана',
        content: [
          'Basic — 24,80€/мес (10 объектов, 1 пользователь)',
          'Standard — 49,60€/мес (50 объектов, 2 пользователя, голос, фото)',
          'Premium — 93,00€/мес (безлимит, 5 пользователей, все функции)',
        ],
        screenshots: ['32.jpg'],
      },
    ],
  },
  {
    id: 'team',
    title: '9. Команда и поддержка',
    items: [
      {
        title: '9.1 Реферальная программа',
        content: [
          'Приглашайте друзей → получите 1 бонусный месяц',
          'Доступно только после покупки аккаунта.',
        ],
        screenshots: ['33.jpg'],
      },
      {
        title: '9.2 Моя команда',
        content: [
          'Лимиты:',
          '• Basic — 1 пользователь',
          '• Standard — 2 пользователя',
          '• Premium — 5 пользователей',
        ],
        screenshots: ['34.jpg'],
      },
      {
        title: '9.3 Поддержка',
        content: [
          'Способы связи: Viber, WhatsApp',
          'Время ответа: в течение 48 часов',
        ],
        screenshots: ['35.jpg'],
      },
      {
        title: '9.4 Удаление аккаунта',
        content: [
          '⚠️ Все данные будут удалены безвозвратно!',
        ],
        screenshots: ['36.jpg'],
      },
    ],
  },
];

export default function HelpPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.help || messages.el.help;

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Get screenshot path based on locale
  const getScreenshotPath = (filename: string) => {
    // language-select.jpg is in root /help/ folder
    if (filename === 'language-select.jpg') {
      return `/help/${filename}`;
    }
    // All other screenshots are in /help/ru/
    return `/help/ru/${filename}`;
  };

  // For now, use Russian content for Russian locale
  const helpContent = helpContentRu;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#033a45',
        paddingTop: '40px',
        paddingBottom: '120px',
        paddingLeft: '40px',
        paddingRight: '40px'
      }}
    >
      {/* Back - at top with normal padding */}
      <p
        onClick={() => router.push(`/${locale}`)}
        className="text-button cursor-pointer"
        style={{ color: 'var(--polar)', marginBottom: '48px' }}
      >
        {t.back}
      </p>

      {/* Intro text */}
      <div className="flex flex-col items-center gap-12">
        <p
          className="text-center text-body"
          style={{ color: 'var(--polar)', fontWeight: 500 }}
        >
          Мобильное приложение, которое освобождает мастера от рутины учёта финансов.
        </p>

        <p
          className="text-center text-body"
          style={{ color: 'var(--polar)', fontWeight: 500 }}
        >
          ΑΠΑΛΛΑΚΤΗΣ — «освободитель»
        </p>

        <p
          className="text-center text-slogan"
          style={{ color: 'var(--orange)' }}
        >
          "Τέλος στη ρουτίνα!"
        </p>

        <p
          className="text-center text-body"
          style={{ color: 'var(--polar)', fontWeight: 500 }}
        >
          — "Конец рутине!"
        </p>
      </div>

      {/* Disclaimer - white text, no orange background */}
      <div
        className="text-center"
        style={{ marginTop: '48px', marginBottom: '48px' }}
      >
        <p className="text-button font-semibold" style={{ color: 'white' }}>
          Это НЕ бухгалтерская программа
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--polar)' }}>
          Это персональный инструмент финансового контроля
        </p>
      </div>

      {/* Title */}
      <h1
        className="text-2xl font-bold text-center"
        style={{ color: 'var(--polar)', marginBottom: '48px' }}
      >
        Инструкция
      </h1>

      {/* Sections */}
      <div className="flex flex-col gap-4">
          {helpContent.map((section, sectionIndex) => {
            const isSectionExpanded = expandedSections.has(section.id);

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full rounded-2xl flex justify-between items-center"
                  style={{
                    backgroundColor: 'var(--polar)',
                    padding: '16px 20px',
                    minHeight: '52px'
                  }}
                >
                  <span
                    className="font-bold"
                    style={{ color: 'var(--deep-teal)', fontSize: '16px' }}
                  >
                    {section.title}
                  </span>
                  <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
                    {isSectionExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Section Items */}
                {isSectionExpanded && (
                  <div className="mt-2 flex flex-col gap-2 pl-2">
                    {section.items.map((item, itemIndex) => {
                      const itemId = `${section.id}-${itemIndex}`;
                      const isItemExpanded = expandedItems.has(itemId);

                      return (
                        <div key={itemId}>
                          {/* Item Header */}
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full rounded-2xl flex justify-between items-center"
                            style={{
                              backgroundColor: 'var(--zanah)',
                              padding: '12px 16px',
                              minHeight: '44px'
                            }}
                          >
                            <span
                              className="font-semibold text-left"
                              style={{ color: 'var(--deep-teal)', fontSize: '14px' }}
                            >
                              {item.title}
                            </span>
                            <span style={{ color: 'var(--deep-teal)', fontSize: '14px' }}>
                              {isItemExpanded ? '▲' : '▼'}
                            </span>
                          </button>

                          {/* Item Content */}
                          {isItemExpanded && (
                            <div
                              className="mt-2 rounded-2xl"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '16px'
                              }}
                            >
                              {/* Screenshots */}
                              {item.screenshots.length > 0 && (
                                <div className="flex flex-col gap-2 mb-4">
                                  {item.screenshots.map((screenshot, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg overflow-hidden"
                                      style={{
                                        border: '2px solid var(--skeptic)',
                                        backgroundColor: '#f5f5f5'
                                      }}
                                    >
                                      <Image
                                        src={getScreenshotPath(screenshot)}
                                        alt={`${item.title} - ${idx + 1}`}
                                        width={400}
                                        height={300}
                                        style={{
                                          width: '100%',
                                          height: 'auto',
                                          objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                          // Hide broken images
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Text Content */}
                              <div className="flex flex-col gap-1">
                                {item.content.map((line, lineIdx) => (
                                  <p
                                    key={lineIdx}
                                    className="text-sm"
                                    style={{
                                      color: 'var(--deep-teal)',
                                      paddingLeft: line.startsWith('•') || line.startsWith('   ') ? '12px' : '0'
                                    }}
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logo at bottom - 3x bigger */}
        <div className="flex justify-center" style={{ marginTop: '48px' }}>
          <Image
            src="/Apallaktis.photos/apallaktis-logo-orange@2x.png"
            alt="ΑΠΑΛΛΑΚΤΗΣ"
            width={450}
            height={150}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  );
}
