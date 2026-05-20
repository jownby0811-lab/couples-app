#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix the remaining untagged dares"""

src_file = r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\src\script.js'
dist_file = r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\dist\script.js'

with open(src_file, 'r', encoding='utf-8') as f:
    src = f.read()

with open(dist_file, 'r', encoding='utf-8') as f:
    dist = f.read()

fixed_src = 0

# Fix src dare 1: "Finish this: 'I'm getting so turned on because...'" neutral
t1 = "Finish this: 'I’m getting so turned on because...'"
if t1 not in src:
    t1 = "Finish this: 'I'm getting so turned on because...'"  # straight apostrophe fallback

idx = src.find(t1)
if idx >= 0:
    chunk = src[idx:idx+300]
    if 'tags:' not in chunk[:150]:
        # Find and replace this dare
        for gender in ['neutral', 'male', 'female']:
            old = '"' + t1 + '",\n        Gender: "' + gender + '"\n      },'
            new = '"' + t1 + '",\n        Gender: "' + gender + '",\n        tags: ["dirty-talk"]\n      },'
            if old in src:
                src = src.replace(old, new, 1)
                fixed_src += 1
                print(f"Fixed src dare 1 (gender={gender})")
                break
        else:
            print(f"Pattern not matched for dare 1. Chunk: {repr(chunk[:150])}")
    else:
        print("Dare 1 already tagged")
else:
    print("Dare 1 not found in src")

# Fix src dare 2: "Eat her out aggressively while she's close to cumming." (curly apostrophe)
curly = chr(0x2019)  # RIGHT SINGLE QUOTATION MARK
t2 = "Eat her out aggressively while she" + curly + "s close to cumming."
idx2 = src.find("Eat her out aggressively")
if idx2 >= 0:
    chunk2 = src[idx2:idx2+300]
    if 'tags:' not in chunk2[:150]:
        old2 = '"' + t2 + '",\n        Gender: "male"\n      },'
        new2 = '"' + t2 + '",\n        Gender: "male",\n        tags: ["oral", "edging"]\n      },'
        if old2 in src:
            src = src.replace(old2, new2, 1)
            fixed_src += 1
            print("Fixed src dare 2: Eat her out aggressively")
        else:
            print(f"Pattern 2 not matched. Chunk: {repr(chunk2[:150])}")
    else:
        print("Dare 2 already tagged")
else:
    print("Dare 2 not found in src")

print(f"Fixed {fixed_src} src dares. Tags count: {src.count('tags:')}")

with open(src_file, 'w', encoding='utf-8') as f:
    f.write(src)

# ─── Fix dist: dares that appear in both tease and foreplay ───
# The compact-format (foreplay) occurrences were skipped during the initial run
# because the script found the tagged tease occurrence first

