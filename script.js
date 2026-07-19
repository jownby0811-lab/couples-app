window.showPage = function (pageId) {
  let sections = document.getElementsByClassName("section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  document.getElementById(pageId).classList.add("active");
  document.getElementById("menu").classList.remove("menu-open");
  if (pageId === "account" && typeof renderAccountPage === "function") {
    renderAccountPage();
  }
  if (pageId === "personalize" && typeof initPersonalizePage === "function") {
    initPersonalizePage();
  }
  if (pageId === "truth" && typeof refreshAllPreferenceCaches === "function") {
    updateMatchedOnlyUI();
    refreshAllPreferenceCaches();
    if (typeof refreshCoupleProgression === "function") refreshCoupleProgression();
    if (typeof updateTierSelectOptions === "function") updateTierSelectOptions();
    if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
    if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();
    if (typeof refreshTierReadout === "function") refreshTierReadout();
  }
  if (pageId === "wheel" && typeof initWheelPage === "function") {
    buildWheelSvg();
    renderWheelRotation(wheelRotationDeg);
    renderWheelLandedState(wheelLandedSegment);
    if (typeof refreshCoupleProgression === "function") refreshCoupleProgression();
    if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();
    if (typeof refreshTierReadout === "function") refreshTierReadout();
    if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
  }
  if (pageId === "home" && typeof initHomePage === "function") {
    initHomePage();
  }
  if (typeof setGameSyncPage === "function") setGameSyncPage(pageId);
};

// ---- App icon set (assets/icons/gameplay/ + assets/icons/ui/) ----
// One mapping (icon key -> PNG path + fallback emoji) and one render
// helper so every emoji->icon swap in this file goes through the same
// place instead of scattering <img> literals, regardless of which of the
// two asset folders a given icon lives in. Falls back to the original
// emoji instantly via the existing imgFallback() (defined in index.html)
// if a PNG fails to load. Renders the @64 masters at a size set by the
// className's own CSS (see GAMEPLAY ICONS / UI ICONS in style.css).
var ICONS = {
  tease:          { src: "assets/icons/gameplay/tease-feather@64.png",             emoji: "😏" },
  foreplay:       { src: "assets/icons/gameplay/foreplay-flames@64.png",           emoji: "🔥" },
  dirty:          { src: "assets/icons/gameplay/dirty-heart@64.png",               emoji: "😈" },
  turnUpHeat:     { src: "assets/icons/gameplay/turn-up-the-heat@64.png",          emoji: "🔥" },
  playerJohn:     { src: "assets/icons/gameplay/player-john-medallion@64.png",     emoji: "😎" },
  playerFelicity: { src: "assets/icons/gameplay/player-felicity-medallion@64.png", emoji: "💕" },
  newGame:        { src: "assets/icons/gameplay/new-game-refresh-card@64.png",     emoji: "🔄" },
  drinkMode:      { src: "assets/icons/gameplay/drink-mode-coupe@64.png",          emoji: "🍺" },
  matchedOnly:    { src: "assets/icons/gameplay/matched-only-hearts@64.png",       emoji: "💕" },
  personalize:    { src: "assets/icons/gameplay/personalize-card-quill@64.png",    emoji: "💌" },

  home:           { src: "assets/icons/ui/home@64.png",                           emoji: "🏠" },
  truthOrDare:    { src: "assets/icons/ui/truth-or-dare@64.png",                  emoji: "🎯" },
  roleplay:       { src: "assets/icons/ui/roleplay@64.png",                       emoji: "🎭" },
  positions:      { src: "assets/icons/ui/positions@64.png",                      emoji: "🧭" },
  spinTheWheel:   { src: "assets/icons/ui/spin-the-wheel@64.png",                 emoji: "🎡" },
  updateNames:    { src: "assets/icons/ui/update-names@64.png",                   emoji: "✏️" },
  soundOn:        { src: "assets/icons/ui/sound-on@64.png",                       emoji: "🔊" },
  soundOff:       { src: "assets/icons/ui/sound-off@64.png",                      emoji: "🔇" },
  account:        { src: "assets/icons/ui/account@64.png",                        emoji: "👤" },
  betaFeedback:   { src: "assets/icons/ui/beta-feedback@64.png",                  emoji: "💬" },
  dareWeTryThis:  { src: "assets/icons/ui/dare-we-try-this@64.png",               emoji: "🔥" },

  wheelManualChoice: { src: "assets/icons/wheel/manual-choice@64.png",            emoji: "🤚" },
  wheelDirtyTalk:    { src: "assets/icons/wheel/dirty-talk@64.png",               emoji: "💬" },
  wheelKissing:      { src: "assets/icons/wheel/kissing@64.png",                  emoji: "💋" },
  wheelMassage:      { src: "assets/icons/wheel/massage@64.png",                  emoji: "💆" }
};

// className controls display size (see style.css); label is the alt text
// unless decorative is true, in which case the icon is aria-hidden
// because the text right next to it already says the same thing.
function appIcon(key, className, label, decorative) {
  var def = ICONS[key];
  if (!def) return "";
  var a11y = decorative ? ' alt="" aria-hidden="true"' : ' alt="' + label + '"';
  return '<img class="' + className + '" src="' + def.src + '"' + a11y +
    ' onerror="imgFallback(this,\'' + def.emoji + '\')">';
}

let johnScore = parseInt(localStorage.getItem("johnScore")) || 0;
let felicityScore = parseInt(localStorage.getItem("felicityScore")) || 0;
let player1Name = localStorage.getItem("player1Name") || "Him";
let player2Name = localStorage.getItem("player2Name") || "Her";
let drinkMode = localStorage.getItem("drinkMode") === "true";
let currentPlayer = "john";
let currentTier = "";
let currentCardMeta = null; // solo mode's { mode, tier, cardIndex } for the currently drawn card

const truthPoints = {
  tease: 3,
  foreplay: 6,
  dirty: 10
};

const pointRanges = {
  tease: [1, 2, 3, 4, 5],
  foreplay: [5, 6, 7, 8, 9, 10],
  dirty: [10, 12, 14, 16, 18, 20]
};

let gameData = JSON.parse(localStorage.getItem("gameData")) || {
  tease: {
    truths: [
      { text: "How turned on are you by the idea of using toys to simulate a threesome on her?", Gender: "neutral" },
      { text: "How do you feel about light bondage or tying her up?", Gender: "male" },
      { text: "How do you feel about light bondage or tying him up?", Gender: "female" },
      { text: "Would you rather tie her up or be the one restrained?", Gender: "male" },
      { text: "Would you rather tie him up or be the one restrained?", Gender: "female" },
      { text: "What lingerie on her turns you on the most?", Gender: "male" },
      { text: "How do you feel about light hair pulling?", Gender: "neutral" },
      { text: "How turned on are you by watching in a mirror?", Gender: "neutral" },
      { text: "On a scale of 1-10, how much do you enjoy praising her?", Gender: "male" },
      { text: "On a scale of 1-10, how much do you enjoy being praised by him?", Gender: "female" },
      { text: "What's a mild roleplay scenario that sounds fun to you?", Gender: "neutral" },
      { text: "How do you feel about light spit play?", Gender: "neutral" },
      { text: "How curious are you about gentle ass play on her?", Gender: "male" },
      { text: "What's a fantasy you've had about us that you haven't shared?", Gender: "neutral" },
      { text: "How do you feel about light bondage or being tied up?", Gender: "neutral" },
      { text: "Would you rather tie me up or be the one restrained?", Gender: "neutral" },
      { text: "How turned on are you by wearing sexy lingerie?", Gender: "female" },
      { text: "What's one compliment or praise that turns you on?", Gender: "neutral" },
      { text: "How do you feel about light hair pulling?", Gender: "neutral" },
      { text: "Would you like to try simple roleplay (strangers, etc.)?", Gender: "neutral" },
      { text: "How do you feel when I call you 'good girl'?", Gender: "female" },
      { text: "What's a fantasy you've had about us that you haven't shared?", Gender: "neutral" },
      { text: "What's the hottest outfit or lingerie you've imagined me in?", Gender: "neutral" },
      { text: "How do you feel about getting a little messy with spit?", Gender: "neutral" },
      { text: "Does the idea of using toys to feel 'full' turn you on?", Gender: "female" },
      { text: "How turned on are you by the idea of multiple holes being played with?", Gender: "neutral" },
      { text: "What's one small touch or tease that always gets you going?", Gender: "neutral" },
      { text: "Would you like to try a butt plug while we're just teasing?", Gender: "female" },
      { text: "How hot does it sound to combine me + toys?", Gender: "female" },
      { text: "Where's a place outside the bedroom you've wanted to fool around?", Gender: "neutral" },
      { text: "Ice, massage oil, or blindfold — which sounds fun right now?", Gender: "neutral" },
      { text: "How do you feel when I tease you for a long time?", Gender: "neutral" },
      { text: "What's one sexy nickname you like or want to use?", Gender: "neutral" },
      { text: "Do you like when I lightly spank you?", Gender: "female" },
      { text: "What's something sweet + dirty you'd like me to say?", Gender: "neutral" },
      { text: "How turned on do you get from eye contact and slow kissing?", Gender: "neutral" },
      { text: "What's one thing you've seen about eating pussy or blowjobs you're curious about?", Gender: "neutral" },
      { text: "On a scale of 1-10, how confident do you feel going down on each other?", Gender: "neutral" },
      { text: "What's one thing you've seen or heard about eating pussy that you're curious to try?", Gender: "male" },
      { text: "On a scale of 1-10, how confident do you feel going down on her?", Gender: "male" },
      { text: "What's something you already enjoy about licking her pussy?", Gender: "male" },
      { text: "How do you feel when she moans or grabs your head?", Gender: "male" },
      { text: "What's one compliment about her pussy that you could say out loud?", Gender: "male" },
      { text: "Do you like when she watches you while you eat her out?", Gender: "male" },
      { text: "What's a simple way you like to start eating her out?", Gender: "male" },
      { text: "How turned on do you get knowing you're making her feel good?", Gender: "male" },
      { text: "What's one gentle thing she could say to help you feel more confident?", Gender: "male" },
      { text: "Do you prefer slow and teasing or eager and hungry?", Gender: "neutral" },
      { text: "What's one thing you've seen or heard about blowjobs that you're curious to try?", Gender: "female" },
      { text: "On a scale of 1-10, how confident do you feel giving head right now?", Gender: "female" },
      { text: "What's something you already enjoy about sucking me?", Gender: "female" },
      { text: "How do you feel when I moan or give you feedback?", Gender: "female" },
      { text: "What's one compliment you can give about my dick right now?", Gender: "female" },
      { text: "What's a simple way you'd like to start going down next time?", Gender: "female" },
      { text: "How turned on do you get knowing you're making me feel good?", Gender: "female" },
      { text: "What's one gentle thing I could say to help you feel more confident?", Gender: "female" },
      { text: "What's one compliment about your body you love giving or hearing?", Gender: "neutral" },
      { text: "How do you feel when I use a sexy voice with you?", Gender: "neutral" },
      { text: "What's a simple word or nickname that turns you on?", Gender: "neutral" },
      { text: "Do you like when I tell you how good you look?", Gender: "neutral" },
      { text: "What's something small I do that makes you blush?", Gender: "neutral" },
      { text: "How turned on does my teasing voice make you?", Gender: "neutral" },
      { text: "What's a mild fantasy you've had about us this week?", Gender: "neutral" },
      { text: "Do you prefer sweet compliments or a little naughty ones?", Gender: "neutral" },
      { text: "What's one touch from me that always feels nice?", Gender: "neutral" },
      { text: "How does it feel when I whisper in your ear?", Gender: "neutral" },
      { text: "What's the hottest thing I've ever worn that turned you on?", Gender: "neutral" },
      { text: "Describe your favorite way I tease you.", Gender: "neutral" },
      { text: "What's a sexual fantasy about me you haven't shared?", Gender: "neutral" },
      { text: "When was the last time you touched yourself thinking about me?", Gender: "neutral" },
      { text: "What's the sexiest thing I've ever said to you?", Gender: "neutral" },
      { text: "If you could touch me in only one place right now, where?", Gender: "neutral" },
      { text: "What's your favorite intimate memory of us?", Gender: "neutral" },
      { text: "What small thing I do drives you crazy with lust?", Gender: "neutral" },
      { text: "Be honest — how often do you get turned on thinking about me?", Gender: "neutral" },
      { text: "What's one compliment about my body you've held back?", Gender: "neutral" }
    ],
    dares: [
      {
        text: "Model your sexiest lingerie for him.",
        Gender: "female",
        tags: ["strip"]
      },
      {
        text: "Lightly tie her hands with a scarf while kissing her.",
        Gender: "male",
        tags: ["bondage", "kissing"]
      },
      {
        text: "Pull her hair gently while making out.",
        Gender: "male",
        tags: ["kissing"]
      },
      {
        text: "Spit on her body and rub it in slowly.",
        Gender: "male",
        tags: ["spit-play"]
      },
      {
        text: "Watch her touch herself in front of a mirror.",
        Gender: "male",
        tags: ["manual", "mirror"]
      },
      {
        text: "Tease her ass gently over her panties with a finger.",
        Gender: "male",
        tags: ["ass-play", "teasing"]
      },
      {
        text: "Roleplay as strangers flirting heavily.",
        Gender: "neutral",
        tags: ["roleplay"]
      },
      {
        text: "Change into lingerie then give him a lap dance.",
        Gender: "female",
        tags: ["strip", "grinding"]
      },
      {
        text: "Praise her body out loud while kissing her.",
        Gender: "male",
        tags: ["praise", "kissing"]
      },
      {
        text: "Insert a small butt plug in her together and just tease.",
        Gender: "female",
        tags: ["toys", "ass-play", "teasing"]
      },
      {
        text: "Do a slow striptease in your favorite lingerie.",
        Gender: "female",
        tags: ["strip"]
      },
      {
        text: "Wear something sexy and model it for him.",
        Gender: "female",
        tags: ["strip"]
      },
      {
        text: "Compliment his body using one praise phrase.",
        Gender: "female",
        tags: ["praise"]
      },
      {
        text: "Pull his hair gently while you make out.",
        Gender: "female",
        tags: ["kissing"]
      },
      {
        text: "Pretend you're strangers meeting at a bar and flirt.",
        Gender: "neutral",
        tags: ["roleplay"]
      },
      {
        text: "Kiss and tease each other while watching in a mirror.",
        Gender: "neutral",
        tags: ["kissing", "teasing", "mirror"]
      },
      {
        text: "Say \"I'm your good girl\" while grinding on his lap.",
        Gender: "female",
        tags: ["dirty-talk", "grinding", "praise"]
      },
      {
        text:
          "Let him hold your wrists above your head while kissing your neck.",
        Gender: "female",
        tags: ["bondage", "kissing"]
      },
      {
        text: "Change into lingerie then give a flirty lap dance.",
        Gender: "female",
        tags: ["strip", "grinding"]
      },
      {
        text: "Spit on their cock/pussy and rub it in slowly.",
        Gender: "neutral",
        tags: ["spit-play"]
      },
      {
        text: "Kiss with lots of spit for 30 seconds.",
        Gender: "neutral",
        tags: ["kissing", "spit-play"]
      },
      {
        text: "Spit between her tits and slide your cock there slowly.",
        Gender: "male",
        tags: ["spit-play"]
      },
      {
        text: "Let him spit on your pussy then tease with his fingers.",
        Gender: "female",
        tags: ["spit-play", "manual", "teasing"]
      },
      {
        text: "Suck a dildo while he kisses and teases your body.",
        Gender: "female",
        tags: ["oral", "toys", "kissing", "teasing"]
      },
      {
        text: "Use a toy on yourself while you make out heavily.",
        Gender: "female",
        tags: ["toys", "kissing"]
      },
      {
        text: "Do a slow striptease down to your underwear.",
        Gender: "neutral",
        tags: ["strip"]
      },
      {
        text: "Grind on his lap fully clothed while making eye contact.",
        Gender: "female",
        tags: ["grinding"]
      },
      {
        text: "Kiss and lick their neck for 30 seconds.",
        Gender: "neutral",
        tags: ["kissing"]
      },
      {
        text:
          "Let them blindfold you and kiss your body anywhere for 45 seconds.",
        Gender: "neutral",
        tags: ["blindfold", "kissing"]
      },
      {
        text: "Whisper three places you want their mouth.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Kiss and lick just the head / her clit softly for 30 seconds.",
        Gender: "neutral",
        tags: ["oral"]
      },
      {
        text: "Run ice cubes over their nipples and thighs.",
        Gender: "neutral",
        tags: ["temperature-play"]
      },
      {
        text: "Give a slow full-body massage using only hands and lips.",
        Gender: "neutral",
        tags: ["massage", "kissing"]
      },
      {
        text: "Kiss them deeply while grinding slowly against them.",
        Gender: "neutral",
        tags: ["kissing", "grinding"]
      },
      {
        text: "Say one sweet + naughty compliment while kissing their body.",
        Gender: "neutral",
        tags: ["dirty-talk", "kissing", "praise"]
      },
      {
        text:
          "Tease each other with light touches and feathers (or fingers) for 60s.",
        Gender: "neutral",
        tags: ["teasing", "manual"]
      },
      {
        text:
          "Look at each other and describe one thing you find hot about the other's body.",
        Gender: "neutral",
        tags: ["dirty-talk", "praise"]
      },
      {
        text: "Kiss and lick her pussy softly.",
        Gender: "male",
        tags: ["oral"]
      },
      {
        text: "Kiss and lick her pussy slowly from bottom to top",
        Gender: "male",
        tags: ["oral"]
      },
      {
        text:
          "Kiss and lick her inner thighs and tease closer with your tongue.",
        Gender: "male",
        tags: ["oral", "teasing"]
      },
      {
        text: "Look up at her while you lick her slowly.",
        Gender: "male",
        tags: ["oral"]
      },
      {
        text: "Tell her one thing you love about her taste while licking.",
        Gender: "male",
        tags: ["oral", "dirty-talk"]
      },
      {
        text: "Lick her with the flat of your tongue for 45 seconds.",
        Gender: "male",
        tags: ["oral"]
      },
      {
        text: "Hold eye contact while kissing and licking her clit.",
        Gender: "male",
        tags: ["oral"]
      },
      {
        text: "Say 'You taste so fucking good' while eating her out.",
        Gender: "male",
        tags: ["oral", "dirty-talk"]
      },
      {
        text: "Tease her pussy with just your lips and tongue for 45 seconds.",
        Gender: "male",
        tags: ["oral", "teasing"]
      },
      {
        text:
          "Kiss and lick just the head for 30 seconds like it's your favorite treat.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Look up at him while you slowly kiss down the full shaft.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Say 'I love your cock' while gently stroking him.",
        Gender: "female",
        tags: ["manual", "dirty-talk"]
      },
      {
        text: "Use your tongue to trace circles around the head slowly.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Kiss his balls gently while looking at him.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Whisper one thing you like about his cock while touching it.",
        Gender: "female",
        tags: ["manual", "dirty-talk"]
      },
      {
        text: "Lick from balls to tip, nice and slow, twice.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Hold eye contact for 10 seconds while kissing the head.",
        Gender: "female",
        tags: ["oral"]
      },
      {
        text: "Say 'You taste so good' while licking him.",
        Gender: "female",
        tags: ["oral", "dirty-talk"]
      },
      {
        text: "Tease them with just your lips and tongue for 45 seconds.",
        Gender: "neutral",
        tags: ["oral", "teasing"]
      },
      {
        text: "Whisper 'I want you' while looking into their eyes.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Say 'You look so hot right now' in your sexiest voice.",
        Gender: "neutral",
        tags: ["dirty-talk", "praise"]
      },
      {
        text: "Say 'I'm getting turned on by you.' in a sexy voice.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Kiss his neck and softly say 'I love this'.",
        Gender: "female",
        tags: ["kissing", "dirty-talk"]
      },
      {
        text: "text them one short flirty compliment about their body.",
        Gender: "neutral",
        tags: ["praise"]
      },
      {
        text: "Say 'That feels good' while they kiss you.",
        Gender: "neutral",
        tags: ["dirty-talk", "kissing"]
      },
      {
        text: "Moan his name softly for 5 seconds.",
        Gender: "female",
        tags: ["dirty-talk"]
      },
      {
        text: "Tell them one place you want them to kiss you.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text:
          "Say 'I'm so wet/hard for you' while straddling/being straddled by them.",
        Gender: "neutral",
        tags: ["dirty-talk", "grinding"]
      },
      {
        text: "Give them a flirty wink and say 'Come here'.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Whisper 3 dirty things you want to do to them in their ear.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Send a 15-second voice note moaning their name.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      },
      {
        text: "Grind on his lap fully clothed for 60 seconds, eyes locked.",
        Gender: "female",
        tags: ["grinding"]
      },
      {
        text:
          "Kiss and lick their neck for 45 seconds, hands behind your back.",
        Gender: "neutral",
        tags: ["kissing"]
      },
      {
        text: "Straddle him and give the slowest, hottest kiss for 30 seconds.",
        Gender: "female",
        tags: ["kissing", "grinding"]
      },
      {
        text:
          "Sit on his lap facing away and describe how he feels against you.",
        Gender: "female",
        tags: ["grinding", "dirty-talk"]
      },
      {
        text: "text them exactly what you want to do to them later.",
        Gender: "neutral",
        tags: ["dirty-talk"]
      }
    ]
  },
  foreplay: {
    truths: [
      { text: "How confident do you feel fingering her ass?", Gender: "male" },
      { text: "How much do you enjoy edging her during foreplay?", Gender: "male" },
      { text: "Would you like to pull her hair while going down on her?", Gender: "male" },
      { text: "How hot is it watching her suck a toy while you touch her?", Gender: "male" },
      { text: "Do you prefer praising her or lightly degrading her?", Gender: "male" },
      { text: "How do you feel about lightly choking her?", Gender: "male" },
      { text: "How much do you enjoy spanking her?", Gender: "male" },
      { text: "What turns you on about restraining her during oral?", Gender: "male" },
      { text: "How do you feel controlling when she can cum?", Gender: "male" },
      { text: "How turned on are you by her wearing a butt plug?", Gender: "male" },
      { text: "How does light spanking turn you on?", Gender: "female" },
      { text: "Do you prefer being praised or lightly degraded?", Gender: "female" },
      { text: "How do you feel when he edges you during foreplay?", Gender: "female" },
      { text: "Would you like him to pull your hair while going down on you?", Gender: "female" },
      { text: "How confident do you feel being restrained during oral?", Gender: "female" },
      { text: "What's one roleplay line you'd be okay saying?", Gender: "female" },
      { text: "How hot is it watching yourself get touched in a mirror?", Gender: "neutral" },
      { text: "Do you like when they tell you exactly how good you taste/look?", Gender: "neutral" },
      { text: "How do you feel about being told not to cum yet?", Gender: "female" },
      { text: "What's a fantasy name you'd like to call them/be called?", Gender: "neutral" },
      { text: "What's your favorite way for him to use his fingers?", Gender: "female" },
      { text: "How do you feel about ass play or fingering?", Gender: "female" },
      { text: "Does wearing a butt plug during foreplay sound hot?", Gender: "neutral" },
      { text: "What's better — slow sensual touching or getting messy?", Gender: "neutral" },
      { text: "How do you feel when he combines oral with a finger in your ass?", Gender: "female" },
      { text: "Would you like to suck him or a toy while he fingers you?", Gender: "female" },
      { text: "How turned on are you by feeling full in multiple places?", Gender: "female" },
      { text: "Do you prefer gentle or a little more intense ass stimulation?", Gender: "female" },
      { text: "What's one new foreplay combo with toys you'd like to try?", Gender: "neutral" },
      { text: "How does it feel when he focuses on your clit and ass at the same time?", Gender: "female" },
      { text: "Do you prefer nipples played with gently or a little rough?", Gender: "female" },
      { text: "How do you feel when they lightly pull your hair?", Gender: "neutral" },
      { text: "Would you rather be in control or have them take control right now?", Gender: "neutral" },
      { text: "What's better — slow sensual touching or eager and rough?", Gender: "neutral" },
      { text: "How do you feel when they tell you exactly what feels good?", Gender: "neutral" },
      { text: "What's one new foreplay thing you want to try tonight?", Gender: "neutral" },
      { text: "Do you like temperature play (hot or cold sensations)?", Gender: "neutral" },
      { text: "What's one part of oral you're feeling more confident about?", Gender: "neutral" },
      { text: "How does it feel when they focus completely on you?", Gender: "neutral" },
      { text: "What's one part of eating pussy that you already feel good at?", Gender: "male" },
      { text: "Would you rather focus on her clit, lips, or inside her?", Gender: "male" },
      { text: "How does it feel when she guides your head?", Gender: "male" },
      { text: "What's one new technique you want to try on her tonight?", Gender: "male" },
      { text: "Do you like using your fingers while licking her?", Gender: "male" },
      { text: "How do you feel when she tells you exactly what feels best?", Gender: "male" },
      { text: "What's better — gentle licking or getting really sloppy?", Gender: "neutral" },
      { text: "Do you enjoy when she gets loud while you eat her out?", Gender: "male" },
      { text: "What's one spot on her pussy you like paying extra attention to?", Gender: "male" },
      { text: "How confident do you feel trying new things with your tongue?", Gender: "male" },
      { text: "What's one part of giving head that you already feel good at?", Gender: "female" },
      { text: "Would you rather focus on the head, shaft, or balls right now?", Gender: "female" },
      { text: "How does it feel when he gently guides your head?", Gender: "female" },
      { text: "What's one new technique you want to try tonight?", Gender: "female" },
      { text: "Do you like using your hand together with your mouth?", Gender: "female" },
      { text: "Do you enjoy when he gets vocal while you suck him?", Gender: "female" },
      { text: "What's one spot on his cock that you like paying extra attention to?", Gender: "female" },
      { text: "How confident do you feel trying new things with your mouth?", Gender: "female" },
      { text: "How do you feel when he tells you exactly what he's doing?", Gender: "female" },
      { text: "Do you like hearing him call you 'good girl'?", Gender: "female" },
      { text: "Would you like him to guide your hands during foreplay?", Gender: "female" },
      { text: "What's your favorite way for him to use his fingers?", Gender: "female" },
      { text: "What's the sluttiest thought you've had about him this week?", Gender: "female" },
      { text: "What's a foreplay move that always makes you lose control?", Gender: "female" },
      { text: "If he only had his hands for 10 minutes, what would you beg for?", Gender: "female" }
    ],
    dares: [
      { text: "Tease her ass gently over her panties with a finger.", Gender: "male", tags: ["ass-play", "teasing"] },
      { text: "Suck a dildo while he kisses and teases your body.", Gender: "female", tags: ["oral", "toys", "kissing", "teasing"] },
      { text: "Use a toy on yourself while you make out heavily.", Gender: "female", tags: ["toys", "kissing"] },
      { text: "Kiss and lick just the head / her clit softly for 30 seconds.", Gender: "neutral", tags: ["oral"] },
      { text: "Kiss and lick her pussy softly.", Gender: "male", tags: ["oral"] },
      { text: "Kiss and lick her pussy slowly from bottom to top.", Gender: "male", tags: ["oral"] },
      { text: "Kiss and lick her inner thighs and tease closer with your tongue.", Gender: "male", tags: ["oral", "teasing"] },
      { text: "Look up at her while you lick her slowly.", Gender: "male", tags: ["oral"] },
      { text: "Tell her one thing you love about her taste while licking.", Gender: "male", tags: ["oral", "dirty-talk"] },
      { text: "Lick her with the flat of your tongue for 45 seconds.", Gender: "male", tags: ["oral"] },
      { text: "Hold eye contact while kissing and licking her clit.", Gender: "male", tags: ["oral"] },
      { text: "Say 'You taste so fucking good' while eating her out.", Gender: "male", tags: ["oral", "dirty-talk"] },
      { text: "Tease her pussy with just your lips and tongue for 45 seconds.", Gender: "male", tags: ["oral", "teasing"] },
      { text: "Kiss and lick just the head for 30 seconds like it's your favorite treat.", Gender: "female", tags: ["oral"] },
      { text: "Look up at him while you slowly kiss down the full shaft.", Gender: "female", tags: ["oral"] },
      { text: "Say 'I love your cock' while gently stroking him.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "Use your tongue to trace circles around the head slowly.", Gender: "female", tags: ["oral"] },
      { text: "Kiss his balls gently while looking at him.", Gender: "female", tags: ["oral"] },
      { text: "Whisper one thing you like about his cock while touching it.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "Lick from balls to tip, nice and slow, twice.", Gender: "female", tags: ["oral"] },
      { text: "Hold eye contact for 10 seconds while kissing the head.", Gender: "female", tags: ["oral"] },
      { text: "Say 'You taste so good' while licking him.", Gender: "female", tags: ["oral", "dirty-talk"] },
      { text: "Tease them with just your lips and tongue for 45 seconds.", Gender: "neutral", tags: ["oral", "teasing"] },
      { text: "69 while lightly pulling her hair.", Gender: "male", tags: ["oral"] },
      { text: "Let her suck a dildo while you finger her.", Gender: "male", tags: ["oral", "toys", "manual"] },
      { text: "Spank her 8-10 times while she counts.", Gender: "male", tags: ["spanking"] },
      { text: "Tie her hands and go down on her.", Gender: "male", tags: ["bondage", "oral"] },
      { text: "Edge her with your mouth and fingers for 90 seconds.", Gender: "male", tags: ["oral", "edging", "manual"] },
      { text: "Make her watch herself in the mirror while you touch her.", Gender: "male", tags: ["manual", "mirror"] },
      { text: "Edge each other with hands and mouth for 90 seconds.", Gender: "neutral", tags: ["oral", "manual", "edging"] },
      { text: "Give him a blowjob while watching yourself in a mirror.", Gender: "female", tags: ["oral", "mirror"] },
      { text: "Roleplay as boss/secretary during foreplay.", Gender: "neutral", tags: ["roleplay"] },
      { text: "Praise each other out loud while touching.", Gender: "neutral", tags: ["praise", "manual"] },
      { text: "Give him a blowjob while fucking yourself with a dildo.", Gender: "female", tags: ["oral", "toys"] },
      { text: "Suck a dildo while he fingers your pussy and ass.", Gender: "female", tags: ["oral", "toys", "manual", "ass-play"] },
      { text: "Spit on his cock and give a sloppy handjob + blowjob.", Gender: "female", tags: ["spit-play", "manual", "oral"] },
      { text: "Wear a butt plug while giving him head.", Gender: "female", tags: ["toys", "ass-play", "oral"] },
      { text: "Finger her ass slowly while she strokes you.", Gender: "male", tags: ["ass-play", "manual"] },
      { text: "Finger her / stroke him while keeping eye contact and talking.", Gender: "neutral", tags: ["manual", "dirty-talk"] },
      { text: "69 for 60–90 seconds, nice and slow.", Gender: "neutral", tags: ["oral"] },
      { text: "Let him spank you 8–10 times while you count them.", Gender: "female", tags: ["spanking"] },
      { text: "Ride his fingers while describing how it feels.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "Use your mouth on them while they use their fingers/hand on you.", Gender: "neutral", tags: ["oral", "manual"] },
      { text: "Alternate between slow and fast oral for one minute.", Gender: "neutral", tags: ["oral", "edging"] },
      { text: "Stay still while the other teases you — no moving your hands.", Gender: "neutral", tags: ["teasing", "edging"] },
      { text: "Guide each other's hands exactly where you want them.", Gender: "neutral", tags: ["manual"] },
      { text: "Suck gently on her clit while using a finger inside her.", Gender: "male", tags: ["oral", "manual"] },
      { text: "Take her clit in your mouth and hold suction for 10 seconds.", Gender: "male", tags: ["oral"] },
      { text: "Use the tip of your tongue to flick her clit rapidly.", Gender: "male", tags: ["oral"] },
      { text: "Alternate between slow licking and fast clit circles.", Gender: "male", tags: ["oral", "edging"] },
      { text: "Lick and suck her labia while fingering her.", Gender: "male", tags: ["oral", "manual"] },
      { text: "Make eye contact with her while licking her clit.", Gender: "male", tags: ["oral"] },
      { text: "Hum or moan with your mouth on her so she feels the vibration.", Gender: "male", tags: ["oral"] },
      { text: "Mix kissing, licking, and sucking all over her pussy.", Gender: "male", tags: ["oral"] },
      { text: "Let her guide your head to where she wants your tongue.", Gender: "male", tags: ["oral"] },
      { text: "Suck just the head with good suction while stroking the shaft.", Gender: "female", tags: ["oral", "manual"] },
      { text: "Take him as deep as comfortable, hold for 5 seconds, then pull back slowly.", Gender: "female", tags: ["oral"] },
      { text: "Use your tongue to flick the underside of the head for 45 seconds.", Gender: "female", tags: ["oral"] },
      { text: "Alternate between slow bobbing and fast shallow sucks for 60 seconds.", Gender: "female", tags: ["oral", "edging"] },
      { text: "Lick and suck his balls gently while stroking him.", Gender: "female", tags: ["oral", "manual"] },
      { text: "Make eye contact for 15 seconds while bobbing on him.", Gender: "female", tags: ["oral"] },
      { text: "Try humming/moaning with him in your mouth so he feels the vibration.", Gender: "female", tags: ["oral"] },
      { text: "Mix kissing, licking, and sucking all over for one minute.", Gender: "female", tags: ["oral"] },
      { text: "Guide his hand to your head if you want him to lead for 30 seconds.", Gender: "female", tags: ["oral"] },
      { text: "Guide his hand where you want it and say 'Right there'.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "While he touches you, say 'That feels so good'.", Gender: "female", tags: ["dirty-talk"] },
      { text: "Finish this: 'I love when you touch my...'", Gender: "female", tags: ["dirty-talk"] },
      { text: "Say 'Don't stop' every time something feels really good.", Gender: "female", tags: ["dirty-talk"] },
      { text: "Finish this: 'Your fingers/tongue feel so...'", Gender: "female", tags: ["dirty-talk"] },
      { text: "Look at him and say 'I want your mouth here'.", Gender: "female", tags: ["dirty-talk"] },
      { text: "React out loud with moans or words when it feels intense.", Gender: "female", tags: ["dirty-talk"] },
      { text: "Finish this: 'I'm getting so turned on because...'", Gender: "neutral", tags: ["dirty-talk"] },
      { text: "Say 'Please keep going' while riding his fingers.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "Touch yourself while he watches and tell you exactly how.", Gender: "female", tags: ["manual", "dirty-talk"] },
      { text: "Give them oral for 2 minutes — no hands allowed.", Gender: "neutral", tags: ["oral"] },
      { text: "69 for 90 seconds but don't cum.", Gender: "neutral", tags: ["oral", "edging"] }
    ]
  },
  dirty: {
    truths: [
      { text: "How hot is it for you to fill her with toys + your cock?", Gender: "male" },
      { text: "How much do you enjoy pulling her hair while fucking?", Gender: "male" },
      { text: "How turned on are you by heavy choking during sex?", Gender: "neutral" },
      { text: "How do you feel about spanking her while inside her?", Gender: "male" },
      { text: "How much do you like controlling her orgasms?", Gender: "male" },
      { text: "Would you rather dominate or be dominated?", Gender: "neutral" },
      { text: "How hot is fucking her in front of a mirror?", Gender: "male" },
      { text: "How much do you enjoy using multiple holes at once?", Gender: "neutral" },
      { text: "What's the hottest roleplay scenario you want to do?", Gender: "neutral" },
      { text: "How turned on are you by making things really sloppy?", Gender: "neutral" },
      { text: "How hot is it when he calls you his little slut?", Gender: "female" },
      { text: "How turned on are you by being fully restrained?", Gender: "neutral" },
      { text: "Do you like being spanked while he's inside you?", Gender: "female" },
      { text: "How does it feel when he controls when you cum?", Gender: "female" },
      { text: "What's one degrading or praising phrase that turns you on?", Gender: "female" },
      { text: "What's your favorite sex position and why?", Gender: "neutral" },
      { text: "Does being filled in multiple holes turn you on?", Gender: "female" },
      { text: "How do you feel about combining him + toys at the same time?", Gender: "female" },
      { text: "Would you like a plug in your ass while he fucks your pussy?", Gender: "female" },
      { text: "How turned on are you by sucking one thing while getting fucked?", Gender: "female" },
      { text: "What's the hottest way to use our dildos together?", Gender: "female" },
      { text: "How does it feel when I pull your hair and go harder?", Gender: "neutral" },
      { text: "Do you like when we get messy with spit during sex?", Gender: "neutral" },
      { text: "How intense does it feel when multiple holes are stimulated?", Gender: "female" },
      { text: "Do you like being fucked/fucking deep and rough?", Gender: "neutral" },
      { text: "What's a kink or position you've thought about but never tried?", Gender: "neutral" },
      { text: "How hot is it when he talks dirty while inside you?", Gender: "female" },
      { text: "Where do you like him to cum most?", Gender: "female" },
      { text: "What's the hottest thing we've ever done together?", Gender: "neutral" },
      { text: "How do you feel right before and during orgasm?", Gender: "neutral" },
      { text: "What's one cunnilingus technique you want to get really good at?", Gender: "male" },
      { text: "How hot is it when she loses control because of your tongue?", Gender: "male" },
      { text: "Do you like talking dirty while your face is buried in her pussy?", Gender: "male" },
      { text: "How does it feel when she cums on your tongue or face?", Gender: "male" },
      { text: "Would you rather make her cum with your mouth, fingers, or both?", Gender: "male" },
      { text: "What's one way you want her to praise you after eating her out?", Gender: "male" },
      { text: "How turned on are you when she can't stay quiet?", Gender: "male" },
      { text: "What's a fantasy involving your mouth between her legs?", Gender: "male" },
      { text: "Do you like telling her how good she tastes in the moment?", Gender: "male" },
      { text: "What's one blowjob technique you want to get really good at?", Gender: "female" },
      { text: "How hot is it when he loses control because of your mouth?", Gender: "female" },
      { text: "Do you like to talk dirty while you're sucking him?", Gender: "female" },
      { text: "What's the sluttiest thought you've had while giving head?", Gender: "female" },
      { text: "How does it feel when he cums in your mouth or on you?", Gender: "female" },
      { text: "Would you rather finish him with your mouth, hand, or both?", Gender: "female" },
      { text: "What's one way you want him to praise you after a blowjob?", Gender: "female" },
      { text: "How turned on are you when he can't stay quiet?", Gender: "female" },
      { text: "What's a fantasy involving your mouth that you haven't told him?", Gender: "female" },
      { text: "Do you like when he tells you how good you're doing in the moment?", Gender: "female" },
      { text: "What's one dirty thing you've wanted to say but felt shy?", Gender: "female" },
      { text: "How hot does it get when he talks while inside you?", Gender: "female" },
      { text: "Do you like hearing exactly how good you feel?", Gender: "neutral" },
      { text: "What's a position where you feel most confident?", Gender: "neutral" },
      { text: "How do you feel when they take control and talk dirty?", Gender: "neutral" },
      { text: "What's something we've done that you want more of?", Gender: "neutral" },
      { text: "Do you like being told you're tight/wet/good?", Gender: "female" },
      { text: "What's one naughty thought you've had during sex?", Gender: "female" },
      { text: "What's a sexy thing you'd like to try next time?", Gender: "neutral" },
      { text: "What's the dirtiest fantasy you've had about them?", Gender: "neutral" },
      { text: "Sweet, filthy, or degrading — how do you like them to talk during sex?", Gender: "neutral" },
      { text: "What's a kink you've been nervous to ask for?", Gender: "neutral" },
      { text: "If we filmed ourselves fucking, what would turn you on most later?", Gender: "neutral" }
    ],
    dares: [
      { text: "Spit on her body and rub it in slowly.", Gender: "male", tags: ["spit-play"] },
      { text: "Watch her touch herself in front of a mirror.", Gender: "male", tags: ["manual", "mirror"] },
      { text: "Spit on their cock/pussy and rub it in slowly.", Gender: "neutral", tags: ["spit-play"] },
      { text: "Kiss with lots of spit for 30 seconds.", Gender: "neutral", tags: ["kissing", "spit-play"] },
      { text: "Spit between her tits and slide your cock there slowly.", Gender: "male", tags: ["spit-play"] },
      { text: "Let him spit on your pussy then tease with his fingers.", Gender: "female", tags: ["spit-play", "manual", "teasing"] },
      { text: "Insert a small butt plug in her together and just tease.", Gender: "female", tags: ["toys", "ass-play", "teasing"] },
      { text: "Finger her ass gently while licking her clit.", Gender: "male", tags: ["oral", "ass-play"] },
      { text: "Put a butt plug in her then eat her out.", Gender: "male", tags: ["toys", "ass-play", "oral"] },
      { text: "Lightly hold her throat while fingering her.", Gender: "male", tags: ["manual"] },
      { text: "Praise or lightly degrade her while teasing.", Gender: "male", tags: ["dirty-talk", "praise", "teasing"] },
      { text: "Fuck her while she sucks a dildo.", Gender: "male", tags: ["penetration", "oral", "toys"] },
      { text: "Pull her hair while fucking her from behind.", Gender: "male", tags: ["penetration"] },
      { text: "Spank her ass while pounding her.", Gender: "male", tags: ["penetration", "spanking"] },
      { text: "Fuck her with a butt plug already in her.", Gender: "male", tags: ["penetration", "toys", "ass-play"] },
      { text: "Roughly choke her while fucking (very hard).", Gender: "male", tags: ["penetration", "bondage"] },
      { text: "Fuck her in front of a mirror while she watches.", Gender: "male", tags: ["penetration", "mirror"] },
      { text: "Use a dildo in one of her holes while you fuck another.", Gender: "male", tags: ["penetration", "toys", "ass-play"] },
      { text: "Edge her right to the edge then let her cum.", Gender: "male", tags: ["penetration", "edging"] },
      { text: "Roleplay a full dirty scenario while fucking.", Gender: "neutral", tags: ["penetration", "roleplay"] },
      { text: "Fuck in front of a mirror while describing what you see.", Gender: "female", tags: ["penetration", "mirror", "dirty-talk"] },
      { text: "Beg to cum using dirty praise or degradation.", Gender: "female", tags: ["dirty-talk", "degradation", "edging"] },
      { text: "Let him restrain you and use you however he wants for 2 minutes.", Gender: "female", tags: ["bondage", "penetration"] },
      { text: "Switch between slow praise and filthy talk while fucking.", Gender: "neutral", tags: ["penetration", "dirty-talk", "praise"] },
      { text: "Fuck in your favorite position with lots of spit.", Gender: "neutral", tags: ["penetration", "spit-play"] },
      { text: "Suck him while riding a dildo.", Gender: "female", tags: ["oral", "toys", "penetration"] },
      { text: "Insert butt plug then let him fuck your pussy.", Gender: "female", tags: ["toys", "ass-play", "penetration"] },
      { text: "Suck a dildo while he fucks you from behind.", Gender: "female", tags: ["penetration", "oral", "toys"] },
      { text: "Suck him + dildo in pussy + plug in ass.", Gender: "female", tags: ["oral", "toys", "penetration", "ass-play"] },
      { text: "Stroke one toy, suck him, and ride another.", Gender: "female", tags: ["oral", "toys", "penetration", "manual"] },
      { text: "Use a dildo in her ass while you fuck her pussy (or vice versa).", Gender: "male", tags: ["penetration", "toys", "ass-play"] },
      { text: "Switch between him and toys in different holes for 3 minutes.", Gender: "female", tags: ["penetration", "toys", "ass-play"] },
      { text: "Ride him reverse cowgirl while watching in a mirror.", Gender: "female", tags: ["penetration", "mirror"] },
      { text: "Switch positions every 30 seconds for 3 minutes.", Gender: "neutral", tags: ["penetration"] },
      { text: "Let her ride your face / let him fuck your mouth while they control pace.", Gender: "neutral", tags: ["oral"] },
      { text: "Focus hard on her clit with strong suction and tongue flicks.", Gender: "male", tags: ["oral"] },
      { text: "Try burying your tongue as deep as possible inside her.", Gender: "male", tags: ["oral"] },
      { text: "Edge her with your mouth — bring her close then slow down.", Gender: "male", tags: ["oral", "edging"] },
      { text: "Eat her out aggressively while she's close to cumming.", Gender: "male", tags: ["oral", "edging"] },
      { text: "Suck her clit while saying 'I love eating your pussy'.", Gender: "male", tags: ["oral", "dirty-talk"] },
      { text: "Let her grind on your face while you lick her.", Gender: "male", tags: ["oral", "grinding"] },
      { text: "Mix fast tongue flicks, slow licks, and deep sucking.", Gender: "neutral", tags: ["oral"] },
      { text: "Make her cum with your mouth while keeping eye contact.", Gender: "male", tags: ["oral"] },
      { text: "Describe how good she tastes while licking her.", Gender: "male", tags: ["oral", "dirty-talk"] },
      { text: "Beg her to cum on your tongue using dirty words.", Gender: "male", tags: ["oral", "dirty-talk"] },
      { text: "Use hand + mouth in rhythm (twist your hand as you go up).", Gender: "female", tags: ["oral", "manual"] },
      { text: "Focus hard on the head with strong suction and tongue flicks for 60s.", Gender: "female", tags: ["oral"] },
      { text: "Try taking me deeper than usual and tell him how it felt.", Gender: "female", tags: ["oral", "dirty-talk"] },
      { text: "Edge him with your mouth — bring him close then slow way down.", Gender: "female", tags: ["oral", "edging"] },
      { text: "Suck him while saying 'I love sucking your dick'.", Gender: "female", tags: ["oral", "dirty-talk"] },
      { text: "Let him gently fuck your mouth for 30–45 seconds.", Gender: "female", tags: ["oral"] },
      { text: "Mix fast bobbing, slow licking, and deep sucks for one minute.", Gender: "female", tags: ["oral"] },
      { text: "Describe how his dick feels in your mouth while you suck him.", Gender: "female", tags: ["oral", "dirty-talk"] },
      { text: "Beg for his cum using one dirty sentence right before he finishes.", Gender: "female", tags: ["oral", "dirty-talk"] },
      { text: "While riding him, say 'You feel so deep'.", Gender: "female", tags: ["penetration", "dirty-talk"] },
      { text: "Finish this: 'Fuck me...' while he's inside you.", Gender: "female", tags: ["penetration", "dirty-talk"] },
      { text: "Say 'I'm your good girl' while looking at him.", Gender: "female", tags: ["dirty-talk", "praise"] },
      { text: "Describe in one sentence how their dick/pussy feels.", Gender: "neutral", tags: ["penetration", "dirty-talk"] },
      { text: "Say 'Harder' or 'Deeper' when you want more.", Gender: "neutral", tags: ["penetration", "dirty-talk"] },
      { text: "Finish this: 'I love your cock/pussy because...'", Gender: "neutral", tags: ["dirty-talk", "praise"] },
      { text: "Say 'Fill me up' or 'Cum on me' when you're close.", Gender: "female", tags: ["penetration", "dirty-talk"] },
      { text: "Beg for what you want in one short dirty sentence.", Gender: "female", tags: ["dirty-talk"] },
      { text: "Fuck him in your favorite position for 2 minutes while describing it.", Gender: "female", tags: ["penetration", "dirty-talk"] },
      { text: "Ride him reverse cowgirl while you watch in a mirror.", Gender: "female", tags: ["penetration", "mirror"] },
      { text: "Let him fuck your mouth while holding your head.", Gender: "female", tags: ["oral", "bondage"] },
      { text: "Let him use a toy on you until you cum, eyes on him.", Gender: "female", tags: ["toys", "manual"] },
      { text: "Switch positions every 30 seconds for 3 minutes straight.", Gender: "neutral", tags: ["penetration"] },
      { text: "Record 30 seconds of you riding him while describing how deep he is.", Gender: "female", tags: ["penetration", "dirty-talk"] }
    ]
  }
};

function showStatus(message) {
  const status = document.getElementById("statusMessage");
  if (!status) return;
  status.innerText = message;
  status.style.opacity = "1";
  setTimeout(() => { status.style.opacity = "0"; }, 2000);
}

// ---- Truth or Dare / Spin the Wheel tier control: per-user "dial" + ----
// ---- effective heat ----
// Each player has their own current tier ("dial"). The session's
// effective (played) heat is min(my dial, partner's dial) when synced —
// see getEffectiveHeatTier() — or just my own dial when solo/unlinked,
// where there's no second dial to min against (byte-identical to this
// app's pre-existing solo behavior, which never restricted tier at all).
// Manual mode edits your dial directly via a dropdown (selectTier below);
// adaptive mode's heat display only shows it (see ADAPTIVE HEAT DISPLAY
// further down) and moves it via the heat-up/cool-down actions.
//
// Truth or Dare and Spin the Wheel each render their own instance of this
// control — one page-name -> DOM-id lookup drives both, so the
// interactive logic (open/close, keyboard nav, refresh) lives in exactly
// one place instead of being duplicated per page. Truth's ids predate
// this generalization and don't all follow the "Wheel" suffix convention
// (its adaptive display container has no suffix at all) — kept as-is
// rather than touching already-working markup.
var myTierDial = "tease";
var partnerTierDial = "tease";

var TIER_CONTROL_PAGES = ["Truth", "Wheel"];
var TIER_CONTROL_IDS = {
  Truth: {
    dropdown: "truthTierDropdown", trigger: "truthTierTrigger", triggerContent: "truthTierTriggerContent",
    listbox: "truthTierListbox", optPrefix: "truthTierOpt-",
    adaptiveDisplay: "adaptiveHeatDisplay", adaptiveTrigger: "adaptiveHeatTrigger",
    adaptiveTriggerContent: "adaptiveHeatTriggerContent", adaptivePanel: "adaptiveHeatPanel",
    upBtn: "turnUpHeatBtnTruth", coolBtn: "coolItDownBtnTruth", readout: "truthTierReadout"
  },
  Wheel: {
    dropdown: "wheelTierDropdown", trigger: "wheelTierTrigger", triggerContent: "wheelTierTriggerContent",
    listbox: "wheelTierListbox", optPrefix: "wheelTierOpt-",
    adaptiveDisplay: "adaptiveHeatDisplayWheel", adaptiveTrigger: "adaptiveHeatTriggerWheel",
    adaptiveTriggerContent: "adaptiveHeatTriggerContentWheel", adaptivePanel: "adaptiveHeatPanelWheel",
    upBtn: "turnUpHeatBtnWheel", coolBtn: "coolItDownBtnWheel", readout: "wheelTierReadout"
  }
};
var tierDropdownOpen = { Truth: false, Wheel: false };
var adaptiveHeatPanelOpenState = { Truth: false, Wheel: false };

// Per-user heat mode ('manual' | 'adaptive') — see Backend.setHeatMode /
// profiles.heat_mode. Seeded from localStorage (set by the onboarding
// heat-mode step or the Account toggle) for the logged-out/local case;
// overwritten from the server in handleGameBackendChange once logged in.
// Defaults to 'manual' for a returning pre-feature user who never saw
// the onboarding step, matching pre-feature behavior (see Part A).
var myHeatMode = localStorage.getItem("heatMode") || "manual";
var partnerHeatMode = "manual";

function truthTierLabel(tier) {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

// The tier every draw, for either performer, actually comes from — see
// getHeatCeilingForPool() and every draw call site.
function getEffectiveHeatTier() {
  if (!isSyncActive()) return myTierDial;
  var myIdx = TIER_ORDER.indexOf(myTierDial);
  var partnerIdx = TIER_ORDER.indexOf(partnerTierDial);
  if (myIdx === -1) myIdx = 0;
  if (partnerIdx === -1) partnerIdx = 0;
  return TIER_ORDER[Math.min(myIdx, partnerIdx)];
}

function updateTierTrigger(page) {
  var content = document.getElementById(TIER_CONTROL_IDS[page].triggerContent);
  if (!content) return;
  content.innerHTML = appIcon(myTierDial, "tier-select-icon-img", "", true) + truthTierLabel(myTierDial);
}

// Local-only UI refresh — does not itself move the dial or send an
// event (see setMyTierDial for the one path that does).
function refreshTruthTierDropdownSelection() {
  TIER_CONTROL_PAGES.forEach(function (page) {
    var ids = TIER_CONTROL_IDS[page];
    TIER_ORDER.forEach(function (t) {
      var opt = document.getElementById(ids.optPrefix + t);
      if (!opt) return;
      opt.setAttribute("aria-selected", String(t === myTierDial));
      opt.classList.toggle("tier-dropdown-option-selected", t === myTierDial);
    });
    updateTierTrigger(page);
  });
}

// Manual mode only: freely set your own dial to any tier, any direction,
// anytime — no gating, no partner consent needed. Raising unilaterally is
// inert until your partner's dial also reaches that tier (see the "min"
// rule in getEffectiveHeatTier); lowering is immediate and unilateral.
function selectTier(page, tier) {
  if (TIER_ORDER.indexOf(tier) === -1 || tier === myTierDial) { closeTierDropdown(page); return; }
  setMyTierDial(tier, "manual_pick");
  closeTierDropdown(page);
}
window.selectTruthTier = function (tier) { selectTier("Truth", tier); };
window.selectWheelTier = function (tier) { selectTier("Wheel", tier); };

// The one place that actually moves MY dial — used by the manual
// dropdowns above and by the adaptive "Cool it down" action. Persisted as
// a direct game_event (not the propose/respond RPC — nothing to agree
// on for your own dial) so it survives reconnect and reaches the
// partner's device. Plays the heat-rise ceremony only when this actually
// raises the EFFECTIVE (played) heat — not on every personal dial nudge,
// so a raise that changes nothing (partner hasn't caught up) stays quiet.
// Applies myTierDial locally (dropdown/display UI + ceremony-if-warranted)
// without sending a new event — used by respondToProgressionPrompt below,
// where the server has already persisted the change via respond_progression
// (and the realtime echo of that insert is filtered out as "my own event"
// by handleGameEvent, so nothing else will apply it locally). setMyTierDial
// is the direct/manual-pick path, which does need to send its own event.
function applyMyTierDialLocally(tier) {
  var before = getEffectiveHeatTier();
  myTierDial = tier;
  refreshTruthTierDropdownSelection();
  if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
  if (typeof refreshTierReadout === "function") refreshTierReadout();
  if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
  var after = getEffectiveHeatTier();
  if (TIER_ORDER.indexOf(after) > TIER_ORDER.indexOf(before) && typeof playHeatRiseCeremony === "function") {
    playHeatRiseCeremony(after);
  }
}

function setMyTierDial(tier, via) {
  applyMyTierDialLocally(tier);
  if (isSyncActive() && window.GameSync) {
    window.GameSync.send("heat_changed", { tier: tier, via: via || "manual_pick" });
  }
}

function openTierDropdown(page) {
  var ids = TIER_CONTROL_IDS[page];
  var panel = document.getElementById(ids.listbox);
  var trigger = document.getElementById(ids.trigger);
  if (!panel || !trigger || tierDropdownOpen[page]) return;
  tierDropdownOpen[page] = true;
  panel.classList.remove("hidden");
  trigger.setAttribute("aria-expanded", "true");
  var current = document.getElementById(ids.optPrefix + myTierDial);
  if (current) current.focus();
}

// returnFocus defaults to true (Escape, selection); an outside tap
// passes false so focus goes wherever the user actually tapped instead
// of being yanked back to the trigger.
function closeTierDropdown(page, returnFocus) {
  var ids = TIER_CONTROL_IDS[page];
  var panel = document.getElementById(ids.listbox);
  var trigger = document.getElementById(ids.trigger);
  if (!panel || !trigger || !tierDropdownOpen[page]) return;
  tierDropdownOpen[page] = false;
  panel.classList.add("hidden");
  trigger.setAttribute("aria-expanded", "false");
  if (returnFocus !== false) trigger.focus();
}

function toggleTierDropdown(page) {
  if (tierDropdownOpen[page]) closeTierDropdown(page);
  else openTierDropdown(page);
}
window.toggleTruthTierDropdown = function () { toggleTierDropdown("Truth"); };
window.toggleWheelTierDropdown = function () { toggleTierDropdown("Wheel"); };

// Adaptive mode's one direct dial action (see the expand panel in
// ADAPTIVE HEAT DISPLAY) — immediately lowers MY OWN dial by one tier.
// No consent needed: lowering is always unilateral and immediate (unlike
// raising, which goes through the mutual heat-up proposal). A no-op at
// the coolest tier already.
window.coolItDown = function () {
  var idx = TIER_ORDER.indexOf(myTierDial);
  if (idx <= 0) return;
  setMyTierDial(TIER_ORDER[idx - 1], "cool_down");
  showStatus("Cooling to " + truthTierLabel(TIER_ORDER[idx - 1]));
};

function handleTierTriggerKeydown(page, e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!tierDropdownOpen[page]) openTierDropdown(page);
  }
}
window.handleTruthTierTriggerKeydown = function (e) { handleTierTriggerKeydown("Truth", e); };
window.handleWheelTierTriggerKeydown = function (e) { handleTierTriggerKeydown("Wheel", e); };

function handleTierListboxKeydown(page, e) {
  var ids = TIER_CONTROL_IDS[page];
  var options = TIER_ORDER.map(function (t) { return document.getElementById(ids.optPrefix + t); }).filter(Boolean);
  var idx = options.indexOf(document.activeElement);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    var next = options[idx === -1 ? 0 : Math.min(idx + 1, options.length - 1)];
    if (next) next.focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    var prev = options[idx === -1 ? 0 : Math.max(idx - 1, 0)];
    if (prev) prev.focus();
  } else if (e.key === "Home") {
    e.preventDefault();
    if (options[0]) options[0].focus();
  } else if (e.key === "End") {
    e.preventDefault();
    if (options[options.length - 1]) options[options.length - 1].focus();
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    var focused = document.activeElement;
    if (focused && focused.dataset && focused.dataset.tier) selectTier(page, focused.dataset.tier);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeTierDropdown(page);
  } else if (e.key === "Tab") {
    closeTierDropdown(page, false);
  }
}
window.handleTruthTierListboxKeydown = function (e) { handleTierListboxKeydown("Truth", e); };
window.handleWheelTierListboxKeydown = function (e) { handleTierListboxKeydown("Wheel", e); };

// ---- ADAPTIVE HEAT DISPLAY ----
// Adaptive mode's tier control: a read-only status display (never a
// picker — see refreshTruthTierModeUI, which shows this instead of the
// dropdown when myHeatMode is 'adaptive') that expands to a small panel
// showing the tease/foreplay/dirty arc, the "Turn up the heat?"
// escalation action, and the "Cool it down" de-escalation action.
function refreshTruthTierModeUI() {
  TIER_CONTROL_PAGES.forEach(function (page) {
    var ids = TIER_CONTROL_IDS[page];
    var dropdown = document.getElementById(ids.dropdown);
    var display = document.getElementById(ids.adaptiveDisplay);
    if (!dropdown || !display) return;
    // Adaptive mode has no experience to offer without a partner — the
    // engine, heat-up proposals, and ceremony are all synced-only — so
    // solo/unlinked users always get the free-pick dropdown regardless of
    // their chosen heat mode, matching this app's existing principle that
    // solo play stays exactly as free as it was before this feature.
    var adaptive = myHeatMode === "adaptive" && isSyncActive();
    dropdown.classList.toggle("hidden", adaptive);
    display.classList.toggle("hidden", !adaptive);
  });
  refreshAdaptiveHeatDisplay();
}

// Updates each page's trigger icon+label, the arc's dimmed/current steps,
// and the two action buttons — called whenever myTierDial, the effective
// heat, or the open-proposal state changes.
function refreshAdaptiveHeatDisplay() {
  var myIdx = TIER_ORDER.indexOf(myTierDial);
  TIER_CONTROL_PAGES.forEach(function (page) {
    var ids = TIER_CONTROL_IDS[page];
    var content = document.getElementById(ids.adaptiveTriggerContent);
    if (content) content.innerHTML = appIcon(myTierDial, "tier-select-icon-img", "", true) + truthTierLabel(myTierDial);

    var panelEl = document.getElementById(ids.adaptivePanel);
    if (panelEl) {
      TIER_ORDER.forEach(function (t, idx) {
        var step = panelEl.querySelector('.adaptive-heat-arc-step[data-tier="' + t + '"]');
        if (!step) return;
        step.classList.toggle("adaptive-heat-arc-step-locked", idx > myIdx);
        step.classList.toggle("adaptive-heat-arc-step-current", idx === myIdx);
      });
    }

    var upBtn = document.getElementById(ids.upBtn);
    if (upBtn) {
      var ceilingIdx = TIER_ORDER.indexOf(getEffectiveHeatTier());
      var atMax = ceilingIdx === -1 || ceilingIdx >= TIER_ORDER.length - 1;
      var hasOpenHeatProposal = (coupleProgression.openProposals || []).some(function (p) { return p.kind === "heat"; });
      if (!isSyncActive() || myHeatMode !== "adaptive" || atMax) {
        upBtn.classList.add("hidden");
      } else {
        upBtn.classList.remove("hidden");
        upBtn.disabled = hasOpenHeatProposal;
        upBtn.innerHTML = hasOpenHeatProposal
          ? "Asked 💌"
          : appIcon("turnUpHeat", "heat-btn-icon", "", true) + "Turn up the heat?";
      }
    }

    var coolBtn = document.getElementById(ids.coolBtn);
    if (coolBtn) {
      coolBtn.classList.toggle("hidden", !isSyncActive() || myHeatMode !== "adaptive" || myIdx <= 0);
    }
  });
}

function openAdaptiveHeatPanel(page) {
  var ids = TIER_CONTROL_IDS[page];
  var panel = document.getElementById(ids.adaptivePanel);
  var trigger = document.getElementById(ids.adaptiveTrigger);
  if (!panel || !trigger || adaptiveHeatPanelOpenState[page]) return;
  adaptiveHeatPanelOpenState[page] = true;
  panel.classList.remove("hidden");
  trigger.setAttribute("aria-expanded", "true");
}

function closeAdaptiveHeatPanel(page, returnFocus) {
  var ids = TIER_CONTROL_IDS[page];
  var panel = document.getElementById(ids.adaptivePanel);
  var trigger = document.getElementById(ids.adaptiveTrigger);
  if (!panel || !trigger || !adaptiveHeatPanelOpenState[page]) return;
  adaptiveHeatPanelOpenState[page] = false;
  panel.classList.add("hidden");
  trigger.setAttribute("aria-expanded", "false");
  if (returnFocus !== false) trigger.focus();
}

// Named ...ForPage (not toggleAdaptiveHeatPanel) so it can't collide with
// window.toggleAdaptiveHeatPanel below — a top-level function declaration
// and a same-named window.* assignment share one binding, so a same-named
// core function here would silently turn into infinite self-recursion
// the moment the window.* alias below reassigns it.
function toggleAdaptiveHeatPanelForPage(page) {
  if (adaptiveHeatPanelOpenState[page]) closeAdaptiveHeatPanel(page);
  else openAdaptiveHeatPanel(page);
}
window.toggleAdaptiveHeatPanelTruth = function () { toggleAdaptiveHeatPanelForPage("Truth"); };
window.toggleAdaptiveHeatPanelWheel = function () { toggleAdaptiveHeatPanelForPage("Wheel"); };
// Pre-existing onclick markup on the Truth page calls this bare name.
window.toggleAdaptiveHeatPanel = window.toggleAdaptiveHeatPanelTruth;

// The "You: X · Partner: Y · Playing at: Z" readout shown under both
// pages' tier controls — synced only, so a raised dial that changes
// nothing (partner hasn't caught up) reads as by-design rather than
// broken.
function refreshTierReadout() {
  TIER_CONTROL_PAGES.forEach(function (page) {
    var el = document.getElementById(TIER_CONTROL_IDS[page].readout);
    if (!el) return;
    if (!isSyncActive()) { el.classList.add("hidden"); return; }
    el.classList.remove("hidden");
    var myName = gameSyncMyName || "You";
    var partnerName = gameSyncPartnerName || "Partner";
    el.innerHTML =
      "<span>" + escapeHtml(myName) + ": " + truthTierLabel(myTierDial) + "</span>" +
      '<span class="tier-readout-sep">&middot;</span>' +
      "<span>" + escapeHtml(partnerName) + ": " + truthTierLabel(partnerTierDial) + "</span>" +
      '<span class="tier-readout-sep">&middot;</span>' +
      '<span class="tier-readout-effective">Playing at: ' + truthTierLabel(getEffectiveHeatTier()) + "</span>";
  });
}

window.toggleMenu = function () {
  const menu = document.getElementById("menu");
  if (!menu) { console.log("Menu not found"); return; }
  if (menu.classList.contains("menu-open")) {
    menu.classList.remove("menu-open");
  } else {
    menu.classList.add("menu-open");
    markMenuDiscovered();
  }
};

// First-run discovery cue on the hamburger icon — permanently cleared
// the first time the user opens the menu.
function markMenuDiscovered() {
  if (localStorage.getItem("menuOpened") === "true") return;
  localStorage.setItem("menuOpened", "true");
  var btn = document.querySelector(".menu-btn");
  if (btn) btn.classList.remove("menu-discovery");
}

function showPage(pageId) {
  let sections = document.getElementsByClassName("section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  document.getElementById(pageId).classList.add("active");
  document.getElementById("menu").classList.remove("menu-open");
}

function getCardText(card) {
  if (typeof card === "string") return card;
  return card.text || card.Text || "";
}

function getCardGender(card) {
  if (typeof card === "string") return "neutral";
  let rawGender = card.gender || card.Gender || "neutral";
  if (Array.isArray(rawGender)) {
    return rawGender.map(g => String(g).toLowerCase());
  }
  return [String(rawGender).toLowerCase()];
}

// Gender filtering moved into pool.js (window.Pool.getPlayablePool) —
// see filterByGender there.

function animateCardText(randomText) {
  let text = document.getElementById("todResult");
  text.classList.remove("fade-in");
  void text.offsetWidth;
  text.innerText = randomText;
  text.classList.add("fade-in");
}

// ========================= //
// GL HELPERS (shared)       //
// ========================= //
// Shared by both the draw-time reveal and the resolution burn-away — a
// trivial fullscreen-quad vertex shader and generic WebGL program
// setup. Each effect keeps its own probed/failed/canvas state so a
// failure in one doesn't retroactively disable the other.

function compileShader(gl, type, src) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    var log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error("Shader compile failed: " + log);
  }
  return s;
}

// A small pre-baked noise texture, sampled from the fragment shader instead
// of computing a sin()-based hash per-pixel. Mobile GPUs commonly run
// fragment shaders at mediump precision, and the classic
// fract(sin(dot(p, big constants)) * bigConstant) hash relies on sin()
// staying chaotic for large arguments — under mediump this collapses into
// smooth, banded, or near-constant output (a well-documented WebGL/mobile
// GLSL gotcha), which is exactly what turns an intended jagged burn edge
// into a smooth circle. Texture sampling doesn't have that failure mode:
// it's a hardware-interpolated memory read, not an arithmetic computation
// sensitive to float precision, so it stays organic on mediump-only GPUs.
var NOISE_TEX_SIZE = 64;
var noiseTexData = null;
function getNoiseTextureData() {
  if (noiseTexData) return noiseTexData;
  var size = NOISE_TEX_SIZE;
  var data = new Uint8Array(size * size);
  // Simple seeded PRNG (mulberry32) so the noise pattern is stable across
  // reloads within a session and reproducible for debugging.
  var seed = 1337;
  function rand() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (var i = 0; i < data.length; i++) data[i] = Math.floor(rand() * 256);
  noiseTexData = data;
  return data;
}

function createNoiseTexture(gl) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, NOISE_TEX_SIZE, NOISE_TEX_SIZE, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, getNoiseTextureData());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // No mipmaps generated, so MIN_FILTER must be a non-mipmap mode or the
  // texture is "incomplete" (samples as black) per the WebGL1 spec.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

// Device-level (not shader-specific) capability query: if HIGH_FLOAT has
// nonzero precision for the fragment shader stage, GL_FRAGMENT_PRECISION_HIGH
// is defined by the driver during compilation, so a shader guarded with
// #ifdef GL_FRAGMENT_PRECISION_HIGH will actually get highp. This lets us
// know — and report in the debug badge — which branch a given shader took
// without needing anything special from the shader itself.
function getFragmentPrecisionInfo(gl) {
  function fmt(fmtInfo) {
    if (!fmtInfo) return null;
    return { rangeMin: fmtInfo.rangeMin, rangeMax: fmtInfo.rangeMax, precision: fmtInfo.precision };
  }
  var high = null, medium = null;
  try {
    high = fmt(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
    medium = fmt(gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT));
  } catch (e) { /* getShaderPrecisionFormat unsupported — treat as mediump-only */ }
  var highpSupported = !!(high && high.precision > 0 && (high.rangeMin > 0 || high.rangeMax > 0));
  return { highpSupported: highpSupported, high: high, medium: medium };
}

function compileGLProgram(canvasId, vertSrc, fragSrc) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) throw new Error(canvasId + " element missing");
  var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) ||
    canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) throw new Error("WebGL context unavailable");
  var vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  var fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
  }
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var positionLoc = gl.getAttribLocation(program, "a_position");
  var noiseTex = createNoiseTexture(gl);
  return {
    gl: gl, canvas: canvas, program: program, buffer: buffer,
    positionLoc: positionLoc,
    timeLoc: gl.getUniformLocation(program, "u_time"),
    resLoc: gl.getUniformLocation(program, "u_resolution"),
    noiseTex: noiseTex,
    noiseTexLoc: gl.getUniformLocation(program, "u_noiseTex"),
    precisionInfo: getFragmentPrecisionInfo(gl)
  };
}

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// ========================= //
// BURN DEBUG BADGE          //
// ========================= //
// Opt-in via ?debug=burn — an on-screen (not console) readout of which
// render path is actually active (WebGL vs CSS fallback) and the
// fragment shader's precision situation, so this is checkable on a real
// phone with no devtools attached.

