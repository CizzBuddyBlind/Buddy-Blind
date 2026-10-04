"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBB } from "@/components/Providers";

function Rich({ text }) {
  const parts = String(text).split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <span key={index} className="bb-how-mark">{part.slice(1, -1)}</span>;
    }
    return <span key={index}>{part}</span>;
  });
}

const STEPS = [
  { n: "01", title: "Home", body: ["Start here. *You don’t know who you’ll meet. That’s the point.* Beside it, we show one event we picked: the fullest table today."] },
  { n: "02", title: "Venues", body: ["Pick from our partner restaurants. See the *place, time, and seats left — not who’s coming.*", "Join a table that already exists, invite others to one, or open your own. *You pick where and when. The people stay blind.*"] },
  { n: "03", title: "Quick Meet", body: ["For when you’re free *today* and just want someone nearby to join you.", "Maybe nobody at work is free for lunch. Maybe you want someone for a coffee or tea break, a casual after-work drink, or you’re a student looking for someone around campus to grab food with.", "*Open a seat or join one nearby.* No planning weeks ahead — just find someone who happens to be free too."] },
  { n: "04", title: "Private", body: ["This one starts with *your reason*.", "Create almost any kind of social event and decide how small or large you want it to be — *from 2 people to 20*.", "Bring IT people together for networking. Start something for lawyers, doctors, designers, founders, or whatever field you’re in.", "Create a hiking or mahjong group for people 50+ who want to expand their social circle. Host an LGBTQ+ night, or create something specifically for gay, lesbian, bi, trans, or queer people who want to meet others in their community.", "Find fellow geeks for a board-game night. Find another movie lover who actually wants to go to the cinema with you.", "*You decide the interest, activity, time, place, and number of people.*", "Others join because they’re interested in the same thing — *not because they picked your profile.*", "Hosting is *Premium*."] },
  { n: "05", title: "Me Time", body: ["Everything you’ve joined, in one place. *Today, and what’s next.*", "When the day comes, one tap tells us *I’m coming* or *I’m here*.", "Then put the app away and meet the people behind the seats."] },
  { n: "06", title: "Plan", body: ["*Free* to explore. *Lite* to comment and rate. *Premium* to host.", "Try Premium free, then stay if you want.", "Your plan unlocks features; it is separate from the *$5 administrative fee* for joining an event."] },
  { n: "07", title: "Profile", body: ["Your Buddy Blind history lives here: *your circle, points, Buddies, events you joined, and events you hosted.*", "After an event, people who actually attended the same event can *review and rate each other*."] },
  { n: "08", title: "Buddies", body: ["Met someone you actually want to see again? *Add them as a Buddy.*", "You can only add someone after you’ve both been part of the same event. That keeps Buddies about people you’ve actually met through Buddy Blind — not random profiles you found in the app.", "Once you’re Buddies, meeting again is easy. Whenever you *Invite, Join, or Host*, you can select the Buddies you want to bring along and notify them directly.", "*Meet blind once. Meet again by choice.*"] },
  { n: "09", title: "Points change the circle", body: ["Points reward you for taking part and bringing people together.", "*Join adds 1. Invite adds 2. Host adds 5.*", "More points move your circle up and give you a bigger discount."] },
  { n: "10", title: "Why the $5 administrative fee?", body: ["The $5 administrative fee helps keep Buddy Blind *accountable* when people who may not know each other are meeting in real life.", "When you join an event, your booking creates a record connecting your registered account to that specific *event, date, and time*.", "Your registered contact and verification information, together with the payment record associated with the booking, can help identify the account behind a seat if something serious happens.", "For example, if someone leaves without paying their bill, damages property, or an incident requires police involvement, Buddy Blind can identify the relevant account and event record and, where appropriate or legally required, assist the venue or authorities with information available to us.", "For that reason, the $5 administrative fee is *non-refundable once the booking is confirmed*, including if you later decide not to attend. It is attached to the confirmed booking and the accountability record created with it.", "*You may not know who’s sitting at the table. But nobody at the table is completely anonymous.*"] },
];

const BADGES = [
  { letter: "B", name: "Bronze", points: "100 points", pointsHk: "100 Points", note: "5%", circle: "bb-metal-bronze" },
  { letter: "S", name: "Silver", points: "300 points", pointsHk: "300 Points", note: "10%", circle: "bb-metal-silver" },
  { letter: "G", name: "Gold", points: "500 points", pointsHk: "500 Points", note: "20%", circle: "bb-metal-gold" },
];

