"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBB } from "@/components/Providers";
import { storeLink } from "@/lib/media";

export default function SharePrivatePage() {
  const { id } = useParams();
  const router = useRouter();
  const bb = useBB();

  useEffect(() => {
    if (!bb.ready) return;
    if (!bb.session) {
      window.location.href = storeLink();
      return;
    }
    router.replace(`/private/${id}`);
  }, [bb.ready, bb.session, id, router]);

  return <main className="bb-frame py-20 text-mute">Opening the night…</main>;
}
