interface PageHeaderProps {
  title: string;
  description?: string;
  usRange?: string;
}

export function PageHeader({ title, description, usRange }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-1 px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {usRange && (
        <span className="mt-1 w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-300">
          {usRange}
        </span>
      )}
    </header>
  );
}
