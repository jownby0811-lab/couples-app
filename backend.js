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
    myCouple: null, // { coupleId, inviteCode, partnerName } | null
    recoveryMode: false
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
    if (m.indexOf("user already registered") !== -1) return "An account with that email already exists — try signing in instead.";
    if (m.indexOf("invalid login credentials") !== -1) return "Incorrect email or password.";
    if (m.indexOf("email not confirmed") !== -1) return "Please confirm your email before signing in.";
    return msg || fallback || "Something went wrong. Please try again.";
  }

  function currentPageUrl() {
    return window.location.origin + window.location.pathname;
  }

  async function refreshMyCouple() {
    if (!client || !state.session) {
      state.myCouple = null;
      return null;
    }
    try {
      var { data, error } = await client.rpc("get_my_couple");
      if (error) throw error;
      var row = (data && data[0]) || null;
      state.myCouple = row
        ? { coupleId: row.couple_id, inviteCode: row.invite_code, partnerName: row.partner_name, partnerId: null }
        : null;
      // couple_members RLS lets a member read both rows for their own
      // couple_id — this is the only way to learn the partner's user id,
      // needed for role-swapping card effects (e.g. Reverse).
      if (state.myCouple) {
        try {
          var membersRes = await client
            .from("couple_members")
            .select("user_id")
            .eq("couple_id", state.myCouple.coupleId);
          if (membersRes.error) throw membersRes.error;
          var other = (membersRes.data || []).find(function (m) { return m.user_id !== state.session.user.id; });
          state.myCouple.partnerId = other ? other.user_id : null;
        } catch (e2) {
          console.warn("Failed to load partner id", e2);
        }
      }
    } catch (e) {
      console.warn("Failed to load couple status", e);
      state.myCouple = null;
    }
    return state.myCouple;
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
    await refreshMyCouple();
    notify();

    client.auth.onAuthStateChange(function (event, session) {
      if (event === "PASSWORD_RECOVERY") {
        state.recoveryMode = true;
        state.session = session;
        notify();
        return;
      }
      state.session = session;
      refreshMyCouple().then(notify);
    });
  }

  // ---- Auth: email + password ----

  // heatMode (optional): carries the local onboarding heat-mode choice
  // (see selectOnboardingHeatMode in script.js) onto the new profile,
  // same best-effort pattern as displayName below.
  async function signUp(email, password, displayName, heatMode, gender) {
    if (!client) throw new Error("Sign-up isn't available right now.");
    var { data, error } = await client.auth.signUp({
      email: email,
      password: password,
      options: { data: { display_name: displayName || "" } }
    });
    if (error) throw new Error(friendlyError(error, "Couldn't create your account. Please try again."));
    state.session = data.session || state.session;
    if (state.session && displayName) {
      try { await updateDisplayName(displayName); } catch (e) { console.warn("Failed to persist display name after signup", e); }
    }
    if (state.session && heatMode) {
      try { await setHeatMode(heatMode); } catch (e) { console.warn("Failed to persist heat mode after signup", e); }
    }
    if (state.session && gender) {
      try { await setGender(gender); } catch (e) { console.warn("Failed to persist gender after signup", e); }
    }
    await refreshMyCouple();
    notify();
    return data;
  }

  async function signIn(email, password) {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { data, error } = await client.auth.signInWithPassword({ email: email, password: password });
    if (error) throw new Error(friendlyError(error, "Couldn't sign in. Please check your email and password."));
    state.session = data.session;
    await refreshMyCouple();
    notify();
    return data;
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    state.session = null;
    state.myCouple = null;
    state.recoveryMode = false;
    notify();
  }

  async function resetPassword(email) {
    if (!client) throw new Error("Password reset isn't available right now.");
    var { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: currentPageUrl() });
    if (error) throw new Error(friendlyError(error, "Couldn't send the reset email. Please try again."));
  }

  async function setNewPassword(newPassword) {
    if (!client) throw new Error("Not available right now.");
    var { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendlyError(error, "Couldn't update your password. Please try again."));
    state.recoveryMode = false;
    notify();
  }

  function isLoggedIn() { return !!state.session; }
  function isInCouple() { return !!state.myCouple; }
  function isLinked() { return !!(state.myCouple && state.myCouple.partnerName); }
  function isRecoveryMode() { return !!state.recoveryMode; }

  // ---- Profile ----

  // userId defaults to the caller's own profile; pass a partner's id to
  // read theirs instead — RLS ("read own or partner profile") allows
  // reading any profile belonging to a member of your own couple.
  async function getProfile(userId) {
    if (!client || !state.session) return null;
    try {
      var { data, error } = await client
        .from("profiles")
        .select("display_name, heat_mode, gender")
        .eq("id", userId || state.session.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Failed to load profile", e);
      return null;
    }
  }

  async function updateDisplayName(name) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client
      .from("profiles")
      .update({ display_name: name })
      .eq("id", state.session.user.id);
    if (error) throw new Error(friendlyError(error, "Couldn't save your name. Please try again."));
  }

  // 'manual' (default) or 'adaptive' — per-user, own profile only. Direct
  // table update (RLS: "update own profile"), same pattern as
  // updateDisplayName; no RPC needed since there's no cross-row logic.
  async function setHeatMode(mode) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client
      .from("profiles")
      .update({ heat_mode: mode })
      .eq("id", state.session.user.id);
    if (error) throw new Error(friendlyError(error, "Couldn't save your heat mode. Please try again."));
  }

  // 'male' or 'female', nullable — per-user, own profile only. Same direct
  // update pattern as setHeatMode. Drives gender-tagged card filtering
  // (see pool.js) — null leaves gender-tagged content excluded until set.
  async function setGender(gender) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client
      .from("profiles")
      .update({ gender: gender })
      .eq("id", state.session.user.id);
    if (error) throw new Error(friendlyError(error, "Couldn't save your gender. Please try again."));
  }

  // ---- Couple linking ----

  async function createCouple() {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { data, error } = await client.rpc("create_couple");
    if (error) throw new Error(friendlyError(error));
    await refreshMyCouple();
    notify();
    return data;
  }

  async function joinCouple(code) {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { data, error } = await client.rpc("join_couple", { code: code });
    if (error) throw new Error(friendlyError(error));
    await refreshMyCouple();
    notify();
    return data;
  }

  async function leaveCouple() {
    if (!client) throw new Error("Sign-in isn't available right now.");
    var { error } = await client.rpc("leave_couple");
    if (error) throw new Error(friendlyError(error));
    await refreshMyCouple();
    notify();
  }

  // ---- Game events (realtime sync for Truth or Dare / Spin Wheel) ----
  // One shared channel per couple, fanned out to any number of local
  // listeners so both game modes can subscribe through the same
  // connection instead of opening one each.

  var gameChannel = null;
  var gameChannelCoupleId = null;
  var gameEventListeners = [];
  var connectionStatus = "solo"; // "solo" | "connecting" | "synced"
  var connectionListeners = [];

  function setConnectionStatus(next) {
    if (connectionStatus === next) return;
    connectionStatus = next;
    connectionListeners.forEach(function (fn) {
      try { fn(connectionStatus); } catch (e) { console.error(e); }
    });
  }

  function isGameSyncActive() {
    return isLoggedIn() && isLinked();
  }

  function teardownGameChannel() {
    if (gameChannel && client) {
      try { client.removeChannel(gameChannel); } catch (e) { /* already gone */ }
    }
    gameChannel = null;
    gameChannelCoupleId = null;
    setConnectionStatus("solo");
  }

  function ensureGameChannel() {
    if (!client || !isGameSyncActive()) {
      teardownGameChannel();
      return;
    }
    var coupleId = state.myCouple.coupleId;
    if (gameChannel && gameChannelCoupleId === coupleId) return;
    teardownGameChannel();
    gameChannelCoupleId = coupleId;
    setConnectionStatus("connecting");
    gameChannel = client
      .channel("game-events-" + coupleId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_events", filter: "couple_id=eq." + coupleId },
        function (payload) {
          gameEventListeners.forEach(function (fn) {
            try { fn(payload.new); } catch (e) { console.error(e); }
          });
        }
      )
      .subscribe(function (status) {
        if (status === "SUBSCRIBED") setConnectionStatus("synced");
        else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnectionStatus("solo");
        else setConnectionStatus("connecting");
      });
  }

  function subscribeGameEvents(onEvent) {
    gameEventListeners.push(onEvent);
    ensureGameChannel();
    return function unsubscribe() {
      gameEventListeners = gameEventListeners.filter(function (fn) { return fn !== onEvent; });
      if (gameEventListeners.length === 0) teardownGameChannel();
    };
  }

  async function sendGameEvent(eventType, payload) {
    if (!client || !state.session || !isLinked()) return { error: new Error("Not synced") };
    var row = {
      couple_id: state.myCouple.coupleId,
      user_id: state.session.user.id,
      event_type: eventType,
      payload: payload || {}
    };
    try {
      var { error } = await client.from("game_events").insert(row);
      if (error) throw error;
      return { error: null };
    } catch (e) {
      console.warn("Failed to send game event", eventType, e);
      return { error: e };
    }
  }

  async function fetchRecentGameEvents(limit) {
    if (!client || !state.session || !isLinked()) return [];
    try {
      var { data, error } = await client
        .from("game_events")
        .select("id, user_id, event_type, payload, created_at")
        .eq("couple_id", state.myCouple.coupleId)
        .order("created_at", { ascending: true })
        .limit(limit || 200);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Failed to fetch recent game events", e);
      return [];
    }
  }

  // Re-subscribe (or tear down) whenever auth/couple state changes — e.g.
  // sign-out, unlink, or a session restored on a fresh load — but only if
  // something is actually listening right now.
  listeners.push(function () {
    if (gameEventListeners.length === 0) return;
    if (isGameSyncActive()) ensureGameChannel();
    else teardownGameChannel();
  });

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
    if (!client || !state.session || !isLinked()) return [];
    try {
      var { data, error } = await client.rpc("get_mutual_matches", { p_type: itemType });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Failed to load mutual matches", e);
      return [];
    }
  }

  // ---- Progression (tag unlocks) ----
  // Mirrors the shape of get_couple_progression()'s TABLE result: one row
  // per currently-open proposal (there can be more than one — e.g. two
  // different tags proposed at once — plus always at least one row with
  // null proposal fields when nothing is open), so this normalizes it
  // into { progressionMode, unlockedTags, openProposals: [...] }.
  // my_answer is always the CALLER's own response only — the RPC never
  // returns anything about the partner's answer or who proposed.

  async function getCoupleProgression() {
    if (!client || !state.session || !isLinked()) {
      return { progressionMode: null, unlockedTags: [], openProposals: [] };
    }
    try {
      var { data, error } = await client.rpc("get_couple_progression");
      if (error) throw error;
      var rows = data || [];
      if (!rows.length) return { progressionMode: null, unlockedTags: [], openProposals: [] };
      var openProposals = rows
        .filter(function (r) { return r.open_proposal_id; })
        .map(function (r) {
          return { id: r.open_proposal_id, kind: r.open_proposal_kind, subject: r.open_proposal_subject, myAnswer: r.my_answer };
        });
      return {
        progressionMode: rows[0].progression_mode,
        unlockedTags: rows[0].unlocked_tags || [],
        openProposals: openProposals
      };
    } catch (e) {
      console.warn("Failed to load couple progression", e);
      return { progressionMode: null, unlockedTags: [], openProposals: [] };
    }
  }

  // Idempotent per open (couple, kind, subject) — calling this again for
  // the same still-open tag proposal just returns the existing id.
  async function createProgressionProposal(kind, subject) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { data, error } = await client.rpc("create_progression_proposal", { p_kind: kind, p_subject: subject });
    if (error) throw new Error(friendlyError(error, "Couldn't send that. Please try again."));
    return data;
  }

  // Returns ONLY 'recorded' or 'unlocked' — by design, never anything
  // that would reveal the partner's answer or whether they've answered.
  async function respondProgression(proposalId, answer) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { data, error } = await client.rpc("respond_progression", { p_proposal: proposalId, p_answer: answer });
    if (error) throw new Error(friendlyError(error, "Couldn't record your answer. Please try again."));
    return data;
  }

  // 'manual' (default) or 'adaptive' — couple-level, either partner can change it.
  async function setProgressionMode(mode) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client.rpc("set_progression_mode", { p_mode: mode });
    if (error) throw new Error(friendlyError(error, "Couldn't update progression mode. Please try again."));
  }

  // ---- Power Cards (Truth or Dare) ----
  // A player's hand is a private table (RLS: user_id = auth.uid()), never
  // readable by their partner. buy_card/play_card are atomic RPCs — the
  // server logs the game event and mutates the hand in one transaction.

  async function loadHand() {
    if (!client || !state.session) return {};
    try {
      var { data, error } = await client
        .from("player_cards")
        .select("card_type, quantity")
        .eq("user_id", state.session.user.id);
      if (error) throw error;
      var hand = {};
      (data || []).forEach(function (row) {
        if (row.quantity > 0) hand[row.card_type] = row.quantity;
      });
      return hand;
    } catch (e) {
      console.warn("Failed to load hand", e);
      return {};
    }
  }

  async function buyCard(cardType, cost) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client.rpc("buy_card", { p_card: cardType, p_cost: cost });
    if (error) throw new Error(friendlyError(error, "Couldn't buy that card. Please try again."));
  }

  async function playCard(cardType, payload) {
    if (!client || !state.session) throw new Error("Please sign in first.");
    var { error } = await client.rpc("play_card", { p_card: cardType, p_payload: payload || {} });
    if (error) throw new Error(friendlyError(error, "Couldn't play that card. Please try again."));
  }

  window.Backend = {
    init: init,
    onChange: function (fn) { listeners.push(fn); },
    isAvailable: function () { return !!client; },
    isLoggedIn: isLoggedIn,
    isInCouple: isInCouple,
    isLinked: isLinked,
    isRecoveryMode: isRecoveryMode,
    getSession: function () { return state.session; },
    getMyCouple: function () { return state.myCouple; },
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    resetPassword: resetPassword,
    setNewPassword: setNewPassword,
    getProfile: getProfile,
    updateDisplayName: updateDisplayName,
    setHeatMode: setHeatMode,
    setGender: setGender,
    createCouple: createCouple,
    joinCouple: joinCouple,
    leaveCouple: leaveCouple,
    getLocalRatings: getLocalRatings,
    saveRating: saveRating,
    loadRatings: loadRatings,
    getMutualMatches: getMutualMatches,
    getCoupleProgression: getCoupleProgression,
    createProgressionProposal: createProgressionProposal,
    respondProgression: respondProgression,
    setProgressionMode: setProgressionMode,
    loadHand: loadHand,
    buyCard: buyCard,
    playCard: playCard
  };

  window.GameSync = {
    isActive: isGameSyncActive,
    getConnectionStatus: function () { return connectionStatus; },
    onConnectionChange: function (fn) { connectionListeners.push(fn); },
    getMyUserId: function () { return state.session ? state.session.user.id : null; },
    getPartnerName: function () { return state.myCouple ? state.myCouple.partnerName : null; },
    getPartnerId: function () { return state.myCouple ? state.myCouple.partnerId : null; },
    subscribe: subscribeGameEvents,
    send: sendGameEvent,
    fetchRecent: fetchRecentGameEvents
  };
})();
