export default function(Highcharts){
    function defaultDataLabelFormatter(){
        return Highcharts.numberFormat(this.y, -1);
    }
    return {
        area() {
            return {
               
            };
        },
        bar(groupDataset) {
            return {
                series: {
                    dataLabels: {
                        enabled: true,
                        x: 30,
                        y: 5
                    }
                },
                xAxis: {
                    tickWidth: 0,
                    tickLength: 0,
                },
            };
        },
        column(groupDataset){
            return {
                chartType: 'column',
                dataLabelsEnabled: ( groupDataset.dataLabelsEnabled === 'true' ) || false,
                yAxisTitleText: groupDataset.yAxisTitleText ? groupDataset.yAxisTitleText : 'Values'
            };
        },
        line(groupDataset){
           function dataLabelsFormatter(){
                return groupDataset.dataLabelsType === 'name' ? this.series.name : 'not set';
            }
            return {
                //series property is handled differently, in the data onComplete function. griffin index.js will clone deep this obj
                // and remove the series property before using as a source for defaultsDeep
                series: {
                    dataLabels: {
                        align: 'left',
                        formatter: groupDataset.dataLabelsType ? dataLabelsFormatter : defaultDataLabelFormatter,
                        verticalAlign: 'middle',
                        x: 2,
                        y: -2
                    }
                },
                xAxis: {
                    tickmarkPlacement: 'between'
                }
            };
        },
        slope(groupDataset){
             function dataLabelsFormatter(){
               var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
               return this.key + '<br>' + this.y.toFixed(fixed) + '%'; // TO DO. cct programmatically for other vale types
            }
            return {
                series: {
                    dataLabels: {
                        formatter: groupDataset.dataLabelsType ? dataLabelsFormatter : undefined,
                    }
                },
                chartHeight: groupDataset.chartHeight || '56%', 
                chartType: 'line',
                dataLabelsEnabled: true,
                xAxisMinPadding: groupDataset.xAxisMinPadding || 0.7,
                xAxisMaxPadding: groupDataset.xAxisMaxPadding || 0.7,
                xAxisLabelsEnabled: false,
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
            }
        },
        pie(groupDataset){
            return {
                chartHeight: '100%',
                chartType: 'pie',
                colorByPoint: true,
                startAngle: groupDataset.startAngle !== undefined ? groupDataset.startAngle : 0
            };
        },
        donut(groupDataset) {
            function dataLabelsFormatter(){
               var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
               console.log('donut', this);
               return this.key + '<br>' + this.percentage.toFixed(fixed) + '%';
            }
            return {
                series: {
                    dataLabels: {
                        formatter: groupDataset.dataLabelsType ? dataLabelsFormatter : undefined,
                    }
                },
                chartHeight: '100%',
                chartType: 'pie',
                colorByPoint: true,
                innerSize: '56%',
                dataLabelsEnabled: groupDataset.dataLabelsEnabled ? groupDataset.dataLabelsEnabled : true,
                dataLabelsFormatter,
                startAngle: groupDataset.startAngle !== undefined ? groupDataset.startAngle : 0,
                dataLabelsConnectorWidth: groupDataset.dataLabelsConnectorWidth !== undefined ? groupDataset.dataLabelsConnectorWidth : 0

            };
        },
        variwide(){
            return {};
        }
    };

}
