export default function returnNumberFormatter(Highcharts, config, decimals){
    var str = decimals !== undefined ? decimals : config.decimals !== undefined ? config.decimals : undefined;
    switch (config.numberFormat){

        case 'percentage':
            if ( str !== undefined ) {
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
            if ( str !== undefined ) {
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
            if ( str !== undefined ) {
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return Highcharts.numberFormat(value, parseInt(str));
                };
            } else {
                return function(){
                    var value = this.value !== undefined ? this.value : this.y;
                    return Highcharts.numberFormat(value, -1);
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