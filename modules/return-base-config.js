import Complete from './onDataComplete.js';
import returnNumberFormatter from './returnNumberFormatter.js';
export default function(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _, defaultConfigs){
    return function ReturnBaseConfig(table, dataset){
        function returnYAxisConfig(){
            var decimals = dataset.yAxisDecimals !== undefined ? dataset.yAxisDecimals : '0';
            return {
                    /*allowDecimals: config.yAxisAllowDecimals === 'false' ? false : true,
                    reversedStacks: config.yAxisReversedStacks === 'true',*/
                    labels: {
                        formatter: returnNumberFormatter(Highcharts, dataset, decimals)
                    },
                    title: {
                        text: dataset.yAxisTitleText || undefined,
                        margin: 15,
                    },
                    /*endOnTick: config.yAxisEndOnTick == 'false' ? false : true,
                    visible: config.yAxisVisible === 'false' ? false : true,
                    max: config.yAxisMax !== undefined ? config.yAxisMax : undefined,
                    min: config.yAxisMin !== undefined ? config.yAxisMin : undefined,
                    maxPadding: config.yAxisMaxPadding !== undefined ? config.yAxisMaxPadding : 0.05,
                    minPadding: config.yAxisMinPadding !== undefined ? config.yAxisMinPadding : 0.05,
                    tickInterval: +config.yAxisTickInterval || undefined*/
                    
                };
        }
        function addCustomColorDeclarations(){
            var colors = JSON.parse(dataset.customColors);
            var hash = dataset.hash;
            var styleString = colors.reduce(function(acc,cur,i){
                return acc + `
                .highcharts-container.griffin.${hash} .highcharts-color-${i},
                .highcharts-container.griffin.${hash} .highcharts-data-label-color-${i} text,
                .highcharts-container.griffin.${hash} .highcharts-series-label-color-${i} text
                 {
                    fill: ${cur};
                    stroke: ${cur};
                    background-color: ${cur};
                }`;
            },'');
            var styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = styleString;
            document.head.appendChild(styleSheet)
        }
        function addOverrideDeclarations(){
            var overrides = JSON.parse(dataset.overrides);
            var hash = dataset.orhash;
            var styleString = overrides.reduce(function(acc1,series,i){
                return acc1 + series.reduce(function(acc,cur){
                    return acc + `
                        .highcharts-container.griffin.${hash} .highcharts-series-${i} ${cur.nodeName}:nth-child(${+cur.index + 1}) {
                            fill: ${cur.overrideColor};
                            stroke: ${cur.overrideColor};
                        }
                    `;
                },'');
            },'');
            var styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = styleString;
            document.head.appendChild(styleSheet);
        }
        function addLabelStyles(){
            var labelStyles = JSON.parse(dataset.labelStyles);
            var hash = dataset.lhash;
            var styleString = labelStyles.reduce(function(acc1,cur){
                return acc1 + `
                    .highcharts-xaxis-labels text:nth-child(${+cur.index + 1}){
                        ${cur.styles.reduce((acc,cur2) => {
                            if (cur2 === 'b'){
                                return acc + `    font-weight: bold;
                                `;
                            }
                            if  (cur2 === 'i'){
                                return acc + `    font-style: italic;
                                `;
                            }
                            return acc;
                        },'')}
                    }
                `
            },'');
            var styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = styleString;
            document.head.appendChild(styleSheet);
        }
        function returnClassName(acc,cur){
            if ( dataset[cur] ){
                console.log(cur);
                if ( cur === 'hash' ){
                    addCustomColorDeclarations();
                }
                if ( cur === 'orhash' ){
                    addOverrideDeclarations();
                }
                if ( cur === 'lhash' ){
                    addLabelStyles();
                }
                return acc + ' ' + dataset[cur];
            }
            return acc;
        }
        const complete = Complete.bind(undefined, table.config, _, defaultConfigs, dataset, Highcharts)

        // return the object to be used as the default when creating a griffin config object using _.defaultsDeep
        // it needs to include only properties that differ from Highcharts defaults
        return {
            chart: {
                className: ( window.exportForPrint ? 'for-print ' : '' ) + classNameKeys.reduce(returnClassName, `griffin griffin-${dataset['chart.type']}`),
                colorCount: 6,
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
               // align: window.exportForPrint ? 'left' : 'center',
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
                borderRadius: 0,
                distance: 8,
                shadow: false,
            },
            yAxis: //{
/*                reversedStacks: false,
                title: {
                    margin: 15,
                    text: undefined
                },*/
                returnYAxisConfig(),
            //},
            xAxis: {
                //endOnTick: true,
                //maxPadding: 0,
                minPadding: 0.1,
                //tickLength: 10
            }
        };
    }
}
