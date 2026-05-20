#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add tags to all dare objects in src/script.js and dist/script.js"""

src_file = r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\src\script.js'
dist_file = r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\dist\script.js'

with open(src_file, 'r', encoding='utf-8') as f:
    src = f.read()

with open(dist_file, 'r', encoding='utf-8') as f:
    dist = f.read()

# ─── STEP 1: Copy src tease dares (already tagged, 73 dares) into dist ───
# Extract tease dares block from src
src_fp_start = src.index('  foreplay: {')
src_tease_block = src[:src_fp_start]
src_dares_start = src_tease_block.rindex('    dares: [')
src_dares_end = src_tease_block.rindex('    ]') + 5  # len("    ]") = 5
src_tease_dares_block = src_tease_block[src_dares_start:src_dares_end]

# Find and replace tease dares in dist
dist_fp_start = dist.index('  foreplay: {')
dist_tease_block = dist[:dist_fp_start]
dist_dares_start = dist_tease_block.rindex('    dares: [')
dist_dares_end = dist_tease_block.rindex('    ]') + 5
abs_start = dist_dares_start
abs_end = dist_dares_end
dist = dist[:abs_start] + src_tease_dares_block + dist[abs_end:]
print(f"Step 1: Replaced dist tease dares with src version")

# Recalculate dist after the change (dist has changed)
with open(dist_file + '.bak', 'w', encoding='utf-8') as f:
    f.write(dist)  # keep backup

