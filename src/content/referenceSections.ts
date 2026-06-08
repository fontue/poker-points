export type ReferenceSection = {
  id: string;
  title: string;
  content: string;
};

export const referenceSections: ReferenceSection[] = [
  {
    id: 'general-rules',
    title: 'Общие правила',
    content: 'Тестовый контент раздела «Общие правила».'
  },
  {
    id: 'table-actions',
    title: 'Правила действий за столом',
    content: 'Тестовый контент раздела «Правила действий за столом».'
  },
  {
    id: 'card-opening',
    title: 'Правила открытия карт',
    content: 'Тестовый контент раздела «Правила открытия карт».'
  },
  {
    id: 'dealing-errors',
    title: 'Решение ошибок при раздаче',
    content: 'Тестовый контент раздела «Решение ошибок при раздаче».'
  },
  {
    id: 'tournament-settings',
    title: 'Параметры турнира',
    content: 'Тестовый контент раздела «Параметры турнира».'
  }
];
