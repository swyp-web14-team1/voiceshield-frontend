import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FontScaleProvider } from "@/components/providers/FontScaleProvider";

const pretendard = localFont({
  variable: "--font-pretendard",
  src: [
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "보이스쉴드 | 피싱안전교실",
  description: "실제 보이스피싱 상황을 체험하며 대응 능력을 기르는 AI 기반 예방 학습 플랫폼",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s={"보통":1,"크게":${14 / 12},"아주크게":${16 / 12}};var v=localStorage.getItem("voiceshield-font-size");document.documentElement.style.setProperty("--font-scale",String(s[v]||1));}catch(e){}})();`,
          }}
        />
      </head>
      <body className="@container h-full">
        <FontScaleProvider>
          <div className="no-scrollbar mx-auto flex h-dvh w-full max-w-125 flex-col overflow-y-auto @max-[400px]:overflow-hidden bg-surface">
            {children}
          </div>
        </FontScaleProvider>
      </body>
    </html>
  );
}
