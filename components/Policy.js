export function PolicyFrame({ kicker, title, children }) {
  return (
    <main className="bb-frame bg-ink pb-32 pt-10 text-fg md:pb-20">
      <article className="mx-auto w-full max-w-3xl">
        <p className="bb-kicker text-white/55">{kicker}</p>
        <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-white/40">Last updated 25 September 2026 · Hong Kong</p>
        <div className="policy mt-8 space-y-6 text-sm leading-relaxed text-white/75 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-white [&_li]:mt-1 [&_strong]:text-white/90 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </main>
  );
}
