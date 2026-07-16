// ========================= //
// SUPABASE BACKEND SERVICE  //
// ========================= //
// Thin service layer around Supabase auth + couple linking + shared
// preferences. Pure data/service logic only — no DOM here. If Supabase
// isn't reachable or the user never signs in, every method degrades to
// localStorage so the rest of the app keeps working offline.
//
// Reused across content types: preferences are keyed by (item_type,
// item_id), so the same saveRating/loadRatings/getMutualMatches calls
// that back the Positions page will work for truths, dares, and
// roleplay later — just pass a different item_type.

(function () {
  var SUPABASE_URL = "https://fbryjhpbecdylwhtfasi.supabase.co";
  var SUPABASE_KEY = "sb_publishable_bVZmfWWHSwoaUzhny4eEQQ_2BUHkI9y";

  var client = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  var state = {
    session: null,
    coupleId: null
  };

  var listeners = [];

  function notify() {
    listeners.forEach(function (fn) {
      try { fn(state); } catch (e) { console.error(e); }
    });
  }

  function friendlyError(err, fallback) {
    var msg = (err && err.message) || "";
    var m = msg.toLowerCase();
    if (m.indexOf("already in a couple") !== -1) return "You're already linked with a partner.";
    if (m.indexOf("invalid invite code") !== -1) return "That invite code doesn't look right. Double-check with your partner.";
    if (m.indexOf("couple is full") !== -1) return "That couple already has two people linked.";
    if (m.indexOf("not authenticated") !== -1) return "Please sign in first.";
    return msg || fallback || "Something went wrong. Please try again.";
  }

  async function refreshCoupleStatus() {
    if (!client || !state.session) {
      state.coupleId = null;
      return null;
    }
    try {
      var uid = state.session.user.id;
      var res = await client.from("couple_members").select("couple_id").eq("user_id", uid).maybeSingle();
      if (res.error) throw res.error;
      state.coupleId = res.data ? res.data.couple_id : null;
    } catch (e) {
      console.warn("Failed to check couple status", e);
      state.coupleId = null;
    }
    return state.coupleId;
  }

  async function init() {
    if (!client) { notify(); return; }
    try {
      var res = await client.auth.getSession();
      state.session = res.data ? res.data.session : null;
    } catch (e) {
      console.warn("Failed to read Supabase session", e);
      state.session = null;
    }
    await refreshCoupleStatus();
    notify();

    client.auth.onAuthStateChange(function (_event, session) {
      state.session = session;
      refreshCoupleStatus().then(notify);
    });
  }

  async function sendMagicLink(email) {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var redirectTo = window.location.origin + window.location.pathname;
    var { error } = await client.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw new Error(friendlyError(error, "Couldn't send the magic link. Please check the email and try again."));
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    state.session = null;
    state.coupleId = null;
    notify();
  }

  async function createCouple() {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { data, error } = await client.rpc("create_couple");
    if (error) throw new Error(friendlyError(error));
    await refreshCoupleStatus();
    notify();
    return data;
  }

  async function joinCouple(code) {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { data, error } = await client.rpc("join_couple", { code: code });
    if (error) throw new Error(friendlyError(error));
    await refreshCoupleStatus();
    notify();
    return data;
  }

  function isLoggedIn() { return !!state.session; }
  function isLinked() { return !!state.coupleId; }

  // ---- Generic preferences (reusable for truth/dare/position/roleplay) ----

  function localKey(itemType) { return "prefRatings_" + itemType; }

  function getLocalRatings(itemType) {
    try {
      return JSON.parse(localStorage.getItem(localKey(itemType))) || {};
    } catch (e) {
      return {};
    }
  }

  function setLocalRating(itemType, itemId, rating) {
    var all = getLocalRatings(itemType);
    all[String(itemId)] = rating;
    localStorage.setItem(localKey(itemType), JSON.stringify(all));
  }

  async function saveRating(itemType, itemId, rating) {
    setLocalRating(itemType, itemId, rating);
    if (!client || !state.session) return { synced: false };
    try {
      var { error } = await client.from("preferences").upsert({
        user_id: state.session.user.id,
        item_type: itemType,
        item_id: String(itemId),
        rating: rating,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,item_id,item_type" });
      if (error) throw error;
      return { synced: true };
    } catch (e) {
      console.warn("Rating saved locally but failed to sync to server", e);
      return { synced: false, error: e };
    }
  }

  async function loadRatings(itemType) {
    var local = getLocalRatings(itemType);
    if (!client || !state.session) return local;
    try {
      var { data, error } = await client
        .from("preferences")
        .select("item_id, rating")
        .eq("item_type", itemType)
        .eq("user_id", state.session.user.id);
      if (error) throw error;
      var merged = Object.assign({}, local);
      (data || []).forEach(function (row) { merged[row.item_id] = row.rating; });
      localStorage.setItem(localKey(itemType), JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn("Failed to load ratings from server, using local cache", e);
      return local;
    }
  }

  async function getMutualMatches(itemType) {
    if (!client || !state.session || !state.coupleId) return [];
    try {
      var { data, error } = await client.rpc("get_mutual_matches", { p_type: itemType });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Failed to load mutual matches", e);
      return [];
    }
  }

  window.Backend = {
    init: init,
    onChange: function (fn) { listeners.push(fn); },
    isAvailable: function () { return !!client; },
    isLoggedIn: isLoggedIn,
    isLinked: isLinked,
    getSession: function () { return state.session; },
    getCoupleId: function () { return state.coupleId; },
    sendMagicLink: sendMagicLink,
    signOut: signOut,
    createCouple: createCouple,
    joinCouple: joinCouple,
    getLocalRatings: getLocalRatings,
    saveRating: saveRating,
    loadRatings: loadRatings,
    getMutualMatches: getMutualMatches
  };
})();
