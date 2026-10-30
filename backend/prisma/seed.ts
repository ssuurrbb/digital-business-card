import {
  LinkKind,
  PrismaClient,
  SkillCategory,
} from '@prisma/client';

const prisma = new PrismaClient();

const PROFILE_SLUG = 'me';

const skills: { name: string; category: SkillCategory }[] = [
  { name: 'Node.js', category: SkillCategory.RUNTIME },
  { name: 'TypeScript', category: SkillCategory.LANGUAGE },
  { name: 'JavaScript', category: SkillCategory.LANGUAGE },
  { name: 'NestJS', category: SkillCategory.FRAMEWORK },
  { name: 'Express', category: SkillCategory.FRAMEWORK },
  { name: 'Fastify', category: SkillCategory.FRAMEWORK },
  { name: 'MongoDB', category: SkillCategory.DATABASE },
  { name: 'PostgreSQL', category: SkillCategory.DATABASE },
  { name: 'Redis', category: SkillCategory.DATABASE },
  { name: 'ClickHouse', category: SkillCategory.DATABASE },
  { name: 'SQL', category: SkillCategory.DATABASE },
  { name: 'Prisma', category: SkillCategory.TOOL },
  { name: 'REST API', category: SkillCategory.OTHER },
  { name: 'Swagger', category: SkillCategory.TOOL },
  { name: 'JWT', category: SkillCategory.OTHER },
  { name: 'Микросервисы', category: SkillCategory.OTHER },
  { name: 'Docker', category: SkillCategory.INFRA },
  { name: 'Nginx', category: SkillCategory.INFRA },
  { name: 'Linux', category: SkillCategory.INFRA },
  { name: 'Git', category: SkillCategory.TOOL },
  { name: 'Telegram Bot API', category: SkillCategory.TOOL },
  { name: 'Next.js', category: SkillCategory.FRAMEWORK },
  { name: 'React', category: SkillCategory.FRAMEWORK },
  { name: 'Caddy', category: SkillCategory.INFRA },
  { name: 'RAG', category: SkillCategory.OTHER },
  { name: 'BM25', category: SkillCategory.OTHER },
  { name: 'AmoCRM', category: SkillCategory.OTHER },
];

const profileSkillNames = [
  'Node.js',
  'TypeScript',
  'JavaScript',
  'NestJS',
  'Express',
  'Fastify',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'ClickHouse',
  'SQL',
  'Prisma',
  'REST API',
  'Swagger',
  'JWT',
  'Микросервисы',
  'Docker',
  'Nginx',
  'Linux',
  'Git',
  'Telegram Bot API',
];

