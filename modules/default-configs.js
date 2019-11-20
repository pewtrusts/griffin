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
                    },
                    marker: {
                        radius: 4
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
                chart: { // TODO is this the right place ??
                    type: 'line'
                },
                series: {
                    dataLabels: {
                        align: 'left',
                        allowOverlap: true, // TO DO: NOT AN HC CONFIG OPTION
                        enabled: true,
                        formatter: groupDataset.dataLabelsType ? dataLabelsFormatter : defaultDataLabelFormatter,
                        verticalAlign: 'middle',
                        x: 2,
                        y: -2,
                    }
                },
                xAxis: {
                    labels: {
                        enabled: false,
                        y: 20
                    },
                    maxPadding: 0.7,
                    minPadding: 0.7,
                    opposite: true,
                    tickLength: 0
                },
                yAxis: {
                    visible: false
                }
            };
        },
        pie(groupDataset){
            return {
                chart: {
                    height: '100%'
                },
                series: {
                    colorByPoint: true
                }
            };
        },
        donut(groupDataset) {
            function dataLabelsFormatter(){
               var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
               return this.key + '<br>' + this.percentage.toFixed(fixed) + '%';
            }
            return {
                chart: {
                    height: '100%',
                    type: 'pie',
                },
                series: {
                    colorByPoint: true,
                    dataLabels: {
                        enabled: true,
                        formatter: groupDataset.dataLabelsType ? dataLabelsFormatter : defaultDataLabelFormatter,
                        connecorWidth: 0, // TODO this soens't seem to be a HC option
                    },
                    innersize: '56%',
                },
            };
        },
        variwide(){
            return {};
        }
    };

}
