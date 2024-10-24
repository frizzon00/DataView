document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btnPeriodo');
    let selectedPeriod = '24h'; // Período padrão
    


    buttons.forEach(button => {
        button.addEventListener('click', function() {
            selectedPeriod = this.textContent.toLowerCase(); // Define o período
            buttons.forEach(btn => btn.classList.remove('active')); // Remove o 'active'
            this.classList.add('active'); // Adiciona o 'active'

            atualizarDados(selectedPeriod); // função para atualizar os dados
            document.getElementById('mediaGeral').innerHTML = `Média Geral (${selectedPeriod})`
            document.getElementById('menorTemp').innerHTML = `Menor Temperatura Registrada  (${selectedPeriod})`
            document.getElementById('maiorTemp').innerHTML = `Maior Temperatura Registrada (${selectedPeriod})`
            document.getElementById('maiorSensor').innerHTML = `Sensor com Maior Média (${selectedPeriod})`
        });
    });


    // atualizar os dados com base no período selecionado
    function atualizarDados(period) {
        // maior valor
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    {
                      maxValueSensor(period: "${period}") {
                        max_value
                      }
                    }
                `,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.maxValueSensor) {
                const maxValue = data.data.maxValueSensor.max_value;
                document.getElementById('maxValue').innerHTML = `${maxValue} ºC`;
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => console.error('Erro ao buscar dados:', error));

        // menor valor
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    {
                      minValueSensor(period: "${period}") {
                        minValue
                      }
                    }
                `,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.minValueSensor) {
                const minValue = data.data.minValueSensor.minValue;
                document.getElementById('minValue').innerHTML = `${minValue} ºC`;
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => console.error('Erro ao buscar dados:', error));

        // média geral
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    {
                      mediaSensor(period: "${period}") {
                        media
                      }
                    }
                `,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.mediaSensor) {
                const media = data.data.mediaSensor.media;
                document.getElementById('mediaValor').innerHTML = `${media} ºC`;;
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => console.error('Erro ao buscar dados:', error));

        // sensor com maior média
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    {
                      sensorWithMaxAvg(period: "${period}") {
                        equipment_id
                        avgValue
                      }
                    }
                `,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.sensorWithMaxAvg) {
                const sensor = data.data.sensorWithMaxAvg.equipment_id;
                const avgValue = data.data.sensorWithMaxAvg.avgValue;
                document.getElementById('sensorMaxAvg').textContent = `${sensor} (${avgValue})`;
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => console.error('Erro ao buscar dados:', error));
    }

    // Chama a função para atualizar os dados na inicialização
    atualizarDados(selectedPeriod);
});