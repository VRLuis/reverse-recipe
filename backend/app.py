from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route("/api/")
def health():
    return "<p>Server is running and healthy</p>"

@app.route("/api/scan", methods=["POST"])
def scan_image():
    image = request.files.get("image")
    if image is None or image.filename == "":
        return jsonify(status=400, message="An image file is required."), 400

    return jsonify(status=200, message="Image received."), 200