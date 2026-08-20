import asyncio
import os
import edge_tts

VOICE = "bn-BD-NabanitaNeural"

BASE_FOLDER = "audio/bn"

NUMBER_FOLDER = os.path.join(BASE_FOLDER, "number")
ADD_FOLDER = os.path.join(BASE_FOLDER, "add")
SUB_FOLDER = os.path.join(BASE_FOLDER, "sub")

os.makedirs(NUMBER_FOLDER, exist_ok=True)
os.makedirs(ADD_FOLDER, exist_ok=True)
os.makedirs(SUB_FOLDER, exist_ok=True)


bangla_numbers = {
    0: "শূন্য",
    1: "এক",
    2: "দুই",
    3: "তিন",
    4: "চার",
    5: "পাঁচ",
    6: "ছয়",
    7: "সাত",
    8: "আট",
    9: "নয়",
    10: "দশ",
    11: "এগারো",
    12: "বারো",
    13: "তেরো",
    14: "চৌদ্দ",
    15: "পনেরো",
    16: "ষোলো",
    17: "সতেরো",
    18: "আঠারো",
    19: "উনিশ",
    20: "বিশ",
    21: "একুশ",
    22: "বাইশ",
    23: "তেইশ",
    24: "চব্বিশ",
    25: "পঁচিশ",
    26: "ছাব্বিশ",
    27: "সাতাশ",
    28: "আঠাশ",
    29: "ঊনত্রিশ",
    30: "ত্রিশ",
    31: "একত্রিশ",
    32: "বত্রিশ",
    33: "তেত্রিশ",
    34: "চৌত্রিশ",
    35: "পঁয়ত্রিশ",
    36: "ছত্রিশ",
    37: "সাঁইত্রিশ",
    38: "আটত্রিশ",
    39: "ঊনচল্লিশ",
    40: "চল্লিশ",
    41: "একচল্লিশ",
    42: "বিয়াল্লিশ",
    43: "তেতাল্লিশ",
    44: "চুয়াল্লিশ",
    45: "পঁয়তাল্লিশ",
    46: "ছেচল্লিশ",
    47: "সাতচল্লিশ",
    48: "আটচল্লিশ",
    49: "ঊনপঞ্চাশ",
    50: "পঞ্চাশ"
}


async def create_audio(text, filename):

    # আগে তৈরি থাকলে skip
    if os.path.exists(filename):
        print("Skipped:", filename)
        return

    for attempt in range(3):

        try:

            communicate = edge_tts.Communicate(
                text,
                VOICE,
                rate="-22%"
            )

            await communicate.save(filename)

            print("Created:", filename)

            return

        except Exception as error:

            print(
                f"Retry {attempt + 1}/3:",
                filename
            )

            if attempt == 2:
                print("Failed:", error)
            else:
                await asyncio.sleep(4)


async def main():

    # =====================================
    # NUMBER MODE 1–50
    # =====================================

    for number in range(1, 51):

        word = bangla_numbers[number]

        text = f"{word} সংখ্যাটি খুঁজে বের করো"

        filename = os.path.join(
            NUMBER_FOLDER,
            f"{number}.mp3"
        )

        await create_audio(
            text,
            filename
        )


    # =====================================
    # ADDITION
    # Level 1–3
    # Answer সর্বোচ্চ 50
    # =====================================

    for number1 in range(1, 50):

        for number2 in range(1, 50):

            answer = number1 + number2

            if answer > 50:
                continue

            text = (
                f"{bangla_numbers[number1]} "
                f"যোগ "
                f"{bangla_numbers[number2]} "
                f"সমান কত?"
            )

            filename = os.path.join(
                ADD_FOLDER,
                f"{number1}_{number2}.mp3"
            )

            await create_audio(
                text,
                filename
            )


    # =====================================
    # SUBTRACTION
    # Negative answer হবে না
    # =====================================

    for number1 in range(1, 51):

        for number2 in range(0, number1 + 1):

            text = (
                f"{bangla_numbers[number1]} "
                f"বিওগ "
                f"{bangla_numbers[number2]} "
                f"সমান কত?"
            )

            filename = os.path.join(
                SUB_FOLDER,
                f"{number1}_{number2}.mp3"
            )

            await create_audio(
                text,
                filename
            )


    # =====================================
    # RANDOM CORRECT FEEDBACK
    # =====================================

    feedback = {

        "correct1.mp3":
            "তোমার উত্তর সঠিক হয়েছে। এগিয়ে যাও!",

        "correct2.mp3":
            "দারুণ! তুমি ঠিক উত্তর দিয়েছো!",

        "correct3.mp3":
            "অসাধারণ! এভাবেই এগিয়ে যাও!",

        "correct4.mp3":
            "চমৎকার! আবারও সঠিক উত্তর!",

        "correct5.mp3":
            "খুব সুন্দর! তুমি বেশ ভালো করছো!",

        "correct6.mp3":
            "বাহ! একদম ঠিক হয়েছে!",

        "wrong.mp3":
            "উত্তরটি সঠিক হয়নি। আবার চেষ্টা করো।",

        "amazing.mp3":
            "দারুণ! পরপর তিনটি সঠিক উত্তর!",

        "superstar.mp3":
            "অসাধারণ! পরপর পাঁচটি সঠিক উত্তর!",

        "champion.mp3":
            "চমৎকার! তুমি একজন নাম্বার চ্যাম্পিয়ন!",

        "level2.mp3":
            "অভিনন্দন! তুমি লেভেল দুই আনলক করেছো!",

        "level3.mp3":
            "অসাধারণ! তুমি লেভেল তিন আনলক করেছো!"
    }


    for filename, text in feedback.items():

        path = os.path.join(
            BASE_FOLDER,
            filename
        )

        await create_audio(
            text,
            path
        )


asyncio.run(main())