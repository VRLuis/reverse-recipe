from flask import Flask, jsonify, request
from flask_cors import CORS
from botocore.exceptions import BotoCoreError, ClientError
from gemini import generate_recipes
from scan_image import detect_labels

app = Flask(__name__)

CORS(app)

@app.route("/api/")
def health():
    return "<p>El servidor está activo y funciona correctamente.</p>"

@app.route("/api/scan", methods=["POST"])
def scan_image():
    image = request.files.get("image")
    if image is None or image.filename == "":
        return jsonify(status=400, message="Se requiere un archivo de imagen."), 400

    image_bytes = image.read()
    if not image_bytes:
        return jsonify(status=400, message="El archivo de imagen está vacío."), 400

    try:
        labels = detect_labels(image_bytes)
    except ClientError as error:
        aws_error = error.response.get("Error", {})
        code = aws_error.get("Code", "UnknownAWSException")
        detail = aws_error.get("Message", "No additional details provided.")
        message = f"Error de Rekognition ({code}): {detail}"
        return jsonify(status=500, message=message), 500
    except RuntimeError as error:
        return jsonify(status=500, message=str(error)), 500
    except BotoCoreError as error:
        message = f"Falló la solicitud a AWS ({type(error).__name__}). Consulta el registro del servidor."
        return jsonify(status=502, message=message), 502
    except Exception:
        message = "Error inesperado al procesar la imagen. Consulta el registro del servidor."
        return jsonify(status=500, message=message), 500

    return jsonify(status=200, message="Ingredientes detectados.", labels=labels), 200


@app.route("/api/recipes", methods=["POST"])
def generate_recipe_endpoint():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(status=400, message="Se requiere un objeto JSON con el campo text."), 400

    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        return jsonify(status=400, message="El campo text debe contener los ingredientes detectados."), 400

    try:
        recipes = generate_recipes(text)
    except ValueError as error:
        return jsonify(status=400, message=str(error)), 400
    except RuntimeError as error:
        app.logger.exception("Error de configuración o respuesta de Gemini.")
        return jsonify(status=500, message=f"Error de configuración o respuesta de Gemini: {error}"), 500
    except Exception:
        app.logger.exception("Falló la generación de recetas con Gemini.")
        return jsonify(status=502, message="No se pudieron generar las recetas. Consulta el registro del servidor."), 502

    return jsonify(status=200, message="Recetas generadas.", recipes=recipes), 200