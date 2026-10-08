import assert from "node:assert/strict";
import test from "node:test";
import { canonicalTime, timeInputValue } from "./timeLabel.js";

test("custom time keeps noon and midnight", () => {
  assert.equal(canonicalTime("12:00"), "12:00 PM");
  assert.equal(canonicalTime("00:00"), "12:00 AM");
  assert.equal(canonicalTime("13:15"), "1:15 PM");
  assert.equal(canonicalTime("01:15"), "1:15 AM");
  assert.equal(timeInputValue("1:15 PM"), "13:15");
  assert.equal(timeInputValue("12:00 AM"), "00:00");
  assert.equal(timeInputValue("12:00 PM"), "12:00");
});
