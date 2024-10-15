let periodoSelecionado = '';

function selecionarPeriodo(periodo) {
    periodoSelecionado = periodo;

    // Mostra as opções de formato de arquivo
    document.getElementById('formato-container').style.display = 'block';

    console.log('Período selecionado:', periodoSelecionado);
}

function baixarLeituras(formato) {
    let query;

    query = `
    {
      sensorReadingsByPeriod(period: "${periodoSelecionado}") {
        equipment_id
        timestamp
        value
      }
    }
`;

    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dados retornados:', data);  // console dos dados retornados

            if (data && data.data && data.data.sensorReadingsByPeriod) {
                const readings = data.data.sensorReadingsByPeriod;

                if (formato === 'pdf') {
                    gerarPDF(readings, periodoSelecionado);
                } else if (formato === 'xlsx') {
                    gerarXLSX(readings, periodoSelecionado);
                } else if (formato === 'csv') {
                    gerarCSV(readings, periodoSelecionado);
                } else {
                    console.error('Formato de download inválido');
                }
            } else {
                console.error('Estrutura de dados inesperada:', data);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
}


function gerarPDF(readings, periodo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();  // Pega a Largura da pagina

    // Texto do título
    const title = `Leituras dos Sensores - Últimos ${periodo}`;
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 10);  // Centraliza os Titulos

    // Texto do cabeçalho das colunas
    const header = 'Equipamento | Data/Hora | Valor';
    const headerWidth = doc.getTextWidth(header); 
    const headerX = (pageWidth - headerWidth) / 2;  
    doc.text(header, headerX, 20);  // Centraliza o Cabecalho

    // Centralizar as leituras
    readings.forEach((reading, index) => {
        const linha = `${reading.equipment_id} | ${reading.timestamp} | ${reading.value}`;
        const linhaWidth = doc.getTextWidth(linha);
        const linhaX = (pageWidth - linhaWidth) / 2;
        doc.text(linha, linhaX, 30 + index * 10);  // Centraliza as Leituras
    });

    // Baixar o PDF
    doc.save(`Leituras-${periodo}.pdf`);
}


function gerarXLSX(readings, periodo) {
    const ws = XLSX.utils.json_to_sheet(readings);  // Cria a planilha
    const wb = XLSX.utils.book_new();  // Cria um novo workbook(sheet)

    XLSX.utils.book_append_sheet(wb, ws, `Leituras_${periodo}`);
    XLSX.writeFile(wb, `Leituras-${periodo}.xlsx`); // Escreve os dados no workbook(sheet) criado
}

function gerarCSV(readings, periodo) {
    const ws = XLSX.utils.json_to_sheet(readings);  // Cria a planilha 
    const csvContent = XLSX.utils.sheet_to_csv(ws);  // Converte para CSV

    // Criar um Blob e baixar o arquivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Leituras-${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}