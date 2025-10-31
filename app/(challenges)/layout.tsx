export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-200">
      <main className="overflow-auto">{children}</main>
    </div>
  );
}
