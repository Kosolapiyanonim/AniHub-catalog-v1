import time
import requests
import os
from supabase import create_client, Client
from typing import List

# --- НАСТРОЙКИ ---
# Получаем данные из переменных окружения
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project-url.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
KODIK_TOKEN = os.getenv("KODIK_API_TOKEN", "0be448ef5f98485a4edcf09bb0969ae3")

print("🔧 Конфигурация:")
print(f"  - Supabase URL: {SUPABASE_URL}")
print(f"  - Supabase Key: {'✅ Установлен' if SUPABASE_KEY != 'your-service-role-key' else '❌ Не установлен'}")
print(f"  - Kodik Token: {'✅ Установлен' if KODIK_TOKEN != '0be448ef5f98485a4edcf09bb0969ae3' else '❌ Не установлен'}")
print()

def process_relations(supabase: Client, anime_id: int, items: List[str], relation_type: str):
    """Обрабатывает связи (жанры, студии, страны)."""
    if not items:
        return
    
    table_name = f"{relation_type}s"
    
    for item_name in items:
        if not item_name:
            continue
        try:
            # Используем upsert для избежания дубликатов
            relation_data = supabase.table(table_name).upsert(
                {"name": item_name}
            ).execute().data[0]
            relation_id = relation_data['id']
            
            # Создаем связь
            supabase.table("anime_relations").upsert({
                "anime_id": anime_id,
                "relation_id": relation_id,
                "relation_type": relation_type
            }).execute()
            
            print(f"    - ✅ Связь добавлена: {item_name} ({relation_type})")
        except Exception as e:
            print(f"    - ❌ Ошибка при обработке связи '{item_name}' ({relation_type}): {e}")

def run_test_parser():
    """Тестовая функция для парсинга и загрузки 10 аниме."""
    print("🚀 Запуск тестового парсера...")
    
    # Проверяем подключение к Supabase
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Успешное подключение к Supabase!")
        
        # Тестируем подключение
        test_response = supabase.table("animes").select("count", count="exact").execute()
        current_count = test_response.count or 0
        print(f"📊 Текущее количество аниме в базе: {current_count}")
        
    except Exception as e:
        print(f"❌ Ошибка подключения к Supabase: {e}")
        return
    
    # Запрос к Kodik API
    api_url = "https://kodikapi.com/list"
    params = {
        "token": KODIK_TOKEN,
        "limit": 10,  # Только 10 для теста
        "types": "anime,anime-serial",
        "with_material_data": "true",
        "sort": "shikimori_rating",
        "order": "desc"
    }
    
    print("\n🌀 Запрашиваем 10 лучших аниме для теста...")
    try:
        response = requests.get(api_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Получен ответ от Kodik API: {len(data.get('results', []))} аниме")
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка сети: {e}")
        return
    
    anime_list = data.get("results", [])
    if not anime_list:
        print("❌ Не удалось получить материалы для теста.")
        return
    
    print(f"\n📥 Обработка {len(anime_list)} аниме...")
    processed_count = 0
    
    for i, anime_data in enumerate(anime_list, 1):
        material_data = anime_data.get("material_data") or {}
        
        # Пропускаем аниме без shikimori_id
        if not anime_data.get("shikimori_id"):
            print(f"  {i}. ⏩ Пропуск: '{anime_data.get('title')}' (нет shikimori_id)")
            continue
        
        title = anime_data.get("title", "Без названия")
        shikimori_id = anime_data.get("shikimori_id")
        rating = material_data.get("shikimori_rating", 0)
        
        print(f"  {i}. 📥 Обработка: {title}")
        print(f"      - Shikimori ID: {shikimori_id}")
        print(f"      - Рейтинг: {rating}")
        print(f"      - Год: {anime_data.get('year', 'Неизвестно')}")
        
        try:
            # Подготавливаем данные для вставки
            record_to_upsert = {
                "kodik_id": anime_data.get("id"),
                "shikimori_id": shikimori_id,
                "kinopoisk_id": anime_data.get("kinopoisk_id"),
                "title": title,
                "title_orig": anime_data.get("title_orig"),
                "year": anime_data.get("year"),
                "poster_url": material_data.get("poster_url") or material_data.get("anime_poster_url"),
                "player_link": anime_data.get("link"),
                "description": material_data.get("description") or material_data.get("anime_description"),
                "type": anime_data.get("type"),
                "status": material_data.get("anime_status"),
                "episodes_count": anime_data.get("episodes_count"),
                "rating_mpaa": material_data.get("rating_mpaa"),
                "kinopoisk_rating": material_data.get("kinopoisk_rating"),
                "imdb_rating": material_data.get("imdb_rating"),
                "shikimori_rating": material_data.get("shikimori_rating"),
                "kinopoisk_votes": material_data.get("kinopoisk_votes"),
                "shikimori_votes": material_data.get("shikimori_votes"),
                "screenshots": {"screenshots": anime_data.get("screenshots", [])},
                "updated_at_kodik": anime_data.get("updated_at")
            }
            
            # Вставляем/обновляем аниме
            upsert_response = supabase.table("animes").upsert(
                record_to_upsert,
                on_conflict="shikimori_id"
            ).execute()
            
            our_anime_id = upsert_response.data[0]['id']
            print(f"      - ✅ Аниме сохранено (ID: {our_anime_id})")
            
            # Обрабатываем связи
            genres = material_data.get('anime_genres', [])
            studios = material_data.get('anime_studios', [])
            countries = material_data.get('countries', [])
            
            if genres:
                print(f"      - 🏷️ Жанры: {', '.join(genres[:3])}{'...' if len(genres) > 3 else ''}")
                process_relations(supabase, our_anime_id, genres, 'genre')
            
            if studios:
                print(f"      - 🏢 Студии: {', '.join(studios[:2])}{'...' if len(studios) > 2 else ''}")
                process_relations(supabase, our_anime_id, studios, 'studio')
            
            if countries:
                print(f"      - 🌍 Страны: {', '.join(countries)}")
                process_relations(supabase, our_anime_id, countries, 'country')
            
            processed_count += 1
            print(f"      - ✅ Обработка завершена")
            
            # Небольшая пауза между запросами
            time.sleep(0.5)
            
        except Exception as e:
            print(f"      - ❌ Ошибка при обработке '{title}': {e}")
        
        print()  # Пустая строка для разделения
    
    print(f"🎉 Тестовый парсинг завершен!")
    print(f"📊 Обработано аниме: {processed_count} из {len(anime_list)}")
    print(f"💾 Проверьте данные в вашей базе Supabase")
    
    # Финальная статистика
    try:
        final_response = supabase.table("animes").select("count", count="exact").execute()
        final_count = final_response.count or 0
        print(f"📈 Общее количество аниме в базе: {final_count}")
        
        # Статистика по связям
        genres_response = supabase.table("genres").select("count", count="exact").execute()
        studios_response = supabase.table("studios").select("count", count="exact").execute()
        countries_response = supabase.table("countries").select("count", count="exact").execute()
        
        print(f"🏷️ Жанров в базе: {genres_response.count or 0}")
        print(f"🏢 Студий в базе: {studios_response.count or 0}")
        print(f"🌍 Стран в базе: {countries_response.count or 0}")
        
    except Exception as e:
        print(f"❌ Ошибка получения статистики: {e}")

if __name__ == "__main__":
    run_test_parser()
