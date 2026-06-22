import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "ko";

const STORAGE_KEY = "cc_lang";

const translations = {
  en: {
    // Nav
    nav_dates: "DATES",
    nav_todos: "TODOS",
    nav_home: "HOME",
    nav_goals: "GOALS",
    nav_more: "MORE",
    // Home
    home_title_fallback: "Couple Connect",
    home_subtitle: "Plan together. Grow together.",
    home_happiness: "HAPPINESS",
    home_todos: "TODOS",
    home_goals: "GOALS",
    home_wishlist: "WISHLIST",
    home_bucket: "BUCKET",
    home_next_event: "NEXT EVENT",
    home_no_events: "NO EVENTS PLANNED",
    home_set_status: "Set status...",
    // Settings
    settings_title: "OPTIONS",
    settings_space_title: "SPACE TITLE",
    settings_space_title_ph: "e.g. Our Little Corner",
    settings_player1: "PLAYER 1 NAME",
    settings_player2: "PLAYER 2 NAME",
    settings_name_ph: "Name",
    settings_anniversary: "ANNIVERSARY DATE",
    settings_language: "LANGUAGE",
    settings_save: "SAVE PROGRESS",
    settings_saving: "SAVING...",
    settings_saved: "Game saved!",
    // More
    more_menu: "MENU",
    more_wishlist: "WISHLIST",
    more_wishlist_sub: "Gifts & desires",
    more_bucket: "BUCKET LIST",
    more_bucket_sub: "Shared adventures",
    more_settings: "SETTINGS",
    more_settings_sub: "Profile & dates",
    more_invite: "INVITE PLAYER 2",
    more_invite_desc: "Share this link to connect your accounts:",
    more_copy: "COPY",
    more_copied: "Link copied! Share with your love",
    // Todos
    todos_title: "TO-DOS",
    todos_add_ph: "New task...",
    todos_empty: "NO TASKS YET",
    // Goals
    goals_title: "GOALS",
    goals_add_ph: "New goal...",
    goals_empty: "NO GOALS YET",
    // Calendar
    calendar_title: "DATES",
    calendar_add: "ADD EVENT",
    calendar_empty: "NO EVENTS",
    // Wishlist
    wishlist_title: "WISHLIST",
    wishlist_add_ph: "New wish...",
    wishlist_empty: "NO WISHES YET",
    // Bucketlist
    bucket_title: "BUCKET LIST",
    bucket_add_ph: "New adventure...",
    bucket_empty: "NO ADVENTURES YET",
    // Items
    items_count: (n: number) => `${n} items`,
  },
  ko: {
    // Nav
    nav_dates: "일정",
    nav_todos: "할일",
    nav_home: "홈",
    nav_goals: "목표",
    nav_more: "더보기",
    // Home
    home_title_fallback: "커플 커넥트",
    home_subtitle: "함께 계획하고. 함께 성장해요.",
    home_happiness: "행복도",
    home_todos: "할일",
    home_goals: "목표",
    home_wishlist: "위시리스트",
    home_bucket: "버킷리스트",
    home_next_event: "다음 일정",
    home_no_events: "예정된 일정 없음",
    home_set_status: "상태 설정...",
    // Settings
    settings_title: "설정",
    settings_space_title: "공간 이름",
    settings_space_title_ph: "예) 우리만의 공간",
    settings_player1: "플레이어 1 이름",
    settings_player2: "플레이어 2 이름",
    settings_name_ph: "이름",
    settings_anniversary: "기념일",
    settings_language: "언어",
    settings_save: "저장하기",
    settings_saving: "저장 중...",
    settings_saved: "저장되었어요!",
    // More
    more_menu: "메뉴",
    more_wishlist: "위시리스트",
    more_wishlist_sub: "선물 & 소원",
    more_bucket: "버킷리스트",
    more_bucket_sub: "함께할 모험들",
    more_settings: "설정",
    more_settings_sub: "프로필 & 날짜",
    more_invite: "플레이어 2 초대",
    more_invite_desc: "이 링크를 공유해서 연결하세요:",
    more_copy: "복사",
    more_copied: "링크 복사됨! 연인과 공유해요",
    // Todos
    todos_title: "할일 목록",
    todos_add_ph: "새 할일...",
    todos_empty: "할일이 없어요",
    // Goals
    goals_title: "목표",
    goals_add_ph: "새 목표...",
    goals_empty: "목표가 없어요",
    // Calendar
    calendar_title: "일정",
    calendar_add: "일정 추가",
    calendar_empty: "일정 없음",
    // Wishlist
    wishlist_title: "위시리스트",
    wishlist_add_ph: "새 소원...",
    wishlist_empty: "소원이 없어요",
    // Bucketlist
    bucket_title: "버킷리스트",
    bucket_add_ph: "새 모험...",
    bucket_empty: "모험이 없어요",
    // Items
    items_count: (n: number) => `${n}개`,
  },
} as const;

type Translations = typeof translations.en;
type TranslationKey = keyof Translations;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: <K extends TranslationKey>(key: K) => Translations[K];
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => translations.en[k] as Translations[typeof k],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ko" ? "ko" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = <K extends TranslationKey>(key: K): Translations[K] =>
    translations[lang][key] as Translations[K];

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
