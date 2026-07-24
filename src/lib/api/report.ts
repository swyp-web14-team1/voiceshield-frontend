import { apiFetch } from "./client";
import type { ReportGuideResponse } from "./types";

export function fetchReportGuide() {
  return apiFetch<ReportGuideResponse>("/api/v1/report-guides");
}
