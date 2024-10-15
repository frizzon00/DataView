function uploadCSV() {
    const input = document.getElementById('csvFileInput');
    const file = input.files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo CSV.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const csvData = event.target.result;
        processCSV(csvData);  // Chama a função para processar o CSV
    };

    reader.readAsText(file);
}

function processCSV(csvData) {
    const rows = csvData.split('\n').map(row => row.trim());  // Divide o CSV por linha e remove espaços
    const parsedData = rows.map(row => {
        const values = row.split(',');
        if (values.length < 3) return null;

        const timestamp = formatTimestamp(values[1].trim());
        if (!timestamp) return null;

        return {
            equipment_id: values[0].trim(),
            timestamp: timestamp,  // Adiciona o timestamp formatado
            value: parseFloat(values[2].trim())
        };
    }).filter(row => row !== null);  // Remove linhas inválidas

    if (parsedData.length === 0) {
        alert('Nenhum dado válido encontrado no CSV.');
        return;
    }

    // Envie os dados processados para o GraphQL
    const query = `
      mutation InsertCSV($input: [SensorInput!]!) {
        insertSensorReadings(input: $input) {
          success
        }
      }
    `;

    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            variables: { input: parsedData }
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Resultado do upload:', data);
            if (data.errors) {
                console.error('Erro ao inserir:', data.errors);
                data.errors.forEach((error, index) => {
                    console.error(`Erro ${index + 1}:`, error.message);
                    if (error.locations) {
                        console.error('Local do erro:', error.locations);
                    }
                    if (error.path) {
                        console.error('Caminho do erro:', error.path);
                    }
                });
            } else {
                alert('CSV inserido com sucesso no banco de dados!');
            }
        })
        .catch(error => {
            console.error('Erro ao fazer o upload:', error);
        });
}
function formatTimestamp(timestamp) {
    //timestampno formato correto (YYYY-MM-DD HH:MM:SS)
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (dateRegex.test(timestamp)) {
        return timestamp;
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Meses começam em zero
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Retorna como YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
