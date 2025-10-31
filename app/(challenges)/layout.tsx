import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Solutions | Jobair Al Sarkar Portfolio",
  description:
    "Explore the problems and assessments solved by Jobair Al Sarkar. Interactive solutions and frontend challenges.",
  keywords: [
    "Jobair Al Sarkar",
    "Solutions",
    "Challenges",
    "Portfolio",
  ],
};

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-200">
      <main className="overflow-auto w-full">{children}</main>
    </div>
  );
}
