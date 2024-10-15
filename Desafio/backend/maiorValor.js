document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  maxValueSensor {
                    max_value
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data && data.data && data.data.maxValueSensor) {
            const maxValue = data.data.maxValueSensor.max_value;
            document.getElementById('maxValue').textContent = maxValue;
            console.log('Maior valor:', maxValue);
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
    
});