// ========================= //
// PLAYABLE POOL             //
// ========================= //
// Single source of truth for "what content can currently be drawn."
// Every draw path — the Truth or Dare draw, the Redraw/Spice card
// effects, the Wildcard picker, and the Spin Wheel's outcome selection
// — calls getPlayablePool() instead of filtering gameData/positionsData
// on its own. Gender/preference/Matched Only/tag-category filtering was
// moved here verbatim from script.js's older per-call-site logic.
// unlockedTags (the tag-unlock progression system) is the one filter
// that was designed here from the start, not extracted — see its
// doc comment on getPlayablePool below.
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
  // segment's tag. Unrelated to `unlockedTags` below — that's the
  // progression allow-list gate, this is the existing "which category"
  // match. No fallback-if-empty here anymore; see the dare branch of
  // getPlayablePool for how the two combine.
  function matchesTag(card, tag) {
    return !!(card.tags && card.tags.indexOf(tag) !== -1);
  }

  // Progression allow-list: `allowedTags` is the couple's FULL currently
  //-playable tag set (base/vanilla tags plus whatever they've unlocked
  // together), computed by the caller — pool.js itself has no opinion on
  // which tags are "base" vs "advanced". A dare passes if it has no tags
  // at all, or if every one of its tags is in the allowed set; a dare
  // carrying even one tag outside that set (i.e. an advanced tag the
  // couple hasn't unlocked) is excluded. `allowedTags` of null/undefined
  // means no restriction at all — the only value ever passed for
  // solo/unlinked users, so their pool is byte-identical to before this
  // feature existed.
  function filterByUnlockedTags(list, allowedTags) {
    if (!allowedTags) return list;
    var allowedSet = {};
    allowedTags.forEach(function (t) { allowedSet[t] = true; });
    return list.filter(function (card) {
      var tags = card.tags;
      if (!tags || !tags.length) return true;
      return tags.every(function (t) { return !!allowedSet[t]; });
    });
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
  // opts.requireTag       Dare-only. If set, narrows to dares carrying this tag — the Spin
  //                       Wheel's per-segment category match. If combined with
  //                       unlockedTags and that leaves nothing playable, the tag
  //                       requirement is dropped before the lock is (see below) — the
  //                       wheel always shows *something*, but never a locked dare.
  // opts.heatCeiling      RESERVED for the upcoming heat/tier progression system (a
  //                       maximum tier). Accepted but NOT wired to anything yet.
  //                       Default: no ceiling (unconstrained).
  // opts.unlockedTags     Dare-only. The couple's full currently-playable tag allow-list
  //                       (base/vanilla tags plus whatever they've unlocked together) —
  //                       computed by the caller, not pool.js. null/undefined (the
  //                       default) means no restriction at all: every solo/unlinked call
  //                       site passes null (or omits it), so that population's pool is
  //                       byte-identical to before this feature existed. A dare with no
  //                       tags, or whose tags are all in the allow-list, is playable; a
  //                       dare carrying even one tag outside it is excluded.
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
      // heatCeiling / unlockedTags: reserved / dare-only, intentionally unused here.
    }

    var matchedOnly = !!opts.matchedOnly;
    var matchedOnlyStrict = !!opts.matchedOnlyStrict;
    var respectGender = opts.respectGender !== false;
    var respectPreferences = opts.respectPreferences !== false;
    var requireTag = opts.requireTag || null;
    var unlockedTags = opts.unlockedTags || null;
    // heatCeiling: reserved, intentionally unused (see above).

    var fullList = gameData[tier][mode === "truth" ? "truths" : "dares"];
    var items = fullList;
    if (respectGender) items = filterByGender(items);

    if (mode === "dare") {
      if (requireTag) {
        var tagMatched = items.filter(function (c) { return matchesTag(c, requireTag); });
        var tagAndUnlocked = filterByUnlockedTags(tagMatched, unlockedTags);
        if (tagAndUnlocked.length) {
          items = tagAndUnlocked;
        } else {
          // Nothing satisfies both the segment tag and the lock — drop
          // the tag requirement (matches the pre-progression "fall back
          // to the unfiltered list" behavior) but keep the lock, so a
          // locked-tag wheel segment never surfaces a locked dare.
          var unlockedOnly = filterByUnlockedTags(items, unlockedTags);
          if (unlockedOnly.length) {
            items = unlockedOnly;
          } else {
            // Last resort: the whole tier is locked (shouldn't happen with
            // a sane base tag set) — show it unfiltered rather than crash
            // on an empty pool.
            if (unlockedTags) console.warn("pool.js: unlockedTags left zero dares for tier " + tier + " — showing the unfiltered tier as a last resort.");
          }
        }
      } else {
        items = filterByUnlockedTags(items, unlockedTags);
      }
    }

    if (respectPreferences) items = filterByPreference(items, tier, fullList, mode, matchedOnly, matchedOnlyStrict);

    return { items: items, fullList: fullList };
  }

  window.Pool = {
    getPlayablePool: getPlayablePool
  };

})();
