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
if(value=='BTtoBSS'){
    fetchTrainsFT('baritorrequetta','barisspirito','results' );         
    
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
   const trainData = {from : from,to: to,limit: 5};
   fetch('/get_trains', { method: 'POST',
                         headers: {'Content-Type': 'application/json'},
                         body: JSON.stringify(trainData) })
       .then(response => response.json())
       .then(data => {
           let output ='';
           if (data.solutions && data.solutions.length > 0) {
               const firstSol = data.solutions[0].solution;
               output =  `<h2><span class="red-text">Da</span> ${firstSol.origin} <span class="red-text">a</span> ${firstSol.destination}</h2>`;
               output += '<table><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Durata</th><th>Prezzo</th></tr>';
               const cartId= data.cartId;                     

               data.solutions.forEach(solution => {
                   const summary = solution.solution;
                   const trainDataStop= {solutionId : summary.id ,cartId: cartId };                  

                   if (!summary || !summary.trains || !summary.trains[0] || !summary.price) {
                     console.log('risultato incompleto');
                       //return; // Salta il risultato se i dati sono incompleti
                   }
                   //trainCategory": "Regionale Veloce",

                   const trainName = summary.trains[0].name || "N/A";
                   const departureTime = summary.departureTime ? new Date(summary.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  : "N/D";
                   const arrivalTime = summary.arrivalTime ? new Date(summary.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })  : "N/D";
                   const duration = summary.duration || "N/D";
                   const price = summary.price && summary.price.amount ? `${summary.price.amount} ${summary.price.currency}` : "N/D";
                   const trainCategory = summary.trains[0].trainCategory || "N/A";
                   const trainCategoryMap= { "Regionale Veloce": "RV", "Regionale": "R", "Frecciarossa": "FR", "Frecciargento": "FA", "Frecciabianca": "FB", "Intercity": "IC", "Intercity Notte": "ICN", "Eurocity": "EC", "Trenitalia": "Trenitalia", "Italo": "Italo" };
                   const trainCategoryShort = trainCategoryMap[trainCategory] || "N/A";
                   const trainNamefull= trainCategoryShort=='RV'? trainName + ' '+trainCategoryShort: trainName;
                   ischanged = summary.trains.length > 1;
                   if (ischanged) return;
                   output += `<tr style="${ischanged ? 'background-color: red; color: white; ' : ''}; 
                   color: ${trainCategoryShort === 'RV' ? 'red' : 'inherit'};">
                       <td>${trainNamefull}</td>
                       <td style="font-weight: bolder";>${departureTime}</td>
                       <td style="font-weight: bolder";>${arrivalTime}</td>
                       <td>${duration}</td>
                       <td>${price}</td>
                   </tr>`;
               });
           } else {
               output += '<tr><td colspan="5">Nessun risultato trovato</td></tr>';
           }
           
           output += '</table>';
           showResult();
           document.getElementById(tableName).innerHTML = output;
           if(tableName=='results')
                fetchTrainsFT(to,from,'results2' );
           else noShowSpinner();
       }).catch(error => {
    noShowSpinner();
       console.error("Errore:", error);
   });
}

function showResult(){
    const results = document.getElementById("results");
    const results2 = document.getElementById("results2");
    results.style.display = "block";
    results2.style.filter = "block";
}