var DEBUG_BURN = (function () {
  try {
    return new URLSearchParams(window.location.search).get("debug") === "burn";
  } catch (e) { return false; }
})();

function ensureDebugBadge() {
  var el = document.getElementById("burnDebugBadge");
  if (el) return el;
  el = document.createElement("div");
  el.id = "burnDebugBadge";
  el.style.cssText = "position:fixed;bottom:8px;left:8px;z-index:99999;" +
    "background:rgba(0,0,0,0.85);color:#c9e6a9;font:11px/1.4 monospace;" +
    "padding:8px 10px;border-radius:8px;max-width:92vw;white-space:pre-wrap;" +
    "pointer-events:none;border:1px solid rgba(255,255,255,0.2);";
  el.textContent = "burn debug: waiting for first draw/resolve…";
  document.body.appendChild(el);
  return el;
}

function describePrecision(precisionInfo) {
  if (!precisionInfo) return "unknown";
  var usesHighp = precisionInfo.highpSupported;
  var active = usesHighp ? "highp" : "mediump";
  var high = precisionInfo.high;
  var medium = precisionInfo.medium;
  var line = "shader precision: " + active + " (device " + (usesHighp ? "supports" : "does NOT support") + " highp in fragment shaders)";
  if (high) line += "\n  highp:   range[2^" + high.rangeMin + ",2^" + high.rangeMax + "] precision 2^-" + high.precision;
  if (medium) line += "\n  mediump: range[2^" + medium.rangeMin + ",2^" + medium.rangeMax + "] precision 2^-" + medium.precision;
  return line;
}

