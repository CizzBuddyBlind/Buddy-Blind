import { createHmac } from "crypto";
import { effectiveAccess, nextEntitlement, snapshotFromSubscription } from "../lib/entitlement.js";
import { verifyStripeSignature } from "../lib/stripeSign.js";

let failed = 0;
function check(name, condition) {
  if (!condition) {
    failed += 1;
    console.error("FAIL", name);
  } else console.log("ok", name);
}

const yearly = snapshotFromSubscription({
  id: "sub_year",
  status: "trialing",
  current_period_end: 1_800_000_000,
  cancel_at_period_end: false,
  customer: "cus_hk",
  metadata: { kind: "premium", cycle: "year", email: "a@buddyblind.com" },
  items: { data: [{ price: { id: "price_year", recurring: { interval: "year" } } }] },
}, "a@buddyblind.com");
check("trial yearly is one yearly cycle", yearly.plan === "premium" && yearly.cycle === "year" && yearly.status === "trialing");

const paid = snapshotFromSubscription({
  ...{
    id: "sub_year",
    status: "active",
    current_period_end: 1_900_000_000,
    cancel_at_period_end: false,
    customer: "cus_hk",
    metadata: { kind: "premium", cycle: "year" },
    items: { data: [{ price: { id: "price_year", recurring: { interval: "year" } } }] },
  },
}, "a@buddyblind.com");
const first = nextEntitlement(null, yearly, { id: "evt_1", created: 10 });
const renewal = nextEntitlement(first.row, paid, { id: "evt_2", created: 20 });
check("renewal keeps yearly premium", renewal.row.plan === "premium" && renewal.row.cycle === "year" && renewal.row.status === "active");

const late = nextEntitlement(renewal.row, yearly, { id: "evt_old", created: 5 });
check("older event does not overwrite", late.skip === "stale" && late.row.status === "active");
const dup = nextEntitlement(renewal.row, paid, { id: "evt_2", created: 20 });
check("duplicate event is ignored", dup.skip === "duplicate");

const pastDue = snapshotFromSubscription({
  id: "sub_year",
  status: "past_due",
  current_period_end: 1_900_000_000,
  customer: "cus_hk",
  metadata: { kind: "premium", cycle: "year" },
  items: { data: [{ price: { id: "price_year", recurring: { interval: "year" } } }] },
}, "a@buddyblind.com");
check("past_due keeps premium", effectiveAccess(pastDue, "user").plan === "premium");

const unpaid = snapshotFromSubscription({
  id: "sub_year",
  status: "unpaid",
  customer: "cus_hk",
  metadata: { kind: "premium" },
  items: { data: [{ price: { id: "price_year", recurring: { interval: "year" } } }] },
}, "a@buddyblind.com");
check("unpaid becomes free", effectiveAccess(unpaid, "user").plan === "free");

const canceled = snapshotFromSubscription({
  id: "sub_m",
  status: "active",
  cancel_at_period_end: true,
  current_period_end: 1_900_000_000,
  customer: "cus_hk",
  metadata: { kind: "premium" },
  items: { data: [{ price: { id: "price_m", recurring: { interval: "month" } } }] },
}, "a@buddyblind.com");
check("scheduled cancel keeps access", effectiveAccess(canceled, "user").plan === "premium" && effectiveAccess(canceled, "user").cancelAtPeriodEnd);

const ended = snapshotFromSubscription({
  id: "sub_m",
  status: "canceled",
  customer: "cus_hk",
  metadata: { kind: "premium" },
  items: { data: [{ price: { id: "price_m", recurring: { interval: "month" } } }] },
}, "a@buddyblind.com");
check("ended subscription is free", effectiveAccess(ended, "user").plan === "free");
check("founder keeps premium after stripe cancel", effectiveAccess(ended, "founder").plan === "premium" && effectiveAccess(ended, "founder").source === "internal");

const internal = { source: "internal", plan: "premium", email: "founder@buddyblind.com" };
const protectedRow = nextEntitlement(internal, ended, { id: "evt_x", created: 50 });
check("stripe cannot overwrite internal entitlement", protectedRow.skip === "internal" && protectedRow.row.source === "internal");

const phoneA = effectiveAccess(renewal.row, "user");
const phoneB = effectiveAccess(renewal.row, "user");
check("same server record gives both devices the same plan", phoneA.plan === phoneB.plan && phoneA.cycle === phoneB.cycle && phoneA.status === phoneB.status);

const secret = "whsec_test";
const raw = "{\"id\":\"evt_1\"}";
const stamp = 1_700_000_000;
const sig = createHmac("sha256", secret).update(`${stamp}.${raw}`).digest("hex");
check("valid stripe signature passes", verifyStripeSignature(raw, `t=${stamp},v1=${sig}`, secret, stamp * 1000));
check("bad stripe signature fails", !verifyStripeSignature(raw, `t=${stamp},v1=dead`, secret, stamp * 1000));

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("billing lifecycle checks passed");
