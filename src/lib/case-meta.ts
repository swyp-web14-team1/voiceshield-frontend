import { AiOutlineStock } from "react-icons/ai";
import { GoOrganization } from "react-icons/go";
import type { CaseCategory, CaseDifficulty } from "@/types";
import {
  CategoryDeliveryIcon,
  CategoryFamilyIcon,
  CategoryMessengerIcon,
} from "@/components/icons/home-icons";

export const CATEGORY_META: Record<CaseCategory, { label: string; Icon: React.ElementType; bg: string }> = {
  institution: { label: "기관사칭", Icon: GoOrganization, bg: "#2b7fff" },
  family: { label: "가족사기", Icon: CategoryFamilyIcon, bg: "#ff2056" },
  delivery: { label: "택배사기", Icon: CategoryDeliveryIcon, bg: "#fe9a00" },
  investment: { label: "투자사기", Icon: AiOutlineStock, bg: "#00bc7d" },
  messenger: { label: "메신저사기", Icon: CategoryMessengerIcon, bg: "#8e51ff" },
};


export const INSTITUTION_ICON_SIZE = "clamp(10px, 4cqw, 19px)";
// 학습하기 목록(ScenarioCard)의 다른 카테고리 아이콘은 고정 12px(size-3)이라, 기관사칭도 넓은 컨테이너에서
// 그보다 커지지 않도록 상한을 12px로 맞춤(기존 13px 상한은 넓은 화면에서 다른 아이콘보다 커 보이는 원인이었음).
export const INSTITUTION_ICON_SIZE_LEARN = "clamp(10px, 3cqw, 12px)";

export const DIFFICULTY_META: Record<CaseDifficulty, { label: string; bg: string }> = {
  easy: { label: "초급", bg: "#00bc7d" },
  medium: { label: "중급", bg: "#f97316" },
  hard: { label: "고급", bg: "#ff2056" },
};

export const CASE_CATEGORY_LABEL: Record<CaseCategory, string> = {
  institution: "기관 사칭",
  family: "가족 사칭",
  delivery: "택배 사칭",
  messenger: "메신저 피싱",
  investment: "투자 사기",
};
