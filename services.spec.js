describe('IndicatorsService', function() {
  var IndicatorsService, $httpBackend;

  beforeEach(module('IndicatorsApp'));

  beforeEach(inject(function(_IndicatorsService_, _$httpBackend_) {
    IndicatorsService = _IndicatorsService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('debe obtener y combinar datos de dos meses para el dólar', function(done) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthStr = String(prevMonth).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');

    const apikey = '92144475bf3bc6a35131d4132c06f090dc7c23f6';
    const url1 = `https://api.cmfchile.cl/api-sbifv3/recursos_api/dolar/${prevYear}/${prevMonthStr}?apikey=${apikey}&formato=json`;
    const url2 = `https://api.cmfchile.cl/api-sbifv3/recursos_api/dolar/${year}/${formattedMonth}?apikey=${apikey}&formato=json`;

    // Simular respuesta con campo correcto
    const data1 = { Dolares: [{ Fecha: '2025-05-01', Valor: '900' }] };
    const data2 = { Dolares: [{ Fecha: '2025-06-01', Valor: '950' }] };

    $httpBackend.expectGET(url1).respond(200, data1);
    $httpBackend.expectGET(url2).respond(200, data2);

    IndicatorsService.getIndicator('dolar').then(function(result) {
      try {
        expect(result).toBeDefined();
        expect(Array.isArray(result.serie)).toBeTrue();
        expect(result.serie.length).toBe(2);
        expect(result.serie[0].Valor).toBe('900');
        expect(result.serie[1].Valor).toBe('950');
        done();
      } catch (error) {
        console.error('Test falló:', error);
        done.fail(error);
      }
    });

    $httpBackend.flush();
  });
});