# ─── STEP 2: Build tag lookup table ───
# Tags for ALL foreplay dares (by text)
foreplay_tags = {
    "Finger her ass gently while licking her clit.": ["oral", "ass-play"],
    "69 while lightly pulling her hair.": ["oral"],
    "Let her suck a dildo while you finger her.": ["oral", "toys", "manual"],
    "Spank her 8-10 times while she counts.": ["spanking"],
    "Tie her hands and go down on her.": ["bondage", "oral"],
    "Edge her with your mouth and fingers for 90 seconds.": ["oral", "edging", "manual"],
    "Lightly hold her throat while fingering her.": ["manual"],
    "Put a butt plug in her then eat her out.": ["toys", "ass-play", "oral"],
    "Make her watch herself in the mirror while you touch her.": ["manual", "mirror"],
    "Praise or lightly degrade her while teasing.": ["dirty-talk", "praise", "teasing"],
    "Edge each other with hands and mouth for 90 seconds.": ["oral", "manual", "edging"],
    "Give him a blowjob while watching yourself in a mirror.": ["oral", "mirror"],
    "Roleplay as boss/secretary during foreplay.": ["roleplay"],
    "Praise each other out loud while touching.": ["praise", "manual"],
    "Give him a blowjob while fucking yourself with a dildo.": ["oral", "toys"],
    "Suck a dildo while he fingers your pussy and ass.": ["oral", "toys", "manual", "ass-play"],
    "Spit on his cock and give a sloppy handjob + blowjob.": ["spit-play", "manual", "oral"],
    "Wear a butt plug while giving him head.": ["toys", "ass-play", "oral"],
    "Finger her ass slowly while she strokes you.": ["ass-play", "manual"],
    "Finger her / stroke him while keeping eye contact and talking.": ["manual", "dirty-talk"],
    "69 for 60–90 seconds, nice and slow.": ["oral"],
    "Let him spank you 8–10 times while you count them.": ["spanking"],
    "Ride his fingers while describing how it feels.": ["manual", "dirty-talk"],
    "Use your mouth on them while they use their fingers/hand on you.": ["oral", "manual"],
    "Alternate between slow and fast oral for one minute.": ["oral", "edging"],
    "Stay still while the other teases you — no moving your hands.": ["teasing", "edging"],
    "Guide each other's hands exactly where you want them.": ["manual"],
    "Suck gently on her clit while using a finger inside her.": ["oral", "manual"],
    "Take her clit in your mouth and hold suction for 10 seconds.": ["oral"],
    "Use the tip of your tongue to flick her clit rapidly.": ["oral"],
    "Alternate between slow licking and fast clit circles.": ["oral", "edging"],
    "Lick and suck her labia while fingering her.": ["oral", "manual"],
    "Make eye contact with her while licking her clit.": ["oral"],
    "Hum or moan with your mouth on her so she feels the vibration.": ["oral"],
    "Mix kissing, licking, and sucking all over her pussy.": ["oral"],
    "Let her guide your head to where she wants your tongue.": ["oral"],
    "Suck just the head with good suction while stroking the shaft.": ["oral", "manual"],
    "Take him as deep as comfortable, hold for 5 seconds, then pull back slowly.": ["oral"],
    "Use your tongue to flick the underside of the head for 45 seconds.": ["oral"],
    "Alternate between slow bobbing and fast shallow sucks for 60 seconds.": ["oral", "edging"],
    "Lick and suck his balls gently while stroking him.": ["oral", "manual"],
    "Make eye contact for 15 seconds while bobbing on him.": ["oral"],
    "Try humming/moaning with him in your mouth so he feels the vibration.": ["oral"],
    "Mix kissing, licking, and sucking all over for one minute.": ["oral"],
    "Guide his hand to your head if you want him to lead for 30 seconds.": ["oral"],
    "Guide his hand where you want it and say 'Right there'.": ["manual", "dirty-talk"],
    "While he touches you, say 'That feels so good'.": ["dirty-talk"],
    "Finish this: 'I love when you touch my...'": ["dirty-talk"],
    "Say 'Don't stop' every time something feels really good.": ["dirty-talk"],
    "Finish this: 'Your fingers/tongue feel so...'": ["dirty-talk"],
    "Look at him and say 'I want your mouth here'.": ["dirty-talk"],
    "React out loud with moans or words when it feels intense.": ["dirty-talk"],
    "Finish this: 'I’m getting so turned on because...'": ["dirty-talk"],
    "Say 'Please keep going' while riding his fingers.": ["manual", "dirty-talk"],
    "Touch yourself while he watches and tell you exactly how.": ["manual", "dirty-talk"],
    "Give them oral for 2 minutes — no hands allowed.": ["oral"],
    "69 for 90 seconds but don't cum.": ["oral", "edging"],
    "Ride his fingers while looking him in the eyes and talking dirty.": ["manual", "dirty-talk"],
    # dist-only foreplay dares (from tease section in original dist)
    "Tease her ass gently over her panties with a finger.": ["ass-play", "teasing"],
    "Suck a dildo while he kisses and teases your body.": ["oral", "toys", "kissing", "teasing"],
    "Use a toy on yourself while you make out heavily.": ["toys", "kissing"],
    "Kiss and lick just the head / her clit softly for 30 seconds.": ["oral"],
    "Kiss and lick her pussy softly.": ["oral"],
    "Kiss and lick her pussy slowly from bottom to top.": ["oral"],
    "Kiss and lick her inner thighs and tease closer with your tongue.": ["oral", "teasing"],
    "Look up at her while you lick her slowly.": ["oral"],
    "Tell her one thing you love about her taste while licking.": ["oral", "dirty-talk"],
    "Lick her with the flat of your tongue for 45 seconds.": ["oral"],
    "Hold eye contact while kissing and licking her clit.": ["oral"],
    "Say 'You taste so fucking good' while eating her out.": ["oral", "dirty-talk"],
    "Tease her pussy with just your lips and tongue for 45 seconds.": ["oral", "teasing"],
    "Kiss and lick just the head for 30 seconds like it's your favorite treat.": ["oral"],
    "Look up at him while you slowly kiss down the full shaft.": ["oral"],
    "Say 'I love your cock' while gently stroking him.": ["manual", "dirty-talk"],
    "Use your tongue to trace circles around the head slowly.": ["oral"],
    "Kiss his balls gently while looking at him.": ["oral"],
    "Whisper one thing you like about his cock while touching it.": ["manual", "dirty-talk"],
    "Lick from balls to tip, nice and slow, twice.": ["oral"],
    "Hold eye contact for 10 seconds while kissing the head.": ["oral"],
    "Say 'You taste so good' while licking him.": ["oral", "dirty-talk"],
    "Tease them with just your lips and tongue for 45 seconds.": ["oral", "teasing"],
}

