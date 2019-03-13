import './css/styles.scss';
import cloneDeep from 'lodash.clonedeep';
import defaultsDeep from 'lodash.defaultsdeep';

import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HCAnnotations from 'highcharts/modules/annotations';
import HCData from 'highcharts/modules/data';
//import HCSeriesLabel from 'highcharts/modules/series-label';


HCAnnotations(Highcharts);
HCData(Highcharts);
//HCSeriesLabel(Highcharts);

const _ = {
    cloneDeep,
    defaultsDeep
};
console.log(_);

/**** tooltips ****/
/*function defaultTooltipFormatter(fixed){
    var value = fixed ? this.y.toFixed(fixed) : this.y;
    return `<b>${this.key}:</b> ${value}`;
}*/

Highcharts.setOptions({
    lang: {
        thousandsSep: ',',
        numericSymbols: ['k','m','b','t']
    }
});

function relaxLabels(){ // HT http://jsfiddle.net/thudfactor/B2WBU/ adapted technique
                        // adjusts placement of labels depending on vertical overlap
                        // ie if labels occupy the same vertical space they will be moved
                        // they may not actually overlap, so we call the function twice
                        // for each 'column' of labels . TODO: make more universal by factoring
                        // in horizontal position as well.
    // this = Highchart instance

    var leftLabels = this.container.querySelectorAll('.highcharts-data-label:first-child text'),
        rightLabels = this.container.querySelectorAll('.highcharts-data-label:last-child text');
    relax(leftLabels);
    relax(rightLabels);
    function relax(labels){
        var alpha = 1,
            spacing = 0,
            again = false;
        labels.forEach((labelA, i, array1) => {
            var yA = labelA.getAttribute('y'),
                aMin = Math.round(labelA.getCTM().f) - spacing + parseInt(yA),
                aMax = Math.round(labelA.getCTM().f) + Math.round(labelA.getBBox().height) + 1 + spacing + parseInt(yA),
                aRange = [];
            for ( var j = aMin; j < aMax; j++ ){
                aRange.push(j)
            }
            console.log(aRange);

            labels.forEach(labelB => {
                if ( labelA === labelB ){
                    return;
                }
                var yB = labelB.getAttribute('y'),
                    limitsB = [Math.round(labelB.getCTM().f) - spacing + parseInt(yB), Math.round(labelB.getCTM().f) + labelB.getBBox().height + spacing + parseInt(yB)],
                    sign = limitsB[0] - aRange[aRange.length - 1] <= aRange[0] - limitsB[1] ? 1 : -1,
                    adjust = sign * alpha;
                if ( (aRange[0] < limitsB[0] && aRange[aRange.length - 1] < limitsB[0]) || (aRange[0] > limitsB[1] && aRange[aRange.length - 1] > limitsB[1]) ){
                    //console.log('no collision', a, b);
                    return;
                } // no collison
                
                labelB.setAttribute('y', (+yB - adjust) );
                labelA.setAttribute('y', (+yA + adjust) );
                again = true; 
            });
            if ( i === array1.length - 1 && again === true ) {
                setTimeout(() => {
                    relax(labels);
                },20);
            }
        });
    }
    
}
function useNumericSymbol(config){

        
    // TODO these variable could be calculated in scope of each chart rather than calculated within scope of this fn (ie calculated repeatedly)
    var decimals = config.labelDecimals || -1,
        numericSymbols = this.series.chart.options.lang.numericSymbols,
        numericSymbolMagnitude = this.series.chart.options.lang.numericSymbolMagnitude || 1000, // 1000
        numericSymbolPower = Math.log10(numericSymbolMagnitude), // 3
        valuePower = Math.floor(Math.log10(this.point.y)),  // ie 52,000 -> 4
        value = Highcharts.numberFormat(this.point.y / 10 ** ( Math.floor(valuePower / numericSymbolPower) * numericSymbolPower), decimals), // 5.2
        symbolIndex = Math.floor(valuePower / numericSymbolPower) - 1, // 4 / 3 -> 1.3 -> 1 -> 0
        suffix = config.numberFormat === "percentage" ? '%' : '',
        prefix = config.numberFormat === "currency" ? '$' : '';

    console.log(numericSymbols,numericSymbolMagnitude,numericSymbolPower,valuePower,value,symbolIndex);

    if ( symbolIndex >= 0 && symbolIndex < numericSymbols.length ){
        return numericSymbols[symbolIndex] !== null ? prefix + value + numericSymbols[symbolIndex] + suffix : prefix + Highcharts.numberFormat(this.point.y, decimals) + suffix;
    } else {
        return prefix + Highcharts.numberFormat(this.point.y, decimals) + suffix;
    }
}

