import Complete from './onDataComplete.js';
import returnNumberFormatter from './returnNumberFormatter.js';
const horizontalCharts = ['area','column','line'];
export default function(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _, defaultConfigs){
    return function ReturnBaseConfig(table, dataset){
        function returnYAxisConfig(){
            var decimals = dataset.yAxisDecimals !== undefined ? dataset.yAxisDecimals : dataset.decimals !== undefined ? dataset.decimals : '0';
            return {
                    /*allowDecimals: config.yAxisAllowDecimals === 'false' ? false : true,
                    reversedStacks: config.yAxisReversedStacks === 'true',*/
                    labels: {
                        formatter: returnNumberFormatter(Highcharts, dataset, decimals),
                        //padding: 3
                    },
                    title: {
                        text: dataset.yAxisTitleText || undefined,
                        margin: 15,
                    },
                    reversedStacks: false
                    /*endOnTick: config.yAxisEndOnTick == 'false' ? false : true,
                    visible: config.yAxisVisible === 'false' ? false : true,
                    max: config.yAxisMax !== undefined ? config.yAxisMax : undefined,
                    min: config.yAxisMin !== undefined ? config.yAxisMin : undefined,
                    maxPadding: config.yAxisMaxPadding !== undefined ? config.yAxisMaxPadding : 0.05,
                    minPadding: config.yAxisMinPadding !== undefined ? config.yAxisMinPadding : 0.05,
                    tickInterval: +config.yAxisTickInterval || undefined*/
                    
                };
        }
        function removeStylesheet(id){
            var stylesheet = document.getElementById(id);
            if ( stylesheet ){
                document.head.removeChild(stylesheet);
            }
        }
        function addCustomColorDeclarations(){
            removeStylesheet('customColorStylesheet');
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
            var customColorStylesheet = document.createElement('style');
            customColorStylesheet.type = 'text/css';
            customColorStylesheet.id = 'customColorStylesheet';
            customColorStylesheet.innerText = styleString;
            document.head.appendChild(customColorStylesheet)
        }
        function addOverrideDeclarations(){
            removeStylesheet('overrideColorStylesheet');
            var overrides = JSON.parse(dataset.overrides);
            var hash = dataset.orhash;
            var styleString = overrides.reduce(function(acc1,series,i){
                return acc1 + series.reduce(function(acc,cur){
                    return acc + `
                        .highcharts-container.griffin.${hash} .highcharts-series-${i} .${cur.className}:nth-child(${+cur.index + 1}) {
                            fill: ${cur.className === 'highcharts-point' ? cur.overrideColor : 'none'};
                            stroke: ${cur.overrideColor};
                        }
                    `;
                },'');
            },'');
            var overrideColorStylesheet = document.createElement('style');
            overrideColorStylesheet.type = 'text/css';
            overrideColorStylesheet.id = 'overrideColorStylesheet';
            overrideColorStylesheet.innerText = styleString;
            document.head.appendChild(overrideColorStylesheet);
        }
        function addStrokeWidthOverrides(){
            removeStylesheet('strokeWidthStylesheet');
            var overrides = JSON.parse(dataset.strokeWidths);
            var hash = dataset.sthash;
            var styleString = overrides.reduce(function(acc,cur,i){
                return acc + `
                    .highcharts-container.griffin.${hash} .highcharts-series.highcharts-series-${i} path.highcharts-graph {
                        stroke-width: ${cur}px;
                    }
                `;
            },'');
            var strokeWidthStylesheet = document.createElement('style');
            strokeWidthStylesheet.type = 'text/css';
            strokeWidthStylesheet.id = 'strokeWidthStylesheet';
            strokeWidthStylesheet.innerText = styleString;
            document.head.appendChild(strokeWidthStylesheet);   
        }
        function addLabelStyles(){
            removeStylesheet('labelStylesheet');
            var labelStyles = JSON.parse(dataset.labelStyles);
            var hash = dataset.lhash;
            var styleString = labelStyles.reduce(function(acc1,cur){
                return acc1 + `
                    .highcharts-xaxis-labels text:nth-child(${+cur.index + 1}){
                        font-weight: ${cur.styles.includes('b') ? 'bold' : 'normal'};
                        font-style: ${cur.styles.includes('i') ? 'italic' : 'normal'};
                    }
                    .for-print .highcharts-xaxis-labels text:nth-child(${+cur.index + 1}){
                        font-family: ${cur.styles.includes('b') ? 'WhitneySemibold, "Whitney Semibold"' : 'WhitneyBook, "Whitney Book"'};
                        font-style: ${cur.styles.includes('i') ? 'italic' : 'normal'};
                        font-weight: normal;
                    }
                `
            },'');
            var labelStylesheet = document.createElement('style');
            labelStylesheet.type = 'text/css';
            labelStylesheet.id = 'labelStylesheet';
            labelStylesheet.innerText = styleString;
            document.head.appendChild(labelStylesheet);
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
                if ( cur === 'sthash' ){
                    addStrokeWidthOverrides();
                }
                if ( ['lastDataLabelOnly','xAxisSmallerLabels'].indexOf(cur) !== -1 && dataset[cur] === 'true'){
                    return acc + ' ' + cur;
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
                spacingBottom: 0,
                spacingLeft: 1,
                spacingRight: 15,
                spacingTop: 30,
                styledMode: true
            },
            credits: {
                enabled: false
            },
            data: {
                complete,
                table,
            },
            exporting: {
                enabled: false
            },
            legend: {
                align: window.exportForPrint ? 'left' : 'center',
                symbolHeight: 16,
                symbolRadius: 0,
                squareSymbol: true,
                symbolWidth: 16
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
                tickLength: 0,
                tickPositioner: function(){
                    console.log(arguments, this, this.tickPositions, this.dataMin, 'foo');
                    return this.tickPositions;
                },
                //tickPositions: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
                labels: {
                    padding: 0,
                    y: window.exportForPrint && horizontalCharts.indexOf(dataset['chart.type']) !== -1 ? 25 : undefined
                }
            }
        };
    }
}
