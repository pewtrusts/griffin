export default function returnNumberFormatter(Highcharts, config, decimals){
    switch (config.numberFormat){

        case 'percentage':
            if ( decimals || config.decimals ) {
                let str = config.yAxisDecimals || config.decimals;
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return Highcharts.numberFormat(value * 100, parseInt(str)) + '%';
                };
            } else {
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    var rtn = Highcharts.numberFormat(value * 100, 0) + '%';
                    return rtn;
                };
            }
            break;
        case 'currency':
            if ( decimals || config.decimals ) {
                let str = config.yAxisDecimals || config.decimals;
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return '$' + Highcharts.numberFormat(value, parseInt(str));
                };
            } else {
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return '$' + Highcharts.numberFormat(value, 2);
                };
            }
            break;
        default:
            if ( decimals || config.decimals ) {
                let str = config.yAxisDecimals || config.decimals;
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return Highcharts.numberFormat(value, parseInt(str));
                };
            } else {
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return value;
                };
            }
            break;

    }
     /*
        return function(){
            return `${config.yAxisShowPrefix === 'true' && config.prefix ? config.prefix : ''}${Highcharts.numberFormat(this.value, -1)}${config.yAxisShowSuffix === 'true' && config.suffix ? config.suffix : ''}`;
        };
    }*/
}