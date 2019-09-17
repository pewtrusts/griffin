export default function() {
    // invoked as bound fn with first argument being the table's config object
    // and the second argument being lodash
    // the original arguments[0] is now arguments[2]
    console.log(this);
    console.log('arguments', arguments, this);
    var seriesTypes, seriesNumberFormats, zones;
    const config = arguments[0];
    const _ = arguments[1];

    if (config.seriesTypes) {
        seriesTypes = JSON.parse(config.seriesTypes);
    } else {
        seriesTypes = arguments[2].series.map(() => {
            return config.chart.type === 'donut' ? 'pie' : config.chart.type === 'slope' ? 'line' : config.chart.type;
        });
    }
    if (config.seriesNumberFormats) {
        seriesNumberFormats = JSON.parse(config.seriesNumberFormats);
    } else {
        seriesNumberFormats = arguments[2].series.map(() => {
            return config.numberFormat || 'normal';
        });
    }
    if (config.zoneEnds) {
        zones = JSON.parse(config.zoneEnds).map(function(value, index) {
            return {
                className: 'zone-' + index,
                value: value === 'undefined' ? undefined : value
            };
        });
    }
    if (['pie', 'donut'].indexOf(config.chartType !== -1) && config.slice) {
        let slices = JSON.parse(config.slice);
        arguments[2].series[0].data.forEach((point, i) => {
            if (slices.some(s => point[0] === s)) {
                arguments[2].series[0].data[i] = {
                    name: point[0],
                    y: point[1],
                    sliced: true
                };
            }
        });
    }

    console.log('seriesNumberFormats', seriesNumberFormats);
    var defaults = function(i) {
        var numberFormatter;
        console.log(config);
        if (seriesNumberFormats[i] === 'normal') {
            numberFormatter = function() {
                return Highcharts.numberFormat(this.point.y, -1);
            };
        }
        if (seriesNumberFormats[i] === 'percentage') {
            numberFormatter = function() {
                return Highcharts.numberFormat(this.point.y, -1) + '%';
            }
        }
        console.log(numberFormatter);
        return {
            animation: config.animation !== undefined ? config.animation : true,
            type: seriesTypes[i],
            enableMouseTracking: config.enableMouseTracking === 'false' ? false : true,
            connectNulls: config.connectNulls,
            colorByPoint: config.colorByPoint,
            colorIndex: config.colorIndeces ? JSON.parse(config.colorIndeces)[i] : undefined,
            innerSize: config.innerSize,
            dataLabels: {

                //distance: -30,
                connectorPadding: config.dataLabelsConnectorWidth == 0 ? 0 : undefined,
                padding: config.dataLabelsConnectorWidth == 0 ? 0 : undefined,
                connectorWidth: config.dataLabelsConnectorWidth !== undefined ? config.dataLabelsConnectorWidth : 1,
                enabled: (config.dataLabelsEnabled == 'true') || false,
                formatter: config.dataLabelsFormat === 'seriesName' ? function() { console.log(this); return this.series.name; } : config.dataLabelsFormat === 'both' ? function() { return this.series.name + '<br />' + useNumericSymbol.call(this, config); } : config.dataLabelsFormat === 'both-reversed' ? function() { return useNumericSymbol.call(this, config) + '<br />' + this.series.name; } : config.dataLabelsFormat === 'both-point' ? function() { return this.key + '<br />' + useNumericSymbol.call(this, config); } : config.dataLabelsFormat === 'both-point-reversed' ? function() { return useNumericSymbol.call(this, config) + '<br />' + this.key; } : config.dataLabelsFormat === 'pointName' ? function() { return this.key; } : function() { return useNumericSymbol.call(this, config); },
                align: config.dataLabelsAlign || 'center',
                verticalAlign: config.dataLabelsVerticalAlign || 'bottom',
                y: config.dataLabelsY !== undefined ? config.dataLabelsY : -10,
                x: config.dataLabelsX !== undefined ? config.dataLabelsX : 0,
                allowOverlap: config.dataLabelsAllowOverlap === 'true' || false,
                overflow: config.dataLabelsOverflow || 'allow',
                crop: config.dataLabelsCrop || false,

            },
            label: {
                enabled: config.labelEnabled || false,
                connectorAllowed: config.labelConnectorAllowed || false
            },
            showInLegend: true,
            stacking: config.stacking ? config.stacking : undefined,
            slicedOffset: 10,
            startAngle: config.startAngle !== undefined ? +config.startAngle : 0,
            states: {
                hover: {
                    enabled: false,
                    halo: {
                        size: 0
                    },
                }
            },
            //yAxis: returnAxisIndex(i),
            lineWidth: config.lineWidth ? parseInt(config.lineWidth) : 4,
            visible: config.hideSeries && JSON.parse(config.hideSeries).indexOf(i) !== -1 ? false : true,
            marker: {
                symbol: config.seriesMarker || 'circle'
            },
            maxPointWidth: config.maxPointWidth || undefined,
            zoneAxis: config.zoneAxis || 'y',
            zones: zones || []




        }
    };
    console.log(arguments, this);

    function parseNondataColumns(nondataColumns, originalArguments) {
        console.log(nondataColumns, config.xAxisAnnotations, config.endColumn);
        nondataColumns.forEach((column, i) => {
            console.log(config.xAxisPlotBandsColumnIndex, i + +config.endColumn + 1);
            if (!config.xAxisPlotBands && config.xAxisPlotBandsColumnIndex == i + +config.endColumn + 1) { // i.e. endColumn = 1; index = 0;
                let begin, end, plotBandInProgress = false,
                    plotBands = [];
                column.data.forEach((d, j) => {
                    if (d[1] === 1 && !plotBandInProgress) {
                        console.log(d);
                        begin = j;
                        plotBandInProgress = true;
                    }
                    if (d[1] === 0 && plotBandInProgress) {
                        end = j
                        plotBands.push({
                            from: begin,
                            to: end
                        });
                        plotBandInProgress = false;
                    }
                });
                originalArguments[2].xAxis = originalArguments[2].xAxis || {};
                originalArguments[2].xAxis.plotBands = plotBands;
                console.log(originalArguments, 'plotBands!', plotBands);
            }
            // ie 2                 //0  //1
            if (config.xAxisAnnotations == i + +config.endColumn + 1) { // i.e. endColumn = 1; index = 0;
                console.log('annotations!');
                originalArguments[2].annotations = originalArguments[2].annotations || [];
                originalArguments[2].annotations[0] = originalArguments[2].annotations[0] || {};
                originalArguments[2].annotations[0].labels = originalArguments[2].annotations[0].labels || [];
                console.log(originalArguments[2].annotations[0].labels);

                column.data.forEach((d, j) => {
                    if (d[1] !== null) {
                        console.log(d);
                        console.log(originalArguments[2].series[0].data[j]);
                        originalArguments[2].annotations[0].labels.push({
                            align: 'right',
                            text: d[1],
                            point: {
                                x: d[0],
                                xAxis: 0,
                                y: originalArguments[2].series[0].data[j][1],
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
    arguments[2].series.forEach((series, i, array) => { // eslint-disable-line no-unused-vars
        var nondataColumns;
        console.log(config.chartType);
        if (!config.endColumn || i < parseInt(config.endColumn)) {
            let _series = _.defaultsDeep(series, defaults(i));
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
            console.log('series', series);
        } else if (config.endColumn) {
            console.log('nondata column', i);
            nondataColumns = arguments[2].series.splice(i); // HERE. NEED TO TAKE RETURN VALUE OF SPLICE
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
                 arguments[2].annotations = annotations;
                 console.log(arguments);
             }*/
        }
        if (config.xAxisPlotBands && (i === array.length - 1 || i === config.endColumn)) {
            let plotBands = JSON.parse(config.xAxisPlotBands);
            arguments[2].xAxis = arguments[2].xAxis || {};
            arguments[2].xAxis.plotBands = plotBands.map(band => {
                return {
                    from: band[0],
                    to: band[1]
                };
            });
        }
        if (config.xAxisPlotLines && (i === array.length - 1 || i === config.endColumn)) {
            let plotLines = JSON.parse(config.xAxisPlotLines);
            arguments[2].xAxis = arguments[2].xAxis || {};
            arguments[2].xAxis.plotLines = plotLines.map(line => {
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
}