dirty_tags = {
    "Fuck her while she sucks a dildo.": ["penetration", "oral", "toys"],
    "Pull her hair while fucking her from behind.": ["penetration"],
    "Spank her ass while pounding her.": ["penetration", "spanking"],
    "Fuck her with a butt plug already in her.": ["penetration", "toys", "ass-play"],
    "Roughly choke her while fucking (very hard).": ["penetration", "bondage"],
    "Fuck her in front of a mirror while she watches.": ["penetration", "mirror"],
    "Use a dildo in one of her holes while you fuck another.": ["penetration", "toys", "ass-play"],
    "Edge her right to the edge then let her cum.": ["penetration", "edging"],
    "Roleplay a full dirty scenario while fucking.": ["penetration", "roleplay"],
    "Fuck in front of a mirror while describing what you see.": ["penetration", "mirror", "dirty-talk"],
    "Beg to cum using dirty praise or degradation.": ["dirty-talk", "degradation", "edging"],
    "Let him restrain you and use you however he wants for 2 minutes.": ["bondage", "penetration"],
    "Switch between slow praise and filthy talk while fucking.": ["penetration", "dirty-talk", "praise"],
    "Fuck in your favorite position with lots of spit.": ["penetration", "spit-play"],
    "Suck him while riding a dildo.": ["oral", "toys", "penetration"],
    "Insert butt plug then let him fuck your pussy.": ["toys", "ass-play", "penetration"],
    "Suck a dildo while he fucks you from behind.": ["penetration", "oral", "toys"],
    "Suck him + dildo in pussy + plug in ass.": ["oral", "toys", "penetration", "ass-play"],
    "Stroke one toy, suck him, and ride another.": ["oral", "toys", "penetration", "manual"],
    "Use a dildo in her ass while you fuck her pussy (or vice versa).": ["penetration", "toys", "ass-play"],
    "Switch between him and toys in different holes for 3 minutes.": ["penetration", "toys", "ass-play"],
    "Ride him reverse cowgirl while watching in a mirror.": ["penetration", "mirror"],
    "Switch positions every 30 seconds for 3 minutes.": ["penetration"],
    "Let her ride your face / let him fuck your mouth while they control pace.": ["oral"],
    "Focus hard on her clit with strong suction and tongue flicks.": ["oral"],
    "Try burying your tongue as deep as possible inside her.": ["oral"],
    "Edge her with your mouth — bring her close then slow down.": ["oral", "edging"],
    "Eat her out aggressively while she's close to cumming.": ["oral", "edging"],
    "Suck her clit while saying 'I love eating your pussy'.": ["oral", "dirty-talk"],
    "Let her grind on your face while you lick her.": ["oral", "grinding"],
    "Mix fast tongue flicks, slow licks, and deep sucking.": ["oral"],
    "Make her cum with your mouth while keeping eye contact.": ["oral"],
    "Describe how good she tastes while licking her.": ["oral", "dirty-talk"],
    "Beg her to cum on your tongue using dirty words.": ["oral", "dirty-talk"],
    "Use hand + mouth in rhythm (twist your hand as you go up).": ["oral", "manual"],
    "Focus hard on the head with strong suction and tongue flicks for 60s.": ["oral"],
    "Try taking me deeper than usual and tell him how it felt.": ["oral", "dirty-talk"],
    "Edge him with your mouth — bring him close then slow way down.": ["oral", "edging"],
    "Suck him while saying 'I love sucking your dick'.": ["oral", "dirty-talk"],
    "Let him gently fuck your mouth for 30–45 seconds.": ["oral"],
    "Mix fast bobbing, slow licking, and deep sucks for one minute.": ["oral"],
    "Describe how his dick feels in your mouth while you suck him.": ["oral", "dirty-talk"],
    "Beg for his cum using one dirty sentence right before he finishes.": ["oral", "dirty-talk"],
    "While riding him, say 'You feel so deep'.": ["penetration", "dirty-talk"],
    "Finish this: 'Fuck me...' while he's inside you.": ["penetration", "dirty-talk"],
    "Say 'I'm your good girl' while looking at him.": ["dirty-talk", "praise"],
    "Describe in one sentence how their dick/pussy feels.": ["penetration", "dirty-talk"],
    "Say 'Harder' or 'Deeper' when you want more.": ["penetration", "dirty-talk"],
    "Finish this: 'I love your cock/pussy because...'": ["dirty-talk", "praise"],
    "Say 'Fill me up' or 'Cum on me' when you're close.": ["penetration", "dirty-talk"],
    "Beg for what you want in one short dirty sentence.": ["dirty-talk"],
    "Fuck him in your favorite position for 2 minutes while describing it.": ["penetration", "dirty-talk"],
    "Ride him reverse cowgirl while you watch in a mirror.": ["penetration", "mirror"],
    "Let him fuck your mouth while holding your head.": ["oral", "bondage"],
    "Let him use a toy on you until you cum, eyes on him.": ["toys", "manual"],
    "Switch positions every 30 seconds for 3 minutes straight.": ["penetration"],
    "Record 30 seconds of you riding him while describing how deep he is.": ["penetration", "dirty-talk"],
    # dist-only dirty dares
    "Spit on her body and rub it in slowly.": ["spit-play"],
    "Watch her touch herself in front of a mirror.": ["manual", "mirror"],
    "Spit on their cock/pussy and rub it in slowly.": ["spit-play"],
    "Kiss with lots of spit for 30 seconds.": ["kissing", "spit-play"],
    "Spit between her tits and slide your cock there slowly.": ["spit-play"],
    "Let him spit on your pussy then tease with his fingers.": ["spit-play", "manual", "teasing"],
    "Insert a small butt plug in her together and just tease.": ["toys", "ass-play", "teasing"],
    "Put a butt plug in her then eat her out.": ["toys", "ass-play", "oral"],
    "Lightly hold her throat while fingering her.": ["manual"],
    "Praise or lightly degrade her while teasing.": ["dirty-talk", "praise", "teasing"],
}

