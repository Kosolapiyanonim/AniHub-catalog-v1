// /lib/types.ts

// --- Типы для данных, приходящих от Kodik API ---

export interface KodikTranslation {
  id: number;
  title: string;
  type: "voice" | "subtitles";
}

export interface KodikMaterialData {
  poster_url?: string;
  description?: string;
  genres?: string[];
  studios?: string[];
  anime_title?: string;
  title_orig?: string;
  anime_status?: string;
  episodes_total?: number;
  shikimori_rating?: number;
  shikimori_votes?: number;
  // Добавляем остальные поля, которые могут пригодиться
}

export interface KodikAnimeData {
  id: string; // Уникальный ID озвучки от Kodik
  title: string;
  title_orig?: string;
  shikimori_id?: string;
  type: 'anime-serial' | 'anime' | 'movie'; // и другие возможные типы
  year?: number;
  link: string; // Ссылка на плеер
  quality?: string;
  episodes_count?: number;
  translation: KodikTranslation;
  updated_at: string;
  material_data?: KodikMaterialData;
}


// --- Типы для компонентов на фронтенде ---

// Облегченный тип для карточки аниме в каруселях и каталоге
export interface AnimeForCard {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  // Это поле будет добавляться, если пользователь авторизован
  user_list_status?: string | null; 
}