async function main() {
  const existing = await prisma.profile.findUnique({
    where: { slug: PROFILE_SLUG },
  });

  if (existing) {
    console.log('Profile already exists, skip seed to keep admin edits.');
    return;
  }

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      create: skill,
      update: { category: skill.category },
    });
  }

  const skillRows = await prisma.skill.findMany();
  const skillIdByName = new Map(skillRows.map((row) => [row.name, row.id]));

  const profile = await prisma.profile.create({
    data: {
      slug: PROFILE_SLUG,
      name: 'Михаил Брусельцев',
      headline: 'Backend-разработчик (Node.js, TypeScript)',
      description:
        'Люблю задачи, где нужно разобраться в бизнес-логике и выразить её в коде точно: расчёт метрик, пейсинг, правила, которые нельзя нарушить. Ищу команду с код-ревью и сильными инженерами, у которых можно расти. Вне работы — спорт и книги.',
      location: 'Новосибирск',
      links: {
        create: [
          {
            kind: LinkKind.EMAIL,
            label: 'Email',
            url: 'mailto:bruseltsev@bk.ru',
            sortOrder: 0,
          },
        ],
      },
      skills: {
        create: profileSkillNames.map((name, sortOrder) => {
          const skillId = skillIdByName.get(name);
          if (!skillId) {
            throw new Error(`Skill not found: ${name}`);
          }
          return { skillId, sortOrder };
        }),
      },
      experiences: {
        create: [
          {
            company: 'Finmatik',
            position: 'Backend-разработчик',
            startDate: new Date('2024-04-01'),
            endDate: null,
            sortOrder: 0,
            achievements: {
              create: [
                {
                  sortOrder: 0,
                  text: 'Бэкенд рекламной платформы (ретаргетинг и видеореклама) на Node.js: Fastify, MongoDB, Redis, ClickHouse, pm2. Три сервиса — обработка трафика, админ-API и браузерное расширение; в репозитории 66 из 227 коммитов.',
                },
                {
                  sortOrder: 1,
                  text: 'Алгоритм пейсинга показов и кликов — ядро системы: удерживает фактические CTR и VTR внутри коридоров медиаплана, догоняет клики, когда дневной план показов уже выполнен, и не допускает перелива сверх лимита.',
                },
                {
                  sortOrder: 2,
                  text: 'Перераспределение остатков медиаплана за 30 минут до завершения: недовыполненные объёмы переносятся на активные баннеры вместо обнуления.',
                },
                {
                  sortOrder: 3,
                  text: 'Устранил системный класс дефектов в учёте: уходящие в минус остатки показов, несброшенные счётчики бустов, продолжение закупки по остановленным кампаниям.',
                },
                {
                  sortOrder: 4,
                  text: 'API решения о показе для браузерного расширения: подстановка видеорекламы на домен с учётом категории сайта, гео и чёрного списка.',
                },
                {
                  sortOrder: 5,
                  text: 'Автоматическая категоризация доменов и выгрузка отчётов по видеотегам и статистике баннеров с фильтрами в админпанели.',
                },
                {
                  sortOrder: 6,
                  text: 'Сократил объём хранимых логов: TTL-индексы в MongoDB для автоудаления, плановая очистка устаревших коллекций, синхронизация прода в dev для воспроизведения багов.',
                },
                {
                  sortOrder: 7,
                  text: 'Гео-фильтрация кампаний с исключением отдельных городов, нормализация числовых метрик, перевод расчётов в московское время.',
                },
                {
                  sortOrder: 8,
                  text: 'Настроил хранение файлов в S3-совместимом объектном хранилище с конвертацией изображений в WebP.',
                },
                {
                  sortOrder: 9,
                  text: 'Собрал парсер на Puppeteer и Cheerio с ограничением конкурентности: выгрузка карточек организаций, продуктов по категориям и отзывов, итоговые датасеты до 8 МБ JSON.',
                },
                {
                  sortOrder: 10,
                  text: 'Реализовал инструмент генерации контента на LLM для наполнения сайта.',
                },
                {
                  sortOrder: 11,
                  text: 'Поддерживал документацию API в Swagger, участвовал в код-ревью и рефакторинге legacy-кода.',
                },
              ],
            },
          },
          {
            company: 'ООО ПРФ «Альянсэнерго»',
            position: 'Инженер-программист',
            startDate: new Date('2023-10-01'),
            endDate: new Date('2024-04-01'),
            sortOrder: 1,
            achievements: {
              create: [
                {
                  sortOrder: 0,
                  text: 'Внутренняя система учёта компании: PHP на бэкенде, SQL-база, HTML-интерфейс.',
                },
                {
                  sortOrder: 1,
                  text: 'Спроектировал и внедрил REST API модуля управления пользователями и правами доступа.',
                },
                {
                  sortOrder: 2,
                  text: 'Настроил схему SQL-базы и ограничения целостности данных, участвовал в проектировании архитектуры приложения.',
                },
              ],
            },
          },
          {
            company: 'Реводс Мобаил',
            position: 'Разработчик конфигурационного файла',
            startDate: new Date('2022-08-01'),
            endDate: new Date('2023-12-01'),
            sortOrder: 2,
            achievements: {
              create: [
                {
                  sortOrder: 0,
                  text: 'Делал конфигурационные файлы интернет-магазинов для приложения компании.',
                },
              ],
            },
          },
          {
            company: 'Смарт Лидз',
            companyUrl: 'https://www.cityads.ru/',
            position: 'Арбитраж трафика',
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-04-01'),
            sortOrder: 3,
            achievements: {
              create: [
                {
                  sortOrder: 0,
                  text: 'Контекстная реклама в поисковике Bing и отслеживание рекламного трафика.',
                },
              ],
            },
          },
        ],
      },
      projects: {
        create: [
          {
            name: 'СтройОтбор',
            sortOrder: 0,
            description:
              'SaaS для строительных подрядчиков: подбирает госзакупки под профиль фирмы и сразу показывает, останется ли подрядчик в плюсе. Сделан от идеи до прода с тарифами: интеграция с ЕИС, калькулятор маржи, матчинг закупок, Telegram-боты и ежедневный бэкап Postgres.',
            url: null,
            repoUrl: null,
            skills: {
              create: connectSkills(skillIdByName, [
                'Next.js',
                'React',
                'TypeScript',
                'PostgreSQL',
                'Prisma',
                'Docker',
                'Caddy',
                'Telegram Bot API',
              ]),
            },
          },
          {
            name: 'AI-ассистент менеджера поддержки',
            sortOrder: 1,
            description:
              'Принимает обращение клиента из AmoCRM и возвращает менеджеру готовый ответ плюс подсказку по допродаже. RAG на BM25 со стеммингом под русский, гардрейлы в коде поверх промпта и offline-режим, если нет ключа модели.',
            url: null,
            repoUrl: null,
            skills: {
              create: connectSkills(skillIdByName, [
                'Node.js',
                'RAG',
                'BM25',
                'AmoCRM',
              ]),
            },
          },
          {
            name: 'QuitNicotine',
            sortOrder: 2,
            description:
              'Мобильное приложение поддержки отказа от никотина: локальные пуш-уведомления, локализация, хранение прогресса офлайн. Собрано через EAS и опубликовано в RuStore.',
            url: null,
            repoUrl: null,
          },
        ],
      },
    },
  });

  console.log(`Seeded profile ${profile.id}`);
}

function connectSkills(
  skillIdByName: Map<string, string>,
  names: string[],
): { skillId: string }[] {
  return names.map((name) => {
    const skillId = skillIdByName.get(name);
    if (!skillId) {
      throw new Error(`Skill not found: ${name}`);
    }
    return { skillId };
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