const HK_STEPS = [
  { n: "01", title: "Home", body: ["由呢度開始。 *你唔知邊個會 Show up，呢個先係重點。* 每日仲有我哋幫你揀嘅一局：*唔使煩，即管盲撐*"] },
  { n: "02", title: "盲約", body: ["揀間你本身都想去嘅餐廳。你會知 *邊度、幾點、仲有幾多個位*，至於邊個坐你隔離？*到時咪知。* 見到啱嘅枱就 Join，想叫人一齊就 Invite，冇啱嘅就自己開一枱。 *地方你揀 人就 Blind*"] },
  { n: "03", title: "即興", body: ["*今日得閒，又唔想一個人？* 返工附近冇人陪你食 Lunch？想 Tea 一 Tea、飲杯 Coffee？放工想飲返杯？喺學校想搵個人一齊食嘢？ *開個位，或者 Join 附近有位嗰枱。* 唔使約定下個禮拜，唔使計劃咁多。 *啱啱你得閒，啱啱佢又得閒。* 咁咪坐低囉。"] },
  { n: "04", title: "我話事", body: ["*今次個局 你話事* 想搞咩都得，人數由 *2 個到 20 個*，你自己決定。做 IT 想識返 IT 人？Lawyer、醫生、Designer、Founder 想 Networking？50+ 想行山、打麻雀、擴闊下生活圈？想搞 LGBTQ+ Night，或者開一局俾 Gay、Lesbian、Bi、Trans、Queer 嘅人識下自己 Community 入面嘅人？Geek 想搵 Geek 開 Board Game Night？Movieholic 想搵個真係肯陪你入戲院嘅人？", "*興趣、活動、時間、地方、人數 全部你話事。* 人哋 Join 你個局，係因為 *大家啱同一樣嘢*，唔係因為睇完你個 Profile 先揀你。 *Hosting 屬於 Premium 功能*"] },
  { n: "05", title: "Me Time", body: ["*今日約咗 日日都約咗* 你 Join 過嘅局，全部喺返呢度。到嗰日，一撳就話俾我哋知 *我會嚟* 或者 *我到咗*。之後收埋部電話。 *真人出場。*"] },
  { n: "06", title: "我要升呢", body: ["*窮 L 恩物* — 四圍睇。 *平平哋* — Comment & Rate。 *都唔貴* — 自己開局。 *都唔貴* 可以先試，啱先留低。"] },
  { n: "07", title: "個人", body: ["*你喺 Buddy Blind 留低嘅足跡* 你嘅 Circle、Points、Buddies、Join 過咩、Host 過咩，全部喺度。一齊出席過同一個 Event 嘅人，完場之後先可以 *Review & Rate 對方*。 *真係見過 先有得講*"] },
  { n: "08", title: "Buddies", body: ["*有啲人 Blind 一次就夠 有啲人你會想見多次* 一齊參加過同一個 Event，先可以 Add 對方做 Buddy。所以 Buddies 唔係你周圍睇 Profile Add 返嚟，*係你真係見過嘅人*。做咗 Buddies 之後就簡單。下次你 *Invite、Join 或 Host*，可以直接揀想叫埋邊個 Buddy，我哋幫你通知佢。 *第一次 Blind 下次你揀*"] },
  { n: "09", title: "啲分唔係 DSE，儲分玩大個圈", body: ["盲約盲撐有分加，話吓事更加有。 *Join +1 · Invite +2 · Host +5* 分愈多，個 Circle 愈高，Discount 都跟住升。"] },
  { n: "10", title: "點解要收 $5 行政費？", body: ["Blind 還 Blind，*但唔代表冇人知你係邊個。* 你每次 Join Event，個 Booking 都會將你嘅註冊 Account 同嗰次 *Event、日期、時間同付款紀錄* 連埋一齊。你註冊時提供嘅聯絡及驗證資料，加上同 Booking 有關嘅付款紀錄，可以喺有嚴重事故發生時，協助確認個位背後係邊個 Account。", "例如有人食完唔埋單、整爛場地，或者有嚴重事件需要警方介入，Buddy Blind 可以確認相關 Account 同 Event 紀錄，並喺適當或者法律要求嘅情況下，向場地或有關當局提供我哋持有嘅相關資料。所以 Booking 一經確認，*$5 行政費不設退款*，就算之後你決定唔出席都一樣。呢 $5 唔單止係一個位，亦係嗰次 Booking 留低嘅一份 Accountability Record。", "*你可以唔知隔離坐邊個 但坐得低 就唔係完全匿名*"] },
];

