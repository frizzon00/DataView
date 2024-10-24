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
            console.log('Dados retornados:', data);  // dados retornados

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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Margens
    const marginTop = 10;
    const marginBottom = 20;
    const lineHeight = 10;

    let currentY = marginTop;

    const adicionarCabecalho = () => {
        const title = `Leituras dos Sensores - Últimos ${periodo}`;
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, marginTop);
        currentY = marginTop + lineHeight;

        const header = 'Equipamento | Data/Hora | Valor';
        const headerWidth = doc.getTextWidth(header);
        const headerX = (pageWidth - headerWidth) / 2;
        doc.text(header, headerX, currentY);
        currentY += lineHeight;
    };

    adicionarCabecalho();

    readings.forEach((reading, index) => {
        // Verifica se a posição ultrapassou o limite da página
        if (currentY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            adicionarCabecalho();
        }

        const linha = `${reading.equipment_id} | ${reading.timestamp} | ${reading.value}`;
        const linhaWidth = doc.getTextWidth(linha);
        const linhaX = (pageWidth - linhaWidth) / 2;
        doc.text(linha, linhaX, currentY);
        currentY += lineHeight;
    });

    // Baixa o PDF
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