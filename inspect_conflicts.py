from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

DATASET = Path("dataset") / "Freshwater Fish Disease Aquaculture in south asia"

OUTPUT = Path("results") / "dataset_audit"
OUTPUT.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------
# IMPORTANT CROSS-CLASS CONFLICTS FOUND IN THE AUDIT
# ------------------------------------------------------------

pairs = [
    (
        "Parasitic diseases",
        "Parasitic diseases (240).jpg",
        "Bacterial gill disease",
        "Bacterial gill disease (35).jpg",
    ),
    (
        "Bacterial diseases - Aeromoniasis",
        "Bacterial diseases - Aeromoniasis (2).png",
        "Bacterial Red disease",
        "Bacterial Red disease (34).jpg",
    ),
    (
        "Parasitic diseases",
        "Parasitic diseases (240).jpg",
        "Bacterial gill disease",
        "Bacterial gill disease (25).jpg",
    ),
    (
        "Bacterial gill disease",
        "Bacterial gill disease (19).jpg",
        "Fungal diseases Saprolegniasis",
        "Fungal diseases Saprolegniasis (7).jpeg",
    ),
]

# ------------------------------------------------------------
# SETTINGS
# ------------------------------------------------------------

IMAGE_WIDTH = 400
IMAGE_HEIGHT = 300
LABEL_HEIGHT = 90

FONT_SIZE = 18

try:
    FONT = ImageFont.truetype("arial.ttf", FONT_SIZE)
except:
    FONT = ImageFont.load_default()


# ------------------------------------------------------------
# LOAD IMAGE
# ------------------------------------------------------------

def load_image(split, class_name, filename):

    path = (
        DATASET
        / split
        / class_name
        / filename
    )

    if not path.exists():
        return None, path

    try:
        img = Image.open(path).convert("RGB")
        return img, path
    except:
        return None, path


# ------------------------------------------------------------
# CREATE CONTACT SHEET
# ------------------------------------------------------------

print("\nCreating visual conflict inspection sheet...")

sheet_width = IMAGE_WIDTH * 2
sheet_height = len(pairs) * (IMAGE_HEIGHT + LABEL_HEIGHT)

sheet = Image.new(
    "RGB",
    (sheet_width, sheet_height),
    "white"
)

draw = ImageDraw.Draw(sheet)


for index, pair in enumerate(pairs):

    train_class = pair[0]
    train_file = pair[1]

    test_class = pair[2]
    test_file = pair[3]

    train_img, train_path = load_image(
        "Train",
        train_class,
        train_file
    )

    test_img, test_path = load_image(
        "Test",
        test_class,
        test_file
    )

    y = index * (IMAGE_HEIGHT + LABEL_HEIGHT)

    # --------------------------------------------------------
    # TRAIN IMAGE
    # --------------------------------------------------------

    if train_img:

        train_img.thumbnail(
            (IMAGE_WIDTH, IMAGE_HEIGHT)
        )

        x = (IMAGE_WIDTH - train_img.width) // 2

        sheet.paste(
            train_img,
            (x, y)
        )

    # --------------------------------------------------------
    # TEST IMAGE
    # --------------------------------------------------------

    if test_img:

        test_img.thumbnail(
            (IMAGE_WIDTH, IMAGE_HEIGHT)
        )

        x = IMAGE_WIDTH + (
            IMAGE_WIDTH - test_img.width
        ) // 2

        sheet.paste(
            test_img,
            (x, y)
        )

    # --------------------------------------------------------
    # LABELS
    # --------------------------------------------------------

    text_y = y + IMAGE_HEIGHT + 5

    draw.text(
        (10, text_y),
        f"TRAIN: {train_class}",
        fill="black",
        font=FONT
    )

    draw.text(
        (10, text_y + 25),
        train_file,
        fill="black",
        font=FONT
    )

    draw.text(
        (IMAGE_WIDTH + 10, text_y),
        f"TEST: {test_class}",
        fill="black",
        font=FONT
    )

    draw.text(
        (IMAGE_WIDTH + 10, text_y + 25),
        test_file,
        fill="black",
        font=FONT
    )

    draw.text(
        (IMAGE_WIDTH + 10, text_y + 50),
        f"Conflict #{index + 1}",
        fill="black",
        font=FONT
    )


# ------------------------------------------------------------
# SAVE
# ------------------------------------------------------------

output_file = OUTPUT / "cross_class_conflicts.jpg"

sheet.save(
    output_file,
    quality=95
)

print("\n" + "=" * 70)
print("VISUAL INSPECTION COMPLETE")
print("=" * 70)

print(f"\nSaved to:")
print(output_file)

print("\nOpen this image and inspect each conflict.")
print("=" * 70)