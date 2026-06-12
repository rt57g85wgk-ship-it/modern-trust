from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv(
    "GOOGLE_MAPS_API_KEY"
)


@app.get("/health")
def health():

    return jsonify({
        "status": "ok"
    })


@app.get("/config")
def config():

    return jsonify({
        "apiKey": API_KEY
    })


@app.post("/route")
def route():

    data = request.json

    def format_loc(loc):

        if isinstance(loc, dict):

            return {
                "location": {
                    "latLng": {
                        "latitude": loc["lat"],
                        "longitude": loc["lng"]
                    }
                }
            }

        return {
            "address": loc
        }

    url = (
        "https://routes.googleapis.com/"
        "directions/v2:computeRoutes"
    )

    headers = {

        "Content-Type":
            "application/json",

        "X-Goog-Api-Key":
            API_KEY,

        "X-Goog-FieldMask":
            "routes.distanceMeters,"
            "routes.duration,"
            "routes.polyline.encodedPolyline"
    }

    body = {

        "origin":
            format_loc(
                data["origin"]
            ),

        "destination":
            format_loc(
                data["destination"]
            ),

        "travelMode":
            "DRIVE"
    }

    res = requests.post(
        url,
        json=body,
        headers=headers
    )
    
    print("="*50)
    print("STATUS: ", res.status_code)
    print("RESPONSE:")
    print(res.text)
    print("="*50)

    if res.status_code != 200:

        return jsonify({
            "error": res.text
        }), res.status_code

    return jsonify(
        res.json()
    )


if __name__ == "__main__":

    app.run(
        debug=True,
        port=5001
    )