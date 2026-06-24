import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { sectionPadding } from "@/lib/utils";

const ProfilePanel = dynamic(
  () =>
    import("@/components/profile/profile-panel").then((m) => m.ProfilePanel),
  { loading: () => <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" /> }
);

export const metadata: Metadata = {
  title: "My Profile",
  description: "Your uploaded and processed documents.",
};

export default function ProfilePage() {
  return (
    <div className={`mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${sectionPadding}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Access your uploaded files and documents you&apos;ve updated with our tools.
        </p>
      </div>
      <ProfilePanel />
    </div>
  );
}
