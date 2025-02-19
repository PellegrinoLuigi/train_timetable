function fetchTrains() {
             fetchTrainsFT(1,'Risultati BARI - TRANI:','results' );
             

         }
        function fetchTrainsFT(directionTrain,timetableTitle, tableName) {
            const trainData = {
                direction : directionTrain
            };
            fetch('/get_trains', { method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify(trainData) })
                .then(response => response.json())
                .then(data => {
                    let output = '<h2>timetableTitle</h2><table><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Durata</th><th>Prezzo</th></tr>';
                    
                    if (data.solutions && data.solutions.length > 0) {
                        data.solutions.forEach(solution => {
                            const summary = solution.solution;

                            if (!summary || !summary.trains || !summary.trains[0] || !summary.price) {
                                return; // Salta il risultato se i dati sono incompleti
                            }

                            const trainName = summary.trains[0].name || "N/A";
                            const departureTime = summary.departureTime ? new Date(summary.departureTime).toLocaleTimeString() : "N/D";
                            const arrivalTime = summary.arrivalTime ? new Date(summary.arrivalTime).toLocaleTimeString() : "N/D";
                            const duration = summary.duration || "N/D";
                            const price = summary.price && summary.price.amount ? `${summary.price.amount} ${summary.price.currency}` : "N/D";

                            output += `<tr>
                                <td>${trainName}</td>
                                <td>${departureTime}</td>
                                <td>${arrivalTime}</td>
                                <td>${duration}</td>
                                <td>${price}</td>
                            </tr>`;
                        });
                    } else {
                        output += '<tr><td colspan="5">Nessun risultato trovato</td></tr>';
                    }
                    
                    output += '</table>';
                    document.getElementById(tableName).innerHTML = output;
                    if(tableName=='result')
                      fetchTrainsFT(2,'Risultati TRANI - BARI:','results2');
                })
                .catch(error => console.error('Errore:', error));
        }