function updateDebugBadge(label, pathInfo) {
  if (!DEBUG_BURN) return;
  var el = ensureDebugBadge();
  var lines = ["burn debug — " + label, "path: " + pathInfo.path];
  if (pathInfo.precisionInfo) lines.push(describePrecision(pathInfo.precisionInfo));
  if (pathInfo.note) lines.push(pathInfo.note);
  el.textContent = lines.join("\n");
}

var GL_VERT_SRC = [
  "attribute vec2 a_position;",
  "varying vec2 v_uv;",
  "void main() {",
  "  v_uv = a_position * 0.5 + 0.5;",
  "  gl_Position = vec4(a_position, 0.0, 1.0);",
  "}"
].join("\n");

// ========================= //
// CARD DRAW REVEAL (WebGL)  //
// ========================= //
// Fires once per card draw (solo or synced — same event either way).
// The card shows an opaque dark face; a hole ignites at the center and
// spreads radially outward with a noise-driven organic edge, a
// rose-gold ember ring, and fine sparks, consuming the face to reveal
// the already-rendered card text/art beneath. ~1.3s. Same three-tier
// degradation as the resolution burn-away (WebGL -> CSS clip-path
// dissolve -> quick fade under reduced motion). Unlike the resolution
// effect, the overlay hides itself once fully open — there's no
// "frozen" state worth keeping since the real card is already showing.

var revealGL = null;
var revealGLProbed = false;
var revealGLFailed = false;
var revealAnimFrame = null;

var REVEAL_FRAG_SRC = [
  "#ifdef GL_FRAGMENT_PRECISION_HIGH",
  "precision highp float;",
  "#else",
  "precision mediump float;",
  "#endif",
  "varying vec2 v_uv;",
  "uniform float u_time;",
  "uniform vec2 u_resolution;",
  "uniform sampler2D u_noiseTex;",
  "float noise(vec2 p) {",
  "  return texture2D(u_noiseTex, p * 0.015625).r;",
  "}",
  "float fbm(vec2 p) {",
  "  float v = 0.0; float amp = 0.55;",
  "  for (int i = 0; i < 4; i++) { v += amp * noise(p); p *= 2.05; amp *= 0.5; }",
  "  return v;",
  "}",
  "void main() {",
  "  vec2 uv = v_uv;",
  "  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);",
  "  vec2 centered = (uv - 0.5) * aspect;",
  "  float dist = length(centered);",
  "  float n = fbm(uv * aspect * 5.5 + vec2(u_time * 0.5, -u_time * 0.5));",
  "  float noiseOffset = (n - 0.5) * 0.4;",
  "  float front = dist - noiseOffset;",
  "  float p = max(0.0, u_time * 1.35 - 0.05);",
  "  float opened = step(front, p);",
  "  float edge = smoothstep(p - 0.08, p, front) * (1.0 - smoothstep(p, p + 0.08, front)) * (1.0 - opened);",
  "  float sparkNoise = noise(uv * aspect * 42.0 + u_time * 32.0);",
  "  float spark = edge * step(0.87, sparkNoise) * 1.5;",
  "  vec3 emberColor = vec3(0.79, 0.66, 0.48);",
  "  vec3 hotColor = vec3(1.0, 0.87, 0.65);",
  "  vec3 faceColor = vec3(0.028, 0.035, 0.05);",
  "  vec3 emberGlow = mix(emberColor, hotColor, clamp(spark, 0.0, 1.0)) * (edge * 1.6 + spark);",
  "  float faceAlpha = (1.0 - opened) * (1.0 - edge) * 0.97;",
  "  float alpha = clamp(faceAlpha + edge * 0.95 + spark * 0.3, 0.0, 1.0);",
  "  vec3 color = mix(faceColor, emberGlow, clamp(edge * 2.2 + spark, 0.0, 1.0));",
  "  gl_FragColor = vec4(color, alpha);",
  "}"
].join("\n");

function setupRevealGL() {
  if (revealGLProbed) return revealGL;
  revealGLProbed = true;
  try {
    revealGL = compileGLProgram("revealCanvas", GL_VERT_SRC, REVEAL_FRAG_SRC);
  } catch (e) {
    console.warn("WebGL reveal effect unavailable, using CSS fallback", e);
    revealGL = null;
    revealGLFailed = true;
  }
  return revealGL;
}

function runRevealCSSFallback(quick) {
  var el = document.getElementById("revealFallback");
  if (!el) return;
  el.classList.remove("hidden", "reveal-fallback-quick", "reveal-fallback-play");
  void el.offsetWidth;
  el.classList.add(quick ? "reveal-fallback-quick" : "reveal-fallback-play");
}

function hideRevealOverlay() {
  if (revealAnimFrame) { cancelAnimationFrame(revealAnimFrame); revealAnimFrame = null; }
  var canvas = document.getElementById("revealCanvas");
  if (canvas) canvas.classList.add("hidden");
  var fallback = document.getElementById("revealFallback");
  if (fallback) {
    fallback.classList.add("hidden");
    fallback.classList.remove("reveal-fallback-quick", "reveal-fallback-play");
  }
}

function triggerBurnReveal(card) {
  hideRevealOverlay();
  if (typeof playSfx === "function") {
    playSfx("draw");
    setTimeout(function () { playSfx("reveal"); }, 350);
  }

  if (prefersReducedMotion()) {
    updateDebugBadge("reveal", { path: "CSS quick fade (prefers-reduced-motion)" });
    runRevealCSSFallback(true);
    return;
  }

  var ctx = setupRevealGL();
  if (!ctx || revealGLFailed) {
    updateDebugBadge("reveal", { path: "CSS fallback (WebGL unavailable or previously failed)" });
    runRevealCSSFallback(false);
    return;
  }

  try {
    var canvas = ctx.canvas;
    var rect = card.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    canvas.classList.remove("hidden");

    var gl = ctx.gl;
    gl.viewport(0, 0, w, h);
    gl.useProgram(ctx.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.buffer);
    gl.enableVertexAttribArray(ctx.positionLoc);
    gl.vertexAttribPointer(ctx.positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(ctx.resLoc, w, h);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ctx.noiseTex);
    gl.uniform1i(ctx.noiseTexLoc, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    updateDebugBadge("reveal", { path: "WebGL", precisionInfo: ctx.precisionInfo });

    var duration = 1450;
    var start = null;
    var lastTs = null;
    var slowFrames = 0;
    if (revealAnimFrame) cancelAnimationFrame(revealAnimFrame);

    function frame(ts) {
      if (start === null) { start = ts; lastTs = ts; }
      var delta = ts - lastTs;
      lastTs = ts;
      if (delta > 120) {
        slowFrames++;
        if (slowFrames >= 3) {
          console.warn("WebGL reveal effect struggling on this device, switching to CSS fallback");
          revealGLFailed = true;
          canvas.classList.add("hidden");
          revealAnimFrame = null;
          updateDebugBadge("reveal", { path: "CSS fallback (WebGL struggled mid-animation)", precisionInfo: ctx.precisionInfo });
          runRevealCSSFallback(false);
          return;
        }
      }
      var t = Math.min(1, (ts - start) / duration);
      try {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(ctx.timeLoc, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } catch (e) {
        console.warn("WebGL reveal render failed mid-animation, switching to CSS fallback", e);
        revealGLFailed = true;
        canvas.classList.add("hidden");
        revealAnimFrame = null;
        updateDebugBadge("reveal", { path: "CSS fallback (WebGL render threw mid-animation)", precisionInfo: ctx.precisionInfo });
        runRevealCSSFallback(false);
        return;
      }
      if (t < 1) {
        revealAnimFrame = requestAnimationFrame(frame);
      } else {
        revealAnimFrame = null;
        // Fully open — nothing left to show. Unlike the resolution burn
        // there's no frozen state worth keeping, so hide the canvas.
        canvas.classList.add("hidden");
      }
    }
    revealAnimFrame = requestAnimationFrame(frame);
  } catch (e) {
    console.warn("WebGL reveal effect failed, using CSS fallback", e);
    revealGLFailed = true;
    var canvasEl = document.getElementById("revealCanvas");
    if (canvasEl) canvasEl.classList.add("hidden");
    updateDebugBadge("reveal", { path: "CSS fallback (WebGL setup threw)" });
    runRevealCSSFallback(false);
  }
}

// ========================= //
// CARD BURN-AWAY (WebGL)    //
// ========================= //
// Fires once per card resolution (judged/skipped/discarded by any path,
// solo or synced) — a fire-and-forget visual overlay on #todCard. Every
// caller updates game state and UI synchronously and independently;
// this function only decorates on top and is never awaited.
//
// Three tiers, chosen once per session and cached:
//   1. WebGL noise-dissolve shader (charring edge + rose-gold ember +
//      spark flicker), ~1.25s.
//   2. CSS opacity/filter dissolve if WebGL is unavailable or falters
//      mid-animation (~1.2s, reads similarly).
//   3. A simple quick opacity fade if prefers-reduced-motion is set
//      (~0.35s) — this tier is checked first and skips WebGL entirely.
// The end state is left frozen (charred) rather than reverting, until
// the next draw explicitly clears it via hideBurnOverlay().

var burnGL = null;
var burnGLProbed = false;
var burnGLFailed = false;
var burnAnimFrame = null;

var BURN_FRAG_SRC = [
  "#ifdef GL_FRAGMENT_PRECISION_HIGH",
  "precision highp float;",
  "#else",
  "precision mediump float;",
  "#endif",
  "varying vec2 v_uv;",
  "uniform float u_time;",
  "uniform vec2 u_resolution;",
  "uniform sampler2D u_noiseTex;",
  "float noise(vec2 p) {",
  "  return texture2D(u_noiseTex, p * 0.015625).r;",
  "}",
  "float fbm(vec2 p) {",
  "  float v = 0.0; float amp = 0.55;",
  "  for (int i = 0; i < 4; i++) { v += amp * noise(p); p *= 2.05; amp *= 0.5; }",
  "  return v;",
  "}",
  "void main() {",
  "  vec2 uv = v_uv;",
  "  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);",
  "  float n = fbm(uv * aspect * 5.0 + vec2(0.0, u_time * 0.4));",
  "  float bias = (1.0 - uv.y) * 0.15 + abs(uv.x - 0.5) * 0.1;",
  "  float t = n + bias;",
  "  float p = u_time * 1.25;",
  "  float burnt = step(t, p);",
  "  float edge = smoothstep(p - 0.09, p, t) * (1.0 - smoothstep(p, p + 0.09, t)) * (1.0 - burnt);",
  "  float sparkNoise = noise(uv * aspect * 40.0 + u_time * 30.0);",
  "  float spark = edge * step(0.88, sparkNoise) * 1.4;",
  "  vec3 emberColor = vec3(0.79, 0.66, 0.48);",
  "  vec3 hotColor = vec3(1.0, 0.85, 0.6);",
  "  vec3 charColor = vec3(0.04, 0.02, 0.02);",
  "  vec3 emberGlow = mix(emberColor, hotColor, clamp(spark, 0.0, 1.0)) * (edge * 1.6 + spark);",
  "  float alpha = clamp(burnt * 0.94 + edge * 0.9, 0.0, 1.0);",
  "  vec3 color = mix(charColor, emberGlow, clamp(edge * 2.0 + spark, 0.0, 1.0));",
  "  gl_FragColor = vec4(color, alpha);",
  "}"
].join("\n");

function setupBurnGL() {
  if (burnGLProbed) return burnGL;
  burnGLProbed = true;
  try {
    burnGL = compileGLProgram("burnCanvas", GL_VERT_SRC, BURN_FRAG_SRC);
  } catch (e) {
    console.warn("WebGL burn effect unavailable, using CSS fallback", e);
    burnGL = null;
    burnGLFailed = true;
  }
  return burnGL;
}

function runBurnCSSFallback(quick) {
  var el = document.getElementById("burnFallback");
  if (!el) return;
  el.classList.remove("hidden", "burn-fallback-quick", "burn-fallback-play");
  void el.offsetWidth;
  el.classList.add(quick ? "burn-fallback-quick" : "burn-fallback-play");
}

function hideBurnOverlay() {
  if (burnAnimFrame) { cancelAnimationFrame(burnAnimFrame); burnAnimFrame = null; }
  var canvas = document.getElementById("burnCanvas");
  if (canvas) canvas.classList.add("hidden");
  var fallback = document.getElementById("burnFallback");
  if (fallback) {
    fallback.classList.add("hidden");
    fallback.classList.remove("burn-fallback-quick", "burn-fallback-play");
  }
}

function triggerCardBurnAway() {
  var cardEl = document.getElementById("todCard");
  if (!cardEl) return;
  if (typeof markRoundPlayed === "function") markRoundPlayed();
  if (typeof playSfx === "function") playSfx("burn");

  if (prefersReducedMotion()) {
    updateDebugBadge("resolution burn", { path: "CSS quick fade (prefers-reduced-motion)" });
    runBurnCSSFallback(true);
    return;
  }

  var ctx = setupBurnGL();
  if (!ctx || burnGLFailed) {
    updateDebugBadge("resolution burn", { path: "CSS fallback (WebGL unavailable or previously failed)" });
    runBurnCSSFallback(false);
    return;
  }

  try {
    var canvas = ctx.canvas;
    var rect = cardEl.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    canvas.classList.remove("hidden");

    var gl = ctx.gl;
    gl.viewport(0, 0, w, h);
    gl.useProgram(ctx.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.buffer);
    gl.enableVertexAttribArray(ctx.positionLoc);
    gl.vertexAttribPointer(ctx.positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(ctx.resLoc, w, h);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ctx.noiseTex);
    gl.uniform1i(ctx.noiseTexLoc, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    updateDebugBadge("resolution burn", { path: "WebGL", precisionInfo: ctx.precisionInfo });

    var duration = 1250;
    var start = null;
    var lastTs = null;
    var slowFrames = 0;
    if (burnAnimFrame) cancelAnimationFrame(burnAnimFrame);

    function frame(ts) {
      if (start === null) { start = ts; lastTs = ts; }
      var delta = ts - lastTs;
      lastTs = ts;
      if (delta > 120) {
        slowFrames++;
        if (slowFrames >= 3) {
          console.warn("WebGL burn effect struggling on this device, switching to CSS fallback");
          burnGLFailed = true;
          canvas.classList.add("hidden");
          burnAnimFrame = null;
          updateDebugBadge("resolution burn", { path: "CSS fallback (WebGL struggled mid-animation)", precisionInfo: ctx.precisionInfo });
          runBurnCSSFallback(false);
          return;
        }
      }
      var t = Math.min(1, (ts - start) / duration);
      try {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(ctx.timeLoc, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } catch (e) {
        console.warn("WebGL burn render failed mid-animation, switching to CSS fallback", e);
        burnGLFailed = true;
        canvas.classList.add("hidden");
        burnAnimFrame = null;
        updateDebugBadge("resolution burn", { path: "CSS fallback (WebGL render threw mid-animation)", precisionInfo: ctx.precisionInfo });
        runBurnCSSFallback(false);
        return;
      }
      if (t < 1) {
        burnAnimFrame = requestAnimationFrame(frame);
      } else {
        burnAnimFrame = null;
        // Frame left drawn (canvas stays visible) — the card reads as
        // burnt until the next draw calls hideBurnOverlay().
      }
    }
    burnAnimFrame = requestAnimationFrame(frame);
  } catch (e) {
    console.warn("WebGL burn effect failed, using CSS fallback", e);
    burnGLFailed = true;
    var canvasEl = document.getElementById("burnCanvas");
    if (canvasEl) canvasEl.classList.add("hidden");
    updateDebugBadge("resolution burn", { path: "CSS fallback (WebGL setup threw)" });
    runBurnCSSFallback(false);
  }
}

// ========================= //
// SOUND FX                  //
// ========================= //
// Small synthesized sound set via the Web Audio API — everything below
// is generated code, so there's zero audio-asset payload. Sounds
// default on; the mute toggle in the main menu persists to
// localStorage. playSfx() rate-limits each sound type independently so
// rapid-fire events (e.g. a fast double-tap) never stack or clip —
// different sounds are still free to layer naturally.

var soundMuted = localStorage.getItem("soundMuted") === "true";
var sfxAudioCtx = null;
var sfxLastPlayedAt = {};
var SFX_MIN_INTERVAL_MS = 70;

function getSfxAudioCtx() {
  if (sfxAudioCtx) return sfxAudioCtx;
  try {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    sfxAudioCtx = new Ctor();
  } catch (e) {
    sfxAudioCtx = null;
  }
  return sfxAudioCtx;
}

function sfxTone(ctx, freq, startAt, duration, opts) {
  opts = opts || {};
  var osc = ctx.createOscillator();
  osc.type = opts.type || "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  if (opts.freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), startAt + duration);
  }
  var gain = ctx.createGain();
  var peak = opts.gain != null ? opts.gain : 0.16;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + (opts.attack || 0.012));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.03);
}

function sfxNoiseBurst(ctx, startAt, duration, opts) {
  opts = opts || {};
  var bufferSize = Math.max(1, Math.round(ctx.sampleRate * duration));
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  var src = ctx.createBufferSource();
  src.buffer = buffer;
  var filter = ctx.createBiquadFilter();
  filter.type = opts.filterType || "bandpass";
  filter.frequency.setValueAtTime(opts.filterFreq || 1200, startAt);
  if (opts.filterFreqEnd != null) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(1, opts.filterFreqEnd), startAt + duration);
  }
  filter.Q.value = opts.q != null ? opts.q : 1;
  var gain = ctx.createGain();
  var peak = opts.gain != null ? opts.gain : 0.14;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + (opts.attack || 0.01));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(startAt);
  src.stop(startAt + duration + 0.03);
}

var SFX_BUILDERS = {
  // Card draw — ignition: a quick match-strike catching into a brief
  // sizzle/crackle, echoing the burn reveal's fire timbre but compact
  // and front-loaded so it reads as the moment the card catches.
  draw: function (ctx, t0) {
    // Strike: a short, bright scratchy transient.
    sfxNoiseBurst(ctx, t0, 0.05, { filterType: "highpass", filterFreq: 2600, gain: 0.09, attack: 0.003 });
    // Catch: a brief sizzle sweeping down as the flame takes hold.
    sfxNoiseBurst(ctx, t0 + 0.02, 0.26, { filterType: "bandpass", filterFreq: 3200, filterFreqEnd: 900, q: 0.8, gain: 0.10, attack: 0.01 });
    // A few tiny crackle pops woven through the catch.
    var pops = 3;
    for (var i = 0; i < pops; i++) {
      var at = t0 + 0.03 + Math.random() * 0.22;
      sfxNoiseBurst(ctx, at, 0.015 + Math.random() * 0.015, {
        filterType: "lowpass", filterFreq: 1000 + Math.random() * 600,
        gain: 0.05 + Math.random() * 0.03, attack: 0.002
      });
    }
  },
  // Reveal — subtle whoosh.
  reveal: function (ctx, t0) {
    sfxNoiseBurst(ctx, t0, 0.38, { filterType: "bandpass", filterFreq: 300, filterFreqEnd: 2200, q: 0.7, gain: 0.09, attack: 0.05 });
  },
  // Burn — low crackle: a handful of tiny noise ticks scattered across ~0.5s.
  burn: function (ctx, t0) {
    var ticks = 6;
    for (var i = 0; i < ticks; i++) {
      var at = t0 + Math.random() * 0.5;
      sfxNoiseBurst(ctx, at, 0.03 + Math.random() * 0.03, {
        filterType: "lowpass", filterFreq: 700 + Math.random() * 500,
        gain: 0.06 + Math.random() * 0.04, attack: 0.002
      });
    }
  },
  // Points awarded — warm chime (root + third + fifth).
  points: function (ctx, t0) {
    [523.25, 659.25, 783.99].forEach(function (f, i) {
      sfxTone(ctx, f, t0 + i * 0.02, 0.7, { type: "sine", gain: 0.11, attack: 0.008 });
    });
  },
  // Truth passed — light positive two-note rise.
  truthPass: function (ctx, t0) {
    sfxTone(ctx, 523.25, t0, 0.16, { type: "sine", gain: 0.13, attack: 0.006 });
    sfxTone(ctx, 659.25, t0 + 0.09, 0.22, { type: "sine", gain: 0.13, attack: 0.006 });
  },
  // Truth failed — a dramatic low descending tone.
  truthFail: function (ctx, t0) {
    sfxTone(ctx, 220, t0, 0.32, { type: "sine", freqEnd: 130, gain: 0.13, attack: 0.008 });
  },
  // Power card played — bold stinger for the announcement banner.
  cardPlayed: function (ctx, t0) {
    sfxTone(ctx, 180, t0, 0.32, { type: "sawtooth", freqEnd: 90, gain: 0.14, attack: 0.004 });
    sfxTone(ctx, 440, t0, 0.22, { type: "square", gain: 0.08, attack: 0.004 });
    sfxNoiseBurst(ctx, t0, 0.12, { filterType: "highpass", filterFreq: 2000, gain: 0.08, attack: 0.002 });
  },
  // Love-glow reveal — delicate ascending sparkle.
  sparkle: function (ctx, t0) {
    [1046.5, 1318.5, 1568.0, 2093.0].forEach(function (f, i) {
      sfxTone(ctx, f, t0 + i * 0.045, 0.14, { type: "sine", gain: 0.06, attack: 0.003 });
    });
  }
};

function playSfx(name) {
  if (soundMuted || !SFX_BUILDERS[name]) return;
  var now = Date.now();
  if (sfxLastPlayedAt[name] && now - sfxLastPlayedAt[name] < SFX_MIN_INTERVAL_MS) return;
  sfxLastPlayedAt[name] = now;
  var ctx = getSfxAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") { ctx.resume().catch(function () {}); }
  try {
    SFX_BUILDERS[name](ctx, ctx.currentTime);
  } catch (e) {
    console.warn("Sound effect failed:", name, e);
  }
}

window.toggleSoundMute = function () {
  soundMuted = !soundMuted;
  localStorage.setItem("soundMuted", soundMuted);
  updateSoundMuteUI();
};

function updateSoundMuteUI() {
  var el = document.getElementById("soundMuteToggle");
  if (!el) return;
  el.innerHTML = '<span class="menu-link-icon-col">' +
    appIcon(soundMuted ? "soundOff" : "soundOn", "nav-link-icon", "", true) +
    '</span><span class="menu-link-label" id="soundMuteLabel">' +
    (soundMuted ? "Sound Off" : "Sound On") + "</span>";
  el.setAttribute("aria-label", soundMuted ? "Unmute sounds" : "Mute sounds");
}

function applyCardGenderStyle(cardElement, genderList) {
  cardElement.classList.remove("male-card", "female-card", "neutral-card");
  if (genderList.includes("male") && !genderList.includes("female")) {
    cardElement.classList.add("male-card");
  } else if (genderList.includes("female") && !genderList.includes("male")) {
    cardElement.classList.add("female-card");
  } else {
    cardElement.classList.add("neutral-card");
  }
}

function getTruth() {
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
  if (isSyncActive()) { syncDrawCard("truth"); return; }
  let tier = getEffectiveHeatTier();
  let pool = window.Pool.getPlayablePool({ mode: "truth", tier: tier, matchedOnly: matchedOnly, heatCeiling: getHeatCeilingForPool() });
  let fullList = pool.fullList;
  let list = pool.items;
  if (list.length === 0) { showStatus("No cards available for this player 😅"); return; }
  let randomCard = list[Math.floor(Math.random() * list.length)];
  currentCardMeta = { mode: "truth", tier: tier, cardIndex: fullList.indexOf(randomCard) };
  let card = document.getElementById("todCard");
  let text = getCardText(randomCard);
  let genders = getCardGender(randomCard);
  document.getElementById("cardLabel").innerText = tier.toUpperCase() + " TRUTH";
  animateCardText(text);
  applyCardGenderStyle(card, genders);
  card.classList.remove("hidden-card");
  card.classList.remove("flipped");
  card.classList.remove("dare-card");
  card.classList.add("truth-card");
  triggerBurnReveal(card);
  currentTier = tier;
  document.getElementById("passFailSection").style.display = "block";
  document.getElementById("pointSection").style.display = "none";
  showSkipSection("truth");
}

function getDare() {
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
  if (isSyncActive()) { syncDrawCard("dare"); return; }
  let tier = getEffectiveHeatTier();
  let pool = window.Pool.getPlayablePool({ mode: "dare", tier: tier, matchedOnly: matchedOnly, unlockedTags: getAllowedTagsForPool(), heatCeiling: getHeatCeilingForPool() });
  let fullList = pool.fullList;
  let list = pool.items;
  if (list.length === 0) { showStatus("No cards available for this player 😅"); return; }
  let randomCard = list[Math.floor(Math.random() * list.length)];
  currentCardMeta = { mode: "dare", tier: tier, cardIndex: fullList.indexOf(randomCard) };
  let card = document.getElementById("todCard");
  let text = getCardText(randomCard);
  let genders = getCardGender(randomCard);
  document.getElementById("cardLabel").innerText = tier.toUpperCase() + " DARE";
  animateCardText(text);
  applyCardGenderStyle(card, genders);
  card.classList.remove("hidden-card");
  card.classList.remove("flipped");
  card.classList.remove("truth-card");
  card.classList.add("dare-card");
  triggerBurnReveal(card);
  currentTier = tier;
  document.getElementById("passFailSection").style.display = "none";
  showPointButtons(tier);
  showSkipSection("dare");
}

// spin() replaced by spinWheel() — see SPIN WHEEL section below

function updateScoreDisplay() {
  if (isSyncActive()) {
    let p1 = document.getElementById("player1Label");
    let p2 = document.getElementById("player2Label");
    if (p1) p1.innerText = gameSyncMyName || "You";
    if (p2) p2.innerText = gameSyncPartnerName || "Partner";
    document.getElementById("johnScoreDisplay").innerText = syncScores.mine;
    document.getElementById("felicityScoreDisplay").innerText = syncScores.partner;
    return;
  }
  document.getElementById("johnScoreDisplay").innerText = johnScore;
  document.getElementById("felicityScoreDisplay").innerText = felicityScore;
}

function updateNameDisplays() {
  if (isSyncActive()) return; // sync mode owns these labels via updateScoreDisplay()
  let p1 = document.getElementById("player1Label");
  let p2 = document.getElementById("player2Label");
  if (p1) p1.innerText = player1Name;
  if (p2) p2.innerText = player2Name;
}

function updateTurnDisplay() {
  let text;
  if (currentPlayer === "john") {
    text = player1Name + "'s turn 😎";
  } else {
    text = player2Name + "'s turn 💕";
  }
  document.getElementById("turnDisplay").innerText = text;
}

function showPointButtons(tier) {
  let container = document.getElementById("pointButtons");
  let section = document.getElementById("pointSection");
  container.innerHTML = "";
  pointRanges[tier].forEach(points => {
    let btn = document.createElement("button");
    btn.innerText = points;
    btn.onclick = () => awardPoints(points);
    container.appendChild(btn);
  });
  section.style.display = "block";
}

function passTruth() {
  if (isSyncActive()) { syncJudgeTruth("pass"); return; }
  let points = truthPoints[currentTier] || 0;
  if (currentPlayer === "john") {
    johnScore += points;
    localStorage.setItem("johnScore", johnScore);
    showStatus(player1Name + " +" + points + " 🔥");
  } else {
    felicityScore += points;
    localStorage.setItem("felicityScore", felicityScore);
    showStatus(player2Name + " +" + points + " 🔥");
  }
  updateScoreDisplay();
  endTurn();
  if (typeof playSfx === "function") playSfx("truthPass");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  if (currentCardMeta) showInGameRatingStrip(currentCardMeta.mode, currentCardMeta.tier, currentCardMeta.cardIndex);
}

function failTruth() {
  if (isSyncActive()) { syncJudgeTruth("fail"); return; }
  showStatus("No points awarded 😅");
  endTurn();
  if (typeof playSfx === "function") playSfx("truthFail");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  if (currentCardMeta) showInGameRatingStrip(currentCardMeta.mode, currentCardMeta.tier, currentCardMeta.cardIndex);
}