all_tags = {}
all_tags.update(foreplay_tags)
all_tags.update(dirty_tags)

# ─── STEP 3: Add tags to src (multi-line format) ───
added_src = 0
skipped_src = 0

for dare_text, tags in all_tags.items():
    tags_js = str(tags).replace("'", '"')  # JSON-like array

    # Check if dare exists and isn't already tagged
    if dare_text not in src:
        continue

    # Find the dare's location
    idx = src.index(dare_text)
    # Check if already tagged (look for 'tags:' within next 300 chars)
    snippet = src[idx:idx+300]
    if 'tags:' in snippet:
        skipped_src += 1
        continue

    # Try pattern: text ends with dare_text + closing quote, then Gender on next line
    # Pattern A: standard multi-line
    for gender in ['male', 'female', 'neutral']:
        old = f'"{dare_text}",\n        Gender: "{gender}"\n'
        new = f'"{dare_text}",\n        Gender: "{gender}",\n        tags: {tags_js}\n'
        if old in src:
            src = src.replace(old, new, 1)
            added_src += 1
            break
        # Last dare in section (no trailing comma on closing brace)
        old_last = f'"{dare_text}",\n        Gender: "{gender}"\n      }}\n    ]'
        new_last = f'"{dare_text}",\n        Gender: "{gender}",\n        tags: {tags_js}\n      }}\n    ]'
        if old_last in src:
            src = src.replace(old_last, new_last, 1)
            added_src += 1
            break
    else:
        # Pattern B: weird same-line format (text and Gender on same line)
        for gender in ['male', 'female', 'neutral']:
            old = f'"{dare_text}",        Gender: "{gender}"\n'
            new = f'"{dare_text}",\n        Gender: "{gender}",\n        tags: {tags_js}\n'
            if old in src:
                src = src.replace(old, new, 1)
                added_src += 1
                break
        else:
            # Pattern C: no Gender property (special case)
            old_ng = f'"{dare_text}"\n      }},\n'
            new_ng = f'"{dare_text}",\n        tags: {tags_js}\n      }},\n'
            # Note: double }} in f-string to produce literal }
            if old_ng in src:
                src = src.replace(old_ng, new_ng, 1)
                added_src += 1
            else:
                print(f"  UNMATCHED in src: {dare_text[:60]}")

print(f"Step 3: Tagged {added_src} dares in src (skipped {skipped_src} already tagged)")

# ─── STEP 4: Add tags to dist (single-line format) ───
added_dist = 0
skipped_dist = 0

for dare_text, tags in all_tags.items():
    tags_js = str(tags).replace("'", '"')

    if dare_text not in dist:
        continue

    idx = dist.index(dare_text)
    snippet = dist[idx:idx+200]
    if 'tags:' in snippet:
        skipped_dist += 1
        continue

    # Dist single-line format: { text: "...", Gender: "gender" },
    matched = False
    for gender in ['male', 'female', 'neutral']:
        old = f'", Gender: "{gender}" }},'
        new = f'", Gender: "{gender}", tags: {tags_js} }},'
        # Make sure we're replacing the RIGHT dare by including the dare text
        old_full = f'"{dare_text}", Gender: "{gender}" }},'
        new_full = f'"{dare_text}", Gender: "{gender}", tags: {tags_js} }},'
        if old_full in dist:
            dist = dist.replace(old_full, new_full, 1)
            added_dist += 1
            matched = True
            break
        # Last dare in section
        old_last = f'"{dare_text}", Gender: "{gender}" }}\n    ]'
        new_last = f'"{dare_text}", Gender: "{gender}", tags: {tags_js} }}\n    ]'
        if old_last in dist:
            dist = dist.replace(old_last, new_last, 1)
            added_dist += 1
            matched = True
            break

    if not matched and dare_text in dist:
        print(f"  UNMATCHED in dist: {dare_text[:60]}")

print(f"Step 4: Tagged {added_dist} dares in dist (skipped {skipped_dist} already tagged)")

# ─── Write results ───
with open(src_file, 'w', encoding='utf-8') as f:
    f.write(src)
print(f"Wrote src/script.js")

with open(dist_file, 'w', encoding='utf-8') as f:
    f.write(dist)
print(f"Wrote dist/script.js")

# ─── Verification ───
import re
src_dare_objs = re.findall(r'"text":|text:', src)
src_tags = src.count('tags:')
dist_tags = dist.count('tags:')
print(f"\nVerification:")
print(f"  src  tags: count = {src_tags}")
print(f"  dist tags: count = {dist_tags}")
