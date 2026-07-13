import { AiOutlineStock } from "react-icons/ai";
import type { CaseCategory, CaseDifficulty } from "@/types";
import {
  CategoryDeliveryIcon,
  CategoryFamilyIcon,
  CategoryGovernmentIcon,
  CategoryMessengerIcon,
} from "@/components/icons/home-icons";

export const CATEGORY_META: Record<CaseCategory, { label: string; Icon: React.ElementType; bg: string }> = {
  institution: { label: "기관사칭", Icon: CategoryGovernmentIcon, bg: "rgba(138,155,188,0.44)" },
  family: { label: "가족사기", Icon: CategoryFamilyIcon, bg: "#ff2056" },
  delivery: { label: "택배사기", Icon: CategoryDeliveryIcon, bg: "#fe9a00" },
  investment: { label: "투자사기", Icon: AiOutlineStock, bg: "#00bc7d" },
  messenger: { label: "메신저사기", Icon: CategoryMessengerIcon, bg: "#8e51ff" },
};

export const DIFFICULTY_META: Record<CaseDifficulty, { label: string; bg: string }> = {
  easy: { label: "초급", bg: "#00bc7d" },
  medium: { label: "중급", bg: "#f97316" },
  hard: { label: "고급", bg: "#ff2056" },
};
