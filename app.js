angular.module('IndicatorsApp', [])
.controller('MainController', function(IndicatorsService, $timeout, $scope) {
    const vm = this;

    vm.indicators = [
        { nombre: 'Dólar', codigo: 'dolar' },
        { nombre: 'Euro', codigo: 'euro' },
        { nombre: 'IPC', codigo: 'ipc' },
        { nombre: 'UF', codigo: 'uf' },
        { nombre: 'UTM', codigo: 'utm' }
    ];

    vm.unidadMap = {
        dolar: 'Pesos',
        euro: 'Pesos',
        uf: 'Pesos',
        ipc: '%',
        utm: 'Pesos'
        };

    vm.selectedIndicator = null;
    vm.selectedSerie = [];
    vm.selectedData = null;
    vm.showChart = false;

    vm.selectIndicator = function(code) {
        vm.selectedIndicator = vm.indicators.find(i => i.codigo === code);
        vm.unidad = vm.unidadMap[code];
        IndicatorsService.getIndicator(code).then(function(response) {
            const serie = response.serie;

            if (Array.isArray(serie) && serie.length > 0) {
                vm.selectedData = serie[0];
                vm.selectedSerie = serie;
                vm.showChart = false;
                $scope.$applyAsync();
            } else {
                vm.selectedSerie = [];
                vm.selectedData = null;
                vm.showChart = false;
                alert("No hay datos disponibles.");
            }
        });
    };

    vm.showDetail = function(code) {
        vm.selectedIndicator = vm.indicators.find(i => i.codigo === code);
        vm.unidad = vm.unidadMap[code]; 
        IndicatorsService.getIndicator(code).then(function(response) {
            const serie = response.serie;

            if (Array.isArray(serie) && serie.length > 0) {
                vm.selectedData = serie[0];
                vm.selectedSerie = serie;
                vm.showChart = true;
                $scope.$applyAsync();
                const isAnual = ['ipc', 'utm'].includes(code);
                const datosParaGrafico = isAnual ? serie.slice(-12) : serie.slice(-10);

                $timeout(function () {
                    drawChart(datosParaGrafico.reverse());
                }, 0);
            } else {
                alert("No hay datos disponibles para el gráfico.");
            }
        });
    };

    // Controlar instancia del gráfico para evitar conflictos
    let currentChart = null;

    function drawChart(data) {
        const canvas = document.getElementById('chart');
        if (!canvas) {
            console.error("Canvas no encontrado.");
            return;
        }

        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.Fecha.slice(0, 10)),
                datasets: [{
                    label: 'Valor',
                    data: data.map(d => parseFloat(d.Valor.replace(',', '.'))),
                    borderColor: 'blue',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }
});
