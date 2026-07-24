import { apiFetch } from "./client";
import type { KakaoLoginResponse, MemberMeResponse, MemberResponse } from "./types";

export function loginWithKakao(kakaoAuthCode: string) {
  return apiFetch<KakaoLoginResponse>("/api/v1/auth/kakao", {
    method: "POST",
    body: { kakaoAuthCode },
  });
}

export function createMember(userId: string) {
  return apiFetch<MemberResponse>("/api/v1/members", {
    method: "POST",
    body: { userId, signupStatus: "SIGNUP_COMPLETE" },
  });
}

export function fetchMyProfile() {
  return apiFetch<MemberMeResponse>("/api/v1/members/me");
}

export function withdrawMembership() {
  return apiFetch<null>("/api/v1/members/me", { method: "DELETE" });
}
