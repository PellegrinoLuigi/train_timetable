from flask import Flask, render_template, jsonify, request
import requests
import datetime
import pytz
import os

app = Flask(__name__)

def get_italy_current_time():
    italy_tz = pytz.timezone('Europe/Rome')
    current_time = datetime.datetime.now(italy_tz)
    return current_time.isoformat()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_trains', methods=['POST'])
def get_trains():
    data = request.get_json()  # Riceve i dati come JSON
    direction = data.get("direction")
    departureLocationId=830011119
    arrivalLocationId=830011112
    if(direction=='2'){
        temporary=departureLocationId
        departureLocationId =arrivalLocationId
        arrivalLocationId= temporary
    }
    url = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions"
    body = {
        "departureLocationId": departureLocationId,
        "arrivalLocationId": arrivalLocationId,
        "departureTime": get_italy_current_time(),
        "adults": 1,
        "children": 0,
        "criteria": {
            "frecceOnly": False,
            "regionalOnly": True,
            "noChanges": True,
            "order": "DEPARTURE_DATE",
            "limit": 10,
            "offset": 0
        },
        "advancedSearchRequest": {
            "bestFare": False
        }
    }
    try:
        response = requests.post(url, json=body)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Usa la porta specificata da Render
    app.run(host="0.0.0.0", port=port, debug=True)
