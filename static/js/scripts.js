let selectedLimit = 5;
const routeMap = {
  BtoT: ['baricentrale', 'trani'],
  BtoBT: ['baricentrale', 'baritorrequetta'],
  BTtoT: ['baritorrequetta', 'trani'],
  BTtoBSS: ['baritorrequetta', 'barisspirito'],
};

const trainCategoryMap = {
  "Regionale Veloce": "RV", "Regionale": "R", "Frecciarossa": "FR",
  "Frecciargento": "FA", "Frecciabianca": "FB", "Intercity": "IC",
  "Intercity Notte": "ICN", "Eurocity": "EC", "Trenitalia": "Trenitalia", "Italo": "Italo"
};

const updateLimit = () => selectedLimit = +document.getElementById("limitSelect").value;

const toggleSpinner = show => {
  document.getElementById("overlay").style.display = show ? "flex" : "none";
  document.getElementById("content").style.filter = show ? "blur(5px)" : "none";
};

const fetchTrains = value => {
  toggleSpinner(true);
  const route = routeMap[value];
  route && fetchTrainsFT(route[0], route[1], 'results');
};

const showResult = () => {
  document.getElementById("results").style.display = "block";
  document.getElementById("results2").style.display = "block";
};

const fetchTrainsFT = (from, to, tableName) => {
  fetch('/get_trains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, limit: selectedLimit })
  })
  .then(res => res.json())
  .then(data => {
    let output = '';
    const sols = data.solutions || [];

    if (!sols.length) {
      output = '<tr><td colspan="5">Nessun risultato trovato</td></tr>';
    } else {
      const s0 = sols[0].solution;
      output = `<h3>Da <span class="red-text">${s0.origin}</span> a <span class="red-text">${s0.destination}</span></h3>
        <div class="table-wrapper"><div class="table-container"><table>
        <thead><tr><th>Treno</th><th>Partenza</th><th>Arrivo</th><th>Durata</th><th>Prezzo</th></tr></thead><tbody>`;

      sols.forEach(({ solution: s }) => {
        if (!s?.trains?.[0] || !s.price || s.trains.length > 1) return;

        const t = s.trains[0];
        const cat = trainCategoryMap[t.trainCategory] || "N/A";
        const name = cat === 'RV' ? `${t.name} ${cat}` : t.name || "N/A";

        const fmt = d => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/D";
        const timeDep = fmt(s.departureTime), timeArr = fmt(s.arrivalTime);
        const price = s.price.amount ? `${s.price.amount} ${s.price.currency}` : "N/D";

        output += '<tr style="color:${cat === 'RV' ? '#e53e3e' : 'inherit'}">
          <td data-label="Treno">${name}</td>
          <td data-label="Partenza" style="font-weight:bold">${timeDep}</td>
          <td data-label="Arrivo" style="font-weight:bold">${timeArr}</td>
          <td data-label="Durata">${s.duration || 'N/D'}</td>
          <td data-label="Prezzo">${price}</td></tr>';
      });

      output += '</tbody></table></div></div>';
    }

    showResult();
    document.getElementById(tableName).innerHTML = output;
    tableName === 'results' ? fetchTrainsFT(to, from, 'results2') : toggleSpinner(false);
  })
  .catch(err => {
    console.error("Errore:", err);
    toggleSpinner(false);
  });
};

// Parallax (desktop, senza throttling)
if (window.innerWidth > 768) {
  const container = document.querySelector('.container');
  if (container) {
    document.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = y / rect.height * 3, tiltY = x / rect.width * 3;
      container.style.transform = `perspective(1000px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
    });
    document.addEventListener('mouseleave', () =>
      container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)');
  }
}
