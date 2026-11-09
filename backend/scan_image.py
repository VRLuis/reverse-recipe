import os
from pathlib import Path
from typing import Any

import boto3
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def _is_ingredient_candidate(label: dict[str, Any]) -> bool:
    categories = {category.get("Name") for category in label.get("Categories", [])}
    if "Food and Beverage" not in categories:
        return False

    name = label.get("Name", "").casefold()
    if name in {"food", "meal", "dish", "meat"}:
        return False

    parents = {parent.get("Name") for parent in label.get("Parents", [])}
    return not parents.intersection({"Dish", "Meal"})


def detect_labels(image_bytes: bytes) -> list[dict[str, str | float]]:
    access_key_id = os.getenv("ACCESS_KEY_ID")
    secret_access_key = os.getenv("ACCESS_SECRET_KEY")
    region = os.getenv("REGION")

    if not access_key_id or not secret_access_key or not region:
        raise RuntimeError("Debes configurar ACCESS_KEY_ID, ACCESS_SECRET_KEY y REGION.")

    client = boto3.client(
        "rekognition",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name=region,
    )
    response = client.detect_labels(Image={"Bytes": image_bytes})
    return [
        {"name": label["Name"], "confidence": label["Confidence"]}
        for label in response.get("Labels", [])
        if _is_ingredient_candidate(label)
    ]