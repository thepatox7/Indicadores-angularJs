angular.module('IndicatorsApp')
.service('IndicatorsService', function($http) {
    const apiKey = '92144475bf3bc6a35131d4132c06f090dc7c23f6';
    const baseUrl = 'https://api.cmfchile.cl/api-sbifv3/recursos_api';

    const indicadorMap = {
        dolar: 'Dolares',
        euro: 'Euros',
        uf: 'UFs',
        ipc: 'IPCs',
        utm: 'UTMs'
    };

    this.getIndicator = function(code) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const formattedMonth = String(month).padStart(2, '0');
        const apiField = indicadorMap[code];

        if (['dolar', 'euro', 'uf'].includes(code)) {
            // Últimos 30 días: 2 meses de datos
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            const prevMonthStr = String(prevMonth).padStart(2, '0');

            const urls = [
                `${baseUrl}/${code}/${prevYear}/${prevMonthStr}?apikey=${apiKey}&formato=json`,
                `${baseUrl}/${code}/${year}/${formattedMonth}?apikey=${apiKey}&formato=json`
            ];

            return Promise.all(urls.map(u => $http.get(u)))
                .then(responses => {
                    const datos1 = responses[0].data[apiField] || [];
                    const datos2 = responses[1].data[apiField] || [];
                    return { serie: [...datos1, ...datos2] };
                });

        } else {
    // Obtener los últimos 12 meses para IPC y UTM
    const allRequests = [];
    const months = [];

    // Mes actual
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Añadir últimos meses del año pasado
    for (let i = 12 - (currentMonth - 0); i <= 12; i++) {
        months.push({ year: currentYear - 1, month: i });
    }

    // Añadir meses de este año
    for (let i = 1; i < currentMonth; i++) {
        months.push({ year: currentYear, month: i });
    }

    months.forEach(({ year, month }) => {
        const m = String(month).padStart(2, '0');
        const url = `${baseUrl}/${code}/${year}/${m}?apikey=${apiKey}&formato=json`;
        allRequests.push(
            $http.get(url).catch(err => {
                if (err.status === 404) return null;
                throw err;
            })
        );
    });

    return Promise.all(allRequests).then(responses => {
        const datos = responses.flatMap(r => r?.data?.[apiField] || []);
        return { serie: datos };
    });
}
    }
});
