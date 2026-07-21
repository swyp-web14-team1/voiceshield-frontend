import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}
