window.showPage = function (pageId) {
  let sections = document.getElementsByClassName("section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  document.getElementById(pageId).classList.add("active");
  document.getElementById("menu").style.left = "-260px";
};

let johnScore = parseInt(localStorage.getItem("johnScore")) || 0;
let felicityScore = parseInt(localStorage.getItem("felicityScore")) || 0;
let player1Name = localStorage.getItem("player1Name") || "Him";
let player2Name = localStorage.getItem("player2Name") || "Her";
let currentPlayer = "john";
let currentTier = "";

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
  }
};

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
  let tier = getSelectedTier();
  let fullList = gameData[tier].truths;
  let list = getFilteredList(fullList);
  if (list.length === 0) { showStatus("No cards available for this player 😅"); return; }
  let randomCard = list[Math.floor(Math.random() * list.length)];
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
}

function getDare() {
  let tier = getSelectedTier();
  let fullList = gameData[tier].dares;
  let list = getFilteredList(fullList);
  if (list.length === 0) { showStatus("No cards available for this player 😅"); return; }
  let randomCard = list[Math.floor(Math.random() * list.length)];
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
}

function spin() {
  let options = ["Truth", "Dare", "Kiss", "Massage", "Skip"];
  let result = options[Math.floor(Math.random() * options.length)];
  document.getElementById("result").innerText = result;
}

function updateScoreDisplay() {
  document.getElementById("johnScoreDisplay").innerText = johnScore;
  document.getElementById("felicityScoreDisplay").innerText = felicityScore;
}

function updateNameDisplays() {
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
}

function failTruth() {
  showStatus("No points awarded 😅");
  endTurn();
}

function awardPoints(points) {
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
}

function endTurn() {
  document.getElementById("passFailSection").style.display = "none";
  document.getElementById("pointSection").style.display = "none";
  currentPlayer = currentPlayer === "john" ? "felicity" : "john";
  updateTurnDisplay();
}

function resetGame() {
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
  document.getElementById("todCard").classList.add("hidden-card");
  showStatus("New game started 🔄");
}

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
