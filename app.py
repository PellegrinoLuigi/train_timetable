from flask import Flask, render_template, jsonify, request
import requests
import datetime
import pytz
import os

app = Flask(__name__ , static_folder="static")

# Dizionario con i valori delle stazioni
stazioni = {
    "trani": 830011112,
    "baricentrale": 830011119,
    "baritorrequetta": 830011004,
    "barisspirito": 830011116,
    "baripalese": 830055011
}

def get_italy_current_time():
    italy_tz = pytz.timezone('Europe/Rome')
    current_time = datetime.datetime.now(italy_tz)
    adjusted_time = current_time - datetime.timedelta(minutes=3)  # Sottrae 10 minuti
    return adjusted_time.isoformat()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_trains', methods=['POST'])
def get_trains():
    data = request.get_json()  # Riceve i dati come JSON
    station_name_from = data.get("from")
    station_name_to = data.get("to")
    limit=  data.get("limit")
    url = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions"
    body = {
        "departureLocationId": stazioni.get(station_name_from, 830011112),
        "arrivalLocationId": stazioni.get(station_name_to, 830011112),
        "departureTime": get_italy_current_time(),
        "adults": 1,
        "children": 0,
        "criteria": {
             "frecceOnly":false,
              "regionalOnly":true,
              "intercityOnly":false,
              "tourismOnly":false,
              "noChanges":true,
              "order":"DEPARTURE_DATE",
              "offset":0,
              "limit":limit
        },
        "advancedSearchRequest": {
            "bestFare": False,
            "bikeFilter":false
        }
    }
    try:
        response = requests.post(url, json=body)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/get_stops', methods=['POST'])
def get_stops():
    data = request.get_json()  # Riceve i dati come JSON
    solutionId = data.get("solutionId")
    cartId = data.get("cartId")
    url = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/stops?cartId="+cartId+"&solutionId="+solutionId;   
    try:
        response = requests.post(url, json=body)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Usa la porta specificata da Render
    app.run(host="0.0.0.0", port=port, debug=True)
