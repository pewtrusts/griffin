import Complete from './onDataComplete.js';
export default function(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _, defaultConfigs){
    return function ReturnBaseConfig(table, dataset){
        function returnClassName(acc,cur){
            if ( dataset[cur] ){
                return acc + ' ' + cur;
            }
            return acc;
        }
        const complete = Complete.bind(undefined, table.config, _, defaultConfigs, dataset)

        // return the object to be used as the default when creating a griffin config object using _.defaultsDeep
        // it needs to include only properties that differ from Highcharts defaults
        return {
            chart: {
                className: ( window.exportForPrint ? 'for-print ' : '' ) + classNameKeys.reduce(returnClassName, `griffin griffin-${dataset['chart.type']}`),
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
                position: {
                    align: 'left',
                    x: 0
                },
                text: '© ' + new Date().getFullYear() + ' The Pew Charitable Trusts'
            },
            data: {
                complete,
                table,
            },
            exporting: {
                enabled: false
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
                //endOnTick: true,
                //maxPadding: 0,
                minPadding: 0.1,
            }
        };
    }
}
