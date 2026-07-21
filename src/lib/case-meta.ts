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
// 학습하기 목록(ScenarioCard)의 기관사칭 배지는 홈 화면보다 작은 고정 20px 배지라 19px 상한이 너무 컸다 — 이 화면만 14px로 상한을 낮춤.
export const INSTITUTION_ICON_SIZE_LEARN = "clamp(10px, 3cqw, 13px)";

export const DIFFICULTY_META: Record<CaseDifficulty, { label: string; bg: string }> = {
  easy: { label: "초급", bg: "#00bc7d" },
  medium: { label: "중급", bg: "#f97316" },
  hard: { label: "고급", bg: "#ff2056" },
};
