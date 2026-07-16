// ========================= //
// BETA FEEDBACK FORM        //
// ========================= //
// Standalone page — no auth required. Inserts a single row into
// beta_feedback using the anon key. Never reads from the table.

(function () {
  var SUPABASE_URL = "https://fbryjhpbecdylwhtfasi.supabase.co";
  var SUPABASE_KEY = "sb_publishable_bVZmfWWHSwoaUzhny4eEQQ_2BUHkI9y";

  var client = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  var selectedScore = null;
  var selectedMode = null;

  function blankToNull(value) {
    var trimmed = (value || "").trim();
    return trimmed ? trimmed : null;
  }

  function initScoreScale() {
    var buttons = document.querySelectorAll("#fbScoreScale .score-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedScore = parseInt(btn.getAttribute("data-score"), 10);
        buttons.forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        document.getElementById("fbError").innerText = "";
      });
    });
  }

  function initModeChips() {
    var chips = document.querySelectorAll("#fbModeChips .pos-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var mode = chip.getAttribute("data-mode");
        selectedMode = selectedMode === mode ? null : mode;
        chips.forEach(function (c) {
          c.classList.toggle("active", c.getAttribute("data-mode") === selectedMode);
        });
      });
    });
  }

  function buildFavoriteMode() {
    var why = blankToNull(document.getElementById("fbModeWhy").value);
    if (!selectedMode) return why; // no mode picked, but they left a "why" note anyway
    return why ? selectedMode + " — " + why : selectedMode;
  }

  function setButtonState(state) {
    var btn = document.getElementById("fbSubmitBtn");
    if (state === "sending") {
      btn.disabled = true;
      btn.innerText = "Sending…";
    } else if (state === "sent") {
      btn.disabled = true;
      btn.innerText = "Sent ✓";
    } else {
      btn.disabled = false;
      btn.innerText = "Send Feedback 💌";
    }
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error("TIMEOUT"));
      }, ms);
      promise.then(
        function (value) { clearTimeout(timer); resolve(value); },
        function (err) { clearTimeout(timer); reject(err); }
      );
    });
  }

  function showThankYou() {
    document.getElementById("feedbackForm").classList.add("hidden");
    document.getElementById("fbThankYou").classList.remove("hidden");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    var errEl = document.getElementById("fbError");
    errEl.innerText = "";

    if (!selectedScore) {
      errEl.innerText = "Please pick a score from 1 to 5 before sending.";
      document.getElementById("fbScoreScale").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!client) {
      errEl.innerText = "Feedback can't be sent right now — please try again in a moment.";
      return;
    }

    var payload = {
      device: blankToNull(document.getElementById("fbDevice").value),
      onboarding_score: selectedScore,
      onboarding_notes: blankToNull(document.getElementById("fbOnboardingNotes").value),
      discover_notes: blankToNull(document.getElementById("fbDiscoverNotes").value),
      favorite_mode: buildFavoriteMode(),
      awkward_moment: blankToNull(document.getElementById("fbAwkwardMoment").value),
      best_moment: blankToNull(document.getElementById("fbBestMoment").value),
      bugs: blankToNull(document.getElementById("fbBugs").value),
      price_expectation: blankToNull(document.getElementById("fbPriceExpectation").value),
      missing: blankToNull(document.getElementById("fbMissing").value)
    };

    setButtonState("sending");
    try {
      // No .select() chained: this is a minimal-return insert that never
      // asks PostgREST to read the row back, which the write-only RLS
      // policy on beta_feedback (insert-only, no select) would otherwise
      // leave hanging.
      var { error } = await withTimeout(
        client.from("beta_feedback").insert(payload),
        10000
      );
      if (error) throw error;
      setButtonState("sent");
      await wait(700);
      showThankYou();
    } catch (err) {
      console.warn("Failed to submit beta feedback", err);
      if (err && err.message === "TIMEOUT") {
        errEl.innerText = "That's taking longer than expected — your answers are still here, please try again.";
      } else {
        errEl.innerText = "Couldn't send that just now — your answers are still here, please try again.";
      }
      setButtonState("idle");
    }
  }

  window.addEventListener("load", function () {
    initScoreScale();
    initModeChips();
    var form = document.getElementById("feedbackForm");
    form.addEventListener("submit", handleSubmit);
  });
})();
