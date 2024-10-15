 document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                {
                  mediaSensor {
                    media
                  }
                }
            `,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data && data.data && data.data.mediaSensor) {
            const media = data.data.mediaSensor.media;
            document.getElementById('mediaValor').textContent = media;
            console.log('Média geral:', media);
        } else {
            console.error('Estrutura de dados inesperada:', data);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
    });
    
    });