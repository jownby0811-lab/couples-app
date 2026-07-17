window.showPage = function (pageId) {
  let sections = document.getElementsByClassName("section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  document.getElementById(pageId).classList.add("active");
  document.getElementById("menu").style.left = "-260px";
  if (pageId === "account" && typeof renderAccountPage === "function") {
    renderAccountPage();
  }
  if (pageId === "personalize" && typeof initPersonalizePage === "function") {
    initPersonalizePage();
  }
  if (pageId === "truth" && typeof refreshAllPreferenceCaches === "function") {
    updateMatchedOnlyUI();
    refreshAllPreferenceCaches();
  }
  if (pageId === "wheel" && typeof resizeWheelCanvas === "function") {
    resizeWheelCanvas();
    drawWheelCanvas(wheelRotationDeg, wheelLandedSegment);
  }
  if (typeof setGameSyncPage === "function") setGameSyncPage(pageId);
};

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

function getSelectedTier() {
  return document.getElementById("tierSelect").value;
}

window.toggleMenu = function () {
  const menu = document.getElementById("menu");
  if (!menu) { console.log("Menu not found"); return; }
  if (menu.style.left === "0px") {
    menu.style.left = "-260px";
  } else {
    menu.style.left = "0px";
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
  document.getElementById("menu").style.left = "-260px";
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

function getFilteredList(list) {
  return list.filter(card => {
    let genders = getCardGender(card);
    if (currentPlayer === "john") {
      return genders.includes("male") || genders.includes("neutral");
    } else {
      return genders.includes("female") || genders.includes("neutral");
    }
  });
}

function animateCardText(randomText) {
  let text = document.getElementById("todResult");
  text.classList.remove("fade-in");
  void text.offsetWidth;
  text.innerText = randomText;
  text.classList.add("fade-in");
}

function triggerBurnReveal(card) {
  card.classList.remove("burn-reveal");
  void card.offsetWidth;
  card.classList.add("burn-reveal");
  setTimeout(() => { card.classList.remove("burn-reveal"); }, 1900);
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
  if (isSyncActive()) { syncDrawCard("truth"); return; }
  let tier = getSelectedTier();
  let fullList = gameData[tier].truths;
  let list = getFilteredList(fullList);
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
  if (isSyncActive()) { syncDrawCard("dare"); return; }
  let tier = getSelectedTier();
  let fullList = gameData[tier].dares;
  let list = getFilteredList(fullList);
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
  if (currentCardMeta) showInGameRatingStrip(currentCardMeta.mode, currentCardMeta.tier, currentCardMeta.cardIndex);
}

function failTruth() {
  if (isSyncActive()) { syncJudgeTruth("fail"); return; }
  showStatus("No points awarded 😅");
  endTurn();
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
  if (currentCardMeta) showInGameRatingStrip(currentCardMeta.mode, currentCardMeta.tier, currentCardMeta.cardIndex);
}

function endTurn() {
  document.getElementById("passFailSection").style.display = "none";
  document.getElementById("pointSection").style.display = "none";
  document.getElementById("skipSection").style.display = "none";
  currentPlayer = currentPlayer === "john" ? "felicity" : "john";
  updateTurnDisplay();
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
}

function syncDrawCard(mode) {
  if (typeof hideInGameRatingStrip === "function") hideInGameRatingStrip();
  var tier = getSelectedTier();
  var fullList = gameData[tier][mode === "truth" ? "truths" : "dares"];
  var list = getFilteredList(fullList);
  list = applyPreferenceFilter(list, tier, fullList, mode);
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
}

function syncAwardPoints(amount) {
  if (!syncTruthRound || syncTruthRound.myRole !== "judge" || syncTruthRound.mode !== "dare") return;
  var round = syncTruthRound;
  if (round.doubleDown) amount = amount * 2;
  applySyncScoreDelta(round.performerId, amount);
  showStatus((gameSyncPartnerName || "Partner") + " +" + amount + (round.doubleDown ? " 🔥 (Double Down!)" : " 🔥"));
  showSyncOutcome("todCard", amount > 0);
  endSyncTruthRound();
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

// Only ever narrows the deck for couple-linked users — logged-out or
// unlinked players keep the exact original unfiltered deck.
function applyPreferenceFilter(list, tier, fullList, itemType) {
  if (!isSyncActive()) return list;
  if (matchedOnly) {
    return list.filter(function (card) {
      var idx = fullList.indexOf(card);
      return Object.prototype.hasOwnProperty.call(itemMutualMatches[itemType], tierItemId(tier, idx));
    });
  }
  return list.filter(function (card) {
    var idx = fullList.indexOf(card);
    return itemRatings[itemType][tierItemId(tier, idx)] !== "no";
  });
}

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

// ---- Personalize page ----

async function initPersonalizePage() {
  await refreshAllPreferenceCaches();
  renderPersonalizeTagChips();
  renderPersonalizeList();
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

window.submitOnboarding = function () {
  let p1 = document.getElementById("p1Input").value.trim();
  let p2 = document.getElementById("p2Input").value.trim();
  if (!p1) { document.getElementById("p1Input").focus(); return; }
  if (!p2) { document.getElementById("p2Input").focus(); return; }
  player1Name = p1;
  player2Name = p2;
  localStorage.setItem("player1Name", player1Name);
  localStorage.setItem("player2Name", player2Name);
  document.getElementById("onboarding").classList.add("hidden");
  updateNameDisplays();
  updateTurnDisplay();
};

window.updateNames = function () {
  document.getElementById("p1Input").value = localStorage.getItem("player1Name") || "";
  document.getElementById("p2Input").value = localStorage.getItem("player2Name") || "";
  document.getElementById("menu").style.left = "-260px";
  document.getElementById("onboarding").classList.remove("hidden");
};

window.addEventListener("load", function () {
  updateScoreDisplay();
  updateNameDisplays();
  updateDrinkModeUI();
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
    await window.Backend.signUp(email, password, name);
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
    area.innerHTML =
      '<p class="auth-sub">Linked with <strong>' + escapeHtml(couple.partnerName) + '</strong> 💞</p>' +
      '<button onclick="handleLeaveCouple()" class="auth-secondary-btn">Leave Couple</button>';
  }
}

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
    renderAccountCoupleArea();
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

function genRoundId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function applySyncScoreDelta(userId, delta) {
  if (!userId || !delta) return;
  if (userId === gameSyncMyId()) syncScores.mine = Math.max(0, syncScores.mine + delta);
  else syncScores.partner = Math.max(0, syncScores.partner + delta);
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
  if (wheelTurnEl && synced) wheelTurnEl.innerText = "Either of you can spin 🎡";
  else if (wheelTurnEl) updateWheelTurnDisplay();
  updateScoreDisplay();
  updateWheelScoreDisplay();
  if (typeof updateCardMenuVisibility === "function") updateCardMenuVisibility();
}

function updateWheelScoreDisplay() {
  var el = document.getElementById("wheelScoreDisplay");
  if (!el) return;
  if (!isSyncActive()) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  el.innerText = (gameSyncMyName || "You") + ": " + syncScores.mine + " 🔥  |  " + (gameSyncPartnerName || "Partner") + ": " + syncScores.partner + " 🔥";
}

function handleGameBackendChange() {
  gameSyncPartnerName = (window.GameSync && window.GameSync.getPartnerName()) || "";
  if (window.Backend && window.Backend.isLoggedIn()) {
    window.Backend.getProfile().then(function (p) {
      gameSyncMyName = (p && p.display_name) || "You";
      applySyncVisibility();
    });
  } else {
    gameSyncMyName = "You";
  }
  reconcileGameSyncSubscription();
  if (typeof updateMatchedOnlyUI === "function") updateMatchedOnlyUI();
  if (typeof refreshAllPreferenceCaches === "function") refreshAllPreferenceCaches();
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
  spice:       { name: "Spice",       cost: 35, effect: "Upgrade the current dare one tier." },
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
  var mode = syncTruthRound.mode, tier = syncTruthRound.tier;
  var fullList = gameData[tier][mode === "truth" ? "truths" : "dares"];
  var list = applyPreferenceFilter(getFilteredList(fullList), tier, fullList, mode);
  if (list.length === 0) { showStatus("No fresh cards available to redraw 😅"); return null; }
  var randomCard = list[Math.floor(Math.random() * list.length)];
  var cardIndex = fullList.indexOf(randomCard);
  return { roundId: genRoundId(), mode: mode, tier: tier, cardIndex: cardIndex, performer_user_id: syncTruthRound.performerId };
}

function buildSpicePayload() {
  if (!syncTruthRound || syncTruthRound.myRole !== "performer" || syncTruthRound.mode !== "dare") return null;
  var curIdx = TIER_ORDER.indexOf(syncTruthRound.tier);
  var newTier = (curIdx >= 0 && curIdx < TIER_ORDER.length - 1) ? TIER_ORDER[curIdx + 1] : TIER_ORDER[TIER_ORDER.length - 1];
  var fullList = gameData[newTier].dares;
  var list = applyPreferenceFilter(getFilteredList(fullList), newTier, fullList, "dare");
  if (list.length === 0) { showStatus("No cards available at that tier 😅"); return null; }
  var randomCard = list[Math.floor(Math.random() * list.length)];
  var cardIndex = fullList.indexOf(randomCard);
  return { roundId: genRoundId(), mode: "dare", tier: newTier, cardIndex: cardIndex, performer_user_id: syncTruthRound.performerId };
}

// Wildcard's pool is the mutual-match pool specifically (not just
// "not rated no") — "the matched deck" — which is inherently a subset
// of every card effect's preference-sovereignty requirement.
function getWildcardPool(tier) {
  var fullList = gameData[tier].dares;
  var pool = [];
  fullList.forEach(function (card, idx) {
    if (itemMutualMatches.dare[tierItemId(tier, idx)] === true) pool.push({ card: card, cardIndex: idx });
  });
  return pool;
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
}

function applyCardEffect(cardType, payload) {
  if (cardType === "reverse") applyReverseEffect(payload);
  else if (cardType === "double_down") applyDoubleDownEffect(payload);
  else if (cardType === "shield") applyShieldEffect(payload);
  else if (cardType === "redraw" || cardType === "spice" || cardType === "wildcard") {
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
  var tier = getSelectedTier();
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
// Visible only on the Truth or Dare page while synced with a partner —
// solo/unlinked players never see any of this (see updateCardMenuVisibility).

window.toggleCardMenu = function () {
  var menu = document.getElementById("cardMenu");
  if (!menu) return;
  if (cardMenuOpen) {
    menu.style.right = "-320px";
    cardMenuOpen = false;
  } else {
    menu.style.right = "0px";
    cardMenuOpen = true;
    renderCardShop();
  }
};

function updateCardMenuVisibility() {
  var btn = document.getElementById("cardMenuBtn");
  var truthSection = document.getElementById("truth");
  var onTruthPage = !!(truthSection && truthSection.classList.contains("active"));
  var show = isSyncActive() && onTruthPage;
  if (btn) btn.classList.toggle("hidden", !show);
  if (!show) {
    var menu = document.getElementById("cardMenu");
    if (menu) menu.style.right = "-320px";
    cardMenuOpen = false;
  }
  if (show) { renderCardShop(); renderHandTray(); }
  else {
    var tray = document.getElementById("handTray");
    if (tray) tray.classList.add("hidden");
  }
}

function renderCardShop() {
  var balanceEl = document.getElementById("cardShopBalance");
  if (balanceEl) balanceEl.innerText = cardBalance.mine + " pts";

  var list = document.getElementById("cardShopList");
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
          "<span class=\"card-shop-cost\">" + def.cost + " pts</span>" +
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

var wheelSegmentDefs = {
  tease: [
    { label: 'Kissing',    emoji: '💋', tag: 'kissing'    },
    { label: 'Teasing',    emoji: '😏', tag: 'teasing'    },
    { label: 'Massage',    emoji: '💆', tag: 'massage'    },
    { label: 'Manual',     emoji: '🤚', tag: 'manual'     },
    { label: 'Dirty Talk', emoji: '💬', tag: 'dirty-talk' },
    { label: 'Position',   emoji: '🔀', tag: 'position'   }
  ],
  foreplay: [
    { label: 'Oral',       emoji: '👄', tag: 'oral'       },
    { label: 'Manual',     emoji: '🤚', tag: 'manual'     },
    { label: 'Teasing',    emoji: '😏', tag: 'teasing'    },
    { label: 'Toys',       emoji: '🧸', tag: 'toys'       },
    { label: 'Dirty Talk', emoji: '💬', tag: 'dirty-talk' },
    { label: 'Position',   emoji: '🔀', tag: 'position'   }
  ],
  dirty: [
    { label: 'Oral',       emoji: '👄', tag: 'oral'       },
    { label: 'Bondage',    emoji: '🔗', tag: 'bondage'    },
    { label: 'Spanking',   emoji: '👋', tag: 'spanking'   },
    { label: 'Toys',       emoji: '🧸', tag: 'toys'       },
    { label: 'Dirty Talk', emoji: '💬', tag: 'dirty-talk' },
    { label: 'Position',   emoji: '🔀', tag: 'position'   }
  ]
};

function initWheelPage() {
  wheelCurrentPlayer = 'john';
  wheelRotationDeg = 0;
  updateWheelTurnDisplay();
  resizeWheelCanvas();
  drawWheelCanvas(0, -1);
  // Canvas text doesn't wait for web fonts on its own — force a crisp
  // redraw once the italic Playfair Display face has actually loaded.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      drawWheelCanvas(wheelRotationDeg, wheelLandedSegment);
    });
  }
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

window.wheelTierChanged = function () {
  drawWheelCanvas(wheelRotationDeg, -1);
};

var wheelResizeTimer = null;
window.addEventListener('resize', function () {
  if (wheelResizeTimer) clearTimeout(wheelResizeTimer);
  wheelResizeTimer = setTimeout(function () {
    var wheelSection = document.getElementById('wheel');
    if (wheelSection && wheelSection.classList.contains('active')) {
      resizeWheelCanvas();
      drawWheelCanvas(wheelRotationDeg, wheelLandedSegment);
    }
  }, 150);
});

function easeOutCubicWheel(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Fits an (optionally two-word) segment label into the available chord
// width by shrinking the italic Playfair Display size, then draws it with
// a soft rose-gold glow behind high-contrast dark fill. Auto-fit keeps this
// legible regardless of exact glyph metrics (script/serif fonts vary).
function drawWheelSegmentLabel(ctx, label, availWidth, baseSize, minSize) {
  var parts = label.indexOf(' ') !== -1 ? label.split(' ') : [label];
  var size = baseSize;
  function setFont(s) { ctx.font = 'italic 700 ' + s + 'px "Playfair Display", serif'; }
  function widestPart() {
    var w = 0;
    parts.forEach(function (p) { w = Math.max(w, ctx.measureText(p).width); });
    return w;
  }
  setFont(size);
  while (size > minSize && widestPart() > availWidth) {
    size -= 1;
    setFont(size);
  }
  ctx.shadowColor = 'rgba(201,169,122,0.65)';
  ctx.shadowBlur = Math.max(3, Math.round(size * 0.22));
  ctx.fillStyle = '#1b1008';
  if (parts.length === 2) {
    var lineGap = size * 0.98;
    ctx.fillText(parts[0], 0, -lineGap / 2);
    ctx.fillText(parts[1], 0, lineGap / 2);
  } else {
    ctx.fillText(parts[0], 0, 0);
  }
  ctx.shadowBlur = 0;
}

function resizeWheelCanvas() {
  var canvas = document.getElementById('wheelCanvas');
  var wrapper = document.querySelector('.wheel-wrapper');
  if (!canvas || !wrapper) return;
  var size = wrapper.clientWidth;
  if (!size) return;
  var dpr = window.devicePixelRatio || 1;
  var target = Math.round(size * dpr);
  if (canvas.width !== target) {
    canvas.width = target;
    canvas.height = target;
  }
}

function drawWheelCanvas(rotDeg, landedSeg) {
  var canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var W = canvas.width / dpr, H = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  var cx = W / 2, cy = H / 2;
  var outerR = cx - 5;
  var numSeg = 6;
  var arcAngle = (2 * Math.PI) / numSeg;
  var rot = rotDeg * Math.PI / 180;

  ctx.clearRect(0, 0, W, H);

  var tierEl = document.getElementById('wheelTierSelect');
  var tier = tierEl ? tierEl.value : 'tease';
  var segs = wheelSegmentDefs[tier];

  for (var i = 0; i < numSeg; i++) {
    var startAngle = rot + i * arcAngle;
    var endAngle = startAngle + arcAngle;
    var isLanded = (i === landedSeg);

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.closePath();
    if (isLanded) {
      ctx.shadowColor = i % 2 === 0 ? 'rgba(201,169,122,1)' : 'rgba(210,215,224,1)';
      ctx.shadowBlur = 28;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(220,196,155,1)' : 'rgba(228,233,244,1)';
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(201,169,122,1)' : 'rgba(210,215,224,1)';
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Divider stroke
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(8,6,16,0.72)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Label at segment center — elegant italic serif, no emoji, sized to
    // the wheel and auto-fit to the segment so it never gets clipped.
    var midAngle = rot + (i + 0.5) * arcAngle;
    var labelR = outerR * 0.62;
    var textX = cx + Math.cos(midAngle) * labelR;
    var textY = cy + Math.sin(midAngle) * labelR;
    var availWidth = 2 * labelR * Math.sin(arcAngle / 2) * 0.82;
    var baseFontSize = Math.max(14, Math.round(outerR * 0.16));

    ctx.save();
    ctx.translate(textX, textY);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawWheelSegmentLabel(ctx, segs[i].label, availWidth, baseFontSize, 11);
    ctx.restore();
  }

  // Chrome gradient outer ring
  var ringGrad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
  ringGrad.addColorStop(0,    '#c9a97a');
  ringGrad.addColorStop(0.43, '#c9a97a');
  ringGrad.addColorStop(0.68, '#b8bcc4');
  ringGrad.addColorStop(1,    '#c8cdd6');
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 2, 0, 2 * Math.PI);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Dark ring to mask segment edges at center
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(10,8,18,1)';
  ctx.fill();

  // Center pin drawn at exact mathematical center (cx, cy)
  var pinR = 15;
  var pinGrad = ctx.createLinearGradient(cx - pinR, cy - pinR, cx + pinR, cy + pinR);
  pinGrad.addColorStop(0, '#c9a97a');
  pinGrad.addColorStop(1, '#c8cdd6');
  ctx.shadowColor = 'rgba(201,169,122,0.7)';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(cx, cy, pinR, 0, 2 * Math.PI);
  ctx.fillStyle = pinGrad;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, pinR, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function startWheelSpinAnimation(segmentIndex, targetNormOverride, forcedCard) {
  var spinBtn = document.getElementById('wheelSpinBtn');
  if (spinBtn) spinBtn.disabled = true;

  document.getElementById('wheelResultArea').style.display = 'none';
  document.getElementById('wheelTimerArea').style.display = 'none';
  document.getElementById('wheelNextTurnBtn').style.display = 'none';
  var judgeSection = document.getElementById('wheelJudgeSection');
  var waitSection = document.getElementById('wheelWaitSection');
  if (judgeSection) judgeSection.style.display = 'none';
  if (waitSection) waitSection.style.display = 'none';
  if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
  wheelTimerRunning = false;

  wheelIsSpinning = true;
  wheelLandedSegment = segmentIndex;
  wheelPendingForcedCard = forcedCard || null;

  // Pointer at top = 270° screen. Segment i center = (i+0.5)*60° local.
  // To land: rot + (i+0.5)*60 ≡ 270 (mod 360) → targetNorm = (270 - (i+0.5)*60) mod 360
  var segAngle = 60;
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

  function animate(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    wheelRotationDeg = startDeg + (endDeg - startDeg) * easeOutCubicWheel(progress);
    drawWheelCanvas(wheelRotationDeg, -1);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelRotationDeg = endDeg;
      onWheelSpinComplete();
    }
  }
  requestAnimationFrame(animate);

  return targetNorm;
}

window.spinWheel = function () {
  if (wheelIsSpinning) return;
  if (isSyncActive()) { syncSpin(); return; }
  startWheelSpinAnimation(Math.floor(Math.random() * 6), null, null);
};

function onWheelSpinComplete() {
  wheelIsSpinning = false;
  drawWheelCanvas(wheelRotationDeg, wheelLandedSegment);
  var spinBtn = document.getElementById('wheelSpinBtn');
  if (spinBtn) spinBtn.disabled = false;
  setTimeout(function () {
    showWheelResult(wheelPendingForcedCard);
    wheelPendingForcedCard = null;
  }, 700);
}

function wheelCardColorClass() {
  if (isSyncActive() && syncWheelRound) {
    return syncWheelRound.myRole === 'performer' ? 'player2-card' : 'player1-card';
  }
  return wheelCurrentPlayer === 'john' ? 'player1-card' : 'player2-card';
}

function showWheelResult(forcedCard, skipTimerSchedule) {
  var tierEl = document.getElementById('wheelTierSelect');
  var tier = tierEl ? tierEl.value : 'tease';
  var seg = wheelSegmentDefs[tier][wheelLandedSegment];

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
      var diffMap = { tease: 'beginner', foreplay: 'intermediate', dirty: 'advanced' };
      var pool = positionsData.filter(function (p) { return p.difficulty === diffMap[tier]; });
      if (!pool.length) pool = positionsData;
      pos = pool[Math.floor(Math.random() * pool.length)];
    }
    cardLabel.innerText = '🔀 POSITION';
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
      var filtered = dares.filter(function (d) { return d.tags && d.tags.indexOf(seg.tag) !== -1; });
      if (!filtered.length) filtered = dares;
      dare = filtered[Math.floor(Math.random() * filtered.length)];
    }
    cardLabel.innerText = seg.emoji + ' ' + seg.label.toUpperCase();
    cardText.innerText = dare.text;
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
  if (isSyncActive()) {
    resetWheelSyncUI();
    document.getElementById('wheelResultArea').style.display = 'none';
    document.getElementById('wheelTimerArea').style.display = 'none';
    document.getElementById('wheelNextTurnBtn').style.display = 'none';
    if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
    wheelTimerRunning = false;
    drawWheelCanvas(wheelRotationDeg, -1);
    return;
  }
  wheelCurrentPlayer = wheelCurrentPlayer === 'john' ? 'felicity' : 'john';
  updateWheelTurnDisplay();
  document.getElementById('wheelResultArea').style.display = 'none';
  document.getElementById('wheelTimerArea').style.display = 'none';
  document.getElementById('wheelNextTurnBtn').style.display = 'none';
  if (wheelTimerInterval) { clearInterval(wheelTimerInterval); wheelTimerInterval = null; }
  wheelTimerRunning = false;
  drawWheelCanvas(wheelRotationDeg, -1);
};

// ========================= //
// SPIN WHEEL SYNC           //
// ========================= //
// Same performer/judge role rule as Truth or Dare, reusing its
// 'points_awarded' event so both modes feed one running score. The
// outcome (segment + exact landing angle + which card/position) is
// decided once by whoever spins and broadcast — the partner's wheel
// replays that same outcome rather than rolling its own.

function syncSpin() {
  var tierEl = document.getElementById('wheelTierSelect');
  var tier = tierEl ? tierEl.value : 'tease';
  var segmentIndex = Math.floor(Math.random() * 6);
  var seg = wheelSegmentDefs[tier][segmentIndex];
  var roundId = genRoundId();
  var performerId = gameSyncMyId();

  var forcedCard = { cardIndex: null, positionId: null };
  if (seg.tag === 'position') {
    var diffMap = { tease: 'beginner', foreplay: 'intermediate', dirty: 'advanced' };
    var pool = positionsData.filter(function (p) { return p.difficulty === diffMap[tier]; });
    if (!pool.length) pool = positionsData;
    var pos = pool[Math.floor(Math.random() * pool.length)];
    forcedCard.positionId = pos.id;
  } else {
    var dares = gameData[tier].dares;
    var filtered = dares.filter(function (d) { return d.tags && d.tags.indexOf(seg.tag) !== -1; });
    if (!filtered.length) filtered = dares;
    var dare = filtered[Math.floor(Math.random() * filtered.length)];
    forcedCard.cardIndex = dares.indexOf(dare);
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

  var tierEl = document.getElementById('wheelTierSelect');
  if (tierEl) tierEl.value = p.tier;

  syncWheelRound = {
    roundId: p.roundId, tier: p.tier, segmentIndex: p.segmentIndex, tag: p.tag,
    cardKind: p.cardKind, cardIndex: p.cardIndex, positionId: p.positionId,
    performerId: p.performer_user_id, myRole: myRole
  };

  var label = document.getElementById('wheelSpunByLabel');
  if (label) {
    label.innerText = '🎡 Spun by ' + (gameSyncPartnerName || 'your partner');
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

  var tierEl = document.getElementById("wheelTierSelect");
  if (tierEl) tierEl.value = p.tier;
  wheelLandedSegment = p.segmentIndex;
  if (p.targetRotationDeg != null) wheelRotationDeg = p.targetRotationDeg;
  drawWheelCanvas(wheelRotationDeg, wheelLandedSegment);

  syncWheelRound = {
    roundId: p.roundId, tier: p.tier, segmentIndex: p.segmentIndex, tag: p.tag,
    cardKind: p.cardKind, cardIndex: p.cardIndex, positionId: p.positionId,
    performerId: p.performer_user_id, myRole: myRole
  };

  var label = document.getElementById("wheelSpunByLabel");
  if (label) {
    if (myRole === "judge") {
      label.innerText = "🎡 Spun by " + (gameSyncPartnerName || "your partner");
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
