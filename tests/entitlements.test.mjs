import test from "node:test";
import assert from "node:assert/strict";

import {
  FEATURE_MINIMUM_TIER,
  PUBLIC_TIERS,
  ROUTE_FEATURE_MAP,
  canSaveNewMatch,
  canTierUse,
  getFeatureForRoute,
  getLimit,
  normalizeTier
} from "../shared/cornerman-entitlements.js";

test("public tier names and invalid development fallback are stable", () => {
  assert.deepEqual(PUBLIC_TIERS, ["free", "basic", "plus", "pro"]);
  assert.equal(normalizeTier("free"), "free");
  assert.equal(normalizeTier("enterprise"), "pro");
  assert.equal(normalizeTier(null), "pro");
});

test("Free supports the genuine individual trial and excludes coach tools", () => {
  for (const feature of ["match_capture", "match_history", "match_detail", "athlete_dashboard", "media_review"]) {
    assert.equal(canTierUse("free", feature), true, feature);
  }
  for (const feature of ["media_library", "reports", "team_dashboard", "recon_capture", "opponent_dashboard", "competition_trends", "recommendations", "sandman_handoff"]) {
    assert.equal(canTierUse("free", feature, ["sandman"]), false, feature);
  }
});

test("Basic provides the complete individual library but not team intelligence", () => {
  for (const feature of ["match_capture", "match_history", "athlete_dashboard", "media_review", "media_library", "reports"]) {
    assert.equal(canTierUse("basic", feature), true, feature);
  }
  assert.equal(canTierUse("basic", "team_dashboard"), false);
  assert.equal(canTierUse("basic", "recon_capture"), false);
});

test("Plus provides coach workflow without Pro hooks or Sandman", () => {
  for (const feature of ["team_dashboard", "tournament_manager", "roster", "recon_capture", "opponent_dashboard", "competition_trends", "recommendations", "reports"]) {
    assert.equal(canTierUse("plus", feature), true, feature);
  }
  assert.equal(canTierUse("plus", "advanced_reports"), false);
  assert.equal(canTierUse("plus", "sandman_handoff", ["sandman"]), false);
});

test("Pro hooks exist and Sandman also requires its integration profile", () => {
  for (const feature of ["advanced_reports", "advanced_scouting", "exports", "ai_athlete_feedback", "ai_team_feedback"]) {
    assert.equal(canTierUse("pro", feature), true, feature);
  }
  assert.equal(canTierUse("pro", "sandman_handoff", []), false);
  assert.equal(canTierUse("pro", "sandman_handoff", ["sandman"]), true);
});

test("limits and Free saved-library boundary are correct", () => {
  assert.equal(getLimit("athletes", "free"), 1);
  assert.equal(getLimit("athletes", "basic"), 1);
  assert.equal(getLimit("athletes", "plus"), null);
  assert.equal(getLimit("savedMatches", "free"), 3);
  for (const count of [0, 1, 2]) assert.equal(canSaveNewMatch(count, "free"), true);
  assert.equal(canSaveNewMatch(3, "free"), false);
  for (const tier of ["basic", "plus", "pro"]) {
    assert.equal(canSaveNewMatch(300, tier), true, tier);
  }
});

test("active routes resolve through one feature map", () => {
  assert.equal(getFeatureForRoute("/console/match-launch.html"), "match_capture");
  assert.equal(getFeatureForRoute("patterns/"), "competition_trends");
  assert.equal(getFeatureForRoute("bridge/match-import.html?x=1"), "sandman_handoff");
  assert.equal(getFeatureForRoute("console/index.html"), null);
  assert.equal(Object.keys(ROUTE_FEATURE_MAP).length > 15, true);
  assert.equal(FEATURE_MINIMUM_TIER.sandman_handoff, "pro");
});
