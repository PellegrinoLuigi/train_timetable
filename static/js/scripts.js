function fetchTrains(value) {
             showSpinner();
             getFromTo(value);

}
function getFromTo(value){
  if(value=='BtoT'){
     fetchTrainInfo('baricentrale','trani','results' );             
  }
   if(value=='BtoBT'){
      fetchTrainInfo('baricentrale','baritorrequetta','results' );             

   }
   if(value=='BTtoT'){
      fetchTrainInfo('baritorrequetta','trani','results' );             

   }
}

   
function showSpinner(){
            const overlay = document.getElementById("overlay");
            const content = document.getElementById("content");
            overlay.style.display = "flex";
            content.style.filter = "blur(5px)";
}
function noShowSpinner(){
            const overlay = document.getElementById("overlay");
            const content = document.getElementById("content");
            overlay.style.display = "none";
             content.style.filter = "none";
}
function fetchTrainInfo(from, to, tableName) {
    const trainData = {
        from: from,
        to: to,
        limit: 5
    };

    fetch('/get_train_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainData)
    })
    .then(response => response.json())
    .then(data => {
        let output = '';
        if (data.length > 0) {
            output = '<h2><span class="red-text">Da</span> ' + from + ' <span class="red-text">a</span> ' + to + '</h2>';
            output += '<table><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Prezzo</th><th>SS</th></tr>';

            data.forEach(train => {
                const { train_name, departure_time, arrival_time, price, is_stop_present } = train;
                output += `<tr style="${is_stop_present ? 'background-color: red; color: white;' : ''}">
                            <td>${train_name}</td>
                            <td>${departure_time}</td>
                            <td>${arrival_time}</td>
                            <td>${price}</td>
                            <td>${is_stop_present ? 'Sì' : 'No'}</td>
                        </tr>`;
            });
        } else {
            output += '<tr><td colspan="5">Nessun risultato trovato</td></tr>';
        }

        output += '</table>';
        document.getElementById(tableName).innerHTML = output;
    })
    .catch(error => {
        console.error("Errore:", error);
    });
}

function fetchTrainsFT(from, to, tableName) {
    const trainData = {
        from: from,
        to: to,
        limit: 5
    };

    fetch('/get_trains', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(trainData)
    })
    .then(response => response.json())
    .then(data => {
        let output = '';
        if (data.solutions && data.solutions.length > 0) {
            const firstSol = data.solutions[0].solution;
            output = `<h2><span class="red-text">Da</span> ${firstSol.origin} <span class="red-text">a</span> ${firstSol.destination}</h2>`;
            output += '<table><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Durata</th><th>Prezzo</th><th>SS</th></tr>';
            const cartId = data.cartId;

            // Funzione per ottenere gli stop e restituire una promessa
            const getStops = (solutionId) => {
                const trainDataStop = { solutionId: solutionId, cartId: cartId };
                return fetch('/get_stops', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(trainDataStop)
                })
                .then(response => response.json())
                .then(data => {
                    // Verifica che i dati siano strutturati correttamente
                    if (data && data[0] && data[0].stops) {
                        return data[0].stops.some(stop => stop.location.id === 830011116);
                    } else {
                        console.error("Dati di fermate non trovati o mal formattati:", data);
                        return false;
                    }
                }).catch(error => {
                    console.error("Errore nel recupero delle fermate:", error);
                    return false;
                });
            };

            // Esegui tutte le promesse per ogni soluzione
            const promises = data.solutions.map(solution => {
                const summary = solution.solution;

                if (!summary || !summary.trains || !summary.trains[0] || !summary.price) {
                    console.log('Risultato incompleto');
                    return Promise.resolve(null);  // Salta il risultato se i dati sono incompleti
                }

                const trainName = summary.trains[0].name || "N/A";
                const departureTime = summary.departureTime ? new Date(summary.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/D";
                const arrivalTime = summary.arrivalTime ? new Date(summary.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/D";
                const duration = summary.duration || "N/D";
                const price = summary.price && summary.price.amount ? `${summary.price.amount} ${summary.price.currency}` : "N/D";

                // Ottieni la presenza della fermata
                return getStops(summary.id).then(isLocationPresent => {
                    const ss = isLocationPresent;
                    const ischanged = summary.trains.length > 1;
                    return `<tr style="${ischanged ? 'background-color: red; color: white;' : ''}">
                        <td>${trainName}</td>
                        <td>${departureTime}</td>
                        <td>${arrivalTime}</td>
                        <td>${duration}</td>
                        <td>${price}</td>
                        <td>${ss}</td>
                    </tr>`;
                });
            });

            // Dopo che tutte le promesse sono risolte, aggiorna l'output
            Promise.all(promises).then(results => {
                results.forEach(result => {
                    if (result) {
                        output += result;
                    }
                });

                if (results.length === 0) {
                    output += '<tr><td colspan="6">Nessun risultato trovato</td></tr>';
                }

                output += '</table>';
                document.getElementById(tableName).innerHTML = output;

                // Ricarica i dati per il secondo tavolo, se necessario
                if (tableName === 'results') {
                    fetchTrainsFT(to, from, 'results2');
                } else {
                    noShowSpinner();
                }
            }).catch(error => {
                noShowSpinner();
                console.error("Errore:", error);
            });

        } else {
            output += '<tr><td colspan="6">Nessun risultato trovato</td></tr>';
            output += '</table>';
            document.getElementById(tableName).innerHTML = output;
            noShowSpinner();
        }
    })
    .catch(error => {
        noShowSpinner();
        console.error("Errore:", error);
    });
}
