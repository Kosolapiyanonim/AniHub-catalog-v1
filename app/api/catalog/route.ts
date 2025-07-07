// НАЧАЛО КОДА ДЛЯ КОПИРОВАНИЯ

// 1. Получаем 'page' и 'limit' из запроса.
//    Если их нет, ставим значения по умолчанию (страница 1, лимит 28).
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 28;

// Также получаем параметры сортировки, если они есть
const sort = req.query.sort;
const order = req.query.order;

// 2. ВЫЧИСЛЯЕМ 'offset' (смещение). ЭТО ГЛАВНОЕ ИСПРАВЛЕНИЕ.
const offset = (page - 1) * limit;

// КОНЕЦ КОДА ДЛЯ КОПИРОВАНИЯ


// 3. Дальше в вашем коде ничего менять не нужно.
//    Он должен просто использовать переменные limit, offset, sort, order,
//    которые мы определили выше.
//
// Например, ваш следующий код может выглядеть так:
//
// const response = await fetch(`https://shikimori.one/api/animes?limit=${limit}&offset=${offset}&order=${sort}&status=ongoing`);
// const data = await response.json();
// res.status(200).json(data);
