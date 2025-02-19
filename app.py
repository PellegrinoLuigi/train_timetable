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
    limit = data.get("limit")

    # URL per fare la richiesta
    url = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions"
    
    # Body della richiesta
    body = {
        "departureLocationId": stazioni.get(station_name_from, 830011112),  # Default se non trovato
        "arrivalLocationId": stazioni.get(station_name_to, 830011112),
        "departureTime": get_italy_current_time(),
        "adults": 1,
        "children": 0,
        "criteria": {
             "frecceOnly": False,
             "regionalOnly": True,
             "intercityOnly": False,
             "tourismOnly": False,
             "noChanges": True,
             "order": "DEPARTURE_DATE",
             "offset": 0,
             "limit": limit
        },
        "advancedSearchRequest": {
            "bestFare": False,
            "bikeFilter": False
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

    # Usa i parametri nell'URL come query string per una richiesta GET
    url = f"https://www.lefrecce.it/Channels.Website.BFF.WEB/website/stops?cartId={cartId}&solutionId={solutionId}"

    try:
        # Usa la richiesta GET invece di POST se non c'è bisogno di un corpo
        response = requests.get(url)
        return jsonify(response.json())  # Restituisce la risposta JSON
    except Exception as e:
        return jsonify({"error": str(e)})  # In caso di errore

@app.route('/get_train_info', methods=['POST'])
def get_train_info():
    # Ricevi i dati dal front-end
    data = request.get_json()
    station_name_from = data.get("from")
    station_name_to = data.get("to")
    limit = data.get("limit")

    # URL per la richiesta di soluzioni treni
    url_trains = "https://www.lefrecce.it/Channels.Website.BFF.WEB/website/ticket/solutions"
    
    body_trains = {
        "departureLocationId": stazioni.get(station_name_from, 830011112),  # Default se non trovato
        "arrivalLocationId": stazioni.get(station_name_to, 830011112),
        "departureTime": get_italy_current_time(),
        "adults": 1,
        "children": 0,
        "criteria": {
             "frecceOnly": False,
             "regionalOnly": True,
             "intercityOnly": False,
             "tourismOnly": False,
             "noChanges": True,
             "order": "DEPARTURE_DATE",
             "offset": 0,
             "limit": limit
        },
        "advancedSearchRequest": {
            "bestFare": False,
            "bikeFilter": False
        }
    }

    try:
        # Prima richiesta per ottenere i treni
        response_trains = requests.post(url_trains, json=body_trains)
        solutions = response_trains.json().get('solutions', [])

        # Se non ci sono soluzioni, ritorna un errore
        if not solutions:
            return jsonify({"error": "No train solutions found."})

        # Itera sulle soluzioni e raccogli i dati per ogni treno
        result = []
        for solution in solutions:
            solution_data = solution.get('solution', {})
            solutionId = solution_data.get('id')
            cartId = solution_data.get('cartId')

            # Seconda richiesta per ottenere le fermate
            url_stops = f"https://www.lefrecce.it/Channels.Website.BFF.WEB/website/stops?cartId={cartId}&solutionId={solutionId}"
            response_stops = requests.get(url_stops)
            stops_data = response_stops.json()

            # Verifica se ci sono fermate
            isLocationPresent = any(stop['location']['id'] == 830011116 for stop in stops_data[0].get('stops', []))

            # Prepara i dati da restituire
            result.append({
                "train_name": solution_data.get('trainName', 'N/A'),
                "departure_time": solution_data.get('departureTime'),
                "arrival_time": solution_data.get('arrivalTime'),
                "price": solution_data.get('price', {}).get('amount', 'N/A'),
                "is_stop_present": isLocationPresent
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Usa la porta specificata da Render
    app.run(host="0.0.0.0", port=port, debug=True)
