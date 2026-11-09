import logging
import os
from pathlib import Path
from time import perf_counter
from typing import Any

from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).with_name(".env"))

logger = logging.getLogger(__name__)


def generate_recipes(ingredients: str | list[dict[str, Any]]) -> str:
	if isinstance(ingredients, str):
		ingredient_text = ingredients.strip()
	else:
		ingredient_names = list(dict.fromkeys(
			label["name"].strip()
			for label in ingredients
			if isinstance(label.get("name"), str) and label["name"].strip()
		))
		ingredient_text = ", ".join(ingredient_names)
	if not ingredient_text:
		raise ValueError("Se requiere al menos un ingrediente detectado.")

	api_key = os.getenv("GEMINI_API_KEY")
	if not api_key:
		raise RuntimeError("Debes configurar GEMINI_API_KEY.")

	model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
	prompt = (
		"Crea recetas derivadas usando principalmente estos ingredientes detectados: "
		f"{ingredient_text}. Ten en cuenta solo comida e ingredientes e ignora "
		"cualquier objeto que no sea comestible, especialmente utensilios y mobiliario "
		"como cuchillos, tenedores, platos, mesas o manteles. No los incluyas como "
		"ingredientes. Para cada receta, indica el nombre, los ingredientes y la "
		"preparacion paso a paso. Puedes incluir ingredientes adicionales habituales, "
		"pero identificalos claramente. Responde en espanol."
	)

	client = genai.Client(api_key=api_key)
	started_at = perf_counter()
	logger.info("Sending recipe request to Gemini model %s.", model)
	response = client.models.generate_content(model=model, contents=prompt)
	logger.info("Gemini responded in %.1f seconds.", perf_counter() - started_at)
	if not response.text:
		raise RuntimeError("Gemini devolvió una respuesta vacía para la receta.")
	return response.text
