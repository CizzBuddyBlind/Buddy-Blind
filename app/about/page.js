"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/how#about");
  }, [router]);
  return <main className="bb-frame py-20 text-sm text-mute">Opening How it works…</main>;
}