function AboutBody() {
  const params = useSearchParams();
  const bb = useBB();
  const hk = bb.lang === "zh-HK";
  const narrow = !!bb.narrow;
  const head = "font-serif font-normal text-[clamp(2rem,8vw,2.4rem)] leading-[1.05]";
  const steps = hk ? HK_STEPS : STEPS;
  const [tab, setTab] = useState(params.get("tab") === "how" ? "how" : "about");
  useEffect(() => {
    if (tab !== "how") return;
    const id = window.location.hash.replace("#", "");
    if (!id.startsWith("help-")) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [tab, hk]);
  return (
    <main className="bb-frame bg-ink pb-28 pt-10 text-fg md:pb-20">
      <div className="flex gap-2">
        {[
          ["about", "About us"],
          ["how", "How"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] ${tab === id ? "bg-ember text-[#1a1408]" : "bg-white/10 text-white/70"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "about" ? (
        <>
          <h1 className={narrow ? `mt-8 ${head}` : "mt-8 max-w-4xl font-serif leading-[1.05]"}>
            <span className={narrow ? "block" : "block text-3xl text-white sm:text-4xl md:text-5xl"}>The restaurant is the setting.</span>
            <span className={narrow ? "mt-2 block" : "mt-2 block text-3xl text-white sm:text-4xl md:text-5xl"}>The people are the experience.</span>
            <span className={narrow ? "mt-3 block italic text-ember" : "mt-3 block text-5xl text-ember sm:text-6xl md:text-7xl"}>The conversation is the point.</span>
          </h1>
          <div className="bb-lead-gap max-w-2xl space-y-5 text-base leading-relaxed text-white/70">
            <p>Buddy Blind is built on one simple idea: meet people without knowing exactly who you’re going to meet.</p>
            <p>You choose the time, the place, and how many seats. You know enough to decide you want to go — but you don’t get to pre-select who sits with you. That uncertainty isn’t a bug. It’s the product. We call it the Blind Box.</p>
            <p>Show up. Talk. Discover who they are through a real meal — not a profile, not a swipe, and not endless scrolling beforehand.</p>
            <p>Buddy Blind is not a dating app. It’s a way to get more real interaction back into everyday life: dinner, lunch near work, a drink after — planned in the app, lived at the table.</p>
          </div>
        </>
      ) : (
        <div className="bb-how mx-auto w-full max-w-5xl" {...(hk ? { "data-keep": "1" } : {})}>
          <h1 className={narrow ? `mt-8 ${head}` : "mt-8 max-w-4xl font-serif text-[3.4rem] font-normal leading-[0.95] text-white sm:text-6xl md:text-7xl"}>
            {hk ? "齋睇場，齋睇 Feel" : "See venue, see vibe"}
            <br />
            <span className="italic text-ember">{hk ? "唔諗 LU，坐低先算" : "Take a seat."}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">
            <Rich text={hk ? "揀地方、時間、興趣，唔使揀人。 *坐低，Show up，睇吓今次撞到邊個。*" : "Pick the place, time, or interest — not the people. *Take a seat, show up, and see who you meet.*"} />
          </p>
          <ol className="bb-lead-gap overflow-hidden rounded-[1.7rem] border border-white/15">
            {steps.map((step) => (
              <li id={`help-${step.n}`} key={step.n} className="grid scroll-mt-24 grid-cols-[3.2rem_1fr] gap-2 border-t border-white/10 px-6 py-7 first:border-t-0 sm:px-10">
                <span className="pt-2 text-xs tracking-[0.12em] text-white/40">{step.n}</span>
                <div>
                  <h2 className={narrow ? "font-serif text-xl font-normal leading-tight text-white" : "font-serif text-[1.65rem] font-normal leading-tight text-white md:text-[1.85rem]"}>{step.title}</h2>
                  {step.body.map((line) => (
                    <p key={line} className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55"><Rich text={line} /></p>
                  ))}
                  {step.n === "09" && (narrow ? (
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {BADGES.map((badge) => (
                        <div key={badge.letter} className="flex flex-col items-center text-center">
                          <span className={`grid h-9 w-9 place-items-center rounded-full font-serif text-base font-normal ring-1 ring-black/15 ${badge.circle}`}>{badge.letter}</span>
                          <span className="mt-2 block text-xs text-white">{badge.name}</span>
                          <span className="block text-[10px] leading-tight text-white/45">{hk ? badge.pointsHk : badge.points}</span>
                          <span className="block text-[10px] text-white/45">{badge.note}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap gap-6">
                      {BADGES.map((badge) => (
                        <div key={badge.letter} className="flex items-center gap-3">
                          <span className={`grid h-11 w-11 place-items-center rounded-full font-serif text-lg font-normal ring-1 ring-black/15 ${badge.circle}`}>{badge.letter}</span>
                          <span>
                            <span className="block text-sm text-white">{badge.name}</span>
                            <span className="block text-xs text-white/45">{hk ? badge.pointsHk : badge.points} · {badge.note}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<main className="bb-frame py-20 text-white/45">Loading…</main>}>
      <AboutBody />
    </Suspense>
  );
}
