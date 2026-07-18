// ========================= //
// PLAYABLE POOL             //
// ========================= //
// Single source of truth for "what content can currently be drawn."
// Every draw path — the Truth or Dare draw, the Redraw/Spice card
// effects, the Wildcard picker, and the Spin Wheel's outcome selection
// — calls getPlayablePool() instead of filtering gameData/positionsData
// on its own. This is a pure extraction: the filter logic below is
// moved verbatim from script.js (getFilteredList / applyPreferenceFilter
// / the wheel's inline tag and difficulty filters), not rewritten.
//
// Loaded after backend.js and before script.js, but — like backend.js —
// it only touches script.js's globals (gameData, positionsData,
// currentPlayer, itemRatings, itemMutualMatches, tierItemId,
// isSyncActive, getCardGender) lazily, inside function bodies, so
// load order relative to script.js doesn't matter in practice.

(function () {

  // ---- internal filter primitives ----

  // Gender filter: only cards tagged for the current player (or neutral).
  // Identical to the old top-level getFilteredList().
  function filterByGender(list) {
    return list.filter(function (card) {
      var genders = getCardGender(card);
      if (currentPlayer === "john") {
        return genders.indexOf("male") !== -1 || genders.indexOf("neutral") !== -1;
      }
      return genders.indexOf("female") !== -1 || genders.indexOf("neutral") !== -1;
    });
  }

  // Preferences/Matched Only filter: only ever narrows the deck for
  // couple-linked users — logged-out or unlinked players keep the exact
  // original list. Identical to the old top-level applyPreferenceFilter(),
  // with one addition: `strict` selects between the two matched-only
  // checks that existed independently pre-refactor (the general
  // Matched Only toggle used hasOwnProperty; the Wildcard picker used
  // `=== true`). That's a pre-existing micro-inconsistency, not
  // something this refactor introduces — kept both, verbatim, rather
  // than silently unifying them, to guarantee zero behavior change.
  function filterByPreference(list, tier, fullList, itemType, matchedOnly, strict) {
    if (!isSyncActive()) return list;
    if (matchedOnly) {
      return list.filter(function (card) {
        var idx = fullList.indexOf(card);
        var id = tierItemId(tier, idx);
        return strict
          ? itemMutualMatches[itemType][id] === true
          : Object.prototype.hasOwnProperty.call(itemMutualMatches[itemType], id);
      });
    }
    return list.filter(function (card) {
      var idx = fullList.indexOf(card);
      return itemRatings[itemType][tierItemId(tier, idx)] !== "no";
    });
  }

  // Spin Wheel's per-segment category match: dares carrying the
  // segment's tag, falling back to the unfiltered list if that leaves
  // nothing. Unrelated to `unlockedTags` below — that's a future
  // allow-list gate, this is an existing "which category" match.
  function filterByTag(list, tag) {
    if (!tag) return list;
    var filtered = list.filter(function (card) {
      return card.tags && card.tags.indexOf(tag) !== -1;
    });
    return filtered.length ? filtered : list;
  }

  var WHEEL_DIFFICULTY_BY_TIER = { tease: "beginner", foreplay: "intermediate", dirty: "advanced" };

  // Positions pool: difficulty-mapped from tier, falling back to the
  // full list if that leaves nothing. Identical to the wheel's old
  // inline diffMap filter — positions have never respected gender,
  // preferences, or Matched Only.
  function getPositionPool(tier) {
    var fullList = positionsData;
    var items = fullList.filter(function (p) { return p.difficulty === WHEEL_DIFFICULTY_BY_TIER[tier]; });
    if (!items.length) items = fullList;
    return { items: items, fullList: fullList };
  }

  // ---- public API ----

  // getPlayablePool(opts)
  //
  // opts.mode           'truth' | 'dare' | 'position' — which content list to draw from.
  // opts.tier            'tease' | 'foreplay' | 'dirty'.
  // opts.matchedOnly      When true, narrows to mutual-match-only content; when false,
  //                       narrows to "not rated no". Both only ever apply for
  //                       couple-linked users (see filterByPreference) — solo/unlinked
  //                       always get the unfiltered list, exactly as before this refactor.
  //                       Ignored for mode: 'position'.
  // opts.matchedOnlyStrict  Selects the stricter mutual-match check (`=== true` instead of
  //                       hasOwnProperty) — pass true only from the Wildcard picker, which
  //                       used that check pre-refactor. See filterByPreference's comment.
  // opts.respectGender    Whether to apply the currentPlayer gender filter. Default true.
  //                       The Wildcard picker and the Spin Wheel never applied this —
  //                       pass false to preserve that.
  // opts.respectPreferences Whether to apply preference/Matched Only filtering at all.
  //                       Default true. The Spin Wheel's dare pool never applied this
  //                       (it only matches by segment tag) — pass false to preserve that.
  // opts.requireTag       Dare-only. If set, narrows to dares carrying this tag, falling
  //                       back to the unfiltered list if that leaves nothing — the Spin
  //                       Wheel's per-segment category match.
  // opts.heatCeiling      RESERVED for the upcoming progression system (a maximum tier /
  //                       intensity ceiling). Accepted but NOT wired to anything yet.
  //                       Default: no ceiling (unconstrained).
  // opts.unlockedTags     RESERVED for the upcoming progression system (an allow-list of
  //                       tags the couple has unlocked). Accepted but NOT wired to
  //                       anything yet. Default: no restriction (all tags allowed).
  //
  // Returns { items, fullList }. `items` is a subset of `fullList` built with
  // Array.filter, so it preserves the original card references — callers can keep using
  // fullList.indexOf(picked) exactly as every call site did before this refactor.
  function getPlayablePool(opts) {
    opts = opts || {};
    var mode = opts.mode;
    var tier = opts.tier;

    if (mode === "position") {
      return getPositionPool(tier);
      // heatCeiling / unlockedTags: reserved, intentionally unused (see above).
    }

    var matchedOnly = !!opts.matchedOnly;
    var matchedOnlyStrict = !!opts.matchedOnlyStrict;
    var respectGender = opts.respectGender !== false;
    var respectPreferences = opts.respectPreferences !== false;
    var requireTag = opts.requireTag || null;
    // heatCeiling / unlockedTags: reserved, intentionally unused (see above).

    var fullList = gameData[tier][mode === "truth" ? "truths" : "dares"];
    var items = fullList;
    if (respectGender) items = filterByGender(items);
    if (mode === "dare" && requireTag) items = filterByTag(items, requireTag);
    if (respectPreferences) items = filterByPreference(items, tier, fullList, mode, matchedOnly, matchedOnlyStrict);

    return { items: items, fullList: fullList };
  }

  window.Pool = {
    getPlayablePool: getPlayablePool
  };

})();
