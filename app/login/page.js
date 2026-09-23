import { Suspense } from "react";
import LoginForm from "./form";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="bb-frame py-20 text-center text-mute">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
