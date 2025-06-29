beforeAll(function() {
  // Mock global Chart constructor si no existe
  window.Chart = function() {
    return {
      destroy: function() {},
    };
  };
});

describe('MainController', function() {
  var $controller, $rootScope, $q, $timeout, scope, vm;
  var IndicatorsServiceMock;

  beforeEach(module('IndicatorsApp'));

  beforeEach(inject(function(_$controller_, _$rootScope_, _$q_, _$timeout_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $timeout = _$timeout_;
    scope = $rootScope.$new();

    IndicatorsServiceMock = {
      getIndicator: jasmine.createSpy('getIndicator')
    };

    vm = $controller('MainController as vm', {
      $scope: scope,
      IndicatorsService: IndicatorsServiceMock,
      $timeout: $timeout
    });
  }));

  it('debe tener 5 indicadores iniciales', function() {
    expect(vm.indicators.length).toBe(5);
    expect(vm.indicators[0].codigo).toBe('dolar');
  });

  it('selectIndicator debe asignar datos correctamente cuando hay datos', function() {
    var mockResponse = {
      serie: [
        { Fecha: '2025-01-01', Valor: '1000' },
        { Fecha: '2025-01-02', Valor: '1100' }
      ]
    };

    var deferred = $q.defer();
    IndicatorsServiceMock.getIndicator.and.returnValue(deferred.promise);

    vm.selectIndicator('dolar');
    deferred.resolve(mockResponse);
    scope.$apply();

    expect(vm.selectedIndicator.codigo).toBe('dolar');
    expect(vm.unidad).toBe('Pesos');
    expect(vm.selectedData).toEqual(mockResponse.serie[0]);
    expect(vm.selectedSerie.length).toBe(2);
    expect(vm.showChart).toBe(false);
  });

  it('selectIndicator debe mostrar alerta si no hay datos', function() {
    spyOn(window, 'alert');
    var deferred = $q.defer();
    IndicatorsServiceMock.getIndicator.and.returnValue(deferred.promise);

    vm.selectIndicator('dolar');
    deferred.resolve({ serie: [] });
    scope.$apply();

    expect(window.alert).toHaveBeenCalledWith('No hay datos disponibles.');
    expect(vm.selectedSerie.length).toBe(0);
  });

  it('showDetail debe preparar datos para el gráfico con 12 entradas para ipc/utm', function() {
    spyOn(window, 'alert');
    spyOn(document, 'getElementById').and.returnValue({
      getContext: () => ({
        clearRect: () => {},
      })
    });
    const serie = [];
    for (let i = 0; i < 15; i++) {
      serie.push({ Fecha: `2025-0${i+1}-01`, Valor: `${1000 + i}` });
    }

    var deferred = $q.defer();
    IndicatorsServiceMock.getIndicator.and.returnValue(deferred.promise);

    vm.showDetail('ipc');
    deferred.resolve({ serie });
    scope.$apply();

    $timeout.flush();

    expect(vm.selectedSerie.length).toBe(15);
    expect(vm.showChart).toBe(true);
    expect(vm.selectedData).toEqual(serie[0]);
  });
});
