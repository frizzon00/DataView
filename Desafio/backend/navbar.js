function sair() {
    window.location.href = "./Login";
}

document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        // Mostra a tela selecionada
        if (screenId == "Dashboard") {
            document.getElementById(screenId).style.display = 'grid';
        } else {
            document.getElementById(screenId).style.display = 'flex';
        }
    }

    document.getElementById('tela').addEventListener('click', () => showScreen('Dashboard'));
    document.getElementById('tela2').addEventListener('click', () => showScreen('uploadCsv'));
    document.getElementById('tela3').addEventListener('click', () => showScreen('download'));
});

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('transition');
    const nav = document.getElementById('ativar');
    const menuItems = document.getElementById('menuItens');
    const menuItems2 = document.getElementById('menuItens2');
    const titles = [
        document.getElementById('titulo'),
        document.getElementById('titulo2'),
        document.getElementById('titulo3')
    ];
    const titles2 = [
        document.getElementById('titulo6')
    ];
    const mainTitle = document.getElementById('mainTitle');

    function toggleMenu() {
        nav.classList.toggle('active');
        menuItems.classList.toggle('open');
        menuItems2.classList.toggle('open');

        titles.forEach(title => {
            title.style.display = title.style.display === 'flex' ? 'none' : 'flex';
        });
        titles2.forEach(title => {
            title.style.display = title.style.display === 'flex' ? 'none' : 'flex';
        });
        mainTitle.style.display = mainTitle.style.display === 'flex' ? 'none' : 'flex';
    }

    button.addEventListener('click', toggleMenu);
});

const buttons = document.querySelectorAll('.btnPeriodo');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove a classe 'active'
        buttons.forEach(btn => btn.classList.remove('active'));
        // Adiciona a classe 'active'
        this.classList.add('active');
    });
});