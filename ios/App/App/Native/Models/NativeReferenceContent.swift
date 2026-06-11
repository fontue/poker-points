import Foundation

struct NativeReferenceSection: Identifiable {
    let id: String
    let title: String
    let items: [NativeReferenceItem]
}

struct NativeReferenceItem: Identifiable {
    let id = UUID()
    let title: String?
    let bullets: [String]
}

enum NativeReferenceContent {
    static let sections: [NativeReferenceSection] = [
        NativeReferenceSection(
            id: "general-rules",
            title: "Общие правила",
            items: [
                NativeReferenceItem(title: nil, bullets: [
                    "Не обсуждать раздачу и свою руку до завершения раздачи",
                    "Не смотреть чужие руки и не показывать свою руку другим игрокам",
                    "Не подсказывать",
                    "Не нарушать порядок действий за столом",
                    "Не смотреть карты флопа/терна/ривера раньше времени, вне зависимости выбыл игрок из раздачи или нет",
                    "Нельзя брать фишки другого игрока или передавать их другим игрокам. В случае нарушения фишки переходят в пот банка"
                ]),
                NativeReferenceItem(title: "Санкции", bullets: [
                    "Сброс руки",
                    "Пропуск одной раздачи",
                    "Пропуск круга раздач",
                    "Штрафы 1-2ББ в пот банка раздачи"
                ])
            ]
        ),
        NativeReferenceSection(
            id: "table-actions",
            title: "Правила действий за столом",
            items: [
                NativeReferenceItem(title: nil, bullets: [
                    "Ставка молча - call",
                    "Рейз необходимо озвучить",
                    "Озвученное действие считается совершенным"
                ])
            ]
        ),
        NativeReferenceSection(
            id: "card-opening",
            title: "Правила открытия карт",
            items: [
                NativeReferenceItem(title: nil, bullets: [
                    "При all-in обязательно вскрываются карты на руке",
                    "На шоудауне первым открывает карты игрок, который сделал последнее агрессивное действие. Если ставок не было, первым открывается тот, кто говорил первым",
                    "Если игрок открыл свою руку раньше времени, торги не останавливаются и игра продолжается",
                    "Докрутка стола невозможна, если один из игроков против"
                ])
            ]
        ),
        NativeReferenceSection(
            id: "dealing-errors",
            title: "Решение ошибок при раздаче",
            items: [
                NativeReferenceItem(title: "Открылась 1 карта при раздаче", bullets: [
                    "Карта показывается всем",
                    "Карта сжигается",
                    "Игрок получает новую"
                ]),
                NativeReferenceItem(title: "Открылись 2+ карты при раздаче", bullets: [
                    "Полная пересдача",
                    "Колода перемешивается"
                ]),
                NativeReferenceItem(title: "Игрок получил неправильное количество карт", bullets: [
                    "Если заметили сразу - пересдача",
                    "Если уже началась игра - решение организатора"
                ]),
                NativeReferenceItem(title: "Флоп / терн / ривер открыли раньше времени", bullets: [
                    "Карта убирается",
                    "Ошибка исправляется",
                    "Карта возвращается в колоду",
                    "Колода перемешивается",
                    "Открывается новая карта"
                ]),
                NativeReferenceItem(title: "Забыли сжечь карту", bullets: [
                    "Открытая карта убирается",
                    "Сжигается правильная карта",
                    "Колода перемешивается",
                    "Открывается новая"
                ]),
                NativeReferenceItem(title: "Открыли две карты вместо одной", bullets: [
                    "Обе карты убираются",
                    "Колода перемешивается",
                    "Открывается заново"
                ]),
                NativeReferenceItem(title: "Игрок случайно показал карты", bullets: [
                    "Рука остается в игре"
                ]),
                NativeReferenceItem(title: "Карты игрока попали в сброс", bullets: [
                    "Если карты можно определить - рука жива",
                    "Если смешались - рука мертва"
                ]),
                NativeReferenceItem(title: "Любая спорная ситуация", bullets: [
                    "Решение организатора окончательное"
                ])
            ]
        )
    ]
}
