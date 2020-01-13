import returnNumberFormatter from './returnNumberFormatter.js';
export default function() {
    // invoked as bound fn with first argument being the table's config object {general, series}
    // and the second argument being lodash, and the third being defaultConfigs
    // the fourth is the original griffin.dataset, fifth is Highcharts
    // the original arguments[0] is now arguments[5]
    console.log(this);
    console.log('arguments', arguments, this);
    var seriesTypes, seriesNumberFormats, zones;
    const config = arguments[0].general;
    const seriesConfig = arguments[0].series;
    const _ = arguments[1];
    const defaultConfigs = arguments[2];
    const dataset = arguments[3];
    const Highcharts = arguments[4];
    const nonDataColumnTypes = ['xAxisPlotBandsColumnIndex'];
    var nondataColumns = [];
    const nonDataIndeces = [];

    // if a seriesTypes attribute is provided, parse it here for use in the returnAxisConfig function
    // if none is provided, make all series the same type on basis of chart.type
    if (config.seriesTypes) {
        seriesTypes = JSON.parse(config.seriesTypes);
    } else {
        seriesTypes = arguments[5].series.map(() => {
            return config.chart.type === 'donut' ? 'pie' : config.chart.type === 'slope' ? 'line' : config.chart.type;
        });
    }
    // do the same for seriesNumberFormats
    if (config.seriesNumberFormats) {
        seriesNumberFormats = JSON.parse(config.seriesNumberFormats);
    } else {
        seriesNumberFormats = arguments[5].series.map(() => {
            return config.numberFormat || 'normal';
        });
    }
    // zone
    if (config.zoneEnds) {
        zones = JSON.parse(config.zoneEnds).map(function(value, index) {
            return {
                className: 'zone-' + index,
                value: value === 'undefined' ? undefined : value
            };
        });
    }
    // convert point from [x,y] to {name,y, sliced} to support sliced (offset) pie segments
    if (['pie', 'donut'].indexOf(config.chartType !== -1) && config.slice) {
        let slices = JSON.parse(config.slice);
        arguments[5].series[0].data.forEach((point, i) => {
            if (slices.some(s => point[0] === s)) {
                arguments[5].series[0].data[i] = {
                    name: point[0],
                    y: point[1],
                    sliced: true
                };
            }
        });
    }
    console.log('seriesNumberFormats', seriesNumberFormats);

    var defaults = function(i, numberOfSeries) {
       
        //here returning only properties that differ form HC defaults or which need non-dot attributes to detrmine
        var sConfig =  {
            colorByPoint: seriesConfig.series[seriesTypes[i]] && seriesConfig.series[seriesTypes[i]].colorByPoint !== undefined ? seriesConfig.series[seriesTypes[i]].colorByPoint : undefined,
            colorIndex: config.colorIndeces ? JSON.parse(config.colorIndeces)[i] : undefined,
            // TO DO : DATALABELS FORMATTER SHOULD BE HANDLED IN DEFAULTSCONFIG I THIKN
            /*dataLabels: {
                formatter: config.dataLabelsFormat === 'seriesName' ? function() { console.log(this); return this.series.name; } : config.dataLabelsFormat === 'both' ? function() { return this.series.name + '<br />' + useNumericSymbol.call(this, config); } : config.dataLabelsFormat === 'both-reversed' ? function() { return useNumericSymbol.call(this, config) + '<br />' + this.series.name; } : config.dataLabelsFormat === 'both-point' ? function() { return this.key + '<br />' + useNumericSymbol.call(this, config); } : config.dataLabelsFormat === 'both-point-reversed' ? function() { return useNumericSymbol.call(this, config) + '<br />' + this.key; } : config.dataLabelsFormat === 'pointName' ? function() { return this.key; } : function() { return useNumericSymbol.call(this, config); },
                y: -10,
            },*/
            dataLabels: {
                allowOverlap: true,
                enabled: seriesConfig.series[seriesTypes[i]] && seriesConfig.series[seriesTypes[i]].dataLabels && seriesConfig.series[seriesTypes[i]].dataLabels.enabled === true,
                formatter(){
                    return returnNumberFormatter(Highcharts, config, config.tooltipDecimals).call(this);
                },
                inside: seriesConfig.series[seriesTypes[i]] && seriesConfig.series[seriesTypes[i]].dataLabels ? seriesConfig.series[seriesTypes[i]].dataLabels.inside : undefined
            },
            label: {
                connectorAllowed: config.labelConnectorAllowed || false,
                enabled: config.labelEnabled || false,
            },
            marker: {
                symbol: 'circle'
            },
            showInLegend: numberOfSeries > 1,
            slicedOffset: 10,
            stacking: seriesConfig.series[seriesTypes[i]] && seriesConfig.series[seriesTypes[i]].stacking && seriesConfig.series[seriesTypes[i]].stacking !== 'undefined' ? seriesConfig.series[seriesTypes[i]].stacking : undefined,
            states: {
                hover: {
                    enabled: false,
                    halo: {
                        size: 0
                    },
                }
            },
            tooltip: {
                pointFormatter(){ 
                    var valueStr = returnNumberFormatter(Highcharts, config, config.tooltipDecimals).call(this);
                    return `${this.series.name}: <b>${valueStr}</b>`;
                    //return 'foobar';
                }
            },
            type: seriesTypes[i],
            zones: zones || []
        };
        // use the series property only from defaultConfigs as source for defaultsDeep
        var source = defaultConfigs[dataset['chart.type']](dataset).series; 
        var rtn = _.defaultsDeep(sConfig, source); // mutates sConfig
        return rtn;
    };
    console.log(arguments, this);

    function parseNondataColumns(originalArguments) {
        nondataColumns.forEach((column, i) => {
            if (!config.xAxisPlotBands && config.xAxisPlotBandsColumnIndex == column.originalIndex) { // i.e. plotbands not set directly (from data column) and original index equals one specified in config
                let begin, end, plotBandInProgress = false,
                    plotBands = [];
                column.data.forEach((d, j) => {
                    if (d[1] === 1 && !plotBandInProgress) {
                        begin = d[0];
                        plotBandInProgress = true;
                    }
                    if (d[1] === 0 && plotBandInProgress) {
                        end = d[0]
                        plotBands.push({
                            from: begin,
                            to: end,
                            label: {
                                align: 'left',
                                text: column.name,
                                y: -10,
                            }
                        });
                        plotBandInProgress = false;
                    }
                });
                originalArguments[5].xAxis = originalArguments[5].xAxis || {};
                originalArguments[5].xAxis.plotBands = plotBands;
                console.log(originalArguments, 'plotBands!', plotBands);
            }
            // ie 2                 //0  //1
            if (config.xAxisAnnotations == column.originalIndex) { 
                console.log('annotations!');
                originalArguments[5].annotations = originalArguments[5].annotations || [];
                originalArguments[5].annotations[0] = originalArguments[5].annotations[0] || {};
                originalArguments[5].annotations[0].labels = originalArguments[5].annotations[0].labels || [];
                console.log(originalArguments[5].annotations[0].labels);

                column.data.forEach((d, j) => {
                    if (d[1] !== null) {
                        console.log(d);
                        console.log(originalArguments[5].series[0].data[j]);
                        originalArguments[5].annotations[0].labels.push({
                            align: 'right',
                            text: d[1],
                            point: {
                                x: d[0],
                                xAxis: 0,
                                y: originalArguments[5].series[0].data[j][1],
                                yAxis: 0
                            }, //TODO: ALLOW FOR MULTIPLE AXES?
                            shape: 'connector',
                            y: 50,
                            padding: 0

                        });
                    }
                });
                console.log(originalArguments);
            }
        });
    }
    nonDataColumnTypes.forEach(type => { // capture the indeces of all nondata columns
        if ( config[type] !== undefined ){
            let index = +config[type];
            nonDataIndeces.push(index);
        }
    });
    nonDataIndeces.sort(function(a,b){ // sort the indeces in descending order so that splicing one from the the original array doesn't affect the index of the next to be spliced
        return a < b ? 1 : a > b ? -1 : 0;
    });
    nonDataIndeces.forEach(i => {
        nondataColumns = nonDataIndeces.map(idx => {
            var column = arguments[5].series.splice(idx, 1)[0];
            column.originalIndex = idx;
            return column;
        }); // populate nondata columns and remove them from original array of data columns
    });
    arguments[5].series.forEach((series, i, array) => { // eslint-disable-line no-unused-vars
        // here `series` obj has only data (array) and name (string) properties, coming from the Highcharts data module's parsing of the html tabel
        var numberOfSeries = array.length;
        var _series = _.defaultsDeep(series, seriesConfig, defaults(i, numberOfSeries)); // defaults return obj should include only those properties that differ from HC defaults
        if (seriesTypes[i].match(/range/) !== null) {
            let _data = _series.data.map(each => {
                var range = each[1] === null ? [null, null] : each[1].split('–').map(str => +str);
                return [each[0], ...range];
            });
            _series.data = _data;
        }
        if (seriesTypes[i] === 'variwide') {
            //let _data = _series.data.map(each => {
            console.log(_series.data);
            //    });
        }
        series = _series;
       /* } else if (config.endColumn) {
            console.log('nondata column', i);
            nondataColumns = arguments[5].series.splice(i); // HERE. NEED TO TAKE RETURN VALUE OF SPLICE
            // AND ITEREATE THROUGH THAT ARRAY LOOKING FOR
            // ANNOTATION COLUMNS AND NOTE COLUMNS
            // PLOTBANDS CAN BE HANDLED VIA THE TABLE IN COLUMNS OR
            // DIRECTLY VIA X-AXIS-PLOTNABDS ATTRIBUTE. DIRECT ONE OVERRIDES
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
                 arguments[5].annotations = annotations;
                 console.log(arguments);
             }*/
      /*  } */
        if (config.xAxisPlotBands && i === array.length - 1 ) {
            let plotBands = JSON.parse(config.xAxisPlotBands);
            arguments[5].xAxis = arguments[5].xAxis || {};
            arguments[5].xAxis.plotBands = plotBands.map(band => {
                return {
                    from: band[0],
                    to: band[1],
                    label: {
                        align: 'left',
                        text: band[2],
                        y: -10
                    }
                };
            });
        }
        if (config.xAxisPlotLines && i === array.length - 1 ) {
            let plotLines = JSON.parse(config.xAxisPlotLines);
            arguments[5].xAxis = arguments[5].xAxis || {};
            arguments[5].xAxis.plotLines = plotLines.map(line => {
                return {
                    value: line[0],
                    label: {
                        text: line[1],
                        rotation: 0,
                        useHTML: true
                    }
                };
            });
        }
    });
    parseNondataColumns(arguments);
}