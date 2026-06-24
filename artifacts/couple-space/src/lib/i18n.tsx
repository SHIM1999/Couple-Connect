import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "ko";

const STORAGE_KEY = "cc_lang";

const translations = {
  en: {
    // Nav
    nav_dates: "DATES", nav_todos: "TODOS", nav_home: "HOME", nav_goals: "GOALS", nav_more: "MORE",
    // Home
    home_title_fallback: "Couple Connect", home_subtitle: "Plan together. Grow together.",
    home_happiness: "HAPPINESS", home_todos: "TODOS", home_goals: "GOALS",
    home_wishlist: "WISHLIST", home_bucket: "BUCKET",
    home_next_event: "NEXT EVENT", home_no_events: "NO EVENTS PLANNED", home_set_status: "Set status...",
    items_count: (n: number) => `${n} items`,
    color_label: "COLOR",
    // Settings
    settings_title: "OPTIONS", settings_space_title: "SPACE TITLE",
    settings_space_title_ph: "e.g. Our Little Corner", settings_player1: "PLAYER 1 NAME",
    settings_player2: "PLAYER 2 NAME", settings_name_ph: "Name",
    settings_anniversary: "ANNIVERSARY DATE", settings_language: "LANGUAGE",
    settings_save: "SAVE PROGRESS", settings_saving: "SAVING...", settings_saved: "Game saved!",
    // More
    more_menu: "MENU", more_wishlist: "WISHLIST", more_wishlist_sub: "Gifts & desires",
    more_bucket: "BUCKET LIST", more_bucket_sub: "Shared adventures",
    more_settings: "SETTINGS", more_settings_sub: "Profile & dates",
    more_invite: "INVITE PLAYER 2", more_invite_desc: "Share this link to connect your accounts:",
    more_copy: "COPY", more_copied: "Link copied! Share with your love",
    // Calendar / Timeline
    cal_timeline: "TIMELINE", cal_quest_log: "QUEST LOG",
    cal_prev: "PREV", cal_next: "NEXT",
    cal_new_event: "NEW EVENT", cal_event_name_ph: "Event name...",
    cal_details_ph: "Details (optional)", cal_save_event: "SAVE EVENT",
    cal_saving: "SAVING...", cal_anniversary_badge: "ANNIVERSARY",
    cal_empty: "NO EVENTS FOUND.\nPLAN A DATE!",
    cal_event_saved: "Event saved!", cal_event_removed: "Event removed!",
    // Todos / Quest Log
    todos_title: "QUEST LOG", todos_new: "NEW QUEST",
    todos_ph: "Quest objective...", todos_details_ph: "Details (optional)",
    todos_accept: "ACCEPT QUEST", todos_saving: "SAVING...",
    todos_empty: "NO ACTIVE QUESTS.\nRELAX FOR NOW.",
    todos_deleted: "Quest deleted!", todos_added: "New Quest added!",
    // Goals / Milestones
    goals_title: "MILESTONES", goals_new: "SET NEW GOAL",
    goals_ph: "What's the goal?", goals_category_ph: "Category (e.g., Travel)",
    goals_details_ph: "Details (optional)", goals_commit: "COMMIT GOAL",
    goals_saving: "SAVING...", goals_empty: "NO GOALS SET YET.\nDREAM BIG!",
    goals_deleted: "Goal deleted!", goals_set: "Goal set!", goals_achieved: "Goal achieved!",
    // Wishlist / Inventory
    wish_title: "INVENTORY", wish_add: "ADD ITEM",
    wish_item_ph: "Item name...", wish_link_ph: "Link URL (optional)",
    wish_details_ph: "Details (optional)", wish_save: "ADD TO LIST",
    wish_saving: "ADDING...", wish_empty: "INVENTORY EMPTY.\nTIME TO SHOP!",
    wish_collected: "Item collected!", wish_trashed: "Item trashed!", wish_added: "Added to inventory",
    // Bucketlist / World Map
    bucket_title: "WORLD MAP", bucket_new: "NEW ADVENTURE",
    bucket_where_ph: "Where to?", bucket_details_ph: "Extra details...",
    bucket_save: "PIN LOCATION", bucket_saving: "SAVING...",
    bucket_empty: "MAP IS BLANK.\nSTART EXPLORING!",
    bucket_unlocked: "Adventure unlocked!", bucket_deleted: "Adventure deleted", bucket_added: "Added to Map",
  },
  ko: {
    // Nav
    nav_dates: "일정", nav_todos: "할일", nav_home: "홈", nav_goals: "목표", nav_more: "더보기",
    // Home
    home_title_fallback: "커플 커넥트", home_subtitle: "함께 계획하고. 함께 성장해요.",
    home_happiness: "행복도", home_todos: "할일", home_goals: "목표",
    home_wishlist: "위시리스트", home_bucket: "버킷리스트",
    home_next_event: "다음 일정", home_no_events: "예정된 일정 없음", home_set_status: "상태 설정...",
    items_count: (n: number) => `${n}개`,
    color_label: "색상",
    // Settings
    settings_title: "설정", settings_space_title: "공간 이름",
    settings_space_title_ph: "예) 우리만의 공간", settings_player1: "플레이어 1 이름",
    settings_player2: "플레이어 2 이름", settings_name_ph: "이름",
    settings_anniversary: "기념일", settings_language: "언어",
    settings_save: "저장하기", settings_saving: "저장 중...", settings_saved: "저장되었어요!",
    // More
    more_menu: "메뉴", more_wishlist: "위시리스트", more_wishlist_sub: "선물 & 소원",
    more_bucket: "버킷리스트", more_bucket_sub: "함께할 모험들",
    more_settings: "설정", more_settings_sub: "프로필 & 날짜",
    more_invite: "플레이어 2 초대", more_invite_desc: "이 링크를 공유해서 연결하세요:",
    more_copy: "복사", more_copied: "링크 복사됨! 연인과 공유해요",
    // Calendar / Timeline
    cal_timeline: "타임라인", cal_quest_log: "퀘스트 로그",
    cal_prev: "이전", cal_next: "다음",
    cal_new_event: "새 일정", cal_event_name_ph: "일정 이름...",
    cal_details_ph: "내용 (선택)", cal_save_event: "저장",
    cal_saving: "저장 중...", cal_anniversary_badge: "기념일",
    cal_empty: "일정이 없어요.\n데이트 계획 세워요!",
    cal_event_saved: "일정 저장됨!", cal_event_removed: "일정 삭제됨!",
    // Todos / Quest Log
    todos_title: "퀘스트 로그", todos_new: "새 퀘스트",
    todos_ph: "퀘스트 내용...", todos_details_ph: "내용 (선택)",
    todos_accept: "퀘스트 수락", todos_saving: "저장 중...",
    todos_empty: "진행 중인 퀘스트 없음.\n잠시 쉬어가요.",
    todos_deleted: "퀘스트 삭제됨!", todos_added: "새 퀘스트 추가됨!",
    // Goals / Milestones
    goals_title: "마일스톤", goals_new: "새 목표 설정",
    goals_ph: "목표가 뭔가요?", goals_category_ph: "카테고리 (예: 여행)",
    goals_details_ph: "내용 (선택)", goals_commit: "목표 설정",
    goals_saving: "저장 중...", goals_empty: "아직 목표가 없어요.\n크게 꿈꿔요!",
    goals_deleted: "목표 삭제됨!", goals_set: "목표 설정됨!", goals_achieved: "목표 달성!",
    // Wishlist / Inventory
    wish_title: "인벤토리", wish_add: "아이템 추가",
    wish_item_ph: "아이템 이름...", wish_link_ph: "링크 (선택)",
    wish_details_ph: "내용 (선택)", wish_save: "목록에 추가",
    wish_saving: "추가 중...", wish_empty: "인벤토리가 비어있어요.\n쇼핑할 시간!",
    wish_collected: "아이템 획득!", wish_trashed: "아이템 삭제됨!", wish_added: "인벤토리에 추가됨",
    // Bucketlist / World Map
    bucket_title: "월드맵", bucket_new: "새 모험",
    bucket_where_ph: "어디로?", bucket_details_ph: "추가 내용...",
    bucket_save: "위치 핀", bucket_saving: "저장 중...",
    bucket_empty: "지도가 비어있어요.\n탐험 시작!",
    bucket_unlocked: "모험 해제됨!", bucket_deleted: "모험 삭제됨", bucket_added: "지도에 추가됨",
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
    try { const s = localStorage.getItem(STORAGE_KEY); return s === "ko" ? "ko" : "en"; } catch { return "en"; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
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
