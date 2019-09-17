import Complete from './onDataComplete.js';
export default function(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _, defaultConfigs){
    return function ReturnBaseConfig(table, dataset){

        const complete = Complete.bind(undefined, table.config, _, defaultConfigs, dataset)

        // return the object to be used as the default when creating a griffin config object using _.defaultsDeep
        // it needs to include only properties that differ from Highcharts defaults
        return {
            chart: {
                events: {
                   // render: config.datalabelsAllowOverlap ? relaxLabels : undefined
                },
                spacingBottom: 30,
                spacingLeft: 0,
                spacingRight: 15,
                spacingTop: 30,
                styledMode: true
            },
            credits: {
                href: '',
                text: '© ' + new Date().getFullYear() + ' The Pew Charitable Trusts'
            },
            data: {
                complete,
                table,
            },
            legend: {
                symbolHeight: 10,
                symbolRadius: 10,
                symbolWidth: 10,
            },
           /* responsive: {
                rules: returnResponsiveRules()
            },*/
            title: {
                align: 'left',
                text: table.querySelector('caption') ? table.querySelector('caption').innerHTML : null,
            },
            tooltip: {  
              //  pointFormatter: returnPointFormatter(),
            },
            yAxis: {
                reversedStacks: false,
                title: {
                    margin: 15,
                    text: undefined
                },
            },
            xAxis: {
                maxPadding: 0.1,
                minPadding: 0.1,
            }
        };
    }
}