function awardPoints(points) {
  if (isSyncActive()) { syncAwardPoints(points); return; }
  if (currentPlayer === "john") {
    johnScore += points;
    localStorage.setItem("johnScore", johnScore);
    showStatus(player1Name + " +" + points + " 🔥");
  } else {
    felicityScore += points;
    localStorage.setItem("felicityScore", felicityScore);
    showStatus(player2Name + " +" + points + " 🔥");
  }
  updateScoreDisplay();
  endTurn();
  if (typeof playSfx === "function") playSfx("points");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  if (currentCardMeta) showInGameRatingStrip(currentCardMeta.mode, currentCardMeta.tier, currentCardMeta.cardIndex);
}

function endTurn() {
  document.getElementById("passFailSection").style.display = "none";
  document.getElementById("pointSection").style.display = "none";
  document.getElementById("skipSection").style.display = "none";
  currentPlayer = currentPlayer === "john" ? "felicity" : "john";
  updateTurnDisplay();
  if (typeof maybeShowProgressionPrompt === "function") maybeShowProgressionPrompt();
}

function resetGame() {
  if (isSyncActive()) {
    showStatus("Scores sync with your partner and can't be reset from one device.");
    return;
  }
  johnScore = 0;
  felicityScore = 0;
  currentPlayer = "john";
  currentTier = "";
  localStorage.setItem("johnScore", johnScore);
  localStorage.setItem("felicityScore", felicityScore);
  updateScoreDisplay();
  updateTurnDisplay();
  document.getElementById("pointSection").style.display = "none";
  document.getElementById("passFailSection").style.display = "none";
  document.getElementById("skipSection").style.display = "none";
  document.getElementById("todCard").classList.add("hidden-card");
  currentCardMeta = null;
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
  showStatus("New game started 🔄");
}

function updateDrinkModeUI() {
  const btn = document.getElementById("drinkModeBtn");
  const indicator = document.getElementById("drinkModeIndicator");
  const drinkBtn = document.getElementById("drinkBtn");
  if (btn) btn.classList.toggle("active-drink-mode", drinkMode);
  if (indicator) indicator.style.display = drinkMode ? "block" : "none";
  if (drinkBtn) drinkBtn.style.display = drinkMode ? "inline-block" : "none";
}

function showSkipSection(cardType) {
  const penalty = truthPoints[currentTier] || 0;
  const skipBtn = document.getElementById("skipBtn");
  const drinkBtn = document.getElementById("drinkBtn");
  const skipSection = document.getElementById("skipSection");
  if (skipBtn) skipBtn.innerText = "Skip 💸 (-" + penalty + " pts)";
  if (drinkBtn) drinkBtn.style.display = drinkMode ? "inline-block" : "none";
  if (skipSection) {
    // Dare cards have no Pass/Fail buffer — add equivalent top margin manually
    skipSection.style.marginTop = cardType === "dare" ? "110px" : "14px";
    skipSection.style.display = "block";
  }
}

window.toggleDrinkMode = function () {
  drinkMode = !drinkMode;
  localStorage.setItem("drinkMode", drinkMode);
  updateDrinkModeUI();
};

window.skipCard = function () {
  if (isSyncActive()) { syncSkipCard("money"); return; }
  const penalty = truthPoints[currentTier] || 0;
  if (currentPlayer === "john") {
    johnScore = Math.max(0, johnScore - penalty);
    localStorage.setItem("johnScore", johnScore);
    showStatus(player1Name + " -" + penalty + " 💸");
  } else {
    felicityScore = Math.max(0, felicityScore - penalty);
    localStorage.setItem("felicityScore", felicityScore);
    showStatus(player2Name + " -" + penalty + " 💸");
  }
  updateScoreDisplay();
  endTurn();
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
};

window.drinkSkip = function () {
  if (isSyncActive()) { syncSkipCard("drink"); return; }
  const drinkCounts = { tease: 1, foreplay: 2, dirty: 3 };
  const count = drinkCounts[currentTier] || 1;
  const toast = document.getElementById("drinkToast");
  if (toast) {
    toast.innerText = "🍺 Take " + count + " drink" + (count > 1 ? "s" : "") + "!";
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 2000);
  }
  endTurn();
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
};

// ========================= //
// TRUTH OR DARE SYNC        //
// ========================= //
// Two-device layer for Truth or Dare. Whoever draws is the performer;
// their partner is always the judge, and judging controls only ever
// render on the judge's device. Every device derives its state from
// the game_events log, so a draw/skip/verdict looks identical no
// matter which side triggered it.

function renderSyncedCard(mode, tier, card, cardIndex, drawnByPartner) {
  var cardEl = document.getElementById("todCard");
  var text = getCardText(card);
  var genders = getCardGender(card);
  document.getElementById("cardLabel").innerText = tier.toUpperCase() + " " + mode.toUpperCase();
  animateCardText(text);
  applyCardGenderStyle(cardEl, genders);
  cardEl.classList.remove("hidden-card");
  cardEl.classList.remove("flipped");
  cardEl.classList.remove(mode === "truth" ? "dare-card" : "truth-card");
  cardEl.classList.add(mode === "truth" ? "truth-card" : "dare-card");
  triggerBurnReveal(cardEl);

  var label = document.getElementById("drawnByLabel");
  if (label) {
    if (drawnByPartner) {
      label.innerText = "✋ Drawn by " + (gameSyncPartnerName || "your partner");
      label.classList.remove("hidden");
    } else {
      label.classList.add("hidden");
    }
  }

  // Never attributed to a partner — just a neutral "you both loved this" glow.
  var isLoveMatch = isSyncActive() && itemMutualMatches[mode][tierItemId(tier, cardIndex)] === true;
  cardEl.classList.toggle("love-match", isLoveMatch);
  var loveBadge = document.getElementById("loveMatchBadge");
  if (loveBadge) loveBadge.classList.toggle("hidden", !isLoveMatch);
  if (isLoveMatch && typeof playSfx === "function") {
    // Timed to land once the burn-reveal has fully opened and the
    // badge is actually visible.
    setTimeout(function () { playSfx("sparkle"); }, 1350);
  }
}

function showTruthOrDareJudgeUI(mode, myRole) {
  var pointSection = document.getElementById("pointSection");
  var passFailSection = document.getElementById("passFailSection");
  var judgeWaitSection = document.getElementById("judgeWaitSection");

  pointSection.style.display = "none";
  passFailSection.style.display = "none";
  judgeWaitSection.style.display = "none";

  if (myRole === "judge") {
    if (mode === "dare") showPointButtons(currentTier);
    else passFailSection.style.display = "block";
  } else {
    document.getElementById("judgeWaitText").innerText = (gameSyncPartnerName || "Your partner") + " is scoring you… 👀";
    judgeWaitSection.style.display = "block";
  }

  showSkipSection(mode);
  if (myRole === "judge") document.getElementById("skipSection").style.display = "none";
}

function endSyncTruthRound() {
  syncTruthRound = null;
  var pointSection = document.getElementById("pointSection");
  var passFailSection = document.getElementById("passFailSection");
  var judgeWaitSection = document.getElementById("judgeWaitSection");
  var skipSection = document.getElementById("skipSection");
  var label = document.getElementById("drawnByLabel");
  if (pointSection) pointSection.style.display = "none";
  if (passFailSection) passFailSection.style.display = "none";
  if (judgeWaitSection) judgeWaitSection.style.display = "none";
  if (skipSection) skipSection.style.display = "none";
  if (label) label.classList.add("hidden");
  if (typeof renderHandTray === "function") renderHandTray();
  if (typeof maybeShowProgressionPrompt === "function") maybeShowProgressionPrompt();
  if (typeof refreshEngineSnapshot === "function") refreshEngineSnapshot();
}

function syncDrawCard(mode) {
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
  var tier = getEffectiveDrawTier(getEffectiveHeatTier());
  var pool = window.Pool.getPlayablePool({ mode: mode, tier: tier, matchedOnly: matchedOnly, unlockedTags: getAllowedTagsForPool(), heatCeiling: getHeatCeilingForPool() });
  var fullList = pool.fullList;
  var list = pool.items;
  if (list.length === 0) {
    if (matchedOnly) {
      showStatus("No mutual " + mode + " matches yet — rate some together, or turn off Matched Only 💔");
    } else {
      showStatus("No cards available for this player 😅");
    }
    return;
  }
  var randomCard = list[Math.floor(Math.random() * list.length)];
  var cardIndex = fullList.indexOf(randomCard);
  var roundId = genRoundId();
  var performerId = gameSyncMyId();

  currentTier = tier;
  syncTruthRound = { roundId: roundId, tier: tier, mode: mode, cardIndex: cardIndex, performerId: performerId, myRole: "performer", doubleDown: false };
  renderSyncedCard(mode, tier, randomCard, cardIndex, false);
  showTruthOrDareJudgeUI(mode, "performer");
  if (typeof renderHandTray === "function") renderHandTray();

  window.GameSync.send("card_drawn", {
    roundId: roundId, mode: mode, tier: tier, cardIndex: cardIndex, performer_user_id: performerId
  });
}

function restoreTruthOrDareRound(starterEvent, events) {
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
  var p = starterEvent.payload || {};
  var list = gameData[p.tier] && gameData[p.tier][p.mode === "truth" ? "truths" : "dares"];
  var card = list && list[p.cardIndex];
  if (!card) { endSyncTruthRound(); return; }
  var myId = gameSyncMyId();
  var performerId = p.performer_user_id;
  var doubleDown = false;

  // On a fresh reconnect/reload, replay any card_played events already
  // logged against this round (double_down / reverse) so the restored
  // state matches what was on-screen before the disconnect.
  if (events) {
    events.forEach(function (ev) {
      if (ev.event_type !== "card_played") return;
      var cp = ev.payload || {};
      if (cp.roundId !== p.roundId) return;
      if (cp.card === "double_down") doubleDown = true;
      if (cp.card === "reverse" && cp.newPerformerId) performerId = cp.newPerformerId;
    });
  }

  var myRole = performerId === myId ? "performer" : "judge";
  currentTier = p.tier;
  syncTruthRound = { roundId: p.roundId, tier: p.tier, mode: p.mode, cardIndex: p.cardIndex, performerId: performerId, myRole: myRole, doubleDown: doubleDown };
  renderSyncedCard(p.mode, p.tier, card, p.cardIndex, myRole === "judge");
  showTruthOrDareJudgeUI(p.mode, myRole);
  if (typeof renderHandTray === "function") renderHandTray();
}

function applyRemoteCardDrawn(ev) {
  restoreTruthOrDareRound(ev);
}

function syncSkipCard(kind) {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer") return;
  var round = syncTruthRound;
  var tier = round.tier;
  var payload = {
    roundId: round.roundId, mode: round.mode, tier: tier, cardIndex: round.cardIndex,
    performer_user_id: round.performerId, kind: kind
  };

  if (kind === "money") {
    var penalty = truthPoints[tier] || 0;
    payload.penalty = penalty;
    applySyncScoreDelta(round.performerId, -penalty);
    showStatus((gameSyncMyName || "You") + " -" + penalty + " 💸");
  } else {
    var drinkCounts = { tease: 1, foreplay: 2, dirty: 3 };
    var count = drinkCounts[tier] || 1;
    payload.drinks = count;
    var toast = document.getElementById("drinkToast");
    if (toast) {
      toast.innerText = "🍺 Take " + count + " drink" + (count > 1 ? "s" : "") + "!";
      toast.classList.add("show");
      setTimeout(function () { toast.classList.remove("show"); }, 2000);
    }
  }

  endSyncTruthRound();
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  window.GameSync.send("card_skipped", payload);
}

function applyRemoteCardSkipped(ev) {
  var p = ev.payload || {};
  if (p.kind === "money") {
    applySyncScoreDelta(p.performer_user_id, -(p.penalty || 0));
    showStatus((gameSyncPartnerName || "Partner") + " -" + (p.penalty || 0) + " 💸");
  } else {
    var toast = document.getElementById("drinkToast");
    if (toast) {
      var n = p.drinks || 1;
      toast.innerText = "🍺 " + (gameSyncPartnerName || "Partner") + " takes " + n + " drink" + (n > 1 ? "s" : "") + "!";
      toast.classList.add("show");
      setTimeout(function () { toast.classList.remove("show"); }, 2000);
    }
  }
  endSyncTruthRound();
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
}

function syncAwardPoints(amount) {
  if (!syncTruthRound || syncTruthRound.myRole !== "judge" || syncTruthRound.mode !== "dare") return;
  var round = syncTruthRound;
  if (round.doubleDown) amount = amount * 2;
  applySyncScoreDelta(round.performerId, amount);
  showStatus((gameSyncPartnerName || "Partner") + " +" + amount + (round.doubleDown ? " 🔥 (Double Down!)" : " 🔥"));
  showSyncOutcome("todCard", amount > 0);
  endSyncTruthRound();
  if (typeof playSfx === "function") playSfx("points");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  showInGameRatingStrip("dare", round.tier, round.cardIndex);
  window.GameSync.send("points_awarded", {
    roundId: round.roundId, performer_user_id: round.performerId, amount: amount, tier: round.tier, source: "truth_or_dare"
  });
}

function syncJudgeTruth(verdict) {
  if (!syncTruthRound || syncTruthRound.myRole !== "judge" || syncTruthRound.mode !== "truth") return;
  var round = syncTruthRound;
  var points = verdict === "pass" ? (truthPoints[round.tier] || 0) : 0;
  if (round.doubleDown) points = points * 2;
  if (points > 0) applySyncScoreDelta(round.performerId, points);
  showStatus(verdict === "pass" ? ((gameSyncPartnerName || "Partner") + " +" + points + (round.doubleDown ? " 🔥 (Double Down!)" : " 🔥")) : "No points awarded 😅");
  showSyncOutcome("todCard", verdict === "pass");
  endSyncTruthRound();
  if (typeof playSfx === "function") playSfx(verdict === "pass" ? "truthPass" : "truthFail");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  showInGameRatingStrip("truth", round.tier, round.cardIndex);
  window.GameSync.send("truth_judged", {
    roundId: round.roundId, performer_user_id: round.performerId, verdict: verdict, points: points, tier: round.tier
  });
}

function applyRemotePointsAwarded(ev) {
  var p = ev.payload || {};
  applySyncScoreDelta(p.performer_user_id, p.amount || 0);
  var isWheel = p.source === "wheel";
  showStatus("You +" + (p.amount || 0) + " 🔥");
  showSyncOutcome(isWheel ? "wheelCard" : "todCard", (p.amount || 0) > 0);
  if (isWheel) {
    resetWheelSyncUI();
    var nb = document.getElementById("wheelNextTurnBtn");
    if (nb) nb.style.display = "inline-block";
  } else {
    var round = syncTruthRound;
    endSyncTruthRound();
    if (typeof playSfx === "function") playSfx("points");
    if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
    if (round) showInGameRatingStrip("dare", round.tier, round.cardIndex);
  }
}

function applyRemoteTruthJudged(ev) {
  var p = ev.payload || {};
  if (p.points) applySyncScoreDelta(p.performer_user_id, p.points);
  showStatus(p.verdict === "pass" ? ("You +" + p.points + " 🔥") : "No points awarded this time 😅");
  showSyncOutcome("todCard", p.verdict === "pass");
  var round = syncTruthRound;
  endSyncTruthRound();
  if (typeof playSfx === "function") playSfx(p.verdict === "pass" ? "truthPass" : "truthFail");
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
  if (round) showInGameRatingStrip("truth", round.tier, round.cardIndex);
}

// ========================= //
// PREFERENCES (dares+truths)//
// ========================= //
// Reuses the same generic Backend.saveRating/loadRatings/getMutualMatches
// calls the Positions page already uses. An item's item_id is
// "<tier>:<index>" — its stable position within gameData[tier].dares
// or .truths, the same addressing the sync feature already uses for
// card_drawn payloads. item_type ('dare'/'truth') is always tracked
// alongside item_id, so the identical "<tier>:<index>" string is safe
// to reuse for both — the database's composite key and these per-type
// caches keep them apart.

var itemRatings = { dare: {}, truth: {} };       // itemType -> item_id -> rating
var itemMutualMatches = { dare: {}, truth: {} }; // itemType -> item_id -> love (boolean)
var matchedOnly = localStorage.getItem("matchedOnly") === "true";
var personalizeTab = "dare"; // 'dare' | 'truth'
var personalizeFilter = "all";
var personalizeTagFilter = []; // selected tags — dares only, OR'd together
var activePersonalizeItem = null; // { itemType, tier, index }

function tierItemId(tier, index) { return tier + ":" + index; }

function ratingEmoji(r) {
  return { no: "🚫", maybe: "🤔", yes: "👍", love: "💕" }[r] || "";
}

async function refreshItemRatings(itemType) {
  itemRatings[itemType] = (window.Backend && await window.Backend.loadRatings(itemType)) || {};
}

async function refreshItemMutualMatches(itemType) {
  if (!isSyncActive()) { itemMutualMatches[itemType] = {}; return; }
  var matches = await window.Backend.getMutualMatches(itemType);
  var map = {};
  matches.forEach(function (m) { map[m.item_id] = !!m.love; });
  itemMutualMatches[itemType] = map;
}

async function refreshAllPreferenceCaches() {
  await refreshItemRatings("dare");
  await refreshItemRatings("truth");
  await refreshItemMutualMatches("dare");
  await refreshItemMutualMatches("truth");
}

// Preference/Matched Only filtering moved into pool.js
// (window.Pool.getPlayablePool) — see filterByPreference there.

window.toggleMatchedOnly = function () {
  matchedOnly = !matchedOnly;
  localStorage.setItem("matchedOnly", matchedOnly);
  updateMatchedOnlyUI();
};

function updateMatchedOnlyUI() {
  var btn = document.getElementById("matchedOnlyBtn");
  if (!btn) return;
  var linked = isSyncActive();
  btn.classList.toggle("hidden", !linked);
  btn.classList.toggle("active-drink-mode", matchedOnly);
}

// ========================= //
// PROGRESSION (tag unlocks) //
// ========================= //
// Couples start with the base/vanilla tag set always available. Every
// other ("advanced") tag has to be mutually unlocked together — a
// "Dare we try [tag]?" proposal both partners answer yes to — before
// its dares enter the pool. Solo/unlinked players are entirely
// unaffected: they never see a restricted pool, a proposal, or a
// locked/unlocked distinction. All state here comes from the existing
// get_couple_progression/create_progression_proposal/respond_progression
// RPCs (backend.js) — no schema changes, no new realtime channel.
//
// Privacy: my_answer from the backend is always the caller's own
// response only. Nothing here ever renders who proposed, whether the
// partner has answered, or what they answered — an unanswered proposal
// and a declined one look identical (both just "not open" once resolved,
// or "asked 💌" while still open).

// The vanilla baseline — always playable regardless of unlock state.
// Everything else appearing in gameData's dare tags is "advanced" by
// exclusion, so new content tags default to locked until added here.
var BASE_TAGS = [
  "kissing", "massage", "praise", "dirty-talk", "teasing", "grinding",
  "strip", "mirror", "roleplay", "manual", "oral", "penetration"
];

var coupleProgression = { progressionMode: null, unlockedTags: [], openProposals: [] };
var activeProgressionPromptId = null;
var activeProgressionPromptTag = null;
var activeProgressionPromptKind = null; // 'tag' | 'heat'

// The heatCeiling passed to window.Pool.getPlayablePool — null (no
// restriction) for solo/unlinked users, so their pool is byte-identical
// to before this feature existed. See getEffectiveHeatTier() (with the
// tier dropdown code above) for the min(my dial, partner's dial) rule
// every draw, for either performer, actually comes from.
function getHeatCeilingForPool() {
  if (!isSyncActive()) return null;
  return getEffectiveHeatTier();
}

// Personalize keeps its own native <select> to filter the browse list by
// tier — a separate concept from the per-user dial system that now
// drives both Truth or Dare and Spin the Wheel (see TIER_CONTROL_PAGES
// above). Still just "pick within what's unlocked," clamped against the
// same effective heat.
function updateTierSelectOptions() {
  var ceiling = getHeatCeilingForPool();
  var ceilingIdx = ceiling ? TIER_ORDER.indexOf(ceiling) : TIER_ORDER.length - 1;

  var sel = document.getElementById("personalizeTierSelect");
  if (sel) {
    Array.prototype.forEach.call(sel.options, function (opt) {
      opt.disabled = TIER_ORDER.indexOf(opt.value) > ceilingIdx;
    });
    if (TIER_ORDER.indexOf(sel.value) > ceilingIdx) {
      sel.value = TIER_ORDER[ceilingIdx];
    }
  }

  refreshTierSelectIcons();
}

// Keeps Personalize's tier <select> companion icon badge (see ICONS) in
// sync with its current value — covers both user-driven onchange events
// and the programmatic ceiling clamp above, which sets .value directly
// and so never fires a change event on its own. Truth or Dare's and Spin
// the Wheel's own trigger icons are handled by updateTierTrigger()
// instead, since neither is a <select> anymore.
function refreshTierSelectIcons() {
  var sel = document.getElementById("personalizeTierSelect");
  var icon = document.getElementById("personalizeTierSelectIcon");
  if (!sel || !icon) return;
  icon.innerHTML = appIcon(sel.value, "tier-select-icon-img", "", true);
}

// Turn-up-heat/cool-down buttons and the ambiance cue both now live
// inside each page's adaptive heat display (see refreshAdaptiveHeatDisplay)
// instead of a page-specific always-visible affordance — this is just the
// legacy entry point several call sites still use.
function updateHeatAmbianceUI() {
  if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
}

function getAllDareTags() {
  var set = {};
  TIER_ORDER.forEach(function (tier) {
    gameData[tier].dares.forEach(function (d) { (d.tags || []).forEach(function (t) { set[t] = true; }); });
  });
  return Object.keys(set).sort();
}

function getAdvancedTags() {
  return getAllDareTags().filter(function (t) { return BASE_TAGS.indexOf(t) === -1; });
}

// The full allow-list passed to window.Pool.getPlayablePool's
// unlockedTags param — null (no restriction) for solo/unlinked users,
// exactly preserving their pre-progression behavior.
function getAllowedTagsForPool() {
  if (!isSyncActive()) return null;
  return BASE_TAGS.concat(coupleProgression.unlockedTags || []);
}

async function refreshCoupleProgression() {
  if (!isSyncActive() || !window.Backend) {
    coupleProgression = { progressionMode: null, unlockedTags: [], openProposals: [] };
  } else {
    coupleProgression = await window.Backend.getCoupleProgression();
  }
  if (typeof renderProgressionTagSections === "function") renderProgressionTagSections();
  if (typeof maybeShowProgressionPrompt === "function") maybeShowProgressionPrompt();
  if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
}

// Propose unlocking a tag together — idempotent server-side, so calling
// this again for a tag that already has an open proposal just reuses it.
function proposeTag(tag) {
  if (!window.Backend || !isSyncActive()) return;
  window.Backend.createProgressionProposal("tag", tag)
    .then(function () { return refreshCoupleProgression(); })
    .catch(function (e) {
      var err = document.getElementById("progressionError");
      if (err) err.innerText = (e && e.message) || "Couldn't send that. Please try again.";
    });
}

// Either player can propose turning the session's effective heat up one
// tier — idempotent server-side, same as proposeTag. Accepting raises
// only the accepting partner's own dial (see respond_progression); the
// couple's effective heat rises once both dials reach the target tier.
window.proposeHeatUp = function () {
  if (!window.Backend || !isSyncActive()) return;
  var ceilingIdx = TIER_ORDER.indexOf(getEffectiveHeatTier());
  if (ceilingIdx === -1 || ceilingIdx >= TIER_ORDER.length - 1) return; // already at max
  var nextTier = TIER_ORDER[ceilingIdx + 1];
  window.Backend.createProgressionProposal("heat", nextTier)
    .then(function () { return refreshCoupleProgression(); })
    .catch(function () {
      // Low-stakes — a failed proposal simply isn't there to answer;
      // tapping the button again retries it.
    });
};

// Truth or Dare only ever shows the prompt between rounds — never over
// an active card, judgment, or power-card moment.
function isTruthOrDareIdle() {
  if (isSyncActive()) return !syncTruthRound;
  var card = document.getElementById("todCard");
  var passFail = document.getElementById("passFailSection");
  var pointSection = document.getElementById("pointSection");
  var skipSection = document.getElementById("skipSection");
  return (!card || card.classList.contains("hidden-card")) &&
    (!passFail || passFail.style.display === "none") &&
    (!pointSection || pointSection.style.display === "none") &&
    (!skipSection || skipSection.style.display === "none");
}

// Shared by both the tag prompt ("Dare we try [tag]?") and the heat
// prompt ("Dare we turn the heat up?" — the target tier is deliberately
// not named here; it's revealed by the ceremony once it actually
// changes). Tag names get the same gradient treatment as everywhere
// else tags are shown; escaped since subject ultimately comes from the
// server.
function progressionPromptHtml(proposal) {
  if (proposal.kind === "heat") return "Dare we turn the heat up? 🔥";
  return "Dare we try <span class=\"progression-prompt-tag\">" + escapeHtml(proposal.subject.replace(/-/g, " ")) + "</span>?";
}

function maybeShowProgressionPrompt() {
  var truthEl = document.getElementById("progressionPromptTruth");
  var personalizeEl = document.getElementById("progressionPromptPersonalize");
  if (!truthEl && !personalizeEl) return;

  var openUnanswered = (coupleProgression.openProposals || []).find(function (p) {
    return (p.kind === "tag" || p.kind === "heat") && p.myAnswer == null;
  });

  activeProgressionPromptId = openUnanswered ? openUnanswered.id : null;
  activeProgressionPromptTag = openUnanswered ? openUnanswered.subject : null;
  activeProgressionPromptKind = openUnanswered ? openUnanswered.kind : null;

  if (truthEl) {
    var truthPage = document.getElementById("truth");
    var truthPageActive = truthPage && truthPage.classList.contains("active");
    var showInTruth = !!openUnanswered && isSyncActive() && truthPageActive && isTruthOrDareIdle();
    if (showInTruth) {
      document.getElementById("progressionPromptTextTruth").innerHTML = progressionPromptHtml(openUnanswered);
      truthEl.classList.remove("hidden");
    } else {
      truthEl.classList.add("hidden");
    }
  }

  if (personalizeEl) {
    var showInPersonalize = !!openUnanswered && isSyncActive();
    if (showInPersonalize) {
      document.getElementById("progressionPromptTextPersonalize").innerHTML = progressionPromptHtml(openUnanswered);
      personalizeEl.classList.remove("hidden");
    } else {
      personalizeEl.classList.add("hidden");
    }
  }
}

// "Not yet" and "Yes" both flow through here — dismissal is immediate
// and quiet either way; only a mutual "yes" (the RPC returning
// 'unlocked') additionally plays the unlock ceremony.
window.respondToProgressionPrompt = function (answer) {
  if (!activeProgressionPromptId || !window.Backend) return;
  var id = activeProgressionPromptId;
  var subject = activeProgressionPromptTag;
  var kind = activeProgressionPromptKind;
  activeProgressionPromptId = null;
  activeProgressionPromptTag = null;
  activeProgressionPromptKind = null;
  var truthEl = document.getElementById("progressionPromptTruth");
  var personalizeEl = document.getElementById("progressionPromptPersonalize");
  if (truthEl) truthEl.classList.add("hidden");
  if (personalizeEl) personalizeEl.classList.add("hidden");
  if (kind === "heat" && answer === false) heatProposalDeclinedThisSession = true;
  window.Backend.respondProgression(id, answer).then(function (result) {
    // Heat: a "yes" raises only MY OWN dial server-side (respond_progression)
    // — never a mutual-consent "unlocked" anymore, so this applies it
    // locally too (the realtime echo of my own resulting event is filtered
    // out as "my own", same guard against downgrading a stale proposal's
    // target that the server applies).
    if (kind === "heat" && answer === true && TIER_ORDER.indexOf(subject) > TIER_ORDER.indexOf(myTierDial)) {
      applyMyTierDialLocally(subject);
    } else if (kind === "tag" && result === "unlocked" && typeof playTagUnlockCeremony === "function") {
      playTagUnlockCeremony(subject);
    }
    return refreshCoupleProgression();
  }).catch(function () {
    // Low-stakes — if it didn't actually go through, the proposal simply
    // resurfaces on the next progression refresh.
  });
};

// ---- Locked/Unlocked sections (Personalize page) ----

function renderProgressionTagSections() {
  var section = document.getElementById("progressionSection");
  if (!section) return;
  if (!isSyncActive()) { section.classList.add("hidden"); return; }
  section.classList.remove("hidden");

  var advanced = getAdvancedTags();
  var unlockedSet = {};
  (coupleProgression.unlockedTags || []).forEach(function (t) { unlockedSet[t] = true; });
  var openProposalByTag = {};
  (coupleProgression.openProposals || []).forEach(function (p) {
    if (p.kind === "tag") openProposalByTag[p.subject] = p;
  });

  var unlocked = advanced.filter(function (t) { return unlockedSet[t]; });
  var locked = advanced.filter(function (t) { return !unlockedSet[t]; });

  var unlockedBlock = document.getElementById("progressionUnlockedBlock");
  var unlockedList = document.getElementById("progressionUnlockedList");
  if (unlocked.length) {
    unlockedBlock.classList.remove("hidden");
    unlockedList.innerHTML = unlocked.map(function (t) {
      return "<span class=\"progression-tag progression-tag-unlocked\">" + escapeHtml(t.replace(/-/g, " ")) + "</span>";
    }).join("");
  } else {
    unlockedBlock.classList.add("hidden");
  }

  var lockedBlock = document.getElementById("progressionLockedBlock");
  var lockedList = document.getElementById("progressionLockedList");
  if (locked.length) {
    lockedBlock.classList.remove("hidden");
    lockedList.innerHTML = "";
    locked.forEach(function (t) {
      var proposal = openProposalByTag[t];
      var row = document.createElement("div");
      row.className = "progression-locked-row";
      row.innerHTML =
        "<span class=\"progression-tag\">" + escapeHtml(t.replace(/-/g, " ")) + "</span>" +
        (proposal
          ? "<span class=\"progression-asked-badge\">asked 💌</span>"
          : "<button type=\"button\" class=\"progression-propose-btn\">Dare we try this? " +
            appIcon("dareWeTryThis", "propose-btn-icon", "", true) + "</button>");
      if (!proposal) {
        row.querySelector(".progression-propose-btn").onclick = (function (tag) {
          return function () { proposeTag(tag); };
        })(t);
      }
      lockedList.appendChild(row);
    });
  } else {
    lockedBlock.classList.add("hidden");
  }
}

// ---- Unlock ceremony ----
// Fires on the local device the instant its own respond call resolves
// to 'unlocked' (regardless of which page it's on), and on the
// partner's device via the realtime tag_unlocked game event — see
// handleGameEvent. Reuses the burn/fire sound language already
// established for card reveals.

var tagUnlockCeremonyTimer = null;

function playTagUnlockCeremony(tag) {
  var el = document.getElementById("tagUnlockCeremony");
  if (!el || !tag) return;
  var labelEl = document.getElementById("tagUnlockCeremonyLabel");
  var textEl = document.getElementById("tagUnlockCeremonyTag");
  if (labelEl) labelEl.innerText = "Unlocked";
  if (textEl) textEl.innerText = tag.replace(/-/g, " ");
  el.classList.remove("hidden");
  el.classList.remove("tag-unlock-ceremony-play", "ceremony-heat");
  void el.offsetWidth; // restart the CSS animation if it's already mid-play
  el.classList.add("tag-unlock-ceremony-play");
  if (typeof playSfx === "function") playSfx("sparkle");
  if (tagUnlockCeremonyTimer) clearTimeout(tagUnlockCeremonyTimer);
  tagUnlockCeremonyTimer = setTimeout(dismissTagUnlockCeremony, 3200);
}

// Heat-rise ceremony — an ember-glow pulse (the .ceremony-heat modifier
// on the same overlay) with the tier name igniting, echoing the card
// draw's ignition sound rather than the tag ceremony's softer sparkle.
// Purely visual — callers (setMyTierDial, applyRemoteHeatChanged) are
// responsible for updating dial state and tier UI *before* calling this,
// and only call it when the EFFECTIVE (played) heat actually rose, so a
// personal dial nudge that changes nothing stays quiet.
function playHeatRiseCeremony(tier) {
  var el = document.getElementById("tagUnlockCeremony");
  if (!el || !tier) return;

  var labelEl = document.getElementById("tagUnlockCeremonyLabel");
  var textEl = document.getElementById("tagUnlockCeremonyTag");
  if (labelEl) labelEl.innerText = "Heat Rising";
  if (textEl) textEl.innerText = tier.charAt(0).toUpperCase() + tier.slice(1);
  el.classList.remove("hidden");
  el.classList.remove("tag-unlock-ceremony-play", "ceremony-heat");
  void el.offsetWidth;
  el.classList.add("ceremony-heat");
  el.classList.add("tag-unlock-ceremony-play");
  if (typeof playSfx === "function") playSfx("draw");
  if (tagUnlockCeremonyTimer) clearTimeout(tagUnlockCeremonyTimer);
  tagUnlockCeremonyTimer = setTimeout(dismissTagUnlockCeremony, 3200);
}

