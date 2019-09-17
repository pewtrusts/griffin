export const defaultConfigs = {
    area() {
        return {
            chartType: 'area',
        };
    },
    bar(groupDataset) {
        return {
            chartType: 'bar',
            dataLabelsEnabled: true,
            yAxisTitleText: groupDataset.yAxisTitleText ? groupDataset.yAxisTitleText : 'Values',
            xAxisTickWidth: 0,
            xAxisTickLength: 0,
            dataLabelsX: groupDataset.dataLabelsX !== undefined ? groupDataset.dataLabelsX : 30,
            dataLabelsY: groupDataset.dataLabelsY !== undefined ? groupDataset.dataLabelsY : 5,
            isStacked: groupDataset.stacked || false

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
       /* return {
            chart: {
                type: 'line'
            }
        };*/
        return {
            dataLabelsEnabled: ( groupDataset.dataLabelsEnabled === 'true' ) || false,
            dataLabelsFormatter: groupDataset.dataLabelsType ? dataLabelsFormatter : undefined,
            connectNulls: ( groupDataset.connectNulls === 'true' ) || false,
            chartType: 'line',
            dataLabelsAlign: 'left',
            dataLabelsVerticalAlign: 'middle',
            dataLabelsY: -2,
            dataLabelsX: 2,
            showLegend: false,
            yAxisTitleText: groupDataset.yAxisTitleText ? groupDataset.yAxisTitleText : '',
            xAxisTickmarkPlacement: groupDataset.xAxisTickmarkPlacement || 'between'
        };
    },
    slope(groupDataset){
         function dataLabelsFormatter(){
           var fixed = groupDataset.decimals ? parseInt(groupDataset.decimals) : 0;
           return this.key + '<br>' + this.y.toFixed(fixed) + '%'; // TO DO. cct programmatically for other vale types
        }
        return {
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