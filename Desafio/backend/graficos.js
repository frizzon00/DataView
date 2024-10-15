var gauge = new JustGage({
    id: "gauge",
    value: 50,
    min: 0,
    max: 100,
    valueFontColor: "#FFFFFF",
    labelFontColor: "#FFFFFF",
    levelColors: [
        "#ff0000",
        "#f1ff00",
        "#05ff00"
    ]
    ,
    pointer: true,
});

const ctx = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Média por Hora',
                data: [], 
                borderColor: 'white',
                borderWidth: 5,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        font: {
                            size: 16
                        }
                    }
                },
                x: {
                    ticks: {
                        color: 'white',
                        font: {
                            size: 16
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 18
                        }
                    }
                }
            }
        }
    });