function dismissTagUnlockCeremony() {
  var el = document.getElementById("tagUnlockCeremony");
  if (el) {
    el.classList.add("hidden");
    el.classList.remove("tag-unlock-ceremony-play", "ceremony-heat");
  }
  if (tagUnlockCeremonyTimer) { clearTimeout(tagUnlockCeremonyTimer); tagUnlockCeremonyTimer = null; }
}
window.dismissTagUnlockCeremony = dismissTagUnlockCeremony;

function applyRemoteTagUnlocked(ev) {
  var tag = (ev.payload || {}).tag;
  if (!tag) return;
  playTagUnlockCeremony(tag);
  refreshCoupleProgression();
}

// Own echoes are already filtered out upstream (handleGameEvent), so any
// heat_changed event reaching here is the partner's — updates only
// partnerTierDial, never myTierDial. Plays the ceremony only when this
// actually raises the EFFECTIVE (played) heat (both dials now reach a
// new shared tier) — if the partner is still catching up to a tier I'm
// already at, or has simply lowered their own dial, this stays quiet.
function applyRemoteHeatChanged(ev) {
  var tier = (ev.payload || {}).tier;
  if (!tier || TIER_ORDER.indexOf(tier) === -1) return;
  var before = getEffectiveHeatTier();
  partnerTierDial = tier;
  if (typeof refreshTierReadout === "function") refreshTierReadout();
  if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
  if (typeof updateTierSelectOptions === "function") updateTierSelectOptions();
  if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
  var after = getEffectiveHeatTier();
  if (TIER_ORDER.indexOf(after) > TIER_ORDER.indexOf(before)) {
    playHeatRiseCeremony(after);
  }
  refreshCoupleProgression();
}

// ---- Personalize page ----

async function initPersonalizePage() {
  await refreshAllPreferenceCaches();
  await refreshCoupleProgression();
  renderPersonalizeTagChips();
  renderPersonalizeList();
  window.setPersonalizeView(personalizeView);
  refreshTierSelectIcons();
}

function getPersonalizeTier() {
  var el = document.getElementById("personalizeTierSelect");
  return el ? el.value : "tease";
}

function getPersonalizeItems(tier) {
  return personalizeTab === "dare" ? gameData[tier].dares : gameData[tier].truths;
}

window.setPersonalizeTab = function (tab) {
  personalizeTab = tab;
  personalizeFilter = "all";
  personalizeTagFilter = [];
  document.getElementById("personalizeTabDares").classList.toggle("active", tab === "dare");
  document.getElementById("personalizeTabTruths").classList.toggle("active", tab === "truth");
  document.getElementById("personalizeTagFilters").classList.toggle("hidden", tab !== "dare");
  renderPersonalizeTagChips();
  renderPersonalizeList();
};

window.onPersonalizeTierChange = function () {
  renderPersonalizeTagChips();
  renderPersonalizeList();
};

function renderPersonalizeTagChips() {
  var container = document.getElementById("personalizeTagChips");
  if (!container) return;
  container.innerHTML = "";
  if (personalizeTab !== "dare") return;
  var tier = getPersonalizeTier();
  var tagSet = {};
  gameData[tier].dares.forEach(function (d) {
    (d.tags || []).forEach(function (t) { tagSet[t] = true; });
  });
  Object.keys(tagSet).sort().forEach(function (tag) {
    var chip = document.createElement("span");
    chip.className = "pos-chip";
    if (personalizeTagFilter.indexOf(tag) !== -1) chip.classList.add("active");
    chip.innerText = tag.replace(/-/g, " ");
    chip.onclick = (function (t) { return function () { togglePersonalizeTag(t); }; })(tag);
    container.appendChild(chip);
  });
}

window.togglePersonalizeTag = function (tag) {
  var idx = personalizeTagFilter.indexOf(tag);
  if (idx === -1) personalizeTagFilter.push(tag); else personalizeTagFilter.splice(idx, 1);
  renderPersonalizeTagChips();
  renderPersonalizeList();
};

window.clearPersonalizeTagFilters = function () {
  personalizeTagFilter = [];
  renderPersonalizeTagChips();
  renderPersonalizeList();
};

function renderPersonalizeList() {
  var tier = getPersonalizeTier();
  var itemType = personalizeTab;
  var items = getPersonalizeItems(tier);
  var ratings = itemRatings[itemType];
  var list = document.getElementById("personalizeList");
  if (!list) return;

  var counts = { all: items.length, unrated: 0, love: 0, no: 0 };
  items.forEach(function (it, i) {
    var r = ratings[tierItemId(tier, i)];
    if (!r) counts.unrated++;
    else if (r === "love") counts.love++;
    else if (r === "no") counts.no++;
  });
  document.getElementById("personalizeCountAll").innerText = counts.all;
  document.getElementById("personalizeCountUnrated").innerText = counts.unrated;
  document.getElementById("personalizeCountLove").innerText = counts.love;
  document.getElementById("personalizeCountNo").innerText = counts.no;

  document.querySelectorAll("#personalize .pos-browse-row").forEach(function (row) {
    row.classList.toggle("active", row.getAttribute("data-personalize-filter") === personalizeFilter);
  });

  list.innerHTML = "";
  var shown = 0;
  items.forEach(function (item, i) {
    var id = tierItemId(tier, i);
    var rating = ratings[id];
    if (personalizeFilter === "unrated" && rating) return;
    if (personalizeFilter === "love" && rating !== "love") return;
    if (personalizeFilter === "no" && rating !== "no") return;
    if (itemType === "dare" && personalizeTagFilter.length) {
      var tags = item.tags || [];
      var matchesAnyTag = personalizeTagFilter.some(function (t) { return tags.indexOf(t) !== -1; });
      if (!matchesAnyTag) return;
    }
    shown++;

    var row = document.createElement("div");
    row.className = "pos-list-item";
    var ratingTag = rating ? "<span class=\"pos-tag\">" + ratingEmoji(rating) + "</span>" : "";
    var tagsHtml = itemType === "dare"
      ? (item.tags || []).slice(0, 3).map(function (t) {
          return "<span class=\"pos-vibe-badge pos-vibe-playful\">" + t.replace(/-/g, " ") + "</span>";
        }).join("")
      : "";
    row.innerHTML =
      "<div class=\"pos-list-name\">" + item.text + "</div>" +
      "<div class=\"pos-list-meta\">" + tagsHtml + ratingTag + "</div>";
    row.onclick = (function (tierArg, index, itemArg) {
      return function () { openPersonalizeModal(tierArg, index, itemArg); };
    })(tier, i, item);
    list.appendChild(row);
  });
  if (shown === 0) {
    list.innerHTML = "<p style=\"color:rgba(255,245,247,0.4);text-align:center;padding:20px 0;\">No " +
      (itemType === "dare" ? "dares" : "truths") + " match this filter.</p>";
  }
}
window.renderPersonalizeList = renderPersonalizeList;

function openPersonalizeModal(tier, index, item) {
  activePersonalizeItem = { itemType: personalizeTab, tier: tier, index: index };
  document.getElementById("personalizeModalText").innerText = item.text;
  var tagsEl = document.getElementById("personalizeModalTags");
  tagsEl.innerHTML = personalizeTab === "dare"
    ? (item.tags || []).map(function (t) { return "<span class=\"pos-category-badge\">" + t.replace(/-/g, " ") + "</span>"; }).join("")
    : "";
  updatePersonalizeRatingButtons();
  document.getElementById("personalizeModal").classList.remove("hidden");
}

window.closePersonalizeModal = function () {
  document.getElementById("personalizeModal").classList.add("hidden");
  activePersonalizeItem = null;
  renderPersonalizeList();
};

function updatePersonalizeRatingButtons() {
  if (!activePersonalizeItem) return;
  var id = tierItemId(activePersonalizeItem.tier, activePersonalizeItem.index);
  var rating = itemRatings[activePersonalizeItem.itemType][id];
  document.querySelectorAll("#personalizeRatingButtons button").forEach(function (b) {
    b.classList.toggle("active-toggle", b.getAttribute("data-rating") === rating);
  });
}

window.setPersonalizeRating = function (rating) {
  if (!activePersonalizeItem) return;
  var itemType = activePersonalizeItem.itemType;
  var id = tierItemId(activePersonalizeItem.tier, activePersonalizeItem.index);
  itemRatings[itemType][id] = rating;
  updatePersonalizeRatingButtons();
  if (window.Backend) {
    window.Backend.saveRating(itemType, id, rating).then(function () {
      refreshItemMutualMatches(itemType);
    });
  }
};

window.setPersonalizeFilter = function (filter) {
  personalizeFilter = filter;
  renderPersonalizeList();
};

// ========================= //
// PERSONALIZE INSIGHTS      //
// ========================= //
// The mirror the couple's play data has been building all along — two
// lenses, and only two. This is a hard privacy architecture rule, not
// just a design choice:
//   "Me"  — the user's own picture, computed from their own ratings
//           only (itemRatings, which never holds the partner's values).
//   "Us"  — the couple's SHARED picture: mutual-match data (already
//           couple-level by construction — get_mutual_matches only ever
//           returns items both partners responded to, never one
//           partner's individual answer) and game_events (inherently
//           shared/public gameplay history, not preference data).
// No stat here may reveal, or allow deriving by subtraction, either
// partner's individual ratings — if it can't be shown without that
// risk, it isn't computed at all, let alone displayed.

var personalizeView = "insights"; // 'insights' | 'browse'
var insightsLens = "me";          // 'me' | 'us'
var insightsHideDetails = localStorage.getItem("insightsHideDetails") === "true";
var positionMutualMatches = {};   // item_id -> love boolean, mirrors itemMutualMatches' shape
var insightsEventsCache = [];
var insightsUsLoaded = false;
var INSIGHTS_EVENTS_FETCH_LIMIT = 3000; // a generous window for lifetime play-history stats, not just live state

function parseTierItemId(id) {
  var idx = id.lastIndexOf(":");
  return { tier: id.slice(0, idx), index: parseInt(id.slice(idx + 1), 10) };
}

// ---- Me: own ratings only ----

function computeRatingDistribution(itemType) {
  var out = { no: 0, maybe: 0, yes: 0, love: 0 };
  var types = itemType === "all" ? ["dare", "truth"] : [itemType];
  types.forEach(function (t) {
    var ratings = itemRatings[t] || {};
    Object.keys(ratings).forEach(function (id) {
      var r = ratings[id];
      if (out.hasOwnProperty(r)) out[r]++;
    });
  });
  out.total = out.no + out.maybe + out.yes + out.love;
  return out;
}

function computeTopLovedTags(limit) {
  var tally = {};
  var ratings = itemRatings.dare || {};
  Object.keys(ratings).forEach(function (id) {
    if (ratings[id] !== "love") return;
    var p = parseTierItemId(id);
    var item = gameData[p.tier] && gameData[p.tier].dares[p.index];
    if (!item) return;
    (item.tags || []).forEach(function (tag) { tally[tag] = (tally[tag] || 0) + 1; });
  });
  return Object.keys(tally)
    .map(function (tag) { return { tag: tag, count: tally[tag] }; })
    .sort(function (a, b) { return b.count - a.count || a.tag.localeCompare(b.tag); })
    .slice(0, limit || 5);
}

function computeTagsExploredCount() {
  var set = {};
  var ratings = itemRatings.dare || {};
  Object.keys(ratings).forEach(function (id) {
    var p = parseTierItemId(id);
    var item = gameData[p.tier] && gameData[p.tier].dares[p.index];
    if (!item) return;
    (item.tags || []).forEach(function (tag) { set[tag] = true; });
  });
  return Object.keys(set).length;
}

function insightsMeHasData() {
  return computeRatingDistribution("all").total > 0;
}

// ---- Us: mutual/shared data only ----
// itemMutualMatches.dare/.truth are already the couple-level mutual-match
// caches used elsewhere (love-glow on drawn cards) — reused here rather
// than fetched again. Positions have no equivalent cache yet, so this
// adds one, refreshed lazily (only when the Us lens is actually opened).

async function refreshPositionMutualMatches() {
  if (!isSyncActive() || !window.Backend) { positionMutualMatches = {}; return; }
  var matches = await window.Backend.getMutualMatches("position");
  var map = {};
  (matches || []).forEach(function (m) { map[m.item_id] = !!m.love; });
  positionMutualMatches = map;
}

async function refreshInsightsEventsCache() {
  if (!isSyncActive() || !window.GameSync) { insightsEventsCache = []; return; }
  insightsEventsCache = await window.GameSync.fetchRecent(INSIGHTS_EVENTS_FETCH_LIMIT);
}

// Ranked by mutual strength — a mutually-loved dare counts double a
// plain mutual match, since get_mutual_matches' own 'love' flag is
// already itself couple-level (bool_or across both partners), never one
// partner's individual answer.
function computeMutualTagRanking(limit) {
  var tally = {};
  var matches = itemMutualMatches.dare || {};
  Object.keys(matches).forEach(function (id) {
    var p = parseTierItemId(id);
    var item = gameData[p.tier] && gameData[p.tier].dares[p.index];
    if (!item) return;
    var weight = matches[id] ? 2 : 1;
    (item.tags || []).forEach(function (tag) { tally[tag] = (tally[tag] || 0) + weight; });
  });
  return Object.keys(tally)
    .map(function (tag) { return { tag: tag, score: tally[tag] }; })
    .sort(function (a, b) { return b.score - a.score || a.tag.localeCompare(b.tag); })
    .slice(0, limit || 6);
}

function computeWeBothWantTotals() {
  function totalsFor(map) {
    var keys = Object.keys(map || {});
    var love = keys.filter(function (id) { return map[id]; }).length;
    return { total: keys.length, love: love };
  }
  return {
    dare: totalsFor(itemMutualMatches.dare),
    truth: totalsFor(itemMutualMatches.truth),
    position: totalsFor(positionMutualMatches)
  };
}

function computeUnlockedTagsTimeline() {
  return insightsEventsCache
    .filter(function (e) { return e.event_type === "tag_unlocked" && (e.payload || {}).tag; })
    .map(function (e) { return { tag: e.payload.tag, date: e.created_at }; })
    .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
}

function computePlayHistoryStats() {
  var dares = 0, truths = 0, wheel = 0, powerCardsTotal = 0;
  insightsEventsCache.forEach(function (e) {
    var p = e.payload || {};
    if (e.event_type === "points_awarded") {
      if (p.source === "wheel") wheel++; else dares++;
    } else if (e.event_type === "truth_judged") {
      truths++;
    } else if (e.event_type === "card_skipped") {
      if (p.mode === "truth") truths++; else if (p.mode === "dare") dares++;
    } else if (e.event_type === "card_played") {
      powerCardsTotal++;
    }
  });
  var scores = computeScoresFromEvents(insightsEventsCache);
  return {
    daresResolved: dares, truthsResolved: truths, wheelResolved: wheel,
    roundsTogether: dares + truths + wheel,
    pointsMine: scores.mine, pointsPartner: scores.partner,
    powerCardsTotal: powerCardsTotal,
    sessions: countDistinctSessions(insightsEventsCache)
  };
}

function insightsUsHasData() {
  if (!isSyncActive()) return false;
  var totals = computeWeBothWantTotals();
  var mutualTotal = totals.dare.total + totals.truth.total + totals.position.total;
  return mutualTotal > 0 || computeUnlockedTagsTimeline().length > 0 || computePlayHistoryStats().roundsTogether > 0;
}

// ---- View/lens plumbing ----

window.setPersonalizeView = function (view) {
  personalizeView = view;
  var insightsEl = document.getElementById("personalizeInsightsSection");
  var browseEl = document.getElementById("personalizeBrowseSection");
  if (insightsEl) insightsEl.classList.toggle("hidden", view !== "insights");
  if (browseEl) browseEl.classList.toggle("hidden", view !== "browse");
  var tabInsights = document.getElementById("personalizeViewTabInsights");
  var tabBrowse = document.getElementById("personalizeViewTabBrowse");
  if (tabInsights) tabInsights.classList.toggle("active", view === "insights");
  if (tabBrowse) tabBrowse.classList.toggle("active", view === "browse");
  if (view === "insights") refreshInsightsActiveLens();
};

window.setInsightsLens = function (lens) {
  insightsLens = lens;
  var meEl = document.getElementById("insightsMePanel");
  var usEl = document.getElementById("insightsUsPanel");
  if (meEl) meEl.classList.toggle("hidden", lens !== "me");
  if (usEl) usEl.classList.toggle("hidden", lens !== "us");
  var tabMe = document.getElementById("insightsLensTabMe");
  var tabUs = document.getElementById("insightsLensTabUs");
  if (tabMe) tabMe.classList.toggle("active", lens === "me");
  if (tabUs) tabUs.classList.toggle("active", lens === "us");
  refreshInsightsActiveLens();
};

function refreshInsightsActiveLens() {
  if (personalizeView !== "insights") return;
  if (insightsLens === "me") {
    renderInsightsMe();
  } else {
    renderInsightsUs();
    if (isSyncActive()) {
      Promise.all([refreshPositionMutualMatches(), refreshInsightsEventsCache()]).then(function () {
        insightsUsLoaded = true;
        renderInsightsUs();
      });
    }
  }
}

window.toggleInsightsHideDetails = function () {
  insightsHideDetails = !insightsHideDetails;
  localStorage.setItem("insightsHideDetails", insightsHideDetails ? "true" : "false");
  renderInsightsUs();
};

function insightsTagLabel(tag, index) {
  return insightsHideDetails ? ("Tag #" + (index + 1)) : tag.replace(/-/g, " ");
}

function renderInsightsMe() {
  var el = document.getElementById("insightsMePanel");
  if (!el) return;

  if (!insightsMeHasData()) {
    el.innerHTML =
      '<div class="insights-private-badge">🔒 Only you see this</div>' +
      '<div class="insights-empty">' +
        '<div class="insights-empty-icon">✨</div>' +
        '<p class="insights-empty-text">Rate a few truths and dares in Browse to start building your picture.</p>' +
      "</div>";
    return;
  }

  var dist = computeRatingDistribution("all");
  var max = Math.max(dist.no, dist.maybe, dist.yes, dist.love, 1);
  var rows = [
    { key: "love", label: "💕 Love", cls: "insights-bar-love" },
    { key: "yes", label: "👍 Yes", cls: "insights-bar-yes" },
    { key: "maybe", label: "🤔 Maybe", cls: "insights-bar-maybe" },
    { key: "no", label: "🚫 No", cls: "insights-bar-no" }
  ];
  var barsHtml = rows.map(function (r) {
    var pct = Math.round((dist[r.key] / max) * 100);
    return '<div class="insights-bar-row">' +
      '<span class="insights-bar-label">' + r.label + "</span>" +
      '<div class="insights-bar-track"><div class="insights-bar-fill ' + r.cls + '" style="width:' + pct + '%"></div></div>' +
      '<span class="insights-bar-count">' + dist[r.key] + "</span>" +
      "</div>";
  }).join("");

  var topTags = computeTopLovedTags(5);
  var tagsHtml = topTags.length
    ? '<div class="insights-tag-rank-list">' + topTags.map(function (t, i) {
        return '<div class="insights-tag-rank-row">' +
          '<span class="insights-tag-rank-num">' + (i + 1) + "</span>" +
          '<span class="insights-tag-rank-name">' + escapeHtml(t.tag.replace(/-/g, " ")) + "</span>" +
          '<span class="insights-tag-rank-count">' + t.count + " 💕</span>" +
          "</div>";
      }).join("") + "</div>"
    : '<p class="insights-inline-empty">Love a few dares to see your top tags here.</p>';

  el.innerHTML =
    '<div class="insights-private-badge">🔒 Only you see this</div>' +
    '<div class="pos-section-title">Your Rating Breakdown</div>' +
    '<div class="insights-bar-list">' + barsHtml + "</div>" +
    '<div class="pos-section-title">Your Top Tags</div>' +
    tagsHtml +
    '<div class="pos-section-title">Your Journey</div>' +
    '<div class="insights-stat-grid">' +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Rated</div><div class="insights-stat-value">' + dist.total + "</div></div>" +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Tags Explored</div><div class="insights-stat-value">' + computeTagsExploredCount() + "</div></div>" +
    "</div>";
}

function renderInsightsUs() {
  var el = document.getElementById("insightsUsPanel");
  if (!el) return;

  if (!isSyncActive()) {
    el.innerHTML =
      '<div class="insights-empty">' +
        '<div class="insights-empty-icon">💞</div>' +
        '<p class="insights-empty-text">Link with your partner to start building your shared story.</p>' +
      "</div>";
    return;
  }

  if (!insightsUsLoaded) {
    el.innerHTML =
      '<div class="insights-celebratory-badge">💞 Your story so far</div>' +
      '<div class="insights-empty"><p class="insights-empty-text">Loading your story…</p></div>';
    return;
  }

  if (!insightsUsHasData()) {
    el.innerHTML =
      '<div class="insights-celebratory-badge">💞 Your story so far</div>' +
      '<div class="insights-empty">' +
        '<div class="insights-empty-icon">🌙</div>' +
        '<p class="insights-empty-text">Play a few rounds together to reveal your shared story here.</p>' +
      "</div>";
    return;
  }

  var tagRanking = computeMutualTagRanking(6);
  var tagsHtml = tagRanking.length
    ? '<div class="insights-tag-rank-list">' + tagRanking.map(function (t, i) {
        return '<div class="insights-tag-rank-row">' +
          '<span class="insights-tag-rank-num">' + (i + 1) + "</span>" +
          '<span class="insights-tag-rank-name">' + escapeHtml(insightsTagLabel(t.tag, i)) + "</span>" +
          '<span class="insights-tag-rank-count">' + t.score + "</span>" +
          "</div>";
      }).join("") + "</div>"
    : '<p class="insights-inline-empty">Rate a few dares together to see the tags you both love.</p>';

  var totals = computeWeBothWantTotals();
  function wantTile(label, t) {
    return '<div class="insights-stat-tile">' +
      '<div class="insights-stat-label">' + label + "</div>" +
      '<div class="insights-stat-value">' + t.total + "</div>" +
      (t.love ? '<div class="insights-stat-sub">' + t.love + " loved 💕</div>" : "") +
      "</div>";
  }

  var timeline = computeUnlockedTagsTimeline();
  var timelineHtml = timeline.length
    ? '<div class="insights-timeline">' + timeline.map(function (t, i) {
        var dateStr = new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        return '<div class="insights-timeline-row">' +
          '<span class="insights-timeline-date">' + dateStr + "</span>" +
          '<span class="insights-timeline-tag">' + escapeHtml(insightsTagLabel(t.tag, i)) + "</span>" +
          "</div>";
      }).join("") + "</div>"
    : '<p class="insights-inline-empty">Unlock a tag together to start your timeline.</p>';

  var history = computePlayHistoryStats();
  var partnerName = escapeHtml(gameSyncPartnerName || "Partner");
  var myName = escapeHtml(gameSyncMyName || "You");

  el.innerHTML =
    '<div class="insights-us-header">' +
      '<div class="insights-celebratory-badge">💞 Your story so far</div>' +
      '<button type="button" class="insights-hide-toggle' + (insightsHideDetails ? " active" : "") + '" onclick="toggleInsightsHideDetails()">' +
        (insightsHideDetails ? "Show details" : "Hide details") +
      "</button>" +
    "</div>" +
    '<div class="pos-section-title">Tags You Both Love</div>' +
    tagsHtml +
    '<div class="pos-section-title">We Both Want This</div>' +
    '<div class="insights-stat-grid insights-stat-grid-3">' +
      wantTile("Dares", totals.dare) + wantTile("Truths", totals.truth) + wantTile("Positions", totals.position) +
    "</div>" +
    '<div class="pos-section-title">Unlocked Together</div>' +
    timelineHtml +
    '<div class="pos-section-title">Play History</div>' +
    '<div class="insights-stat-grid">' +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Rounds Together</div><div class="insights-stat-value">' + history.roundsTogether + "</div></div>" +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Dares vs Truths</div><div class="insights-stat-value insights-stat-value-small">' + history.daresResolved + " / " + history.truthsResolved + "</div></div>" +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Sessions</div><div class="insights-stat-value">' + history.sessions + "</div></div>" +
      '<div class="insights-stat-tile"><div class="insights-stat-label">Power Cards Played</div><div class="insights-stat-value">' + history.powerCardsTotal + "</div></div>" +
    "</div>" +
    '<div class="insights-points-row">' +
      '<span>' + myName + ": " + history.pointsMine + " 🔥</span>" +
      '<span>' + partnerName + ": " + history.pointsPartner + " 🔥</span>" +
    "</div>";
}

// ========================= //
// IN-GAME CARD RATING       //
// ========================= //
// A private, dismissible "How was this one?" prompt shown on each
// player's own device once a card is resolved (dare scored / truth
// judged) — in both solo and synced Truth or Dare. It only ever calls
// Backend.saveRating, exactly like the Personalize page; it's never
// broadcast as a game event, so the partner never sees it.

var inGameRatingMeta = null; // { itemType, tier, cardIndex }

function showInGameRatingStrip(itemType, tier, cardIndex) {
  var strip = document.getElementById("inGameRatingStrip");
  if (!strip || (itemType !== "truth" && itemType !== "dare") || tier == null || cardIndex == null) return;
  inGameRatingMeta = { itemType: itemType, tier: tier, cardIndex: cardIndex };
  var id = tierItemId(tier, cardIndex);
  var existingRating = itemRatings[itemType][id];
  document.querySelectorAll("#inGameRatingButtons button").forEach(function (b) {
    b.classList.toggle("active-toggle", b.getAttribute("data-rating") === existingRating);
  });
  strip.classList.remove("hidden");
}

function hideInGameRatingStrip() {
  var strip = document.getElementById("inGameRatingStrip");
  if (strip) strip.classList.add("hidden");
  inGameRatingMeta = null;
}

window.dismissInGameRating = function () {
  hideInGameRatingStrip();
};

window.setInGameRating = function (rating) {
  if (!inGameRatingMeta) return;
  var itemType = inGameRatingMeta.itemType;
  var id = tierItemId(inGameRatingMeta.tier, inGameRatingMeta.cardIndex);
  itemRatings[itemType][id] = rating;
  document.querySelectorAll("#inGameRatingButtons button").forEach(function (b) {
    b.classList.toggle("active-toggle", b.getAttribute("data-rating") === rating);
  });
  if (window.Backend) {
    window.Backend.saveRating(itemType, id, rating).then(function () {
      refreshItemMutualMatches(itemType);
    });
  }
};

window.showOnboarding = function () {
  document.getElementById("onboarding").classList.remove("hidden");
};

// Defaults to 'adaptive' per spec ("Default highlight on Adaptive"); set
// from the current myHeatMode instead whenever the onboarding overlay is
// re-opened for name edits (see updateNames), so a returning player sees
// their actual current choice rather than being reset to the default.
var onboardingHeatModeChoice = "adaptive";

window.selectOnboardingHeatMode = function (mode) {
  onboardingHeatModeChoice = mode;
  var adaptiveCard = document.getElementById("onboardingHeatModeAdaptive");
  var manualCard = document.getElementById("onboardingHeatModeManual");
  if (adaptiveCard) adaptiveCard.classList.toggle("heat-mode-card-selected", mode === "adaptive");
  if (manualCard) manualCard.classList.toggle("heat-mode-card-selected", mode === "manual");
};

window.submitOnboarding = function () {
  let p1 = document.getElementById("p1Input").value.trim();
  let p2 = document.getElementById("p2Input").value.trim();
  if (!p1) { document.getElementById("p1Input").focus(); return; }
  if (!p2) { document.getElementById("p2Input").focus(); return; }
  player1Name = p1;
  player2Name = p2;
  localStorage.setItem("player1Name", player1Name);
  localStorage.setItem("player2Name", player2Name);

  myHeatMode = onboardingHeatModeChoice;
  localStorage.setItem("heatMode", myHeatMode);
  if (window.Backend && window.Backend.isLoggedIn()) {
    window.Backend.setHeatMode(myHeatMode).catch(function () {
      // Low-stakes — the local choice still applies this session; the
      // Account page toggle can retry the save later.
    });
  }
  if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();

  document.getElementById("onboarding").classList.add("hidden");
  updateNameDisplays();
  updateTurnDisplay();
};

window.updateNames = function () {
  document.getElementById("p1Input").value = localStorage.getItem("player1Name") || "";
  document.getElementById("p2Input").value = localStorage.getItem("player2Name") || "";
  window.selectOnboardingHeatMode(myHeatMode === "adaptive" ? "adaptive" : "manual");
  document.getElementById("menu").classList.remove("menu-open");
  document.getElementById("onboarding").classList.remove("hidden");
};

window.addEventListener("load", function () {
  updateScoreDisplay();
  updateNameDisplays();
  updateDrinkModeUI();
  refreshTierSelectIcons();
  refreshTruthTierDropdownSelection();
  if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
  if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();
  if (typeof refreshTierReadout === "function") refreshTierReadout();
  if (typeof updateSoundMuteUI === "function") updateSoundMuteUI();
  if (typeof recordHomeVisit === "function") recordHomeVisit();
  if (typeof renderHomeHero === "function") renderHomeHero();
  if (typeof maybeShowInstallNudge === "function") maybeShowInstallNudge();
  if (localStorage.getItem("menuOpened") !== "true") {
    var menuBtn = document.querySelector(".menu-btn");
    if (menuBtn) menuBtn.classList.add("menu-discovery");
  }
  if (localStorage.getItem("player1Name") && localStorage.getItem("player2Name")) {
    document.getElementById("onboarding").classList.add("hidden");
  }
  updateTurnDisplay();
  let card = document.getElementById("todCard");
  if (card) {
    card.addEventListener("click", function () {
      this.classList.toggle("flipped");
    });
  }
  document.getElementById("p1Input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("p2Input").focus();
  });
  document.getElementById("p2Input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") window.submitOnboarding();
  });
});

// ========================= //
// AUTH & COUPLE LINKING     //
// ========================= //

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str === null || str === undefined ? "" : String(str);
  return div.innerHTML;
}

window.setAuthTab = function (tab) {
  var signinTab = document.getElementById("authTabSignin");
  var signupTab = document.getElementById("authTabSignup");
  var signinForm = document.getElementById("signinForm");
  var signupForm = document.getElementById("signupForm");
  if (signinTab) signinTab.classList.toggle("active", tab === "signin");
  if (signupTab) signupTab.classList.toggle("active", tab === "signup");
  if (signinForm) signinForm.classList.toggle("hidden", tab !== "signin");
  if (signupForm) signupForm.classList.toggle("hidden", tab !== "signup");
};

window.handleSignIn = async function () {
  var email = document.getElementById("signinEmail").value.trim();
  var password = document.getElementById("signinPassword").value;
  var errEl = document.getElementById("signinError");
  errEl.classList.remove("success");
  errEl.innerText = "";
  if (!email || !password) { errEl.innerText = "Enter your email and password."; return; }
  try {
    await window.Backend.signIn(email, password);
    renderAccountPage();
  } catch (e) {
    errEl.innerText = e.message;
  }
};

window.handleSignUp = async function () {
  var name = document.getElementById("signupName").value.trim();
  var email = document.getElementById("signupEmail").value.trim();
  var password = document.getElementById("signupPassword").value;
  var errEl = document.getElementById("signupError");
  errEl.innerText = "";
  if (!name) { errEl.innerText = "Tell us what to call you."; return; }
  if (!email || !password) { errEl.innerText = "Enter your email and password."; return; }
  try {
    await window.Backend.signUp(email, password, name, myHeatMode);
    renderAccountPage();
    if (!window.Backend.isInCouple()) {
      openCoupleChoiceModal();
    }
  } catch (e) {
    errEl.innerText = e.message;
  }
};

window.handleForgotPassword = async function () {
  var errEl = document.getElementById("signinError");
  var email = document.getElementById("signinEmail").value.trim();
  errEl.classList.remove("success");
  if (!email) {
    errEl.innerText = 'Enter your email above, then tap "Forgot password?" again.';
    return;
  }
  errEl.innerText = "";
  try {
    await window.Backend.resetPassword(email);
    errEl.classList.add("success");
    errEl.innerText = "Check your email for a password reset link.";
  } catch (e) {
    errEl.innerText = e.message;
  }
};

window.handleSetNewPassword = async function () {
  var password = document.getElementById("recoveryPassword").value;
  var errEl = document.getElementById("recoveryError");
  errEl.innerText = "";
  if (!password || password.length < 6) { errEl.innerText = "Password must be at least 6 characters."; return; }
  try {
    await window.Backend.setNewPassword(password);
    document.getElementById("recoveryPassword").value = "";
    renderAccountPage();
  } catch (e) {
    errEl.innerText = e.message;
  }
};

window.handleSaveDisplayName = async function () {
  var name = document.getElementById("acctDisplayName").value.trim();
  var msgEl = document.getElementById("acctProfileMsg");
  msgEl.classList.remove("success");
  msgEl.innerText = "";
  if (!name) { msgEl.innerText = "Enter a display name."; return; }
  try {
    await window.Backend.updateDisplayName(name);
    msgEl.classList.add("success");
    msgEl.innerText = "Saved!";
  } catch (e) {
    msgEl.innerText = e.message;
  }
};

