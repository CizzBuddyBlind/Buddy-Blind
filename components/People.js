"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HostBadge } from "./Flows";
import { peopleYouCanRate, useBB } from "./Providers";
import { setPeopleApi } from "./peopleNav";

const PeopleCtx = createContext(null);

export function usePeople() {
  return useContext(PeopleCtx);
}

const QUICK = ["Easy to talk to", "Funny chat", "Good company"];

function Stars({ value, onChange }) {
  return (
    <div className="flex justify-center gap-2 text-2xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className={n <= value ? "text-ember" : "text-white/25"} aria-label={`${n} stars`}>★</button>
      ))}
    </div>
  );
}

function ReviewForm({ person, onDone }) {
  const bb = useBB();
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");
  function toggle(tag) {
    setTags((cur) => (cur.includes(tag) ? cur.filter((item) => item !== tag) : [...cur, tag]));
  }
  return (
    <form
      className="mt-4 space-y-4 text-center"
      onSubmit={(e) => {
        e.preventDefault();
        const res = bb.addReview(stars, note, person.handle, person.eventId, tags);
        if (res?.error) {
          bb.notify(res.error);
          return;
        }
        onDone(person.handle);
      }}
    >
      <HostBadge handle={person.handle} tier={person.tier || "bronze"} size="feature" quiet />
      <p className="text-sm">{person.handle}</p>
      <Stars value={stars} onChange={setStars} />
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK.map((tag) => (
          <button key={tag} type="button" onClick={() => toggle(tag)} className={`rounded-full px-3 py-1.5 text-xs ${tags.includes(tag) ? "bg-ember text-[#1a1408]" : "bg-white/10 text-white/80"}`}>{tag}</button>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional" className="w-full rounded-2xl border border-white/15 bg-black px-3 py-2 text-left text-sm text-white" />
      <button type="submit" className="w-full rounded-full bg-white py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black">Submit review</button>
    </form>
  );
}

export function PeopleProvider({ children }) {
  const bb = useBB();
  const router = useRouter();
  const path = usePathname() || "/";
  const app = path === "/m" || path.startsWith("/m/");
  const go = useRef(null);
  const [guest, setGuest] = useState("");
  const [group, setGroup] = useState(null);
  const [review, setReview] = useState(null);
  const eligible = bb.session ? peopleYouCanRate(bb.content, bb.session.handle) : [];

  function openProfile(handle) {
    const name = String(handle || "").trim();
    if (!name || name === "?" || /^host$/i.test(name)) return;
    setGroup(null);
    setReview(null);
    const mine = bb.session?.handle && bb.session.handle.toLowerCase() === name.toLowerCase();
    if (app) {
      setGuest(mine ? "" : name);
      go.current?.();
      return;
    }
    router.push(mine ? "/profile" : `/profile?u=${encodeURIComponent(name)}`);
  }

  function openGroup(people, cap = 6) {
    const list = (people || []).filter((person) => person?.handle).slice(0, cap);
    if (!list.length) return;
    if (list.length === 1) {
      openProfile(list[0].handle);
      return;
    }
    setGroup({ people: list, cap });
  }

  function openReview(person) {
    const all = peopleYouCanRate(bb.content, bb.session?.handle);
    const list = all.filter((item) => !item.reviewed);
    if (person) {
      setReview({ people: all, picked: all.find((item) => item.handle === person.handle) || person });
      return;
    }
    if (!list.length) return;
    if (list.length === 1) setReview({ people: list, picked: list[0] });
    else setReview({ people: list, picked: null });
  }

  useEffect(() => {
    setPeopleApi({ openProfile, openGroup, openReview });
  });

  const api = {
    guest,
    clearGuest: () => setGuest(""),
    bindApp: (fn) => { go.current = fn; },
    openProfile,
    openGroup,
    openReview,
    eligible,
  };

  return (
    <PeopleCtx.Provider value={api}>
      {children}
      {group && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" onClick={() => setGroup(null)}>
          <div className="max-h-[70dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-[#141414] p-5 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-xs uppercase tracking-[0.16em] text-white/50">Who joined</p>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {group.people.map((person) => (
                <button key={person.handle} type="button" onClick={() => openProfile(person.handle)} className="grid justify-items-center gap-1 text-center">
                  <HostBadge handle={person.handle} tier={person.tier || "bronze"} quiet />
                  <span className="max-w-full truncate text-[10px] text-white/70">{person.handle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {review && (
        <div className="fixed inset-0 z-[85] grid place-items-center bg-black/70 p-4" onClick={() => setReview(null)}>
          <div className="max-h-[86dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-[#141414] p-5 text-white" onClick={(e) => e.stopPropagation()}>
            {!review.picked && (
              <>
                <p className="text-center text-sm">Who do you want to review?</p>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {review.people.map((person) => (
                    <ReviewPick key={person.handle} person={person} onPick={() => setReview({ ...review, picked: person })} onOpen={() => openProfile(person.handle)} />
                  ))}
                </div>
              </>
            )}
            {review.picked && (
              <ReviewForm
                person={review.picked}
                onDone={(handle) => {
                  const rest = peopleYouCanRate(bb.content, bb.session?.handle).filter((person) => person.handle !== handle && !person.reviewed);
                  if (rest.length) setReview({ people: peopleYouCanRate(bb.content, bb.session?.handle), picked: rest.length === 1 ? rest[0] : null });
                  else setReview(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </PeopleCtx.Provider>
  );
}

function ReviewPick({ person, onPick, onOpen }) {
  const last = useRef(0);
  return (
    <button
      type="button"
      onClick={() => {
        const now = Date.now();
        if (now - last.current < 320) onOpen();
        else onPick();
        last.current = now;
      }}
      className="grid justify-items-center gap-1"
    >
      <HostBadge handle={person.handle} tier={person.tier || "bronze"} quiet />
      <span className="max-w-full truncate text-[10px] text-white/60">{person.reviewed ? "Done" : person.handle}</span>
    </button>
  );
}

export function JoinerStack({ people, host, cap = 6 }) {
  const nav = usePeople();
  const list = (people || []).filter((person) => person?.handle && person.handle !== host && person.role !== "host").slice(0, cap);
  if (!list.length) return null;
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); nav?.openGroup(list, cap); }} className="inline-flex items-center">
      {list.slice(0, 3).map((person) => (
        <span key={person.handle} className="-ml-1 first:ml-0">
          <HostBadge handle={person.handle} tier={person.tier || "bronze"} size="joiner" quiet />
        </span>
      ))}
      {list.length > 3 && <span className="ml-1 text-[10px]">+</span>}
    </button>
  );
}
