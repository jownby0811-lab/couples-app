#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Append positions page JS to both script.js files."""

js = """

// ========================= //
// POSITIONS PAGE            //
// ========================= //

const positionsData = [
  { id: 1, name: "Missionary", description: "The classic. Partner lies on their back, the other on top facing them. Simple, intimate, great eye contact.", tips: "Try placing a pillow under her hips to change the angle significantly.", difficulty: "beginner", category: "him-on-top", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 2, name: "Cowgirl", description: "She straddles him facing forward, controlling depth, pace, and angle entirely. Gives her full control.", tips: "Leaning forward changes the sensation completely compared to sitting upright.", difficulty: "beginner", category: "her-on-top", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 3, name: "Doggy Style", description: "She's on all fours, he enters from behind. Deep penetration, strong sensation for both.", tips: "Her arching her back versus rounding it changes the angle and intensity dramatically.", difficulty: "beginner", category: "from-behind", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 4, name: "Spooning", description: "Both lying on their sides facing the same direction. Slow, intimate, great for lazy mornings or late nights.", tips: "She can reach back and pull him closer or control depth with her hips.", difficulty: "beginner", category: "side-by-side", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 5, name: "Reverse Cowgirl", description: "She straddles him facing his feet instead of his face. Different angle, different sensation, great view for him.", tips: "She can lean forward onto his legs for support and a shallower angle.", difficulty: "beginner", category: "her-on-top", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 6, name: "Edge of the Bed", description: "She lies at the edge of the bed, he stands or kneels. Takes pressure off him, allows deeper thrusting.", tips: "Great for using hands on her simultaneously. Height of bed matters — adjust with pillows.", difficulty: "beginner", category: "him-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 7, name: "Face to Face", description: "Both sitting upright facing each other, she in his lap. Extremely intimate, full body contact, deep eye contact.", tips: "Rocking motion works better than thrusting here. Slow and connected.", difficulty: "beginner", category: "her-on-top", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 8, name: "Standing from Behind", description: "She bends forward against a wall or furniture, he enters from behind standing. Raw and intense.", tips: "Her height relative to his matters — heels or a step can fix any mismatch.", difficulty: "beginner", category: "standing", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 9, name: "Lotus", description: "He sits cross-legged, she sits in his lap facing him with legs wrapped around him. Deeply intimate, slow and connected.", tips: "More about rhythm and closeness than thrusting. Hold each other and move together.", difficulty: "intermediate", category: "her-on-top", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 10, name: "Butterfly", description: "She lies on her back at the edge of the bed, hips elevated with a pillow, legs up on his shoulders as he stands.", tips: "The angle hits differently than standard missionary. Adjust pillow height for best angle.", difficulty: "intermediate", category: "him-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 11, name: "The Pretzel", description: "She lies on her side, he kneels and enters while she swings her top leg over his opposite hip. Unusual angle, surprisingly deep.", tips: "Takes a moment to get into position but worth the effort for the unique sensation.", difficulty: "intermediate", category: "side-by-side", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 12, name: "Seated Doggy", description: "He sits on the edge of the bed or a chair, she sits on his lap facing away and leans forward.", tips: "She controls most of the movement here. He can use his hands freely.", difficulty: "intermediate", category: "her-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 13, name: "Side Saddle", description: "She straddles him but sits sideways rather than forward or backward. Unusual angle, great for G-spot stimulation.", tips: "She can lean forward or back to find the right angle. Slower movement works best.", difficulty: "intermediate", category: "her-on-top", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 14, name: "Flat Doggy", description: "Like doggy style but she lies completely flat on her stomach. He lies on top from behind. Creates tighter sensation.", tips: "She can clench her thighs together to increase tightness. Very different feel from standard doggy.", difficulty: "intermediate", category: "from-behind", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 15, name: "The Chair", description: "He sits in a sturdy chair, she straddles him facing forward. Like cowgirl but with feet on the floor giving her more leverage.", tips: "She can use the chair arms for stability. Allows deeper movement than bed-based cowgirl.", difficulty: "intermediate", category: "her-on-top", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 16, name: "Cunnilingus — Lying Down", description: "She lies on her back, he between her legs using mouth and tongue. The foundational oral position for her pleasure.", tips: "Pillows under her hips elevates the angle. Let her guide your head.", difficulty: "intermediate", category: "oral", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 17, name: "Fellatio — Lying Down", description: "He lies back, she between his legs using her mouth. Control, comfort, and eye contact all work in her favor.", tips: "She controls everything from this position. No pressure, full comfort.", difficulty: "intermediate", category: "oral", vibe: "intimate", tried: false, favorite: false, todo: false },
  { id: 18, name: "69", description: "Both giving and receiving oral simultaneously. Requires coordination but deeply intimate when it works.", tips: "Side-by-side 69 is easier than top-bottom and more comfortable for both.", difficulty: "intermediate", category: "oral", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 19, name: "The Wheelbarrow", description: "She's on her hands, he holds her legs up and enters from behind while she supports on her arms.", tips: "Keep it brief — her arms fatigue quickly. Best as a fun experiment rather than a marathon.", difficulty: "intermediate", category: "standing", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 20, name: "The Bridge", description: "She arches into a back bridge, he kneels in front and enters. Requires flexibility from her, incredible sensation.", tips: "Only attempt if she's comfortable with back flexibility. Start with a supported bridge using a pillow.", difficulty: "advanced", category: "him-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 21, name: "Standing 69", description: "He stands and holds her upside down while both perform oral simultaneously. Requires significant upper body strength.", tips: "Only attempt if he can comfortably hold her weight. A wall nearby for support helps.", difficulty: "advanced", category: "standing", vibe: "playful", tried: false, favorite: false, todo: false },
  { id: 22, name: "The Splits", description: "She does a full leg split while he enters from above or below. Requires exceptional flexibility from her.", tips: "Warm up with stretching first. Never force range of motion.", difficulty: "advanced", category: "him-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 23, name: "Suspended Congress", description: "He lifts her completely off the ground, she wraps legs around him, both having sex while standing. Full suspension.", tips: "Requires significant strength from him. A wall behind her for support makes this much more manageable.", difficulty: "advanced", category: "standing", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 24, name: "The Plow", description: "She lies on her back and brings her legs all the way back over her head. He enters from above at a steep angle.", tips: "Requires significant hip and hamstring flexibility from her. Don't force it.", difficulty: "advanced", category: "him-on-top", vibe: "intense", tried: false, favorite: false, todo: false },
  { id: 25, name: "Cunnilingus — Sitting on Face", description: "She straddles his face while he lies back, giving her full control over pressure and position.", tips: "She controls everything. He uses hands on her thighs or hips. Communication is key.", difficulty: "advanced", category: "oral", vibe: "intense", tried: false, favorite: false, todo: false }
];

var activePositionId = null;
var posFilterBrowse = "all";
var posFilterCategory = null;
var posFilterDifficulty = null;
var posFilterVibe = null;

function loadPositionsState() {
  var saved = localStorage.getItem("positionsState");
  if (!saved) return;
  var state = JSON.parse(saved);
  positionsData.forEach(function (pos) {
    if (state[pos.id]) {
      pos.tried    = !!state[pos.id].tried;
      pos.favorite = !!state[pos.id].favorite;
      pos.todo     = !!state[pos.id].todo;
    }
  });
}

function savePositionsState() {
  var state = {};
  positionsData.forEach(function (pos) {
    state[pos.id] = { tried: pos.tried, favorite: pos.favorite, todo: pos.todo };
  });
  localStorage.setItem("positionsState", JSON.stringify(state));
}

function posDots(difficulty) {
  var n = { beginner: 1, intermediate: 2, advanced: 3 }[difficulty] || 1;
  return "\\u25cf".repeat(n) + "\\u25cb".repeat(3 - n);
}

function getPosFiltered() {
  return positionsData.filter(function (p) {
    if (posFilterBrowse === "favorites" && !p.favorite) return false;
    if (posFilterBrowse === "todo"      && !p.todo)      return false;
    if (posFilterBrowse === "tried"     && !p.tried)     return false;
    if (posFilterCategory   && p.category   !== posFilterCategory)   return false;
    if (posFilterDifficulty && p.difficulty !== posFilterDifficulty) return false;
    if (posFilterVibe       && p.vibe       !== posFilterVibe)       return false;
    return true;
  });
}

function renderPositionsPage() {
  var triedCount = positionsData.filter(function (p) { return p.tried; }).length;
  var el;

  el = document.getElementById("posProgressText");
  if (el) el.innerText = triedCount + " of 25 tried";
  el = document.getElementById("posProgressFill");
  if (el) el.style.width = (triedCount / 25 * 100).toFixed(1) + "%";

  el = document.getElementById("countFavorites");
  if (el) el.innerText = positionsData.filter(function (p) { return p.favorite; }).length;
  el = document.getElementById("countTodo");
  if (el) el.innerText = positionsData.filter(function (p) { return p.todo; }).length;
  el = document.getElementById("countTried");
  if (el) el.innerText = triedCount;

  document.querySelectorAll(".pos-browse-row").forEach(function (row) {
    row.classList.toggle("active", row.getAttribute("data-browse") === posFilterBrowse);
  });
  document.querySelectorAll(".pos-chip").forEach(function (chip) {
    var t = chip.getAttribute("data-type"), v = chip.getAttribute("data-value");
    var on = (t === "category"   && posFilterCategory   === v) ||
             (t === "difficulty" && posFilterDifficulty === v) ||
             (t === "vibe"       && posFilterVibe       === v);
    chip.classList.toggle("active", on);
  });

  var filtered = getPosFiltered();
  var list = document.getElementById("positionsList");
  if (!list) return;
  list.innerHTML = "";
  if (filtered.length === 0) {
    list.innerHTML = "<p style=\\"color:rgba(255,245,247,0.4);text-align:center;padding:20px 0;\\">No positions match these filters.</p>";
    return;
  }
  filtered.forEach(function (pos) {
    var item = document.createElement("div");
    item.className = "pos-list-item";
    var tags = "";
    if (pos.tried)    tags += "<span class=\\"pos-tag\\">\\u2705</span>";
    if (pos.favorite) tags += "<span class=\\"pos-tag\\">\\u2764\\ufe0f</span>";
    if (pos.todo)     tags += "<span class=\\"pos-tag\\">\\ud83d\\udccc</span>";
    item.innerHTML =
      "<div class=\\"pos-list-name\\">" + pos.name + "</div>" +
      "<div class=\\"pos-list-meta\\">" +
        "<span class=\\"pos-vibe-badge pos-vibe-" + pos.vibe + "\\">" + pos.vibe + "</span>" +
        "<span class=\\"pos-dots\\">" + posDots(pos.difficulty) + "</span>" +
        tags +
      "</div>";
    item.onclick = (function (id) { return function () { openPositionCard(id); }; })(pos.id);
    list.appendChild(item);
  });
}

function initPositionsPage() {
  loadPositionsState();

  var pick = positionsData[Math.floor(Math.random() * positionsData.length)];
  var el;
  el = document.getElementById("tonightsPickName");
  if (el) el.innerText = pick.name;
  el = document.getElementById("tonightsPickVibe");
  if (el) { el.innerText = pick.vibe; el.className = "pos-vibe-badge pos-vibe-" + pick.vibe; }
  el = document.getElementById("tonightsPickDots");
  if (el) el.innerText = posDots(pick.difficulty);
  el = document.getElementById("tonightsPick");
  if (el) el.onclick = (function (id) { return function () { openPositionCard(id); }; })(pick.id);

  function makeChips(cid, vals, type) {
    var c = document.getElementById(cid);
    if (!c) return;
    c.innerHTML = "";
    vals.forEach(function (v) {
      var chip = document.createElement("span");
      chip.className = "pos-chip";
      chip.setAttribute("data-type", type);
      chip.setAttribute("data-value", v);
      chip.innerText = v.replace(/-/g, " ");
      chip.onclick = (function (t, val) { return function () { window.setPosFilter(t, val); }; })(type, v);
      c.appendChild(chip);
    });
  }
  makeChips("filterCategory",   ["her-on-top","him-on-top","from-behind","side-by-side","standing","oral"], "category");
  makeChips("filterDifficulty", ["beginner","intermediate","advanced"],  "difficulty");
  makeChips("filterVibe",       ["intimate","playful","intense"],         "vibe");

  renderPositionsPage();
}

function openPositionCard(id) {
  var pos = null;
  for (var i = 0; i < positionsData.length; i++) {
    if (positionsData[i].id === id) { pos = positionsData[i]; break; }
  }
  if (!pos) return;
  activePositionId = id;
  document.getElementById("modalName").innerText        = pos.name;
  document.getElementById("modalDescription").innerText = pos.description;
  document.getElementById("modalTips").innerText        = pos.tips;
  var ve = document.getElementById("modalVibe");
  ve.innerText = pos.vibe; ve.className = "pos-vibe-badge pos-vibe-" + pos.vibe;
  document.getElementById("modalDots").innerText     = posDots(pos.difficulty);
  document.getElementById("modalCategory").innerText = pos.category.replace(/-/g, " ");
  updatePosButtons(pos);
  document.getElementById("positionModal").classList.remove("hidden");
}

window.closePositionCard = function () {
  document.getElementById("positionModal").classList.add("hidden");
  activePositionId = null;
  renderPositionsPage();
};

function updatePosButtons(pos) {
  document.getElementById("btnTried").classList.toggle("active-toggle",    pos.tried);
  document.getElementById("btnFavorite").classList.toggle("active-toggle", pos.favorite);
  document.getElementById("btnTodo").classList.toggle("active-toggle",     pos.todo);
}

window.openPositionCard = openPositionCard;

window.setPosFilter = function (type, value) {
  if      (type === "browse")     posFilterBrowse     = (posFilterBrowse === value && value !== "all") ? "all" : value;
  else if (type === "category")   posFilterCategory   = posFilterCategory   === value ? null : value;
  else if (type === "difficulty") posFilterDifficulty = posFilterDifficulty === value ? null : value;
  else if (type === "vibe")       posFilterVibe       = posFilterVibe       === value ? null : value;
  renderPositionsPage();
};

window.togglePositionState = function (field) {
  if (!activePositionId) return;
  var pos = null;
  for (var i = 0; i < positionsData.length; i++) {
    if (positionsData[i].id === activePositionId) { pos = positionsData[i]; break; }
  }
  if (!pos) return;
  pos[field] = !pos[field];
  savePositionsState();
  updatePosButtons(pos);
  renderPositionsPage();
};

window.drawRandomPosition = function () {
  var pool = getPosFiltered();
  if (!pool.length) pool = positionsData;
  openPositionCard(pool[Math.floor(Math.random() * pool.length)].id);
};

window.addEventListener("load", function () { initPositionsPage(); });
"""

for path in [
    r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\dist\script.js',
    r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\src\script.js',
]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content + js)
    print('Appended to', path)