window.handleSignOut = async function () {
  await window.Backend.signOut();
  renderAccountPage();
};

window.handleAccountCreateCouple = async function () {
  var errEl = document.getElementById("acctCoupleError");
  try {
    await window.Backend.createCouple();
    renderAccountCoupleArea();
  } catch (e) {
    if (errEl) errEl.innerText = e.message;
  }
};

window.handleAccountJoinCouple = async function () {
  var input = document.getElementById("acctJoinCode");
  var errEl = document.getElementById("acctCoupleError");
  var code = input ? input.value.trim() : "";
  if (errEl) errEl.innerText = "";
  if (!code) { if (errEl) errEl.innerText = "Enter your partner's code."; return; }
  try {
    await window.Backend.joinCouple(code);
    renderAccountCoupleArea();
  } catch (e) {
    if (errEl) errEl.innerText = e.message;
  }
};

window.handleLeaveCouple = async function () {
  if (!window.confirm("Leave this couple? You'll stop seeing mutual matches until you link again.")) return;
  try {
    await window.Backend.leaveCouple();
    renderAccountCoupleArea();
  } catch (e) {
    alert(e.message);
  }
};

// ---- Post-signup two-choice couple prompt ----

function openCoupleChoiceModal() {
  document.getElementById("coupleChoiceButtons").classList.remove("hidden");
  document.getElementById("coupleChoiceJoinForm").classList.add("hidden");
  document.getElementById("coupleChoiceCreateResult").classList.add("hidden");
  document.getElementById("coupleChoiceSkip").classList.remove("hidden");
  var errEl = document.getElementById("coupleChoiceError");
  if (errEl) errEl.innerText = "";
  var codeInput = document.getElementById("choiceJoinCode");
  if (codeInput) codeInput.value = "";
  document.getElementById("coupleChoiceModal").classList.remove("hidden");
}

function closeCoupleChoiceModal() {
  document.getElementById("coupleChoiceModal").classList.add("hidden");
}

window.handleChoiceCreate = async function () {
  var errEl = document.getElementById("coupleChoiceError");
  if (errEl) errEl.innerText = "";
  try {
    var code = await window.Backend.createCouple();
    document.getElementById("coupleChoiceButtons").classList.add("hidden");
    document.getElementById("coupleChoiceJoinForm").classList.add("hidden");
    document.getElementById("choiceInviteCode").innerText = code;
    document.getElementById("coupleChoiceCreateResult").classList.remove("hidden");
    document.getElementById("coupleChoiceSkip").classList.add("hidden");
  } catch (e) {
    if (errEl) errEl.innerText = e.message;
  }
};

window.handleChoiceShowJoin = function () {
  document.getElementById("coupleChoiceButtons").classList.add("hidden");
  document.getElementById("coupleChoiceJoinForm").classList.remove("hidden");
};

window.handleChoiceBack = function () {
  document.getElementById("coupleChoiceJoinForm").classList.add("hidden");
  document.getElementById("coupleChoiceButtons").classList.remove("hidden");
  var errEl = document.getElementById("coupleChoiceError");
  if (errEl) errEl.innerText = "";
};

window.handleChoiceJoinSubmit = async function () {
  var input = document.getElementById("choiceJoinCode");
  var code = input.value.trim();
  var errEl = document.getElementById("coupleChoiceError");
  errEl.innerText = "";
  if (!code) { errEl.innerText = "Enter your partner's code."; return; }
  try {
    await window.Backend.joinCouple(code);
    closeCoupleChoiceModal();
    renderAccountPage();
  } catch (e) {
    errEl.innerText = e.message;
  }
};

window.handleChoiceDone = function () {
  closeCoupleChoiceModal();
  renderAccountPage();
};

window.handleChoiceSkip = function () {
  closeCoupleChoiceModal();
};

// ---- Account page rendering ----

async function renderAccountProfile() {
  var input = document.getElementById("acctDisplayName");
  if (!input || !window.Backend) return;
  var profile = await window.Backend.getProfile();
  input.value = (profile && profile.display_name) || "";
}

function renderAccountCoupleArea() {
  var area = document.getElementById("acctCoupleArea");
  if (!area || !window.Backend) return;
  var couple = window.Backend.getMyCouple();
  if (!couple) {
    area.innerHTML =
      '<p class="auth-sub">Link up with your partner to sync ratings and see mutual matches.</p>' +
      '<button onclick="handleAccountCreateCouple()">Start a New Couple</button>' +
      '<div class="auth-divider"><span>or</span></div>' +
      '<div class="onboarding-field">' +
        '<label for="acctJoinCode">Partner\'s Code</label>' +
        '<input id="acctJoinCode" type="text" placeholder="e.g. A1B2C3D4" maxlength="8" autocomplete="off" style="text-transform:uppercase;">' +
      "</div>" +
      '<button onclick="handleAccountJoinCouple()">Join With Code</button>' +
      '<p id="acctCoupleError" class="auth-error"></p>';
  } else if (!couple.partnerName) {
    area.innerHTML =
      '<div class="invite-code-display">' +
        '<div class="invite-code-label">Share this code</div>' +
        '<div class="invite-code-value">' + escapeHtml(couple.inviteCode) + "</div>" +
        '<p class="auth-sub small">Waiting for your partner to join…</p>' +
      "</div>";
  } else {
    // Heat mode used to live here as a couple-level toggle; it's now a
    // per-user preference (see renderAccountHeatMode, in the Your
    // Profile section above) so each partner sets their own.
    area.innerHTML =
      '<p class="auth-sub">Linked with <strong>' + escapeHtml(couple.partnerName) + '</strong> 💞</p>' +
      '<button onclick="handleLeaveCouple()" class="auth-secondary-btn">Leave Couple</button>';
  }
}

// Per-user — only affects how MY OWN tier moves; my partner keeps
// whatever mode they've chosen independently (see Part C: mode is a
// private preference with no effect on the other partner). Available to
// any logged-in user, couple-linked or not.
function renderAccountHeatMode() {
  var manualBtn = document.getElementById("acctHeatModeManualBtn");
  var adaptiveBtn = document.getElementById("acctHeatModeAdaptiveBtn");
  var desc = document.getElementById("acctHeatModeDesc");
  if (!manualBtn || !adaptiveBtn) return;
  var mode = myHeatMode || "manual";
  manualBtn.classList.toggle("active", mode === "manual");
  adaptiveBtn.classList.toggle("active", mode === "adaptive");
  if (desc) {
    desc.innerText = mode === "adaptive"
      ? "The game paces your own tier to how tonight is going, and still only ever asks — never moves it on its own."
      : "Pick your own heat anytime — nothing moves until you say so.";
  }
}

function handleSetHeatMode(mode) {
  if (!window.Backend || !window.Backend.isLoggedIn()) return;
  var err = document.getElementById("acctHeatModeError");
  if (err) err.innerText = "";
  window.Backend.setHeatMode(mode)
    .then(function () {
      myHeatMode = mode;
      localStorage.setItem("heatMode", mode);
      renderAccountHeatMode();
      if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();
      if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
    })
    .catch(function (e) {
      var errEl = document.getElementById("acctHeatModeError");
      if (errEl) errEl.innerText = (e && e.message) || "Couldn't update heat mode. Please try again.";
    });
}
window.handleSetHeatMode = handleSetHeatMode;

function renderAccountPage() {
  var recoveryArea = document.getElementById("acctRecoveryArea");
  var authArea = document.getElementById("acctAuthArea");
  var profileArea = document.getElementById("acctProfileArea");
  if (!recoveryArea || !authArea || !profileArea || !window.Backend) return;

  if (window.Backend.isRecoveryMode()) {
    recoveryArea.classList.remove("hidden");
    authArea.classList.add("hidden");
    profileArea.classList.add("hidden");
    return;
  }
  recoveryArea.classList.add("hidden");

  if (window.Backend.isLoggedIn()) {
    authArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
    renderAccountProfile();
    renderAccountHeatMode();
    renderAccountCoupleArea();
    if (isSyncActive()) {
      refreshCoupleProgression().then(function () { renderAccountCoupleArea(); });
    }
  } else {
    authArea.classList.remove("hidden");
    profileArea.classList.add("hidden");
  }
}
window.renderAccountPage = renderAccountPage;

function handleBackendChange() {
  if (typeof syncPositionRatingsFromServer === "function") syncPositionRatingsFromServer();
  if (typeof handleGameBackendChange === "function") handleGameBackendChange();
  if (window.Backend.isRecoveryMode()) {
    window.showPage("account");
    return;
  }
  var acct = document.getElementById("account");
  if (acct && acct.classList.contains("active")) renderAccountPage();
}

window.addEventListener("load", function () {
  if (!window.Backend || !window.Backend.isAvailable()) return;
  window.Backend.onChange(handleBackendChange);
  window.Backend.init();
  if (window.GameSync) window.GameSync.onConnectionChange(updateConnIndicators);
});

// ========================= //
// GAME SYNC — SHARED        //
// ========================= //
// Realtime layer shared by Truth or Dare and Spin Wheel. Only ever
// active for logged-in, couple-linked users — everyone else keeps the
// exact original single-device behavior, untouched, below.

var gameSyncUnsubscribe = null;
var gameSyncPage = null; // 'truth' | 'wheel' | null — which page(s) want the subscription
var gameSyncMyName = "You";
var gameSyncPartnerName = "";
var syncScores = { mine: 0, partner: 0 };
var syncTruthRound = null; // { roundId, tier, mode, cardIndex, performerId, myRole }
var syncWheelRound = null; // { roundId, tier, segmentIndex, tag, cardKind, cardIndex, positionId, performerId, myRole }
var wheelPendingForcedCard = null;

function isSyncActive() {
  return !!(window.GameSync && window.GameSync.isActive());
}

function gameSyncMyId() {
  return window.GameSync ? window.GameSync.getMyUserId() : null;
}

function gameSyncPartnerId() {
  return window.GameSync && window.GameSync.getPartnerId ? window.GameSync.getPartnerId() : null;
}

function genRoundId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Also keeps cardBalance (the separate spendable-currency economy — see
// computeCardBalanceFromEvents) current as points come in live, not just
// on a full rebuild — every points-affecting event already funnels
// through this one function, local or remote, so Buy button affordability
// unlocks the instant a player's balance crosses a card's cost, mid-round.
function applySyncScoreDelta(userId, delta) {
  if (!userId || !delta) return;
  if (userId === gameSyncMyId()) {
    syncScores.mine = Math.max(0, syncScores.mine + delta);
    cardBalance.mine = Math.max(0, cardBalance.mine + delta);
    renderCardShop();
  } else {
    syncScores.partner = Math.max(0, syncScores.partner + delta);
    cardBalance.partner = Math.max(0, cardBalance.partner + delta);
  }
  updateScoreDisplay();
  updateWheelScoreDisplay();
}

function showSyncOutcome(elId, isGood) {
  var el = document.getElementById(elId);
  if (!el) return;
  var cls = isGood ? "sync-celebrate" : "sync-fail";
  el.classList.remove("sync-celebrate", "sync-fail");
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function () { el.classList.remove(cls); }, 1400);
}

// ---- subscription lifecycle, tied to whichever of the two pages is active ----

function setGameSyncPage(pageId) {
  gameSyncPage = (pageId === "truth" || pageId === "wheel") ? pageId : null;
  reconcileGameSyncSubscription();
}

function reconcileGameSyncSubscription() {
  var shouldBeSubscribed = !!gameSyncPage && isSyncActive();
  if (shouldBeSubscribed && !gameSyncUnsubscribe) {
    gameSyncUnsubscribe = window.GameSync.subscribe(handleGameEvent);
    rebuildGameStateFromServer();
  } else if (!shouldBeSubscribed && gameSyncUnsubscribe) {
    gameSyncUnsubscribe();
    gameSyncUnsubscribe = null;
    resetSyncRoundsUI();
  }
  updateConnIndicators();
  applySyncVisibility();
}

function resetSyncRoundsUI() {
  endSyncTruthRound();
  resetWheelSyncUI();
  syncScores = { mine: 0, partner: 0 };
  cardBalance = { mine: 0, partner: 0 };
  myHand = {};
  if (typeof renderCardShop === "function") renderCardShop();
  if (typeof renderHandTray === "function") renderHandTray();
  if (typeof hideBurnOverlay === "function") hideBurnOverlay();
}

function updateConnIndicators() {
  var status = window.GameSync ? window.GameSync.getConnectionStatus() : "solo";
  var linked = isSyncActive();
  ["truthConnIndicator", "wheelConnIndicator"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!linked) { el.classList.add("hidden"); return; }
    el.classList.remove("hidden");
    if (status === "synced") {
      el.classList.add("conn-synced");
      el.classList.remove("conn-solo");
      el.innerText = "🟢 Synced with " + (gameSyncPartnerName || "your partner");
    } else {
      el.classList.add("conn-solo");
      el.classList.remove("conn-synced");
      el.innerText = "🟡 Playing solo";
    }
  });
}

function applySyncVisibility() {
  var synced = isSyncActive();
  if (!synced) {
    var lbl = document.getElementById("drawnByLabel");
    if (lbl) lbl.classList.add("hidden");
    var wlbl = document.getElementById("wheelSpunByLabel");
    if (wlbl) wlbl.classList.add("hidden");
  }
  var turnEl = document.getElementById("turnDisplay");
  if (turnEl && synced) turnEl.innerText = "Either of you can go 🎲";
  else if (turnEl) updateTurnDisplay();
  var wheelTurnEl = document.getElementById("wheelTurnDisplay");
  if (wheelTurnEl && synced) wheelTurnEl.innerText = "Either partner can spin";
  else if (wheelTurnEl) updateWheelTurnDisplay();
  updateScoreDisplay();
  updateWheelScoreDisplay();
  if (typeof updateCardMenuVisibility === "function") updateCardMenuVisibility();
}

// Points row — plain names and numbers with the same rose-gold middot
// separator as the tier readout, not a flame-emoji scoreboard.
function updateWheelScoreDisplay() {
  var el = document.getElementById("wheelScoreDisplay");
  if (!el) return;
  if (!isSyncActive()) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  el.innerHTML =
    "<span>" + escapeHtml(gameSyncMyName || "You") + ": " + syncScores.mine + "</span>" +
    '<span class="tier-readout-sep">&middot;</span>' +
    "<span>" + escapeHtml(gameSyncPartnerName || "Partner") + ": " + syncScores.partner + "</span>";
}

function handleGameBackendChange() {
  gameSyncPartnerName = (window.GameSync && window.GameSync.getPartnerName()) || "";
  if (window.Backend && window.Backend.isLoggedIn()) {
    window.Backend.getProfile().then(function (p) {
      gameSyncMyName = (p && p.display_name) || "You";
      myHeatMode = (p && p.heat_mode) || "manual";
      applySyncVisibility();
      if (typeof renderHomeHero === "function") renderHomeHero();
      if (typeof refreshTruthTierModeUI === "function") refreshTruthTierModeUI();
    });
    var partnerId = gameSyncPartnerId();
    if (partnerId) {
      window.Backend.getProfile(partnerId).then(function (p) {
        partnerHeatMode = (p && p.heat_mode) || "manual";
        if (typeof refreshTierReadout === "function") refreshTierReadout();
      });
    }
  } else {
    gameSyncMyName = "You";
    myHeatMode = "manual";
    partnerHeatMode = "manual";
  }
  reconcileGameSyncSubscription();
  if (typeof updateMatchedOnlyUI === "function") updateMatchedOnlyUI();
  if (typeof refreshAllPreferenceCaches === "function") refreshAllPreferenceCaches();
  if (typeof refreshCoupleProgression === "function") refreshCoupleProgression();
  if (typeof updateTierSelectOptions === "function") updateTierSelectOptions();
  if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();
  if (typeof renderHomeHero === "function") renderHomeHero();
  if (typeof renderHomeCurrentGame === "function") renderHomeCurrentGame();
}

// ---- incoming event dispatch ----

function handleGameEvent(ev) {
  if (!ev || ev.user_id === gameSyncMyId()) return; // skip our own echoes; already rendered optimistically
  switch (ev.event_type) {
    case "card_drawn": applyRemoteCardDrawn(ev); break;
    case "card_skipped": applyRemoteCardSkipped(ev); break;
    case "points_awarded": applyRemotePointsAwarded(ev); break;
    case "truth_judged": applyRemoteTruthJudged(ev); break;
    case "wheel_spun": applyRemoteWheelSpun(ev); break;
    case "points_spent": applyRemotePointsSpent(ev); break;
    case "card_played": applyRemoteCardPlayed(ev); break;
    case "tag_unlocked": applyRemoteTagUnlocked(ev); break;
    case "heat_changed": applyRemoteHeatChanged(ev); break;
  }
}

// ---- rebuild on load / reconnect ----

function computeScoresFromEvents(events) {
  var myId = gameSyncMyId();
  var totals = {};
  function add(uid, amount) {
    if (!uid || !amount) return;
    totals[uid] = Math.max(0, (totals[uid] || 0) + amount);
  }
  events.forEach(function (ev) {
    var p = ev.payload || {};
    if (ev.event_type === "points_awarded") add(p.performer_user_id, p.amount || 0);
    else if (ev.event_type === "truth_judged") add(p.performer_user_id, p.points || 0);
    else if (ev.event_type === "card_skipped" && p.kind === "money") add(p.performer_user_id || ev.user_id, -(p.penalty || 0));
  });
  var mine = totals[myId] || 0;
  var partner = 0;
  Object.keys(totals).forEach(function (uid) { if (uid !== myId) partner += totals[uid]; });
  return { mine: mine, partner: partner };
}

// A "session" is pragmatic, not stored anywhere: a 6+ hour gap between
// consecutive events (or between the last event and now) starts a fresh
// one at base heat. Within the current session, the ceiling is whatever
// the most recent heat_changed event set it to — same derive-from-the-
// event-log pattern as scores, so reconnects/refreshes rebuild it
// exactly the same way.
var SESSION_GAP_MS = 6 * 60 * 60 * 1000;

// Returns the events belonging to the CURRENT session — the trailing run
// of events with no gap wider than SESSION_GAP_MS between them, and only
// if the very last event is itself recent. Returns [] when there's no
// live session (no events, or the last one is stale). Shared by session
// heat and the adaptive engine's session-scoped readiness signals below.
function findCurrentSessionEvents(events) {
  if (!events || !events.length) return [];
  var now = Date.now();
  var lastTs = new Date(events[events.length - 1].created_at).getTime();
  if (now - lastTs > SESSION_GAP_MS) return [];

  var sessionStartIdx = 0;
  for (var i = events.length - 1; i > 0; i--) {
    var gap = new Date(events[i].created_at).getTime() - new Date(events[i - 1].created_at).getTime();
    if (gap > SESSION_GAP_MS) { sessionStartIdx = i; break; }
  }
  return events.slice(sessionStartIdx);
}

// heat_changed events are keyed by user_id (each partner's own dial) —
// pass userId to get just that partner's current tier this session.
function computeUserTierFromEvents(events, userId) {
  var sessionEvents = findCurrentSessionEvents(events);
  var tier = TIER_ORDER[0];
  for (var j = 0; j < sessionEvents.length; j++) {
    if (sessionEvents[j].event_type === "heat_changed" && sessionEvents[j].user_id === userId) {
      var t = (sessionEvents[j].payload || {}).tier;
      if (t && TIER_ORDER.indexOf(t) !== -1) tier = t;
    }
  }
  return tier;
}

// ========================= //
// ADAPTIVE PROGRESSION ENGINE //
// ========================= //
// A per-device, per-user, read-only engine — active only for a user who
// has personally chosen 'adaptive' heat mode (see Backend.setHeatMode).
// Partners can be in different modes; each engine only ever acts on the
// device's OWN user, never the partner's (see Part C: mode is a private
// preference with no effect on the other partner). It only ever DOES two
// things:
//   1. Proposes raising MY OWN dial — via the exact same
//      window.Backend.createProgressionProposal/respondProgression RPCs
//      as a manually-tapped "Turn up the heat?" tap. A system proposal
//      carries no marker distinguishing it from a human-initiated one —
//      proposals already render with no proposer shown, so this is
//      invisible by construction, not by extra effort. Accepting only
//      ever raises the accepting device's own dial (see
//      respond_progression) — the couple's EFFECTIVE heat (the min of
//      both dials) only rises once both partners have reached the tier.
//   2. Biases which tier gets drawn from, silently, within the existing
//      effective heat — never touching either dial, never unlocking a
//      tag, never writing any event or row anywhere.
// It is fully dormant (isAdaptiveEngineActive() false) in manual mode,
// for unlinked couples, and for logged-out users — every entry point
// below is gated on that one check, so those three cases are
// regression-identical to the engine not existing at all.
//
// Every threshold the engine acts on lives in this one block.
var ADAPTIVE_ENGINE = {
  // Heat readiness (session-scoped, current ceiling tier only)
  HEAT_MIN_RESOLVED_ROUNDS: 8,        // resolved rounds at the ceiling tier this session
  HEAT_MIN_COMPLETION_SHARE: 0.75,    // completed / (completed + skipped)
  HEAT_MIN_RATED_ITEMS: 3,            // own quick-rates needed before skew counts
  HEAT_MIN_YES_LOVE_SHARE: 0.6,       // share of own quick-rates that are yes/love

  // Tag readiness (account-scoped adjacency, static content library)
  TAG_MIN_SESSIONS_BEFORE_ELIGIBLE: 3, // never in a user's first couple of sessions
  TAG_COOLDOWN_DAYS: 5,                // min days between system tag proposals (localStorage-paced)
  TAG_MIN_LOVED_SOURCE_TAGS: 1,        // need at least one mutually-loved dare's tags to seed adjacency
  TAG_MIN_COOCCURRENCE: 2,             // min shared-dare co-occurrence to count as "adjacent"

  // Cooling (session-scoped, silent — never a proposal, never the ceiling)
  COOLING_MIN_SIGNAL_ROUNDS: 4,        // min resolved rounds at the ceiling tier before skip-share counts
  COOLING_MIN_ORGANIC_SKIP_SHARE: 0.4, // organic skip share that reads as "souring"
  COOLING_MIN_RATED_ITEMS: 3,          // own quick-rates needed before negative skew counts
  COOLING_MAX_YES_LOVE_SHARE: 0.4      // yes/love share at/below this reads as "souring"
};

// True only for a logged-in, linked user who has personally chosen
// 'adaptive' heat mode — the single gate every engine entry point below
// funnels through. Per-user, not couple-level: the partner's mode has no
// bearing on whether THIS device's engine runs.
function isAdaptiveEngineActive() {
  return isSyncActive() && myHeatMode === "adaptive";
}

// The last events snapshot the engine has seen — refreshed alongside the
// existing full-state rebuild and after each round resolves (see
// refreshEngineSnapshot). Never fetched purely for the engine's sake on
// its own schedule; it always rides an existing fetch or an existing
// natural trigger point.
var cachedSyncEvents = [];

// Round-outcome + drawn-item tallies for one tier, scoped to a session
// event slice (see findCurrentSessionEvents). Shield-resolved skips are
// excluded entirely (strategic, not discomfort — detected via a
// card_played 'shield' event sharing the round's id); drink-mode
// forfeits (kind 'drink') are tallied separately from organic ('money')
// skips and likewise excluded from the organic-skip signal, since taking
// a drink is a game-mode choice, not a discomfort signal.
function computeTierRoundBucket(sessionEvents, tier) {
  var shieldRoundIds = {};
  sessionEvents.forEach(function (e) {
    if (e.event_type === "card_played" && (e.payload || {}).card === "shield") {
      shieldRoundIds[(e.payload || {}).roundId] = true;
    }
  });

  var completed = 0, organicSkips = 0, otherSkips = 0;
  var drawnItems = []; // { itemType, id }

  sessionEvents.forEach(function (e) {
    var p = e.payload || {};
    if (p.tier !== tier) return;
    if (e.event_type === "card_drawn") {
      if (p.mode === "dare" || p.mode === "truth") drawnItems.push({ itemType: p.mode, id: tierItemId(p.tier, p.cardIndex) });
    } else if (e.event_type === "points_awarded" || e.event_type === "truth_judged") {
      completed++;
    } else if (e.event_type === "card_skipped") {
      if (shieldRoundIds[p.roundId]) return;
      if (p.kind === "money") organicSkips++;
      else otherSkips++;
    }
  });

  var resolved = completed + organicSkips + otherSkips;
  return {
    resolved: resolved,
    completed: completed,
    organicSkips: organicSkips,
    completionShare: resolved > 0 ? completed / resolved : 0,
    organicSkipShare: resolved > 0 ? organicSkips / resolved : 0,
    drawnItems: drawnItems
  };
}

// Own quick-rate skew among a set of drawn items — itemRatings only ever
// holds THIS device's user's own ratings (never the partner's), so no
// extra filtering is needed to keep this private. A rating's timestamp
// isn't tracked client-side (no schema change for this feature), so this
// is a best-effort correlation of "drawn this session" with "currently
// rated" rather than a strict same-session rating — an acceptable
// approximation for a soft readiness signal.
function computeOwnRatingSkewThisSession(drawnItems) {
  var yesLove = 0, noMaybe = 0, rated = 0;
  drawnItems.forEach(function (item) {
    var rating = itemRatings[item.itemType] && itemRatings[item.itemType][item.id];
    if (!rating) return;
    rated++;
    if (rating === "yes" || rating === "love") yesLove++;
    else if (rating === "no" || rating === "maybe") noMaybe++;
  });
  return { rated: rated, yesLove: yesLove, noMaybe: noMaybe, yesLoveShare: rated > 0 ? yesLove / rated : 0 };
}

// Distinct sessions represented in an event list (see SESSION_GAP_MS) —
// a best-effort count bounded by however much history was fetched, used
// only to gate "not in a user's first couple of sessions" for tag
// proposals.
function countDistinctSessions(events) {
  if (!events || !events.length) return 0;
  var count = 1;
  for (var i = 1; i < events.length; i++) {
    var gap = new Date(events[i].created_at).getTime() - new Date(events[i - 1].created_at).getTime();
    if (gap > SESSION_GAP_MS) count++;
  }
  return count;
}

// ---- Heat readiness ----
// "No re-proposal this session" applies whether the proposal ages out
// unanswered or gets an explicit 'not yet' — both flags reset together
// the moment a genuinely new session starts (see updateEngineSessionAnchor).
var heatProposalDeclinedThisSession = false;
var heatProposedThisSession = false;
var engineSessionAnchor = null;

function updateEngineSessionAnchor(sessionEvents) {
  var anchor = sessionEvents.length ? sessionEvents[0].created_at : null;
  if (anchor !== engineSessionAnchor) {
    engineSessionAnchor = anchor;
    heatProposalDeclinedThisSession = false;
    heatProposedThisSession = false;
  }
}

function checkHeatReadiness(events) {
  if (!isAdaptiveEngineActive()) return;
  if (heatProposalDeclinedThisSession || heatProposedThisSession) return;
  var hasOpenHeatProposal = (coupleProgression.openProposals || []).some(function (p) { return p.kind === "heat"; });
  if (hasOpenHeatProposal) return;

  var effectiveTier = getEffectiveHeatTier();
  var ceilingIdx = TIER_ORDER.indexOf(effectiveTier);
  if (ceilingIdx === -1 || ceilingIdx >= TIER_ORDER.length - 1) return; // already at max

  var sessionEvents = findCurrentSessionEvents(events);
  var bucket = computeTierRoundBucket(sessionEvents, effectiveTier);
  if (bucket.resolved < ADAPTIVE_ENGINE.HEAT_MIN_RESOLVED_ROUNDS) return;
  if (bucket.completionShare < ADAPTIVE_ENGINE.HEAT_MIN_COMPLETION_SHARE) return;

  var skew = computeOwnRatingSkewThisSession(bucket.drawnItems);
  if (skew.rated < ADAPTIVE_ENGINE.HEAT_MIN_RATED_ITEMS) return;
  if (skew.yesLoveShare < ADAPTIVE_ENGINE.HEAT_MIN_YES_LOVE_SHARE) return;

  proposeSystemHeatUp();
}

// Same RPC call as window.proposeHeatUp — deliberately indistinguishable.
function proposeSystemHeatUp() {
  if (!window.Backend || !isSyncActive()) return;
  var ceilingIdx = TIER_ORDER.indexOf(getEffectiveHeatTier());
  if (ceilingIdx === -1 || ceilingIdx >= TIER_ORDER.length - 1) return;
  var nextTier = TIER_ORDER[ceilingIdx + 1];
  heatProposedThisSession = true;
  window.Backend.createProgressionProposal("heat", nextTier)
    .then(function () { return refreshCoupleProgression(); })
    .catch(function () {
      // Low-stakes — a failed proposal simply isn't there to answer.
    });
}

// ---- Tag readiness (adjacency) ----
// "Quiet, occasional, never a stream" — paced by a localStorage cooldown
// timestamp. This is device-local pacing state, not shared application
// data: it never touches game_events or any table, and the RPC's own
// server-side idempotency (one open proposal per subject) is the real
// cross-device safety net this sits on top of.
var TAG_PROPOSAL_COOLDOWN_KEY = "adaptiveTagProposalLastAt";

function tagProposalCooldownActive() {
  var last = localStorage.getItem(TAG_PROPOSAL_COOLDOWN_KEY);
  if (!last) return false;
  var elapsedDays = (Date.now() - parseInt(last, 10)) / (24 * 60 * 60 * 1000);
  return elapsedDays < ADAPTIVE_ENGINE.TAG_COOLDOWN_DAYS;
}

function markTagProposalMade() {
  localStorage.setItem(TAG_PROPOSAL_COOLDOWN_KEY, String(Date.now()));
}

// tag -> tag -> shared-dare count, built fresh from the static content
// library each time (cheap — it's a few hundred dares, not a query).
function buildDareTagCooccurrence() {
  var co = {};
  TIER_ORDER.forEach(function (tier) {
    gameData[tier].dares.forEach(function (d) {
      var tags = d.tags || [];
      tags.forEach(function (a) {
        tags.forEach(function (b) {
          if (a === b) return;
          co[a] = co[a] || {};
          co[a][b] = (co[a][b] || 0) + 1;
        });
      });
    });
  });
  return co;
}

// Tags carried by dares the couple has mutually matched on — a mutual
// match already means both partners rated the item 'love', so this is
// simultaneously "matched" and "loved" by construction.
function computeLovedSourceTags() {
  var tagSet = {};
  TIER_ORDER.forEach(function (tier) {
    gameData[tier].dares.forEach(function (d, idx) {
      var id = tierItemId(tier, idx);
      if (itemMutualMatches.dare[id] === true) {
        (d.tags || []).forEach(function (t) { tagSet[t] = true; });
      }
    });
  });
  return Object.keys(tagSet);
}

// The single best-adjacency locked tag, or null if nothing clears the
// co-occurrence bar. Sorted candidates keep the pick deterministic on ties.
function computeTagAdjacencyCandidate() {
  var sourceTags = computeLovedSourceTags();
  if (sourceTags.length < ADAPTIVE_ENGINE.TAG_MIN_LOVED_SOURCE_TAGS) return null;

  var unlockedSet = {};
  (coupleProgression.unlockedTags || []).forEach(function (t) { unlockedSet[t] = true; });
  var openTagSubjects = {};
  (coupleProgression.openProposals || []).forEach(function (p) { if (p.kind === "tag") openTagSubjects[p.subject] = true; });

  var locked = getAdvancedTags().filter(function (t) { return !unlockedSet[t] && !openTagSubjects[t]; }).sort();
  if (!locked.length) return null;

  var co = buildDareTagCooccurrence();
  var best = null, bestScore = 0;
  locked.forEach(function (candidate) {
    var score = 0;
    sourceTags.forEach(function (s) {
      if (s === candidate) return;
      score += (co[candidate] && co[candidate][s]) || 0;
    });
    if (score > bestScore) { bestScore = score; best = candidate; }
  });
  return bestScore >= ADAPTIVE_ENGINE.TAG_MIN_COOCCURRENCE ? best : null;
}

function checkTagReadiness(events) {
  if (!isAdaptiveEngineActive()) return;
  if (countDistinctSessions(events) < ADAPTIVE_ENGINE.TAG_MIN_SESSIONS_BEFORE_ELIGIBLE) return;
  if (tagProposalCooldownActive()) return;
  var hasOpenTagProposal = (coupleProgression.openProposals || []).some(function (p) { return p.kind === "tag"; });
  if (hasOpenTagProposal) return;

  var candidate = computeTagAdjacencyCandidate();
  if (!candidate) return;
  proposeSystemTag(candidate);
}

// Same RPC call as proposeTag — deliberately indistinguishable.
function proposeSystemTag(tag) {
  if (!window.Backend || !isSyncActive()) return;
  markTagProposalMade();
  window.Backend.createProgressionProposal("tag", tag)
    .then(function () { return refreshCoupleProgression(); })
    .catch(function () {
      // Low-stakes — a failed proposal simply isn't there to answer.
    });
}

