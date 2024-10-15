document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  minValueSensor {
                    minValue
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data && data.data && data.data.minValueSensor) {
            const minValue = data.data.minValueSensor.minValue;
            document.getElementById('minValue').textContent = minValue;
            console.log('Menor valor:', minValue);
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
});

