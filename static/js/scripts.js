function fetchTrains(value) {
             showSpinner();
             getFromTo(value);

}
function getFromTo(value){
  if(value=='BtoT'){
     fetchTrainsFT('baricentrale','trani','results' );             
  }
   if(value=='BtoBT'){
      fetchTrainsFT('baricentrale','baritorrequetta','results' );             

   }
   if(value=='BTtoT'){
      fetchTrainsFT('baritorrequetta','trani','results' );             

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
function fetchTrainsFT(from,to,tableName) {
            const trainData = {
                from : from,
                to: to,
                limit: 5
            };
            fetch('/get_trains', { method: 'POST',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify(trainData) })
                .then(response => response.json())
                .then(data => {
                    let output ='';
                    if (data.solutions && data.solutions.length > 0) {
                        const firstSol = data.solutions[0].solution;
                        output = '<h2>Da '+firstSol.origin+' a '+firstSol.destination+'</h2><table><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Durata</th><th>Prezzo</th></tr>';

                        data.solutions.forEach(solution => {
                            const summary = solution.solution;


                            if (!summary || !summary.trains || !summary.trains[0] || !summary.price) {
                              console.log('risultato incompleto');
                                //return; // Salta il risultato se i dati sono incompleti
                            }

                            const trainName = summary.trains[0].name || "N/A";
                            const departureTime = summary.departureTime ? new Date(summary.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  : "N/D";
                            const arrivalTime = summary.arrivalTime ? new Date(summary.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  : "N/D";
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
                    if(tableName=='results')
                         fetchTrainsFT(to,from,'results2' );
                    else noShowSpinner();
                }).catch(error => {
             noShowSpinner();
                console.error("Errore:", error);
            });
        }