// ---- Cooling ----
// Silent by design: no prompt, no message, no ceiling change, no visible
// state anywhere. Only getEffectiveDrawTier's return value differs from
// the requested tier — everything else about the round is untouched.
function checkCoolingActive(events) {
  if (!isAdaptiveEngineActive()) return false;
  var sessionEvents = findCurrentSessionEvents(events);
  var bucket = computeTierRoundBucket(sessionEvents, getEffectiveHeatTier());

  var skipSouring = bucket.resolved >= ADAPTIVE_ENGINE.COOLING_MIN_SIGNAL_ROUNDS &&
    bucket.organicSkipShare >= ADAPTIVE_ENGINE.COOLING_MIN_ORGANIC_SKIP_SHARE;

  var skew = computeOwnRatingSkewThisSession(bucket.drawnItems);
  var ratingSouring = skew.rated >= ADAPTIVE_ENGINE.COOLING_MIN_RATED_ITEMS &&
    skew.yesLoveShare <= ADAPTIVE_ENGINE.COOLING_MAX_YES_LOVE_SHARE;

  return skipSouring || ratingSouring;
}

// The one function draw call sites wrap their tier through. A no-op
// (returns tier unchanged) whenever the engine is inactive, at the
// bottom tier already, or cooling isn't currently active — so this is
// exactly pool.js's existing draw behavior plus, at most, one tier of
// silent downward bias within the ceiling that's already in effect.
function getEffectiveDrawTier(tier) {
  if (!isAdaptiveEngineActive()) return tier;
  if (!checkCoolingActive(cachedSyncEvents)) return tier;
  var idx = TIER_ORDER.indexOf(tier);
  if (idx <= 0) return tier;
  return TIER_ORDER[idx - 1];
}

// ---- Tick / snapshot wiring ----
// The engine only ever evaluates readiness right after an events fetch
// that was already happening for other reasons (a full state rebuild, or
// the lightweight re-fetch below after a round resolves) — it never
// polls or fetches on its own schedule.
function runAdaptiveEngineTick(events) {
  if (!isAdaptiveEngineActive()) return;
  updateEngineSessionAnchor(findCurrentSessionEvents(events));
  checkHeatReadiness(events);
  checkTagReadiness(events);
}

async function refreshEngineSnapshot() {
  if (!isAdaptiveEngineActive() || !window.GameSync) return;
  try {
    var events = await window.GameSync.fetchRecent(200);
    cachedSyncEvents = events;
    runAdaptiveEngineTick(events);
  } catch (e) {
    // Best-effort — the engine simply waits for the next natural trigger.
  }
}

var ROUND_STARTER_CARDS = { redraw: true, spice: true, wildcard: true };

function findPendingRound(events, kind) {
  var resolvedRoundIds = {};
  events.forEach(function (ev) {
    if (ev.event_type === "card_skipped" || ev.event_type === "truth_judged" || ev.event_type === "points_awarded") {
      var rid = (ev.payload || {}).roundId;
      if (rid) resolvedRoundIds[rid] = true;
    } else if (ev.event_type === "card_played" && (ev.payload || {}).card === "shield") {
      var rid2 = (ev.payload || {}).roundId;
      if (rid2) resolvedRoundIds[rid2] = true;
    }
  });
  for (var i = events.length - 1; i >= 0; i--) {
    var ev = events[i];
    // redraw/spice/wildcard replace a draw — their card_played events carry
    // the same starter shape as card_drawn and supersede the discarded round.
    var isTruthOrDareStarter = ev.event_type === "card_drawn" ||
      (ev.event_type === "card_played" && ROUND_STARTER_CARDS[(ev.payload || {}).card]);
    if (kind === "truth_or_dare" && isTruthOrDareStarter) {
      return resolvedRoundIds[(ev.payload || {}).roundId] ? null : ev;
    }
    if (kind === "wheel" && ev.event_type === "wheel_spun") {
      return resolvedRoundIds[(ev.payload || {}).roundId] ? null : ev;
    }
  }
  return null;
}

async function rebuildGameStateFromServer() {
  if (!window.GameSync || !window.GameSync.isActive()) return;
  gameSyncPartnerName = window.GameSync.getPartnerName() || "";
  var events = await window.GameSync.fetchRecent(200);

  var scores = computeScoresFromEvents(events);
  syncScores.mine = scores.mine;
  syncScores.partner = scores.partner;
  updateScoreDisplay();
  updateWheelScoreDisplay();

  myTierDial = computeUserTierFromEvents(events, gameSyncMyId());
  partnerTierDial = computeUserTierFromEvents(events, gameSyncPartnerId());
  if (typeof refreshTruthTierDropdownSelection === "function") refreshTruthTierDropdownSelection();
  if (typeof refreshAdaptiveHeatDisplay === "function") refreshAdaptiveHeatDisplay();
  if (typeof refreshTierReadout === "function") refreshTierReadout();
  if (typeof updateTierSelectOptions === "function") updateTierSelectOptions();
  if (typeof updateHeatAmbianceUI === "function") updateHeatAmbianceUI();

  cachedSyncEvents = events;
  if (typeof runAdaptiveEngineTick === "function") runAdaptiveEngineTick(events);

  var truthStarter = findPendingRound(events, "truth_or_dare");
  if (truthStarter) restoreTruthOrDareRound(truthStarter, events);
  else endSyncTruthRound();

  var wheelStarter = findPendingRound(events, "wheel");
  if (wheelStarter) restoreWheelRound(wheelStarter);
  else resetWheelSyncUI();

  var balances = computeCardBalanceFromEvents(events);
  cardBalance.mine = balances.mine;
  cardBalance.partner = balances.partner;
  renderCardShop();
  loadMyHand();
}

// ========================= //
// HOME PAGE                 //
// ========================= //
// State-aware hero, "current game" summary, and the engagement-gated
// install nudge. Read-only against existing auth/sync data — no new
// backend calls or schema.

function homeCtaState() {
  if (window.Backend && window.Backend.isAvailable() && window.Backend.isLoggedIn()) {
    return window.Backend.isLinked() ? "linked" : "unlinked";
  }
  return "loggedOut";
}

function renderHomeHero() {
  var titleEl = document.getElementById("homeHeroTitle");
  var subEl = document.getElementById("homeHeroSub");
  var ctaEl = document.getElementById("homeHeroCta");
  if (!titleEl || !subEl || !ctaEl) return;

  var state = homeCtaState();

  if (state === "linked") {
    titleEl.innerText = "❤️ " + (gameSyncMyName || "You") + " & " + (gameSyncPartnerName || "Partner");
    subEl.innerText = "Continue your game.";
    ctaEl.innerText = "Continue Playing ❤️";
    ctaEl.onclick = function () { showPage("truth"); };
  } else {
    titleEl.innerText = "Discover each other. Dare each other.";
    subEl.innerText = "Every answer is private. Only what you're both into ever becomes playable.";
    if (state === "unlinked") {
      ctaEl.innerText = "Connect with your partner";
      ctaEl.onclick = function () { showPage("account"); };
    } else {
      ctaEl.innerText = "Start Playing — Free";
      ctaEl.onclick = function () {
        showPage("account");
        if (typeof setAuthTab === "function") setAuthTab("signup");
      };
    }
  }
}

function renderHomeCurrentGame() {
  var block = document.getElementById("homeCurrentGame");
  if (!block) return;
  if (!(window.GameSync && window.GameSync.isActive())) {
    block.classList.add("hidden");
    return;
  }
  window.GameSync.fetchRecent(200).then(function (events) {
    var scores = computeScoresFromEvents(events);
    if (scores.mine <= 0 && scores.partner <= 0) {
      block.classList.add("hidden");
      return;
    }
    var mineLabel = document.getElementById("homeScoreMineLabel");
    var partnerLabel = document.getElementById("homeScorePartnerLabel");
    if (mineLabel) mineLabel.innerText = gameSyncMyName || "You";
    if (partnerLabel) partnerLabel.innerText = gameSyncPartnerName || "Partner";
    document.getElementById("homeScoreMine").innerText = scores.mine;
    document.getElementById("homeScorePartner").innerText = scores.partner;
    block.classList.remove("hidden");
  }).catch(function () {
    block.classList.add("hidden");
  });
}

function initHomePage() {
  renderHomeHero();
  renderHomeCurrentGame();
  maybeShowInstallNudge();
}

// ---- Install nudge ----
// Shown only after real engagement (a completed round, or the 3rd+
// visit) — never on first load — and never inside an installed PWA.

function isStandaloneDisplay() {
  return !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
}

function recordHomeVisit() {
  try {
    var n = (parseInt(localStorage.getItem("homeVisitCount"), 10) || 0) + 1;
    localStorage.setItem("homeVisitCount", String(n));
    return n;
  } catch (e) {
    return 0;
  }
}

function markRoundPlayed() {
  try { localStorage.setItem("hasCompletedRound", "true"); } catch (e) { /* ignore */ }
  maybeShowInstallNudge();
}

function maybeShowInstallNudge() {
  var el = document.getElementById("installNudge");
  if (!el) return;
  if (isStandaloneDisplay()) { el.classList.add("hidden"); return; }
  var dismissed = false;
  try { dismissed = localStorage.getItem("installNudgeDismissed") === "true"; } catch (e) { /* ignore */ }
  if (dismissed) { el.classList.add("hidden"); return; }

  var played = false;
  var visits = 0;
  try {
    played = localStorage.getItem("hasCompletedRound") === "true";
    visits = parseInt(localStorage.getItem("homeVisitCount"), 10) || 0;
  } catch (e) { /* ignore */ }
  if (!played && visits < 3) { el.classList.add("hidden"); return; }

  var textEl = document.getElementById("installNudgeText");
  if (textEl) {
    textEl.innerText = isIosDevice()
      ? "Add Dare We? to your Home Screen — tap Share, then \"Add to Home Screen\"."
      : "Add Dare We? to your Home Screen for quicker access, from your browser menu.";
  }
  el.classList.remove("hidden");
}

window.dismissInstallNudge = function () {
  try { localStorage.setItem("installNudgeDismissed", "true"); } catch (e) { /* ignore */ }
  var el = document.getElementById("installNudge");
  if (el) el.classList.add("hidden");
};

// ========================= //
// POWER CARDS                //
// ========================= //
// A player's hand (player_cards) is RLS-locked to user_id = auth.uid() —
// the server itself refuses to return a row that isn't yours, so a
// partner's hand is structurally unreadable, not just hidden by the UI.
// buy_card/play_card are atomic RPCs: buying logs an anonymous
// 'points_spent' game event (amount only, never the card) and grows the
// buyer's hand; playing shrinks the hand and broadcasts 'card_played'
// with the card type so both devices can apply the effect identically.

var POWER_CARDS = {
  reverse:     { name: "Reverse",     cost: 30, effect: "Bounces the card back — performer and judge swap for this round." },
  double_down: { name: "Double Down", cost: 20, effect: "Play before performing to double this round's awarded points." },
  shield:      { name: "Shield",      cost: 25, effect: "Skip the current card — no penalty, no drink." },
  redraw:      { name: "Redraw",      cost: 15, effect: "Discard the current card and draw a fresh one." },
  spice:       { name: "Spice",       cost: 35, effect: "Upgrade the current dare one tier — or reroll it fresh if you're already at your heat ceiling." },
  wildcard:    { name: "Wildcard",    cost: 50, effect: "Skip the draw — hand-pick any dare from your matched deck." }
};
var POWER_CARD_ORDER = ["reverse", "double_down", "shield", "redraw", "spice", "wildcard"];
var HAND_LIMIT = 3;

var myHand = {};                       // card_type -> quantity (only my own cards)
var cardBalance = { mine: 0, partner: 0 };
var cardMenuOpen = false;
var wildcardActive = false;            // true while the Wildcard picker modal is open

function handCount() {
  return Object.keys(myHand).reduce(function (sum, k) { return sum + (myHand[k] || 0); }, 0);
}

// Mirrors computeScoresFromEvents but tracks a separate spendable
// currency: everything a player has earned minus everything they've
// spent on cards. The visible scoreboard (syncScores) is untouched by
// card purchases — this is a distinct derived economy.
function computeCardBalanceFromEvents(events) {
  var myId = gameSyncMyId();
  var totals = {};
  function add(uid, amount) {
    if (!uid || !amount) return;
    totals[uid] = (totals[uid] || 0) + amount;
  }
  events.forEach(function (ev) {
    var p = ev.payload || {};
    if (ev.event_type === "points_awarded") add(p.performer_user_id, p.amount || 0);
    else if (ev.event_type === "truth_judged") add(p.performer_user_id, p.points || 0);
    else if (ev.event_type === "points_spent") add(ev.user_id, -(p.amount || 0));
  });
  var mine = Math.max(0, totals[myId] || 0);
  var partner = 0;
  Object.keys(totals).forEach(function (uid) { if (uid !== myId) partner = Math.max(0, totals[uid] || 0); });
  return { mine: mine, partner: partner };
}

async function loadMyHand() {
  if (!isSyncActive() || !window.Backend) { myHand = {}; renderCardShop(); renderHandTray(); return; }
  myHand = await window.Backend.loadHand();
  renderCardShop();
  renderHandTray();
}

function applyRemotePointsSpent(ev) {
  var amount = (ev.payload || {}).amount || 0;
  cardBalance.partner = Math.max(0, cardBalance.partner - amount);
  renderCardShop();
  showStatus((gameSyncPartnerName || "Partner") + " spent points on a card 🃏");
}

// ---- playing cards ----
// Whoever plays a card decides its concrete outcome client-side (which
// new card, which role swap) and sends it in the play_card payload, the
// same pattern card_drawn already uses — both devices end up rendering
// the identical result with no independent randomness to reconcile.

var TIER_ORDER = ["tease", "foreplay", "dirty"];

function buildReversePayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer") return null;
  var partnerId = window.GameSync && window.GameSync.getPartnerId ? window.GameSync.getPartnerId() : null;
  if (!partnerId) return null;
  return { roundId: syncTruthRound.roundId, newPerformerId: partnerId };
}

function buildDoubleDownPayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer" || syncTruthRound.doubleDown) return null;
  return { roundId: syncTruthRound.roundId };
}

function buildShieldPayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer") return null;
  return { roundId: syncTruthRound.roundId };
}

function buildRedrawPayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer") return null;
  var mode = syncTruthRound.mode, tier = getEffectiveDrawTier(syncTruthRound.tier);
  var pool = window.Pool.getPlayablePool({ mode: mode, tier: tier, matchedOnly: matchedOnly, unlockedTags: getAllowedTagsForPool(), heatCeiling: getHeatCeilingForPool() });
  var fullList = pool.fullList;
  var list = pool.items;
  if (list.length === 0) { showStatus("No fresh cards available to redraw 😅"); return null; }
  var randomCard = list[Math.floor(Math.random() * list.length)];
  var cardIndex = fullList.indexOf(randomCard);
  return { roundId: genRoundId(), mode: mode, tier: tier, cardIndex: cardIndex, performer_user_id: syncTruthRound.performerId };
}

function buildSpicePayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer" || syncTruthRound.mode !== "dare") return null;
  var curIdx = TIER_ORDER.indexOf(syncTruthRound.tier);
  var heatCeiling = getHeatCeilingForPool();
  var ceilingIdx = heatCeiling ? TIER_ORDER.indexOf(heatCeiling) : TIER_ORDER.length - 1;
  // Upgrade one tier while under the session's heat ceiling; at the
  // ceiling, reroll within the current tier instead of upgrading past it.
  var newTier = (curIdx >= 0 && curIdx < ceilingIdx) ? TIER_ORDER[curIdx + 1] : syncTruthRound.tier;
  var pool = window.Pool.getPlayablePool({ mode: "dare", tier: newTier, matchedOnly: matchedOnly, unlockedTags: getAllowedTagsForPool(), heatCeiling: heatCeiling });
  var fullList = pool.fullList;
  var list = pool.items;
  if (list.length === 0) { showStatus("No cards available at that tier 😅"); return null; }
  var randomCard = list[Math.floor(Math.random() * list.length)];
  var cardIndex = fullList.indexOf(randomCard);
  return { roundId: genRoundId(), mode: "dare", tier: newTier, cardIndex: cardIndex, performer_user_id: syncTruthRound.performerId };
}

// Wildcard's pool is the mutual-match pool specifically (not just
// "not rated no") — "the matched deck" — which is inherently a subset
// of every card effect's preference-sovereignty requirement.
function getWildcardPool(tier) {
  var pool = window.Pool.getPlayablePool({
    mode: "dare", tier: tier, matchedOnly: true, matchedOnlyStrict: true, respectGender: false,
    unlockedTags: getAllowedTagsForPool(), heatCeiling: getHeatCeilingForPool()
  });
  return pool.items.map(function (card) {
    return { card: card, cardIndex: pool.fullList.indexOf(card) };
  });
}

function applyReverseEffect(payload) {
  if (!syncTruthRound || syncTruthRound.roundId !== payload.roundId) return;
  syncTruthRound.performerId = payload.newPerformerId;
  syncTruthRound.myRole = payload.newPerformerId === gameSyncMyId() ? "performer" : "judge";
  var list = gameData[syncTruthRound.tier][syncTruthRound.mode === "truth" ? "truths" : "dares"];
  var card = list[syncTruthRound.cardIndex];
  renderSyncedCard(syncTruthRound.mode, syncTruthRound.tier, card, syncTruthRound.cardIndex, syncTruthRound.myRole === "judge");
  showTruthOrDareJudgeUI(syncTruthRound.mode, syncTruthRound.myRole);
  showStatus("Roles reversed! 🔄");
  if (typeof renderHandTray === "function") renderHandTray();
}

function applyDoubleDownEffect(payload) {
  if (!syncTruthRound || syncTruthRound.roundId !== payload.roundId) return;
  syncTruthRound.doubleDown = true;
  showStatus("Double Down is active — points will be doubled this round! 🔥🔥");
  if (typeof renderHandTray === "function") renderHandTray();
}

function applyShieldEffect(payload) {
  if (!syncTruthRound || syncTruthRound.roundId !== payload.roundId) return;
  showStatus("Shielded — no penalty this round 🛡️");
  endSyncTruthRound();
  if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
}

function applyCardEffect(cardType, payload) {
  if (cardType === "reverse") applyReverseEffect(payload);
  else if (cardType === "double_down") applyDoubleDownEffect(payload);
  else if (cardType === "shield") applyShieldEffect(payload);
  else if (cardType === "redraw" || cardType === "spice" || cardType === "wildcard") {
    // The old card is being discarded — burn it away before the fresh
    // one renders (restoreTruthOrDareRound clears the overlay itself).
    if (typeof triggerCardBurnAway === "function") triggerCardBurnAway();
    restoreTruthOrDareRound({ payload: payload });
  }
}

function showCardAnnouncement(playerName, cardType) {
  var banner = document.getElementById("cardAnnouncement");
  var text = document.getElementById("cardAnnouncementText");
  if (!banner || !text) return;
  var name = (POWER_CARDS[cardType] && POWER_CARDS[cardType].name) || cardType;
  text.innerText = playerName + " played " + name.toUpperCase() + "!";
  banner.classList.remove("hidden");
  void banner.offsetWidth;
  banner.classList.add("card-announcement-show");
  if (typeof playSfx === "function") playSfx("cardPlayed");
  setTimeout(function () {
    banner.classList.remove("card-announcement-show");
    banner.classList.add("hidden");
  }, 2200);
}

async function commitPowerCardPlay(cardType, payload) {
  if (!payload || !window.Backend) return;
  try {
    await window.Backend.playCard(cardType, payload);
  } catch (e) {
    showStatus(e.message || "Couldn't play that card.");
    return;
  }
  myHand[cardType] = Math.max(0, (myHand[cardType] || 0) - 1);
  if (myHand[cardType] === 0) delete myHand[cardType];
  applyCardEffect(cardType, payload);
  showCardAnnouncement(gameSyncMyName || "You", cardType);
  renderCardShop();
  renderHandTray();
}

window.playPowerCard = function (cardType) {
  if (!isSyncActive() || !window.Backend) return;
  if (!myHand[cardType] || myHand[cardType] < 1) return;
  var payload = null;
  if (cardType === "reverse") payload = buildReversePayload();
  else if (cardType === "double_down") payload = buildDoubleDownPayload();
  else if (cardType === "shield") payload = buildShieldPayload();
  else if (cardType === "redraw") payload = buildRedrawPayload();
  else if (cardType === "spice") payload = buildSpicePayload();
  else return; // wildcard is played via openWildcardPicker/chooseWildcardDare instead
  if (!payload) return;
  commitPowerCardPlay(cardType, payload);
};

window.openWildcardPicker = function () {
  if (!myHand.wildcard || myHand.wildcard < 1 || syncTruthRound) return;
  var tier = getEffectiveHeatTier();
  var pool = getWildcardPool(tier);
  var list = document.getElementById("wildcardList");
  var empty = document.getElementById("wildcardEmpty");
  if (!list) return;
  list.innerHTML = "";
  if (pool.length === 0) {
    if (empty) empty.classList.remove("hidden");
  } else {
    if (empty) empty.classList.add("hidden");
    pool.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "pos-list-item";
      row.innerHTML = "<div class=\"pos-list-name\">" + escapeHtml(getCardText(item.card)) + "</div>";
      row.onclick = (function (tierArg, idx) { return function () { chooseWildcardDare(tierArg, idx); }; })(tier, item.cardIndex);
      list.appendChild(row);
    });
  }
  document.getElementById("wildcardModal").classList.remove("hidden");
};

window.closeWildcardPicker = function () {
  document.getElementById("wildcardModal").classList.add("hidden");
};

function chooseWildcardDare(tier, cardIndex) {
  document.getElementById("wildcardModal").classList.add("hidden");
  var performerId = gameSyncMyId();
  var payload = { roundId: genRoundId(), mode: "dare", tier: tier, cardIndex: cardIndex, performer_user_id: performerId };
  commitPowerCardPlay("wildcard", payload);
}

function applyRemoteCardPlayed(ev) {
  var p = ev.payload || {};
  var cardType = p.card;
  if (!cardType || !POWER_CARDS[cardType]) return;
  applyCardEffect(cardType, p);
  showCardAnnouncement(gameSyncPartnerName || "Your partner", cardType);
}

// ---- shop + hand tray UI ----
// The shop button is always visible on the Truth or Dare page (see
// updateCardMenuVisibility). Synced couples see the real shop; solo and
// unlinked players see a locked teaser instead (see renderCardShop) —
// never hidden entirely, so they know the feature exists.

window.toggleCardMenu = function () {
  var menu = document.getElementById("cardMenu");
  if (!menu) return;
  if (cardMenuOpen) {
    menu.classList.remove("card-menu-open");
    cardMenuOpen = false;
  } else {
    menu.classList.add("card-menu-open");
    cardMenuOpen = true;
    renderCardShop();
  }
};

// The shop button itself is always available on Truth or Dare now — solo
// and unlinked players see a locked teaser (see renderCardShop) rather
// than the button disappearing outright. Only actual play stays gated on
// isSyncActive() (getPlayableCards, buyPowerCard, the hand tray).
function updateCardMenuVisibility() {
  var btn = document.getElementById("cardMenuBtn");
  var truthSection = document.getElementById("truth");
  var onTruthPage = !!(truthSection && truthSection.classList.contains("active"));
  if (btn) btn.classList.toggle("hidden", !onTruthPage);
  if (!onTruthPage) {
    var menu = document.getElementById("cardMenu");
    if (menu) menu.classList.remove("card-menu-open");
    cardMenuOpen = false;
  }
  if (onTruthPage) { renderCardShop(); renderHandTray(); }
  else {
    var tray = document.getElementById("handTray");
    if (tray) tray.classList.add("hidden");
  }
}

// ---- closing both slide-out menus ----
// Both menus already toggle shut on a second tap of their own hamburger
// icon (see toggleMenu/toggleCardMenu above). This adds the remaining
// close paths: tapping outside, swiping toward the menu's own edge on
// touch, and Escape on desktop — all routed through the same toggle
// functions so the close animation always matches the open one.

function isLeftMenuOpen() {
  var menu = document.getElementById("menu");
  return !!menu && menu.classList.contains("menu-open");
}