const chartsCollection = [];
    var classNameKeys = ['showLegend','shareTooltip', 'paletteTeal', 'paletteMonoTeal', 'invertDataLabels'];
   
    function returnBaseConfig(table, config){
        console.log(arguments[0].parentNode);
        var className = classNameKeys.reduce((acc, cur) => {
            var addClass = config[cur] === 'true' ? ' ' + cur : '';
            return acc + addClass;
        },config.chartType);
        
        function returnNumberFormatter(){
             if ( config.numberFormat && config.numberFormat === 'percentage' && config.stacking !== 'percent' ){
                if ( config.yAxisDecimals || config.decimals ) {
                    let str = config.yAxisDecimals || config.decimals;
                    return function(){
                        return Highcharts.numberFormat(this.value, parseInt(str)) + '%';
                    };
                } else {
                    return function(){
                        return Highcharts.numberFormat(this.value, -1) + '%';
                    };
                }
             } else {
                return function(){
                    return Highcharts.numberFormat(this.value, -1);
                };
            }
        }
        function returnYAxes(){
            console.log(config);
            if ( !config.yAxes ){
                return {
                    allowDecimals: config.yAxisAllowDecimals === 'false' ? false : true,
                    title: {
                        text: config.yAxisTitleText || undefined,
                        margin: 15,
                        //align: config.chartType === 'column' ? 'high' : 'middle',
                        //rotation: config.chartType === 'column' ? 0 : 270,
                        //offset: config.chartType === 'column' ? -10 : undefined,
                        //y: config.chartType === 'column' ? -20 : undefined,
                        //reserveSpace: config.chartType === 'column' ? false : true
                    },
                    reversedStacks: false,
                    labels: {
                        formatter: returnNumberFormatter()
                    },
                    visible: config.yAxisVisible === false ? false : true,
                    max: config.yAxisMax || undefined,
                    min: config.yAxisMin || undefined
                    
                };
            } else {
                return JSON.parse(config.yAxes).map((each,i) => {
                    return {
                        title: {
                            text: JSON.parse(config.yAxisTitleText)[i] || 'Values',
                            //align: config.chartType === 'column' ? 'high' : 'middle',
                            //rotation: config.chartType === 'column' ? 0 : 270,
                            //offset: config.chartType === 'column' ? -10 : undefined,
                            //y: config.chartType === 'column' ? -20 : undefined,
                            //reserveSpace: config.chartType === 'column' ? false : true
                        },
                        opposite: i === 0 ? false : true
                    };
                });
            }
        }
        function returnAxisIndex(seriesIndex){
            var rtn = 0;
            if( config.yAxes ){
                JSON.parse(config.yAxes).forEach((each,i) => {
                    console.log(each, seriesIndex);
                    if ( each.indexOf(seriesIndex) !== -1 ){
                        console.log(i);
                        rtn = i
                    }
                });
            }
            console.log(rtn);
            return rtn;

        }
        function returnPointFormatter(){
            var prefix = config.numberFormat === 'currency' ? '$' : '',
                suffix = config.numberFormat === 'percentage' ? '%' : '',
                decimals = config.decimals !== undefined ? +config.decimals : -1;

            return function(){
                console.log(config);
                return `${this.series.name}: <b>${prefix + Highcharts.numberFormat(this.y, decimals) + suffix}</b><br/>`;
            };
            /*if ( config.numberFormat === 'percentage' ){
                if ( config.decimals ){
                    return function(){
                        console.log(this);
                        return `${this.series.name}: <b>${Highcharts.numberFormat(this.y, parseInt(config.decimals))}%</b><br/>`;
                    };
                } else {
                    return function(){
                        return `${this.series.name}: <b>${Highcharts.numberFormat(this.y, -1)}%</b><br/>`;
                    };
                }
            } else {
                if ( config.decimals ){
                    return function(){
                        return `${this.series.name}: <b>${Highcharts.numberFormat(this.y, parseInt(config.decimals))}</b><br/>`;
                    };
                } else {
                    return function(){
                        return `${this.series.name}: <b>${Highcharts.numberFormat(this.y, -1)}</b><br/>`;
                    };
                }
            }*/
        }
        
        return {
            chart: {
                className,
                height: config.chartHeight || '56%', // TO DO: is there an aspect ration that would work with all social channels?
                type: config.chartType === 'donut' ? 'pie' : config.chartType === 'slope' ? 'line' : config.chartType || 'line',
                spacingTop: 30,
                spacingLeft: config.spacingLeft !== undefined ? +config.spacingLeft : 0,
                spacingRight: config.spacingRight !== undefined ? +config.spacingRight : 30,
                events: {
                    render: config.datalabelsAllowOverlap ? relaxLabels : undefined
                },
                styledMode: true
            },
            data: {
                table,
                parsed: function(columns){
                    console.log(columns);
                },
                
                complete: function(){
                    /*arguments.forEach(each => {
                        console.log(each);
                    });*/
                    console.log(this);
                    console.log('arguments', arguments, this);
                    var seriesTypes, seriesNumberFormats;
                    if ( config.seriesTypes ){
                        seriesTypes = JSON.parse(config.seriesTypes);
                    } else {
                        seriesTypes = arguments[0].series.map(() => {
                            return config.chartType === 'donut' ? 'pie' : config.chartType === 'slope' ? 'line' : config.chartType;
                        });
                    }
                    if ( config.seriesNumberFormats ){
                        seriesNumberFormats = JSON.parse(config.seriesNumberFormats);
                    } else {
                        seriesNumberFormats = arguments[0].series.map(() => {
                            return config.numberFormat || 'normal';
                        });
                    }

                    console.log('seriesNumberFormats', seriesNumberFormats);
                    var defaults = function(i){
                        var numberFormatter;
                        console.log(config);
                        if ( seriesNumberFormats[i] === 'normal' ){
                            numberFormatter = function(){
                                return Highcharts.numberFormat(this.point.y, -1);
                            };
                        }
                        if ( seriesNumberFormats[i] === 'percentage'){
                            numberFormatter = function(){
                                return Highcharts.numberFormat(this.point.y, -1) + '%';
                            }
                        }
                        console.log(numberFormatter);
                        return {
                            type: seriesTypes[i],
                            colorByPoint: config.colorByPoint,
                            colorIndex: config.colorIndeces ? JSON.parse(config.colorIndeces)[i] : undefined,
                            innerSize: config.innerSize,
                            dataLabels: {
                                //allowOverlap: config.datalabelsAllowOverlap || false,
                                //distance: -30,
                                enabled: config.dataLabelsEnabled || false,
                                formatter:  config.dataLabelsFormatter || function(){ return useNumericSymbol.call(this, config);},
                                align: config.dataLabelsAlign || 'center',
                                verticalAlign: config.dataLabelsVerticalAlign || 'bottom',
                                y: config.dataLabelsY || -10,
                                x: config.dataLabelsX || 0,
                                allowOverlap: config.datalabelsAllowOverlap || false,
                                overflow: config.dataLabelsOverflow || 'allow',
                                crop: config.dataLabelsCrop || false,
                                
                            },
                            showInLegend: true,
                            stacking: config.stacking ? config.stacking : undefined,
                            yAxis: returnAxisIndex(i),
                            lineWidth: config.lineWidth ? parseInt(config.lineWidth) : 4,
                            visible: config.hideSeries && JSON.parse(config.hideSeries).indexOf(i) !== -1 ? false : true,
                            marker: {
                                symbol: config.seriesMarker || 'circle'
                            },
                            maxPointWidth: config.maxPointWidth || undefined
                            
                            


                        }
                    };
                    console.log(arguments, this);
                    function parseNondataColumns(nondataColumns, originalArguments){
                        nondataColumns.forEach((column, i) => {
                            console.log(config.xAxisPlotbands,i + config.endColumn);
                            if ( config.xAxisPlotbands == i + +config.endColumn ){ // i.e. endColumn = 1; index = 0;
                                let begin, end, plotBandInProgress = false, plotBands = [];
                                column.data.forEach((d,j) => {
                                    if ( d[1] === 1 && !plotBandInProgress ){
                                        console.log(d);
                                        begin = j;
                                        plotBandInProgress = true; 
                                    }
                                    if ( d[1] === 0 && plotBandInProgress ){
                                        end = j
                                        plotBands.push({
                                            from: begin,
                                            to: end
                                        });
                                        plotBandInProgress = false;
                                    }
                                });
                                originalArguments[0].xAxis = originalArguments[0].xAxis || {};
                                originalArguments[0].xAxis.plotBands = plotBands;
                                console.log(originalArguments,'plotBands!',plotBands);
                            }
                            if ( config.xAxisAnnotations == i + +config.endColumn ){ // i.e. endColumn = 1; index = 0;
                                console.log('annotations!');
                                originalArguments[0].annotations = originalArguments[0].annotations || [];
                                originalArguments[0].annotations[0] = originalArguments[0].annotations[0] || {};
                                originalArguments[0].annotations[0].labels = originalArguments[0].annotations[0].labels || [];
                                console.log(originalArguments[0].annotations[0].labels);

                                column.data.forEach((d,j) => {
                                    if ( d[1] !== null ){
                                        console.log(originalArguments[0].series[0].data[j]);
                                        originalArguments[0].annotations[0].labels.push({
                                            align: 'right',
                                            text: d[1],
                                            point: {
                                                x: j,
                                                xAxis: 0,
                                                y: originalArguments[0].series[0].data[j][1],
                                                yAxis: 0
                                            }, //TODO: ALLOW FOR MULTIPLE AXES?
                                            shape: 'connector',
                                           // y: 50
                                            
                                        });
                                    }
                                });
                                console.log(originalArguments);
                            }
                        });
                    }
                    arguments[0].series.forEach((series, i) => { // eslint-disable-line no-unused-vars
                        var nondataColumns;
                        console.log(config);
                        if ( !config.endColumn || i < parseInt(config.endColumn) ){
                            let _series = _.defaultsDeep(series, defaults(i));
                            if ( seriesTypes[i].match(/range/) !== null) {
                                let _data = _series.data.map(each => {
                                    var range = each[1] === null ? [null,null] : each[1].split('–').map(str => +str);
                                    return [each[0], ...range];
                                });
                                _series.data = _data;
                            }
                           
                            series = _series;
                            console.log('series', series); 
                        } else {
                            console.log('nondata column',i);
                            nondataColumns = arguments[0].series.splice(i); // HERE. NEED TO TAKE RETURN VALUE OF SPLICE
                                                                                  // AND ITEREATE THROUGH THAT ARRAY LOOKING FOR
                                                                                // ANNOTATION COLUMNS AND NOTE COLUMNS
                                                                                // here logic for handling annotations and plotBands?
                            parseNondataColumns(nondataColumns, arguments);
                            
                           /* console.log(config, i);
                            if ( config.xAxisAnnotations == i ){
                                let annotations = [];
                                series.data.forEach((d,j) => {
                                    if ( d !== '' ){
                                        annotations.push({
                                            labels: {
                                                point: {
                                                    x: j,
                                                    xAxis: 0,
                                                }
                                            },
                                            text: d
                                        });
                                    }
                                });
                                arguments[0].annotations = annotations;
                                console.log(arguments);
                            }*/
                        }
                    });
                }                

            },
            legend: {
                enabled: true
            },
            
            title: {
                text: table.querySelector('caption') ? table.querySelector('caption').innerHTML : null
            },
            tooltip: {
                pointFormatter: returnPointFormatter(),
                positioner: config.tooltipPositioner || undefined,
                shape: config.tooltipShape || 'callout',
                useHTML: config.tooltipUseHTML || false,
                shared: config.sharedTooltip || false

            },
            yAxis: returnYAxes(),
            xAxis: {

                title: {
                    text: config.xAxisTitleText || undefined
                },
                reversed: config.xAxisReversed || false,
                minPadding: config.xAxisMinPadding || 0.1,
                maxPadding: config.xAxisMaxPadding || 0.1,
                tickAmount: config.xAxisTickAmount || undefined,
               // startOnTick: config.xAxisStartOnTick || false,
                tickPositions: config.tickPositions || undefined,
                opposite: config.xAxisOpposite || false,
                tickLength: config.xAxisTickLength !== undefined ? config.xAxisTickLength : 10,
                labels: {
                    y: config.xAxisLabelY !== undefined ? config.xAxisLabelY : undefined
                },
                max: config.xAxisMax !== undefined ? config.xAxisMax : undefined,
                min: config.xAxisMin !== undefined ? config.xAxisMin : undefined


            }
        };
    }
    const defaultConfigs = {
        area() {
            //var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
            /*function defaultTooltipFormatter(){
                return undefined;
            }
            function sharedTooltipFormatter(){
                console.log(this);
                var header = `<b>${this.key}</b>`;
                var body = chartsCollection[this.series.chart.collectionIndex].reduce((acc,cur, i) => {
                    return acc + ( this.series.chart.indexInCollection === i ? '<br /><strong>' : '<br />') + `${cur.title.textStr}: ${cur.series[this.series.index].points[this.point.index].y.toFixed(fixed)}` + ( this.series.chart.indexInCollection === i ? '</strong>' : '');
                },'');
                return header + body;
            }*/
            return {
                chartType: 'area',
            };
        },
        bar(groupDataset) {
            //var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
            /*function defaultTooltipFormatter(){
                console.log(this,arguments);
                return `<span style="font-size: 10px">${this.point.name}</span><br/>
                        ${this.series.name}: <b>${this.point.y}</b><br/>`;
            }
            function sharedTooltipFormatter(){
                console.log(this);
                var header = `<b>${this.key}</b>`;
                var body = chartsCollection[this.series.chart.collectionIndex].reduce((acc,cur, i) => {
                    return acc + ( this.series.chart.indexInCollection === i ? '<br /><strong>' : '<br />') + `${cur.title.textStr}: ${cur.series[this.series.index].points[this.point.index].y.toFixed(fixed)}` + ( this.series.chart.indexInCollection === i ? '</strong>' : '');
                },'');
                return header + body;
            }*/
            return {
                chartType: 'bar',
                //tooltipFormatter: groupDataset.shareTooltip ? sharedTooltipFormatter : defaultTooltipFormatter,
                dataLabelsEnabled: true,
                yAxisTitleText: groupDataset.yAxisTitleText ? groupDataset.yAxisTitleText : 'Values',
                xAxisTickWidth: 0,
                xAxisTickLength: 0,
                isStacked: groupDataset.stacked || false

            };
        },
        column(groupDataset){
            console.log(this, groupDataset);
            return {
                chartType: 'column',
                dataLabelsEnabled: ( groupDataset.dataLabelsEnabled === 'true' ) || false,
                yAxisTitleText: groupDataset.yAxisTitleText ? groupDataset.yAxisTitleText : 'Values'
                

            };
        },
        line(groupDataset){
           /* function dataLabelsFormatter(config){
                console.log(this);
                if ( this.series.points.indexOf(this.point) === 0 || this.series.points.indexOf(this.point) === this.series.points.length - 1){
                    return useNumericSymbol.call(this, config);
                } else {
                    return undefined;
                }
            }*/
            return {
                dataLabelsEnabled: ( groupDataset.dataLabelsEnabled === 'true' ) || false,
               // dataLabelsFormatter,
                chartType: 'line',
                dataLabelsAlign: 'left',
                dataLabelsVerticalAlign: 'middle',
                dataLabelsY: -2,
                dataLabelsX: 2,
                showLegend: false
            };
        },
        slope(groupDataset){
            function dataLabelsFormatter(){
                console.log(this);
                var value = groupDataset.numberFormat === 'percentage' ? Highcharts.numberFormatter(this.y, -1) + '%' : Highcharts.numberFormatter(this.y, -1);
                return `${this.series.name} ${value}`;
                //return value;
            }
            return {
                chartHeight: groupDataset.chartHeight || '100%', 
                chartType: 'line',
                dataLabelsEnabled: groupDataset.dataLabelsEnabled ? groupDataset.dataLabelsEnabled : true,
                
                tickPositions: [2006,2016], // TODO: AVOID HARDCODING. IN DATASET OR SOMEHOW PROGRAMMATICALLY
                xAxisMinPadding: groupDataset.xAxisMinPadding || 0.7,
                xAxisMaxPadding: groupDataset.xAxisMaxPadding || 0.7,
                dataLabelsFormatter,
                dataLabelsAlign: 'left',
                dataLabelsVerticalAlign: 'middle',
                dataLabelsY: -2,
                dataLabelsX: 2,
                datalabelsAllowOverlap: groupDataset.datalabelsAllowOverlap === 'false' ? false : true,
                dataLabelsOverflow: 'allow',
                dataLabelsCrop: false,
                yAxisVisible: false,
                xAxisOpposite: true,
                seriesMarker: 'circle',
                xAxisLabelY: groupDataset.xAxisLabelY || 20,
                xAxisTickLength: 0,
                //seriesLabelsEnabled: groupDataset.seriesLabelsEnabled === 'false' ? false : true
            }
        },
        pie(){
            return {
                chartHeight: '100%',
                chartType: 'pie',
                colorByPoint: true,
            };
        },
        donut(groupDataset) {
            
            //var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
           /* function defaultTooltipFormatter(){
                console.log(this);
                return `<b>${this.key}:</b> ${this.percentage.toFixed(fixed)}%`;
            }
            function sharedTooltipFormatter(){
                console.log(this);
                var header = `<b>${this.key}</b>`;
                var body = chartsCollection[this.series.chart.collectionIndex].reduce((acc,cur, i) => {
                    return acc + ( this.series.chart.indexInCollection === i ? '<br /><strong>' : '<br />') + `${cur.title.textStr}: ${cur.series[this.series.index].points[this.point.index].percentage.toFixed(fixed)}%` + ( this.series.chart.indexInCollection === i ? '</strong>' : '');
                },'');
                return header + body;
            }*/
            function dataLabelsFormatter(){
               var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
               console.log('donut', this);
               return this.key + '<br>' + this.percentage.toFixed(fixed) + '%';
            }
            return {
                chartHeight: '100%',
                chartType: 'pie',
                colorByPoint: true,
                innerSize: '56%',
               // tooltipFormatter: groupDataset.shareTooltip ? sharedTooltipFormatter : defaultTooltipFormatter,
                dataLabelsEnabled: groupDataset.dataLabelsEnabled ? groupDataset.dataLabelsEnabled : true,
                dataLabelsFormatter

            };
        }
    };
    function setProperties(obj, config){
        for ( var key in config ) {
            if ( config.hasOwnProperty(key) ){
                obj[key] = config[key];
            }
        }
        return obj;
    }
    /*function shareTooltip(collectionIndex){
        chartsCollection[collectionIndex].forEach(chart => {
            chart.series.forEach(series => {
                series.points.forEach(point => {
                    point.graphic.element.addEventListener('mouseenter', function(e){
                        console.log(e, point);
                        var seriesIndex = point.series.index;
                        var pointIndex = point.index; 
                        chartsCollection[collectionIndex].forEach(chart => {
                            chart.series[seriesIndex].points[pointIndex].setState('hover');
                            //chart.tooltip.refresh(chart.series[seriesIndex].points[pointIndex]);
                        });
                    });
                    point.graphic.element.addEventListener('mouseleave', function(e){
                        console.log(e, point);
                        var seriesIndex = point.series.index;
                        var pointIndex = point.index; 
                        chartsCollection[collectionIndex].forEach(chart => {
                            chart.series[seriesIndex].points[pointIndex].setState();
                        });
                    });
                })
            })
        }); 
    }*/
    var griffins = document.querySelectorAll('.griffin-wrapper');
    var styleKeys = ['minWidth','maxWidth'];
    function undoCamelCase(str){
        return str.replace(/([A-Z])/g, function(v){return '-' + v.toLowerCase()});
    }

    griffins.forEach((griffin, i) => {
        chartsCollection[i] = []; // an array of arrays. each inner array will hold indiv. charts
                                  // this is so each chart can access its siblings
        console.log(griffin.dataset);
        // pass wrapper-level dataset to setProperties fn which returns an obj with own properties
        // from the dataset and prototypical properties from the defaults defined above
        var styleString = styleKeys.reduce((acc,cur) => {
            var addStyle = griffin.dataset[cur] ? `${undoCamelCase(cur)}: ${griffin.dataset[cur]}; ` : '';
            return acc + addStyle;
        },'');
        griffin.setAttribute('style',styleString);
        console.log(styleString);
        var groupConfig = setProperties(Object.create(defaultConfigs[griffin.dataset.chartType || 'line'](griffin.dataset)), griffin.dataset);
        var tables = griffin.querySelectorAll('.js-griffin-table');
        tables.forEach((table, j, array) => {
            console.log(table.dataset);
            var indivConfig = setProperties(Object.create(groupConfig), table.dataset);
            var container = table.parentNode;
            var highchartsConfig = returnBaseConfig(table, indivConfig); // TO DO: use defaultsdeep here
            console.log(highchartsConfig);
            container.classList.add('griffin-' + griffin.dataset.chartType);
            container.style.width = 100 / array.length + '%';
            console.log(highchartsConfig);
            var chart = Highcharts.chart(table.parentNode, highchartsConfig);
            chart.collectionIndex = i;
            chart.indexInCollection = j;
            chartsCollection[i].push(chart);
            console.log(chart);
        });
        if ( groupConfig.shareTooltip === 'true' ){
            //shareTooltip(i);
        }
    });
    console.log(chartsCollection);