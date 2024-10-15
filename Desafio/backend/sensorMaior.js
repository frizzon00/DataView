 document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  sensorWithMaxAvg {
                    equipment_id
                    avgValue
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Verifique o objeto completo no console
        if (data && data.data && data.data.sensorWithMaxAvg) {
            const sensor = data.data.sensorWithMaxAvg.equipment_id;
            const avgValue = data.data.sensorWithMaxAvg.avgValue;
            document.getElementById('sensorMaxAvg').textContent = `${sensor} (${avgValue})`;
            console.log('Sensor com maior média:', sensor, avgValue);  // Verifica se o dado foi retornado corretamente
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
    });
