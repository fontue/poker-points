export const totalMetrics = [
  {
    key: 'pointsInGame',
    label: 'Поинты в игре',
    suffix: 'P',
    tone: 'points',
    showInFooter: true
  },
  {
    key: 'pointsPaidByTokens',
    label: 'Оплачено',
    suffix: 'P',
    tone: 'paid',
    showInFooter: true
  },
  {
    key: 'prizePoints',
    label: 'Призовые',
    suffix: 'P',
    tone: 'prize'
  },
  {
    key: 'chipsInGame',
    label: 'Фишки',
    tone: 'chips',
    showInFooter: true
  },
  {
    key: 'averageStack',
    label: 'Средний стек',
    tone: 'neutral'
  }
];

export const footerMetrics = totalMetrics.filter((metric) => metric.showInFooter);