// Uses composedPath() rather than el.contains(e.target): a click on a
// Buy button can trigger a synchronous re-render of the shop list before
// this listener runs (the click handler's own DOM update flushes as a
// microtask ahead of the next listener in the same dispatch), which
// would detach the original e.target and make a plain .contains() check
// report "outside" even though the click was squarely inside the menu.
// composedPath() is captured at dispatch time and is immune to that.
document.addEventListener("click", function (e) {
  var path = typeof e.composedPath === "function" ? e.composedPath() : null;
  function isInside(el) {
    if (!el) return false;
    return path ? path.indexOf(el) !== -1 : el.contains(e.target);
  }
  if (isLeftMenuOpen()) {
    var menu = document.getElementById("menu");
    var btn = document.querySelector(".menu-btn");
    if (!isInside(menu) && !isInside(btn)) {
      window.toggleMenu();
    }
  }
  if (typeof cardMenuOpen !== "undefined" && cardMenuOpen) {
    var cardMenu = document.getElementById("cardMenu");
    var cardBtn = document.getElementById("cardMenuBtn");
    if (!isInside(cardMenu) && !isInside(cardBtn)) {
      window.toggleCardMenu();
    }
  }
  TIER_CONTROL_PAGES.forEach(function (page) {
    var ids = TIER_CONTROL_IDS[page];
    if (tierDropdownOpen[page]) {
      var tierPanel = document.getElementById(ids.listbox);
      var tierTrigger = document.getElementById(ids.trigger);
      if (!isInside(tierPanel) && !isInside(tierTrigger)) {
        closeTierDropdown(page, false);
      }
    }
    if (adaptiveHeatPanelOpenState[page]) {
      var heatPanel = document.getElementById(ids.adaptivePanel);
      var heatTrigger = document.getElementById(ids.adaptiveTrigger);
      if (!isInside(heatPanel) && !isInside(heatTrigger)) {
        closeAdaptiveHeatPanel(page, false);
      }
    }
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape" && e.key !== "Esc") return;
  if (isLeftMenuOpen()) window.toggleMenu();
  if (typeof cardMenuOpen !== "undefined" && cardMenuOpen) window.toggleCardMenu();
  TIER_CONTROL_PAGES.forEach(function (page) {
    if (tierDropdownOpen[page]) closeTierDropdown(page);
    if (adaptiveHeatPanelOpenState[page]) closeAdaptiveHeatPanel(page);
  });
});

// Swipe toward the menu's own hinge edge closes it. Listens only on the
// menu element itself (not the whole document) so it never competes with
// normal page scrolling, and only reacts to a clearly horizontal gesture
// past a deliberate threshold so ordinary taps on links/buttons inside
// the menu are completely unaffected.
function attachSwipeToClose(menuEl, direction, isOpenFn, closeFn) {
  if (!menuEl) return;
  var startX = null, startY = null;
  menuEl.addEventListener("touchstart", function (e) {
    if (!isOpenFn() || !e.touches || e.touches.length !== 1) { startX = null; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  menuEl.addEventListener("touchend", function (e) {
    if (startX == null) return;
    var touch = e.changedTouches && e.changedTouches[0];
    var dx = touch ? touch.clientX - startX : 0;
    var dy = touch ? touch.clientY - startY : 0;
    startX = null; startY = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (direction === "left" && dx < 0 && isOpenFn()) closeFn();
    else if (direction === "right" && dx > 0 && isOpenFn()) closeFn();
  }, { passive: true });
}

window.addEventListener("load", function () {
  attachSwipeToClose(document.getElementById("menu"), "left", isLeftMenuOpen, function () { window.toggleMenu(); });
  attachSwipeToClose(document.getElementById("cardMenu"), "right", function () { return typeof cardMenuOpen !== "undefined" && cardMenuOpen; }, function () { window.toggleCardMenu(); });
});

// Deep-links to the partner-connect flow (Account handles both "not
// logged in yet" and "logged in but not linked" — it's the single
// correct destination for either case, same as the home hero's own CTA).
window.goToPartnerConnect = function () {
  if (cardMenuOpen) window.toggleCardMenu();
  window.showPage("account");
};

function renderCardShop() {
  var balanceEl = document.getElementById("cardShopBalance");
  var list = document.getElementById("cardShopList");
  var handSection = document.querySelector(".card-shop-hand-section");

  if (!isSyncActive()) {
    if (balanceEl) balanceEl.innerText = "🔒";
    if (handSection) handSection.classList.add("hidden");
    if (list) {
      list.innerHTML =
        "<div class=\"card-shop-locked-notice\">" +
          "<p class=\"card-shop-locked-text\">Power cards are a couple thing — buy, hold, and play them together once you're linked.</p>" +
          "<button type=\"button\" class=\"card-shop-unlock-btn\" onclick=\"goToPartnerConnect()\">Link your partner to unlock power cards</button>" +
        "</div>" +
        POWER_CARD_ORDER.map(function (cardType) {
          var def = POWER_CARDS[cardType];
          return "<div class=\"card-shop-item card-shop-item-locked\">" +
            "<span class=\"card-shop-lock-overlay\" aria-hidden=\"true\">🔒</span>" +
            "<div class=\"card-shop-item-head\">" +
              "<span class=\"card-shop-name\">" + def.name + "</span>" +
              "<span class=\"card-shop-cost\">" + def.cost + " pts</span>" +
            "</div>" +
            "<div class=\"card-shop-effect\">" + def.effect + "</div>" +
          "</div>";
        }).join("");
    }
    return;
  }

  if (handSection) handSection.classList.remove("hidden");
  if (balanceEl) balanceEl.innerText = cardBalance.mine + " pts";

  if (list) {
    list.innerHTML = "";
    var atLimit = handCount() >= HAND_LIMIT;
    POWER_CARD_ORDER.forEach(function (cardType) {
      var def = POWER_CARDS[cardType];
      var owned = myHand[cardType] || 0;
      var canAfford = cardBalance.mine >= def.cost;
      var disabled = !canAfford || atLimit;
      var row = document.createElement("div");
      row.className = "card-shop-item";
      row.innerHTML =
        "<div class=\"card-shop-item-head\">" +
          "<span class=\"card-shop-name\">" + def.name + "</span>" +
          "<span class=\"card-shop-cost" + (canAfford ? "" : " card-shop-cost-unaffordable") + "\">" + def.cost + " pts</span>" +
        "</div>" +
        "<div class=\"card-shop-effect\">" + def.effect + "</div>" +
        (owned > 0 ? "<div class=\"card-shop-owned\">You have " + owned + "</div>" : "") +
        "<button class=\"card-shop-buy-btn\" type=\"button\"" + (disabled ? " disabled" : "") + ">Buy</button>";
      var buyBtn = row.querySelector(".card-shop-buy-btn");
      buyBtn.onclick = (function (ct, cost) { return function () { buyPowerCard(ct, cost); }; })(cardType, def.cost);
      list.appendChild(row);
    });
  }

  var handList = document.getElementById("cardShopHand");
  if (handList) {
    var entries = Object.keys(myHand).filter(function (k) { return myHand[k] > 0; });
    if (entries.length === 0) {
      handList.innerHTML = "<p class=\"card-shop-empty\">Your hand is empty.</p>";
    } else {
      handList.innerHTML = entries.map(function (k) {
        return "<span class=\"card-shop-hand-chip\">" + (POWER_CARDS[k] ? POWER_CARDS[k].name : k) + " ×" + myHand[k] + "</span>";
      }).join("");
    }
  }
}

async function buyPowerCard(cardType, cost) {
  if (!window.Backend) return;
  if (cardBalance.mine < cost || handCount() >= HAND_LIMIT) return;
  try {
    await window.Backend.buyCard(cardType, cost);
  } catch (e) {
    showStatus(e.message || "Couldn't buy that card.");
    return;
  }
  cardBalance.mine = Math.max(0, cardBalance.mine - cost);
  myHand[cardType] = (myHand[cardType] || 0) + 1;
  renderCardShop();
  renderHandTray();
  showStatus("Bought " + POWER_CARDS[cardType].name + "! 🃏");
}

function getPlayableCards() {
  var playable = [];
  if (!isSyncActive()) return playable;
  if (syncTruthRound && syncTruthRound.myRole === "performer") {
    if (!syncTruthRound.doubleDown && myHand.double_down) playable.push("double_down");
    if (myHand.reverse) playable.push("reverse");
    if (myHand.shield) playable.push("shield");
    if (myHand.redraw) playable.push("redraw");
    if (syncTruthRound.mode === "dare" && myHand.spice) playable.push("spice");
  } else if (!syncTruthRound && myHand.wildcard) {
    playable.push("wildcard");
  }
  return playable;
}

function renderHandTray() {
  var tray = document.getElementById("handTray");
  if (!tray) return;
  if (!isSyncActive()) { tray.classList.add("hidden"); tray.innerHTML = ""; return; }
  var playable = getPlayableCards();
  if (playable.length === 0) { tray.classList.add("hidden"); tray.innerHTML = ""; return; }
  tray.innerHTML = "";
  playable.forEach(function (cardType) {
    var def = POWER_CARDS[cardType];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hand-tray-card";
    btn.innerHTML = def.name + " <span class=\"hand-tray-qty\">×" + myHand[cardType] + "</span>";
    btn.onclick = cardType === "wildcard"
      ? function () { window.openWildcardPicker(); }
      : (function (ct) { return function () { window.playPowerCard(ct); }; })(cardType);
    tray.appendChild(btn);
  });
  tray.classList.remove("hidden");
}

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

function loadPositionRatingsLocal() {
  var stored = window.Backend ? window.Backend.getLocalRatings("position") : {};
  positionsData.forEach(function (pos) {
    pos.rating = stored[String(pos.id)] || null;
  });
}

function posDots(difficulty) {
  var n = { beginner: 1, intermediate: 2, advanced: 3 }[difficulty] || 1;
  return "\u25cf".repeat(n) + "\u25cb".repeat(3 - n);
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
    list.innerHTML = "<p style=\"color:rgba(255,245,247,0.4);text-align:center;padding:20px 0;\">No positions match these filters.</p>";
    return;
  }
  filtered.forEach(function (pos) {
    var item = document.createElement("div");
    item.className = "pos-list-item";
    var tags = "";
    if (pos.tried)    tags += "<span class=\"pos-tag\">\u2705</span>";
    if (pos.favorite) tags += "<span class=\"pos-tag\">\u2764\ufe0f</span>";
    if (pos.todo)     tags += "<span class=\"pos-tag\">\ud83d\udccc</span>";
    item.innerHTML =
      "<div class=\"pos-list-name\">" + pos.name + "</div>" +
      "<div class=\"pos-list-meta\">" +
        "<span class=\"pos-vibe-badge pos-vibe-" + pos.vibe + "\">" + pos.vibe + "</span>" +
        "<span class=\"pos-dots\">" + posDots(pos.difficulty) + "</span>" +
        tags +
      "</div>";
    item.onclick = (function (id) { return function () { openPositionCard(id); }; })(pos.id);
    list.appendChild(item);
  });
}

function initPositionsPage() {
  loadPositionsState();
  loadPositionRatingsLocal();

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
  updatePosRatingButtons(pos);
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

function updatePosRatingButtons(pos) {
  var buttons = document.querySelectorAll("#posRatingButtons button");
  buttons.forEach(function (b) {
    b.classList.toggle("active-toggle", b.getAttribute("data-rating") === pos.rating);
  });
}

window.setPositionRating = function (rating) {
  if (!activePositionId) return;
  var pos = null;
  for (var i = 0; i < positionsData.length; i++) {
    if (positionsData[i].id === activePositionId) { pos = positionsData[i]; break; }
  }
  if (!pos) return;
  pos.rating = rating;
  updatePosRatingButtons(pos);
  if (window.Backend) {
    window.Backend.saveRating("position", pos.id, rating).then(function () {
      renderMutualMatches();
    });
  }
};

async function renderMutualMatches() {
  var section = document.getElementById("mutualMatchesSection");
  var list = document.getElementById("mutualMatchesList");
  if (!section || !list) return;
  if (!window.Backend || !window.Backend.isLoggedIn() || !window.Backend.isLinked()) {
    section.classList.add("hidden");
    return;
  }
  var matches = await window.Backend.getMutualMatches("position");
  if (!matches.length) {
    section.classList.add("hidden");
    return;
  }
  list.innerHTML = "";
  matches.forEach(function (m) {
    var pos = null;
    for (var i = 0; i < positionsData.length; i++) {
      if (String(positionsData[i].id) === String(m.item_id)) { pos = positionsData[i]; break; }
    }
    if (!pos) return;
    var item = document.createElement("div");
    item.className = "pos-mutual-item" + (m.love ? " pos-mutual-love" : "");
    item.innerHTML =
      "<span class=\"pos-mutual-name\">" + pos.name + "</span>" +
      (m.love ? "<span class=\"pos-mutual-glow-badge\">💕 Love</span>" : "<span class=\"pos-mutual-tag\">Mutual</span>");
    item.onclick = (function (id) { return function () { openPositionCard(id); }; })(pos.id);
    list.appendChild(item);
  });
  section.classList.remove("hidden");
}
window.renderMutualMatches = renderMutualMatches;

async function syncPositionRatingsFromServer() {
  if (!window.Backend || !window.Backend.isLoggedIn()) {
    renderMutualMatches();
    return;
  }
  var ratings = await window.Backend.loadRatings("position");
  positionsData.forEach(function (pos) {
    pos.rating = ratings[String(pos.id)] || null;
  });
  if (activePositionId) {
    var pos = null;
    for (var i = 0; i < positionsData.length; i++) {
      if (positionsData[i].id === activePositionId) { pos = positionsData[i]; break; }
    }
    if (pos) updatePosRatingButtons(pos);
  }
  renderMutualMatches();
}
window.syncPositionRatingsFromServer = syncPositionRatingsFromServer;

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

// ========================= //
// SPIN WHEEL                //
// ========================= //

var wheelCurrentPlayer = 'john';
var wheelRotationDeg = 0;
var wheelIsSpinning = false;
var wheelLandedSegment = -1;
var wheelTimerInterval = null;
var wheelTimerSeconds = 0;
var wheelTimerRunning = false;
var wheelHasSpunOnce = false;

// Fixed category segments — no longer keyed by tier (see index.html Wheel
// section comment / PR notes: the wheel's category set is now the same
// regardless of the player's current heat tier; only the DARES drawn for
// a given category vary by tier, same as everywhere else in the app).
// Wildcard has no tag: it draws from the full effective-heat dare pool,
// same shape as a plain untagged "Dare" draw elsewhere in the app.
var WHEEL_SEGMENTS = [
  { key: 'manual',     label: 'Manual',     tag: 'manual',     iconKey: 'wheelManualChoice', tagline: 'Hands-on, your way.' },
  { key: 'dirty-talk', label: 'Dirty Talk', tag: 'dirty-talk', iconKey: 'wheelDirtyTalk',     tagline: "Say what you're thinking.", sm: true },
  { key: 'position',   label: 'Position',   tag: 'position',   iconKey: 'positions',          tagline: 'A new position to try.' },
  { key: 'kissing',    label: 'Kissing',    tag: 'kissing',    iconKey: 'wheelKissing',        tagline: 'Slow down and kiss.' },
  { key: 'teasing',    label: 'Teasing',    tag: 'teasing',    iconKey: 'tease',               tagline: 'Build it up slowly.' },
  { key: 'massage',    label: 'Massage',    tag: 'massage',    iconKey: 'wheelMassage',        tagline: 'Hands-on and unhurried.' },
  { key: 'wildcard',   label: 'Wildcard',   tag: null,         iconKey: 'dareWeTryThis',       tagline: 'Anything from your deck.' }
];
var WHEEL_SEG_COUNT = WHEEL_SEGMENTS.length;
var WHEEL_SEG_ANGLE = 360 / WHEEL_SEG_COUNT;
// The six standard segments alternate navy / rose-gold / silver so no two
// adjacent slices share a color; Wildcard's ember tone is deliberately
// off-rotation (see index.html/style.css comments).
var WHEEL_SEG_COLOR_CLASS = ['navy', 'rose', 'silver', 'navy', 'rose', 'silver', 'ember'].map(function (c) {
  return 'wheel-fill-' + c;
});

var WHEEL_CX = 190, WHEEL_CY = 190, WHEEL_OUTER_R = 182;
var wheelSvgBuilt = false;
var wheelSegmentEls = [];
var wheelLastTickBucket = null;

function wheelPolar(cx, cy, r, angleDeg) {
  var a = angleDeg * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function wheelWedgePathD(startAngle, endAngle) {
  var p1 = wheelPolar(WHEEL_CX, WHEEL_CY, WHEEL_OUTER_R, startAngle);
  var p2 = wheelPolar(WHEEL_CX, WHEEL_CY, WHEEL_OUTER_R, endAngle);
  return 'M ' + WHEEL_CX + ',' + WHEEL_CY +
    ' L ' + p1.x.toFixed(2) + ',' + p1.y.toFixed(2) +
    ' A ' + WHEEL_OUTER_R + ',' + WHEEL_OUTER_R + ' 0 0,1 ' + p2.x.toFixed(2) + ',' + p2.y.toFixed(2) + ' Z';
}

// Builds the wheel once as static SVG — segments never change shape after
// this, only the rotating group's transform (spin) and each segment's
// dim/landed classes (result drama) change at runtime. Labels and glyphs
// are children of each segment's own rotated group, so they turn WITH
// their segment exactly like the physical wedge does.
function buildWheelSvg() {
  var svg = document.getElementById('wheelSvg');
  if (!svg || wheelSvgBuilt) return;

  var segmentsHtml = WHEEL_SEGMENTS.map(function (seg, i) {
    var startAngle = i * WHEEL_SEG_ANGLE;
    var endAngle = startAngle + WHEEL_SEG_ANGLE;
    var midAngle = startAngle + WHEEL_SEG_ANGLE / 2;
    var radialRotate = 'rotate(' + (midAngle + 90) + ' ' + WHEEL_CX + ' ' + WHEEL_CY + ')';
    var labelY = WHEEL_CY - WHEEL_OUTER_R * 0.56;
    var glyphR = WHEEL_OUTER_R * 0.79;
    var glyphSize = 22;

    return '' +
      '<g class="wheel-segment" data-index="' + i + '">' +
        '<path class="wheel-segment-fill ' + WHEEL_SEG_COLOR_CLASS[i] + '" d="' + wheelWedgePathD(startAngle, endAngle) + '"></path>' +
        '<text class="wheel-segment-label' + (seg.sm ? ' wheel-segment-label-sm' : '') + '" transform="' + radialRotate + '" x="' + WHEEL_CX + '" y="' + labelY + '" text-anchor="middle">' + escapeHtml(seg.label) + '</text>' +
        '<foreignObject class="wheel-segment-glyph" transform="' + radialRotate + '" x="' + (WHEEL_CX - glyphSize / 2) + '" y="' + (WHEEL_CY - glyphR - glyphSize / 2) + '" width="' + glyphSize + '" height="' + glyphSize + '">' +
          '<div xmlns="http://www.w3.org/1999/xhtml" class="wheel-segment-glyph-box">' + appIcon(seg.iconKey, "wheel-segment-glyph-img", "", true) + '</div>' +
        '</foreignObject>' +
      '</g>';
  }).join('');

  var dividersHtml = WHEEL_SEGMENTS.map(function (_, i) {
    var p = wheelPolar(WHEEL_CX, WHEEL_CY, WHEEL_OUTER_R, i * WHEEL_SEG_ANGLE);
    return '<line class="wheel-divider" x1="' + WHEEL_CX + '" y1="' + WHEEL_CY + '" x2="' + p.x.toFixed(2) + '" y2="' + p.y.toFixed(2) + '"></line>';
  }).join('');

  svg.innerHTML =
    '<defs>' +
      '<radialGradient id="wheelInnerGlow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#c9a97a" stop-opacity="0.28"></stop>' +
        '<stop offset="100%" stop-color="#c9a97a" stop-opacity="0"></stop>' +
      '</radialGradient>' +
      '<linearGradient id="wheelRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#c9a97a"></stop>' +
        '<stop offset="43%" stop-color="#c9a97a"></stop>' +
        '<stop offset="68%" stop-color="#b8bcc4"></stop>' +
        '<stop offset="100%" stop-color="#c8cdd6"></stop>' +
      '</linearGradient>' +
      '<radialGradient id="wheelHubGrad" cx="35%" cy="35%" r="70%">' +
        '<stop offset="0%" stop-color="#c9a97a"></stop>' +
        '<stop offset="100%" stop-color="#c8cdd6"></stop>' +
      '</radialGradient>' +
    '</defs>' +
    '<circle class="wheel-inner-glow" cx="' + WHEEL_CX + '" cy="' + WHEEL_CY + '" r="' + (WHEEL_OUTER_R * 0.9) + '" fill="url(#wheelInnerGlow)"></circle>' +
    '<g id="wheelRotor" class="wheel-rotor">' +
      segmentsHtml +
      dividersHtml +
    '</g>' +
    '<circle class="wheel-outer-ring" cx="' + WHEEL_CX + '" cy="' + WHEEL_CY + '" r="' + (WHEEL_OUTER_R + 2) + '"></circle>' +
    '<circle class="wheel-hub-mask" cx="' + WHEEL_CX + '" cy="' + WHEEL_CY + '" r="26"></circle>' +
    '<circle class="wheel-hub" cx="' + WHEEL_CX + '" cy="' + WHEEL_CY + '" r="17"></circle>';

  wheelSvgBuilt = true;
  wheelSegmentEls = Array.prototype.slice.call(svg.querySelectorAll('.wheel-segment'));
}

function renderWheelRotation(deg) {
  var rotor = document.getElementById('wheelRotor');
  if (rotor) rotor.setAttribute('transform', 'rotate(' + deg + ' ' + WHEEL_CX + ' ' + WHEEL_CY + ')');
}

// Result drama (landing only): the winning wedge brightens, the rest dim.
// landedSeg === -1 clears both states (mid-spin / fresh page load).
function renderWheelLandedState(landedSeg) {
  wheelSegmentEls.forEach(function (el, i) {
    el.classList.toggle('wheel-segment-win', i === landedSeg);
    el.classList.toggle('wheel-segment-dim', landedSeg !== -1 && i !== landedSeg);
  });
}

function pulseWheelPointerTick() {
  var pointer = document.querySelector('.wheel-pointer');
  if (!pointer) return;
  pointer.classList.remove('wheel-pointer-tick');
  void pointer.offsetWidth;
  pointer.classList.add('wheel-pointer-tick');
}

function pulseWheelPointerLanded() {
  var pointer = document.querySelector('.wheel-pointer');
  if (!pointer) return;
  pointer.classList.remove('wheel-pointer-landed');
  void pointer.offsetWidth;
  pointer.classList.add('wheel-pointer-landed');
  if (navigator.vibrate) {
    try { navigator.vibrate(30); } catch (e) { /* unsupported/blocked — silently skip */ }
  }
}

function setWheelSpinBtnState(state) {
  var label = document.getElementById('wheelSpinBtnLabel');
  if (!label) return;
  label.textContent = state === 'spinning' ? 'Spinning…' : (wheelHasSpunOnce ? 'Spin Again' : 'Spin');
}

function initWheelPage() {
  wheelCurrentPlayer = 'john';
  wheelRotationDeg = 0;
  buildWheelSvg();
  updateWheelTurnDisplay();
  renderWheelRotation(0);
  renderWheelLandedState(-1);
  setWheelSpinBtnState('idle');
}

function updateWheelTurnDisplay() {
  var el = document.getElementById('wheelTurnDisplay');
  if (!el) return;
  if (wheelCurrentPlayer === 'john') {
    el.innerText = player1Name + "'s turn 😎";
  } else {
    el.innerText = player2Name + "'s turn 💕";
  }
}

// The tier every wheel draw comes from — see getHeatCeilingForPool() and
// getEffectiveHeatTier(). A round already in flight (mine or the
// partner's) keeps the tier it was started with, exactly like the old
// select-driven code froze tierEl.value for the duration of a round —
// just read from the round's own recorded tier instead of a hidden
// <select>'s .value now that the native select is gone (see PR notes).
function getWheelTier() {
  if (isSyncActive() && syncWheelRound) return syncWheelRound.tier;
  return getEffectiveDrawTier(getEffectiveHeatTier());
}

function easeOutBackWheel(t) {
  var c1 = 1.2, c3 = c1 + 1;
  var x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
}

function startWheelSpinAnimation(segmentIndex, targetNormOverride, forcedCard) {
  var spinBtn = document.getElementById('wheelSpinBtn');
  if (spinBtn) spinBtn.disabled = true;
  setWheelSpinBtnState('spinning');

  document.getElementById('wheelResultArea').style.display = 'none';
  document.getElementById('wheelTimerArea').style.display = 'none';
  document.getElementById('wheelNextTurnBtn').style.display = 'none';
  var teaser = document.getElementById('wheelResultTeaser');
  if (teaser) teaser.classList.add('hidden');
  var judgeSection = document.getElementById('wheelJudgeSection');
  var waitSection = document.getElementById('wheelWaitSection');
  if (judgeSection) judgeSection.style.display = 'none';
  if (waitSection) waitSection.style.display = 'none';
  if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
  wheelTimerRunning = false;

  wheelIsSpinning = true;
  wheelLandedSegment = segmentIndex;
  wheelPendingForcedCard = forcedCard || null;
  renderWheelLandedState(-1);

  // Pointer at top = 270° screen. Segment i center = (i+0.5)*segAngle
  // local. To land: rot + (i+0.5)*segAngle ≡ 270 (mod 360) →
  // targetNorm = (270 - (i+0.5)*segAngle) mod 360
  var segAngle = WHEEL_SEG_ANGLE;
  var targetNorm;
  if (targetNormOverride != null) {
    targetNorm = ((targetNormOverride % 360) + 360) % 360;
  } else {
    var randOff = (Math.random() - 0.5) * segAngle * 0.44;
    targetNorm = ((270 - (segmentIndex + 0.5) * segAngle + randOff) % 360 + 360) % 360;
  }
  var currentNorm = ((wheelRotationDeg % 360) + 360) % 360;
  var delta = ((targetNorm - currentNorm) % 360 + 360) % 360;
  if (delta < 15) delta += 360;

  var extraSpins = (5 + Math.floor(Math.random() * 4)) * 360;
  var startDeg = wheelRotationDeg;
  var endDeg = wheelRotationDeg + extraSpins + delta;
  var duration = 3600 + Math.random() * 600;
  var startTime = null;
  wheelLastTickBucket = Math.floor(startDeg / segAngle);

  function animate(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    // easeOutBack gives the fast-accelerate/gradual-decelerate spin its
    // "slight overshoot with one settle bounce" finish in a single
    // continuous curve — it overshoots past the final angle around
    // progress ~0.85-0.95 and settles exactly back to it by progress 1.
    wheelRotationDeg = startDeg + (endDeg - startDeg) * easeOutBackWheel(progress);
    var bucket = Math.floor(wheelRotationDeg / segAngle);
    if (bucket !== wheelLastTickBucket) {
      pulseWheelPointerTick();
      wheelLastTickBucket = bucket;
    }
    renderWheelRotation(wheelRotationDeg);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelRotationDeg = endDeg;
      renderWheelRotation(wheelRotationDeg);
      onWheelSpinComplete();
    }
  }
  requestAnimationFrame(animate);

  return targetNorm;
}

window.spinWheel = function () {
  if (wheelIsSpinning) return;
  if (isSyncActive()) { syncSpin(); return; }
  startWheelSpinAnimation(Math.floor(Math.random() * WHEEL_SEG_COUNT), null, null);
};

function onWheelSpinComplete() {
  wheelIsSpinning = false;
  wheelHasSpunOnce = true;
  renderWheelLandedState(wheelLandedSegment);
  pulseWheelPointerLanded();
  var spinBtn = document.getElementById('wheelSpinBtn');
  if (spinBtn) spinBtn.disabled = false;
  setWheelSpinBtnState('result');
  showWheelResultTeaser(WHEEL_SEGMENTS[wheelLandedSegment]);
  setTimeout(function () {
    showWheelResult(wheelPendingForcedCard);
    wheelPendingForcedCard = null;
  }, 700);
}

// The small "what did we land on" card shown above the wheel the instant
// it settles — category + one-line description only. The deeper reveal
// (the actual dare/position text) is the existing card further down,
// shown a beat later by showWheelResult. This card's action button ships
// in a follow-up PR; for now it's read-only.
function showWheelResultTeaser(seg) {
  var el = document.getElementById('wheelResultTeaser');
  if (!el || !seg) return;
  var glyph = document.getElementById('wheelResultTeaserGlyph');
  var name = document.getElementById('wheelResultTeaserName');
  var desc = document.getElementById('wheelResultTeaserDesc');
  if (glyph) glyph.innerHTML = appIcon(seg.iconKey, "wheel-result-teaser-glyph-img", "", true);
  if (name) name.textContent = seg.label;
  if (desc) desc.textContent = seg.tagline;
  el.classList.remove('hidden', 'wheel-result-teaser-play');
  void el.offsetWidth;
  el.classList.add('wheel-result-teaser-play');
}

function wheelCardColorClass() {
  if (isSyncActive() && syncWheelRound) {
    return syncWheelRound.myRole === 'performer' ? 'player2-card' : 'player1-card';
  }
  return wheelCurrentPlayer === 'john' ? 'player1-card' : 'player2-card';
}

// Draws the dare pool for a wheel segment at the given tier — Wildcard
// has no tag (a plain untagged draw, same shape as elsewhere in the
// app); the other six pass their tag through requireTag. pool.js itself
// already falls back to the unlockedTags-filtered (untagged) pool if a
// segment's tag has no dares written yet at this tier, same as every
// other requireTag caller — nothing wheel-specific needed here. Shared
// by the solo draw (showWheelResult) and the server-authoritative draw
// (syncSpin) so both pick from the exact same pool shape.
function drawWheelDarePool(tier, seg) {
  var opts = {
    mode: "dare", tier: tier, respectGender: false, respectPreferences: false,
    unlockedTags: getAllowedTagsForPool(), heatCeiling: getHeatCeilingForPool()
  };
  if (seg.tag) opts.requireTag = seg.tag;
  return window.Pool.getPlayablePool(opts);
}

function showWheelResult(forcedCard, skipTimerSchedule) {
  var tier = getWheelTier();
  var seg = WHEEL_SEGMENTS[wheelLandedSegment];

  var cardEl     = document.getElementById('wheelCard');
  var cardLabel  = document.getElementById('wheelCardLabel');
  var cardText   = document.getElementById('wheelCardText');
  var resultArea = document.getElementById('wheelResultArea');

  // Player border color
  cardEl.classList.remove('player1-card', 'player2-card');
  cardEl.classList.add(wheelCardColorClass());

  if (seg.tag === 'position') {
    var pos = null;
    if (forcedCard && forcedCard.positionId != null) {
      pos = positionsData.filter(function (p) { return p.id === forcedCard.positionId; })[0] || null;
    }
    if (!pos) {
      var posPool = window.Pool.getPlayablePool({ mode: "position", tier: tier });
      pos = posPool.items[Math.floor(Math.random() * posPool.items.length)];
    }
    cardLabel.innerHTML = appIcon("positions", "action-btn-icon", "", true) + 'POSITION';
    cardText.innerHTML =
      '<strong style="font-size:17px;">' + pos.name + '</strong>' +
      '<span style="font-size:13px;opacity:0.82;line-height:1.65;display:block;margin-top:7px;">' + pos.description + '</span>' +
      '<span style="font-size:11px;opacity:0.58;display:block;margin-top:8px;">💡 ' + pos.tips + '</span>';
  } else {
    var dares = gameData[tier].dares;
    var dare = null;
    if (forcedCard && forcedCard.cardIndex != null) {
      dare = dares[forcedCard.cardIndex] || null;
    }
    if (!dare) {
      var darePool = drawWheelDarePool(tier, seg);
      dare = darePool.items[Math.floor(Math.random() * darePool.items.length)];
    }
    cardLabel.innerHTML = appIcon(seg.iconKey, "action-btn-icon", "", true) + seg.label.toUpperCase();
    cardText.innerText = dare ? dare.text : "No cards available for this player 😅";
  }

  resultArea.style.display = 'block';

  // Burn reveal
  cardEl.classList.remove('wheel-burn-reveal');
  void cardEl.offsetWidth;
  cardEl.classList.add('wheel-burn-reveal');
  setTimeout(function () { cardEl.classList.remove('wheel-burn-reveal'); }, 1900);

  if (!skipTimerSchedule) setTimeout(showWheelTimer, 1500);
}

function showWheelTimer() {
  var opts = [30, 60, 90, 120, 150, 180];
  wheelTimerSeconds = opts[Math.floor(Math.random() * opts.length)];
  var disp    = document.getElementById('wheelTimerDisplay');
  var startBtn = document.getElementById('wheelStartTimerBtn');
  var nextBtn  = document.getElementById('wheelNextTurnBtn');
  var area     = document.getElementById('wheelTimerArea');
  if (disp)     { disp.innerText = formatWheelTime(wheelTimerSeconds); disp.className = 'wheel-timer-display'; }
  if (startBtn)  startBtn.style.display = 'inline-block';
  if (nextBtn)   nextBtn.style.display  = 'none';
  if (area)      area.style.display     = 'block';
  wheelTimerRunning = false;
}

function formatWheelTime(s) {
  return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
}

window.startWheelTimer = function () {
  if (wheelTimerRunning) return;
  wheelTimerRunning = true;
  var startBtn = document.getElementById('wheelStartTimerBtn');
  var disp     = document.getElementById('wheelTimerDisplay');
  if (startBtn) startBtn.style.display = 'none';
  if (disp)     disp.classList.add('wt-pulse');

  wheelTimerInterval = setInterval(function () {
    wheelTimerSeconds--;
    var d = document.getElementById('wheelTimerDisplay');
    if (wheelTimerSeconds <= 0) {
      clearInterval(wheelTimerInterval);
      wheelTimerInterval = null;
      wheelTimerRunning = false;

      var flash = document.createElement('div');
      flash.className = 'wheel-screen-flash';
      document.body.appendChild(flash);
      setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 620);

      if (d) { d.innerText = 'Done! 🔥'; d.className = 'wheel-timer-display wt-done'; }

      setTimeout(function () {
        if (isSyncActive() && syncWheelRound && syncWheelRound.cardKind === 'dare') {
          showWheelJudgeUI();
        } else {
          var nb = document.getElementById('wheelNextTurnBtn');
          if (nb) nb.style.display = 'inline-block';
        }
      }, 500);
    } else {
      if (d) d.innerText = formatWheelTime(wheelTimerSeconds);
    }
  }, 1000);
};

window.wheelNextTurn = function () {
  if (typeof markRoundPlayed === "function") markRoundPlayed();
  var teaser = document.getElementById('wheelResultTeaser');
  if (teaser) teaser.classList.add('hidden');
  if (isSyncActive()) {
    resetWheelSyncUI();
    document.getElementById('wheelResultArea').style.display = 'none';
    document.getElementById('wheelTimerArea').style.display = 'none';
    document.getElementById('wheelNextTurnBtn').style.display = 'none';
    if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
    wheelTimerRunning = false;
    renderWheelLandedState(-1);
    if (typeof refreshEngineSnapshot === "function") refreshEngineSnapshot();
    return;
  }
  wheelCurrentPlayer = wheelCurrentPlayer === 'john' ? 'felicity' : 'john';
  updateWheelTurnDisplay();
  document.getElementById('wheelResultArea').style.display = 'none';
  document.getElementById('wheelTimerArea').style.display = 'none';
  document.getElementById('wheelNextTurnBtn').style.display = 'none';
  if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
  wheelTimerRunning = false;
  renderWheelLandedState(-1);
};

// ========================= //
// SPIN WHEEL SYNC           //
// ========================= //
// Same performer/judge role rule as Truth or Dare, reusing its
// 'points_awarded' event so both modes feed one running score. The
// outcome (segment + exact landing angle + which card/position) is
// decided once by whoever spins and broadcast — the partner's wheel
// replays that same outcome rather than rolling its own. The segment
// index always refers to WHEEL_SEGMENTS, so both devices land on the
// identical category regardless of which one's dial happened to move
// the effective heat most recently.

function syncSpin() {
  var tier = getEffectiveDrawTier(getEffectiveHeatTier());
  var segmentIndex = Math.floor(Math.random() * WHEEL_SEG_COUNT);
  var seg = WHEEL_SEGMENTS[segmentIndex];
  var roundId = genRoundId();
  var performerId = gameSyncMyId();

  var forcedCard = { cardIndex: null, positionId: null };
  if (seg.tag === 'position') {
    var posPool = window.Pool.getPlayablePool({ mode: "position", tier: tier });
    var pos = posPool.items[Math.floor(Math.random() * posPool.items.length)];
    forcedCard.positionId = pos.id;
  } else {
    var darePool = drawWheelDarePool(tier, seg);
    var dare = darePool.items[Math.floor(Math.random() * darePool.items.length)];
    forcedCard.cardIndex = darePool.fullList.indexOf(dare);
  }

  syncWheelRound = {
    roundId: roundId, tier: tier, segmentIndex: segmentIndex, tag: seg.tag,
    cardKind: seg.tag === 'position' ? 'position' : 'dare',
    cardIndex: forcedCard.cardIndex, positionId: forcedCard.positionId,
    performerId: performerId, myRole: 'performer'
  };

  var label = document.getElementById('wheelSpunByLabel');
  if (label) label.classList.add('hidden');

  var targetNorm = startWheelSpinAnimation(segmentIndex, null, forcedCard);

  window.GameSync.send('wheel_spun', {
    roundId: roundId, tier: tier, segmentIndex: segmentIndex, targetRotationDeg: targetNorm,
    tag: seg.tag, cardKind: syncWheelRound.cardKind, cardIndex: forcedCard.cardIndex, positionId: forcedCard.positionId,
    performer_user_id: performerId
  });
}

function applyRemoteWheelSpun(ev) {
  var p = ev.payload || {};
  var myId = gameSyncMyId();
  var myRole = p.performer_user_id === myId ? 'performer' : 'judge';

  syncWheelRound = {
    roundId: p.roundId, tier: p.tier, segmentIndex: p.segmentIndex, tag: p.tag,
    cardKind: p.cardKind, cardIndex: p.cardIndex, positionId: p.positionId,
    performerId: p.performer_user_id, myRole: myRole
  };

  var label = document.getElementById('wheelSpunByLabel');
  if (label) {
    label.innerHTML = appIcon("spinTheWheel", "action-btn-icon", "", true) + 'Spun by ' + escapeHtml(gameSyncPartnerName || 'your partner');
    label.classList.remove('hidden');
  }

  if (wheelIsSpinning) return;
  startWheelSpinAnimation(p.segmentIndex, p.targetRotationDeg, { cardIndex: p.cardIndex, positionId: p.positionId });
}

// Reconnect/rebuild path: jump straight to the resolved reveal + the
// right judge/wait controls, rather than replaying the spin animation
// and a from-scratch timer for a round that's already in progress.
function restoreWheelRound(starterEvent) {
  var p = starterEvent.payload || {};
  var myId = gameSyncMyId();
  var myRole = p.performer_user_id === myId ? "performer" : "judge";

  wheelLandedSegment = p.segmentIndex;
  wheelHasSpunOnce = true;
  if (p.targetRotationDeg != null) wheelRotationDeg = p.targetRotationDeg;
  buildWheelSvg();
  renderWheelRotation(wheelRotationDeg);
  renderWheelLandedState(wheelLandedSegment);
  setWheelSpinBtnState('result');

  syncWheelRound = {
    roundId: p.roundId, tier: p.tier, segmentIndex: p.segmentIndex, tag: p.tag,
    cardKind: p.cardKind, cardIndex: p.cardIndex, positionId: p.positionId,
    performerId: p.performer_user_id, myRole: myRole
  };

  var label = document.getElementById("wheelSpunByLabel");
  if (label) {
    if (myRole === "judge") {
      label.innerHTML = appIcon("spinTheWheel", "action-btn-icon", "", true) + "Spun by " + escapeHtml(gameSyncPartnerName || "your partner");
      label.classList.remove("hidden");
    } else {
      label.classList.add("hidden");
    }
  }

  showWheelResult({ cardIndex: p.cardIndex, positionId: p.positionId }, true);
  var timerArea = document.getElementById("wheelTimerArea");
  if (timerArea) timerArea.style.display = "none";

  if (p.cardKind === "dare") {
    showWheelJudgeUI();
  } else {
    var nb = document.getElementById("wheelNextTurnBtn");
    if (nb) nb.style.display = "inline-block";
  }
}

function resetWheelSyncUI() {
  syncWheelRound = null;
  var judgeSection = document.getElementById('wheelJudgeSection');
  var waitSection = document.getElementById('wheelWaitSection');
  var label = document.getElementById('wheelSpunByLabel');
  if (judgeSection) judgeSection.style.display = 'none';
  if (waitSection) waitSection.style.display = 'none';
  if (label) label.classList.add('hidden');
}

function showWheelJudgeUI() {
  if (!syncWheelRound) return;
  var judgeSection = document.getElementById('wheelJudgeSection');
  var waitSection = document.getElementById('wheelWaitSection');
  if (syncWheelRound.myRole === 'judge') {
    var container = document.getElementById('wheelPointButtons');
    container.innerHTML = '';
    (pointRanges[syncWheelRound.tier] || []).forEach(function (points) {
      var btn = document.createElement('button');
      btn.innerText = points;
      btn.onclick = function () { syncAwardWheelPoints(points); };
      container.appendChild(btn);
    });
    judgeSection.style.display = 'block';
    waitSection.style.display = 'none';
  } else {
    document.getElementById('wheelWaitText').innerText = (gameSyncPartnerName || 'Your partner') + ' is scoring you… 👀';
    waitSection.style.display = 'block';
    judgeSection.style.display = 'none';
  }
}

function syncAwardWheelPoints(amount) {
  if (!syncWheelRound || syncWheelRound.myRole !== 'judge') return;
  var round = syncWheelRound;
  applySyncScoreDelta(round.performerId, amount);
  showStatus((gameSyncPartnerName || 'Partner') + ' +' + amount + ' 🔥');
  showSyncOutcome('wheelCard', amount > 0);
  resetWheelSyncUI();
  var nb = document.getElementById('wheelNextTurnBtn');
  if (nb) nb.style.display = 'inline-block';
  window.GameSync.send('points_awarded', {
    roundId: round.roundId, performer_user_id: round.performerId, amount: amount, tier: round.tier, source: 'wheel'
  });
}

window.addEventListener('load', function () { initWheelPage(); });
