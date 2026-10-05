from pathlib import Path
import yaml

BASE = Path("dataset/fish_skin_diseases_v6")
ROBUSTNESS = BASE / "robustness"

CLASS_NAMES = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "streptococcus Disease"
]

CONDITIONS = [
    "blur",
    "noise",
    "brightness",
    "contrast",
    "compression",
    "low_resolution"
]

for condition in CONDITIONS:

    condition_path = ROBUSTNESS / condition

    data = {
        "path": str(condition_path.resolve()),
        "train": "images",
        "val": "images",
        "names": {
            0: CLASS_NAMES[0],
            1: CLASS_NAMES[1],
            2: CLASS_NAMES[2],
            3: CLASS_NAMES[3],
            4: CLASS_NAMES[4]
        }
    }

    yaml_path = condition_path / "data.yaml"

    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(
            data,
            f,
            sort_keys=False,
            allow_unicode=True
        )

    print(f"Updated: {yaml_path}")

print()
print("All robustness YAML files updated successfully.")