dist_foreplay_untagged = [
    ("Tease her ass gently over her panties with a finger.", "male", ["ass-play", "teasing"]),
    ("Suck a dildo while he kisses and teases your body.", "female", ["oral", "toys", "kissing", "teasing"]),
    ("Use a toy on yourself while you make out heavily.", "female", ["toys", "kissing"]),
    ("Kiss and lick just the head / her clit softly for 30 seconds.", "neutral", ["oral"]),
    ("Kiss and lick her pussy softly.", "male", ["oral"]),
    ("Kiss and lick her pussy slowly from bottom to top.", "male", ["oral"]),
    ("Kiss and lick her inner thighs and tease closer with your tongue.", "male", ["oral", "teasing"]),
    ("Look up at her while you lick her slowly.", "male", ["oral"]),
    ("Tell her one thing you love about her taste while licking.", "male", ["oral", "dirty-talk"]),
    ("Lick her with the flat of your tongue for 45 seconds.", "male", ["oral"]),
    ("Hold eye contact while kissing and licking her clit.", "male", ["oral"]),
    ("Say 'You taste so fucking good' while eating her out.", "male", ["oral", "dirty-talk"]),
    ("Tease her pussy with just your lips and tongue for 45 seconds.", "male", ["oral", "teasing"]),
    ("Kiss and lick just the head for 30 seconds like it" + curly + "s your favorite treat.", "female", ["oral"]),
    ("Look up at him while you slowly kiss down the full shaft.", "female", ["oral"]),
    ("Say " + curly + "I love your cock" + curly + " while gently stroking him.", "female", ["manual", "dirty-talk"]),
    ("Use your tongue to trace circles around the head slowly.", "female", ["oral"]),
    ("Kiss his balls gently while looking at him.", "female", ["oral"]),
    ("Whisper one thing you like about his cock while touching it.", "female", ["manual", "dirty-talk"]),
    ("Lick from balls to tip, nice and slow, twice.", "female", ["oral"]),
    ("Hold eye contact for 10 seconds while kissing the head.", "female", ["oral"]),
    ("Say " + curly + "You taste so good" + curly + " while licking him.", "female", ["oral", "dirty-talk"]),
    ("Tease them with just your lips and tongue for 45 seconds.", "neutral", ["oral", "teasing"]),
    ("Make her watch herself in the mirror while you touch her.", "male", ["manual", "mirror"]),
    ("69 while lightly pulling her hair.", "male", ["oral"]),
    ("Edge her with your mouth and fingers for 90 seconds.", "male", ["oral", "edging", "manual"]),
    ("Praise each other out loud while touching.", "neutral", ["praise", "manual"]),
]

fixed_dist = 0
for dare_text, gender, tags in dist_foreplay_untagged:
    tags_js = str(tags).replace("'", '"')
    old = '{ text: "' + dare_text + '", Gender: "' + gender + '" },'
    new = '{ text: "' + dare_text + '", Gender: "' + gender + '", tags: ' + tags_js + ' },'
    if old in dist:
        dist = dist.replace(old, new, 1)
        fixed_dist += 1
    else:
        old_last = '{ text: "' + dare_text + '", Gender: "' + gender + '" }\n    ]'
        new_last = '{ text: "' + dare_text + '", Gender: "' + gender + '", tags: ' + tags_js + ' }\n    ]'
        if old_last in dist:
            dist = dist.replace(old_last, new_last, 1)
            fixed_dist += 1
        else:
            # Try straight apostrophe variants
            dare_straight = dare_text.replace(curly, "'")
            old_s = '{ text: "' + dare_straight + '", Gender: "' + gender + '" },'
            new_s = '{ text: "' + dare_straight + '", Gender: "' + gender + '", tags: ' + tags_js + ' },'
            if old_s in dist:
                dist = dist.replace(old_s, new_s, 1)
                fixed_dist += 1
            else:
                print(f"  UNMATCHED in dist: {dare_text[:60]}")

print(f"\nFixed {fixed_dist} dist dares. Tags count: {dist.count('tags:')}")

with open(dist_file, 'w', encoding='utf-8') as f:
    f.write(dist)

# ─── Final verification ───
import re

for fname, content in [('src', src), ('dist', dist)]:
    untagged = []
    for m in re.finditer(r'dares:\s*\[', content):
        start = m.end()
        depth = 1
        i = start
        while i < len(content) and depth > 0:
            if content[i] == '[': depth += 1
            elif content[i] == ']':
                depth -= 1
                if depth == 0: break
            i += 1
        dares_content = content[start:i]
        for obj_m in re.finditer(r'\{[^{}]+\}', dares_content):
            obj = obj_m.group()
            if 'tags:' not in obj and 'Gender:' in obj:
                text_m = re.search(r'text:\s*[\"](.*?)[\",]', obj)
                if text_m:
                    untagged.append(text_m.group(1)[:60])
    print(f"\n{fname}: {len(untagged)} still untagged dares")
    for t in untagged:
        print(f"  - {repr(t)}")
