export default function(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _){
    return function ReturnBaseConfig(table, config){

        var className = classNameKeys.reduce((acc, cur) => {
            var addClass = config[cur] === 'true' ? ' ' + cur : '';
            return acc + addClass;
        },config.chartType);

        function returnAnnotations(){
            var annotations = JSON.parse(config.annotations);
            return annotations.map(note => {
                return {
                    labels: [{
                        allowOverlap: true,
                        text: note[2],
                        point: {
                            x: +note[0],
                            xAxis: 0,
                            y: note[1],
                            yAxis: 0
                        }
                    }]
                };
            });
        }

        function returnHeaderFormat(){
            if ( config.tooltipHideSeries === "true" ){
               return '';
            }
            return '<span style="font-size: 10px">{point.key}</span><br/>';
        }
        
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
                    return `${config.yAxisShowPrefix === 'true' && config.prefix ? config.prefix : ''}${Highcharts.numberFormat(this.value, -1)}${config.yAxisShowSuffix === 'true' && config.suffix ? config.suffix : ''}`;
                };
            }
        }

        function returnYAxes(){
            if ( !config.yAxes ){
                return {
                    allowDecimals: config.yAxisAllowDecimals === 'false' ? false : true,
                    title: {
                        text: config.yAxisTitleText || undefined,
                        margin: 15,
                    },
                    reversedStacks: config.yAxisReversedStacks === 'true',
                    labels: {
                        formatter: returnNumberFormatter()
                    },
                    endOnTick: config.yAxisEndOnTick == 'false' ? false : true,
                    visible: config.yAxisVisible === 'false' ? false : true,
                    max: config.yAxisMax !== undefined ? config.yAxisMax : undefined,
                    min: config.yAxisMin !== undefined ? config.yAxisMin : undefined,
                    maxPadding: config.yAxisMaxPadding !== undefined ? config.yAxisMaxPadding : 0.05,
                    minPadding: config.yAxisMinPadding !== undefined ? config.yAxisMinPadding : 0.05,
                    tickInterval: +config.yAxisTickInterval || undefined
                    
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
            var prefix = config.numberFormat === 'currency' ? '$' : config.prefix || '',
                suffix = config.numberFormat === 'percentage' ? '%' : config.suffix || '',
                decimals = config.decimals !== undefined ? +config.decimals : -1;
            if ( config.tooltipHideSeries ){
                return function(){
                    var value = ['pie','donut'].indexOf(config.chartType) !== -1 ? this.percentage : this.y;
                    return `${this.name}: <b>${prefix + Highcharts.numberFormat(value, decimals) + suffix}</b><br/>`;
                }
            }
            return function(){
                var value = ['pie','donut'].indexOf(config.chartType) !== -1 ? this.percentage : this.y;
                return `${this.series.name}: <b>${prefix + Highcharts.numberFormat(value, decimals) + suffix}</b><br/>`;
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
        function returnChartLabels(){
            if ( config.labels ){
                return JSON.parse(config.labels).map(each => {
                    return {
                        html: each
                    };
                });
            }
            return [];
        }
        function returnResponsiveRules(){
            var rules = [];
            var calculatedWidth = +config.minHeight / ( parseFloat(config.chartHeight) / 100 );
            if ( config.minHeight ) {
                rules = rules.concat([{
                    chartOptions: {
                        chart: {
                            height: +config.minHeight
                        }
                    },
                    condition: {
                        maxWidth: calculatedWidth
                    }
                },
                {
                    chartOptions: {
                        chart: {
                            height: config.chartHeight || '56%'
                        }
                    },
                    condition: {
                        minWidth: calculatedWidth
                        //minHeight: +config.minHeight + 1
                    }
                }]);
            }
            if ( config.conditionalLegendWidth ){
                rules = rules.concat([{
                    chartOptions: {
                        legend: {
                            enabled: true
                        }
                    },
                    condition: {
                        maxWidth: +config.conditionalLegendWidth
                    }
                },
                {
                    chartOptions: {
                        legend: {
                            enabled: false
                        }
                    },
                    condition: {
                        minWidth: +config.conditionalLegendWidth + 1
                    }
                }]);
            }
            if ( config.conditionalXAxisLabelRotationWidth ){
                rules = rules.concat([{
                    chartOptions: {
                        xAxis: {
                            labels: {
                                rotation: -45
                            }
                        }
                    },
                    condition: {
                        maxWidth: +config.conditionalXAxisLabelRotationWidth
                    }
                }])
            }
            if ( config.conditionalYAxisTitleWidth ){
                rules = rules.concat([{
                    chartOptions: {
                        chart: {
                            spacingTop: 50
                        },
                        yAxis: {
                            title: {
                                rotation: 0,
                                reserveSpace: false,
                                align: 'high',
                                textAlign: 'left',
                                y: -20

                            }
                        }
                    },
                    condition: {
                        maxWidth: +config.conditionalYAxisTitleWidth
                    }
                },
                {
                    chartOptions: {
                        chart: {
                            spacingTop: config.spacingTop !== undefined ? +config.spacingTop : 30
                        },
                        yAxis: {
                            title: {
                                rotation: 270,
                                reserveSpace: true,
                                align: 'middle',
                                textAlign: undefined,
                                y: undefined

                            }
                        }
                    },
                    condition: {
                        minWidth: +config.conditionalYAxisTitleWidth + 1
                    }
                }]);
            }
            //NB handling data labels via css because of multiple series difficuly. TODO: is there a better way?
            return rules;
        }
        
        return {
            annotations: config.annotations ? returnAnnotations() : [],
            chart: {
                animation: config.animation !== 'false' ? false : true,
                className,
                inverted: config.chartInverted === 'true',
                height: config.chartHeight || '56%', // TO DO: is there an aspect ration that would work with all social channels?
                type: config.chartType === 'donut' ? 'pie' : config.chartType === 'slope' ? 'line' : config.chartType || 'line',
                marginTop: config.marginTop !== undefined ? +config.marginTop : undefined,
                marginBottom: config.marginBottom !== undefined ? +config.marginBottom : undefined,
                spacingTop: config.spacingTop !== undefined ? +config.spacingTop : 30,
                spacingLeft: config.spacingLeft !== undefined ? +config.spacingLeft : 0,
                spacingRight: config.spacingRight !== undefined ? +config.spacingRight : 15,
                spacingBottom: config.spacingBottom !== undefined ? +config.spacingBottom : 30,
                events: {
                    render: config.datalabelsAllowOverlap ? relaxLabels : undefined
                },

                styledMode: true
            },
            credits: {
                 href: null,
                text: config.showCopyright === 'true' ? '© ' + new Date().getFullYear() + ' The Pew Charitable Trusts' : '',
                position: {
                    align: 'left',
                    x: 0
                }
                
            },
            enableBringToTop: config.enableBringToTop === 'true',
            labels: {
                items: returnChartLabels()
            },
            data: {
                table,
             /*   parsed: function(columns){
                    if ( config.chartType === 'variwide' ){
                        console.log(columns);
                        columns.forEach(function(column, i){
                            if ( i > 0 ) {
                                column = column.map((d, j) => {
                                    var total = columns.reduce((acc,cur) => {
                                        if ( !isNaN(cur[j]) ){
                                            return acc + cur;
                                        }
                                        return acc;
                                    },0);
                                    return {
                                        y: total,
                                        z: d / total
                                    };
                                });
                                console.log(column);
                            }
                        });
                        console.log(columns);
                    }
                    return true;
                },*/
                
                complete: function(){
                    /*arguments.forEach(each => {
                        console.log(each); 
                    });*/

                    console.log(this);
                    console.log('arguments', arguments, this);
                    var seriesTypes, seriesNumberFormats, zones;
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
                    if ( config.zoneEnds ) {
                        zones = JSON.parse(config.zoneEnds).map(function(value, index){
                            return {
                                className: 'zone-' + index,
                                value: value === 'undefined' ? undefined : value
                            };
                        });
                    }
                    if ( ['pie','donut'].indexOf(config.chartType !== -1 ) && config.slice ){
                        let slices = JSON.parse(config.slice);
                        arguments[0].series[0].data.forEach((point, i) => {
                            if ( slices.some(s => point[0] === s) ){
                                arguments[0].series[0].data[i] = {
                                    name: point[0],
                                    y: point[1],
                                    sliced: true
                                };
                            }
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
                            animation: config.animation !== 'false' ? false : true,
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
                                enabled: ( config.dataLabelsEnabled == 'true' ) || false,
                                formatter:  config.dataLabelsFormat === 'seriesName' ? function(){ console.log(this); return this.series.name; } : 
                                        config.dataLabelsFormat === 'both' ? function(){ return this.series.name + '<br />' + useNumericSymbol.call(this, config);  } : 
                                        config.dataLabelsFormat === 'both-reversed' ? function(){ return useNumericSymbol.call(this, config) + '<br />' + this.series.name;  } :
                                        config.dataLabelsFormat === 'both-point' ? function(){ return this.key + '<br />' + useNumericSymbol.call(this, config);  } : 
                                        config.dataLabelsFormat === 'both-point-reversed' ? function(){ return useNumericSymbol.call(this, config) + '<br />' + this.key;  } :
                                        config.dataLabelsFormat === 'pointName' ? function(){ return this.key; } :
                                        config.dataLabelsFormat === 'percentage' ? function(){ return this.key + '<br />' + Highcharts.numberFormat(this.percentage, 0) + '%'; } : 
                                    function(){ return useNumericSymbol.call(this, config);},
                                align: config.dataLabelsAlign || 'center',
                                verticalAlign: config.dataLabelsVerticalAlign || 'middle',
                                y: config.dataLabelsY !== undefined ? config.dataLabelsY : -10,
                                x: config.dataLabelsX !== undefined ? config.dataLabelsX : 0,
                                allowOverlap: config.dataLabelsAllowOverlap === 'true' || false,
                                overflow: config.dataLabelsOverflow || 'allow',
                                crop: config.dataLabelsCrop || false,
                                
                            },
                            label: {
                                enabled: config.labelEnabled === "true",
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
                            yAxis: returnAxisIndex(i),
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
                    function parseNondataColumns(nondataColumns, originalArguments){
                        console.log(nondataColumns, config.xAxisAnnotations, config.endColumn);
                        nondataColumns.forEach((column, i) => {
                            console.log(config.xAxisPlotBandsColumnIndex,i + +config.endColumn + 1);
                            if ( !config.xAxisPlotBands && config.xAxisPlotBandsColumnIndex == i + +config.endColumn + 1){ // i.e. endColumn = 1; index = 0;
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
                                                          // ie 2                 //0  //1
                            if ( !config.annotations && config.xAxisAnnotations == i + +config.endColumn + 1){ // i.e. endColumn = 1; index = 0;
                                console.log('annotations!');
                                originalArguments[0].annotations = originalArguments[0].annotations || [];
                                originalArguments[0].annotations[0] = originalArguments[0].annotations[0] || {};
                                originalArguments[0].annotations[0].labels = originalArguments[0].annotations[0].labels || [];
                                console.log(originalArguments[0].annotations[0].labels);

                                column.data.forEach((d,j) => {
                                    if ( d[1] !== null ){
                                        console.log(d);
                                        console.log(originalArguments[0].series[0].data[j]);
                                        originalArguments[0].annotations[0].labels.push({
                                            align: 'right',
                                            text: d[1],
                                            point: {
                                                x: d[0],
                                                xAxis: 0,
                                                y: originalArguments[0].series[0].data[j][1],
                                                yAxis: 0
                                            }, //TODO: ALLOW FOR MULTIPLE AXES?
                                            shape: 'connector',
                                            y: 50,
                                            padding:0
                                            
                                        });
                                    }
                                });
                                console.log(originalArguments);
                            }
                        });
                    }
                    arguments[0].series.forEach((series, i, array) => { // eslint-disable-line no-unused-vars
                        var nondataColumns;
                        console.log(config.chartType);
                        if ( !config.endColumn || i < parseInt(config.endColumn) ){
                            let _series = _.defaultsDeep(series, defaults(i));
                            if ( seriesTypes[i].match(/range/) !== null) {
                                let _data = _series.data.map(each => {
                                    var range = each[1] === null ? [null,null] : each[1].split('–').map(str => +str);
                                    return [each[0], ...range];
                                });
                                _series.data = _data;
                            }
                            if ( seriesTypes[i] === 'variwide' ) {
                                //let _data = _series.data.map(each => {
                                    console.log(_series.data);
                            //    });
                            }
                            
                            series = _series;
                            console.log('series', series); 
                        } else if ( config.endColumn ) {
                            console.log('nondata column',i);
                            nondataColumns = arguments[0].series.splice(i); // HERE. NEED TO TAKE RETURN VALUE OF SPLICE
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
                                arguments[0].annotations = annotations;
                                console.log(arguments);
                            }*/
                        }
                        if ( config.xAxisPlotBands && ( i === array.length - 1 || i === config.endColumn ) ){
                            let plotBands = JSON.parse(config.xAxisPlotBands);
                            arguments[0].xAxis = arguments[0].xAxis || {};
                            arguments[0].xAxis.plotBands = plotBands.map(band => {
                                return {
                                    from: band[0],
                                    to: band[1],
                                    label: {
                                        text: band[2] || undefined,
                                        y: -5
                                    },
                                };
                            });
                        }
                        if ( config.xAxisPlotLines && ( i === array.length - 1 || i === config.endColumn ) ){
                            let plotLines = JSON.parse(config.xAxisPlotLines);
                            arguments[0].xAxis = arguments[0].xAxis || {};
                            arguments[0].xAxis.plotLines = plotLines.map(line => {
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

            },
            legend: {
                
                enabled: config.showLegend ? true : false,  // to do . no longer reserving space for legends.
                symbolRadius: 10,
                symbolWidth: 10,
                symbolHeight: 10,
                reversed: config.legendReversed === 'true',
                layout: config.legendLayout || 'horizontal',
                navigation: {
                    enabled: false
                }

                
            },
            plotOptions: {
             pie: {
              point: {
               events: {
                legendItemClick: function(){
                 return false;
                }
               }
              }
             }
            },
            responsive: {
                rules: returnResponsiveRules()
            },
            title: {
                text: table.querySelector('caption') ? table.querySelector('caption').innerHTML : null,
                //useHTML: true,
                align: 'left'
            },
            tooltip: {  
                pointFormatter: returnPointFormatter(),
                positioner: config.tooltipPositioner || undefined,
                shape: config.tooltipShape || 'callout',
                useHTML: config.tooltipUseHTML || false,
                shared: config.sharedTooltip === 'true',
                headerFormat: returnHeaderFormat(),

            },
            yAxis: returnYAxes(),
            xAxis: {
                type: config.xAxisType || 'linear',
                categories: config.xAxisCategories !== undefined ? JSON.parse(config.xAxisCategories) : undefined,
                title: {
                    text: config.xAxisTitleText || undefined
                },
                reversed: config.xAxisReversed || false,
                minPadding: +config.xAxisMinPadding || 0.1,
                maxPadding: +config.xAxisMaxPadding || 0.1,
                tickAmount: config.xAxisTickAmount || undefined,
                tickmarkPlacement: config.xAxisTickmarkPlacement || 'between',
                startOnTick: config.xAxisStartOnTick || false,
                endOnTick: config.xAxisEndOnTick || false,
                tickPositions: config.xAxisTickPositions || undefined,
                opposite: config.xAxisOpposite || false,
                tickLength: config.xAxisTickLength !== undefined ? config.xAxisTickLength : 10,
                labels: {
                    align: config.xAxisLabelsAlign,
                    x: config.xAxisLabelsX !== undefined ? +config.xAxisLabelsX : 0,
                    y: config.xAxisLabelsY !== undefined ? +config.xAxisLabelsY : undefined,
                    enabled: config.xAxisLabelsEnabled !== undefined ? config.xAxisLabelsEnabled : true,
                    rotation: config.xAxisLabelsRotation !== undefined ? config.xAxisLabelsRotation : 0,
                    staggerLines: config.xAxisLabelsStaggerLines || 0,
                    useHTML: config.xAxisLabelsUseHtml === 'true' ? true : false,
                    padding: config.xAxisLabelsPadding !== undefined ? +config.xAxisLabelsPadding : 5,

                    
                },
                max: config.xAxisMax !== undefined ? +config.xAxisMax : undefined,
                min: config.xAxisMin !== undefined ? +config.xAxisMin : undefined,
                visible: config.xAxisVisible === 'false' ? false : true,


            }
        };
    }
}
