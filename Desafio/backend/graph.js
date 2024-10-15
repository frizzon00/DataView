function atualizarGraficos() {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  sensorReadingsByHour(limit: 5) {
                    hour
                    avgValue
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.data && data.data.sensorReadingsByHour) {
            const readings = data.data.sensorReadingsByHour;

            // Mapeia os valores e labels e depois inverte a ordem
            const valores = readings.map(reading => reading.avgValue).reverse();
            const labels = readings.map(reading => reading.hour).reverse();

            // Atualiza o gráfico
            chart.data.labels = labels;
            chart.data.datasets[0].data = valores;
            chart.update();
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
}

setInterval(atualizarGraficos, 5000);

function atualizarGauge() {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  mediaSensorCurrentHour {
                    media
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data && data.data && data.data.mediaSensorCurrentHour) {
            const media = data.data.mediaSensorCurrentHour.media;
            gauge.refresh(media);
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
    
}

setInterval(atualizarGauge, 5000);

document.addEventListener('DOMContentLoaded', () => {
    atualizarGraficos();
    atualizarGauge();
});