/*eslint prefer-exponentiation-operator: "error"*/
export default function(Highcharts){
    return function UseNumericSymbol(config){

            
        // TODO these variable could be calculated in scope of each chart rather than calculated within scope of this fn (ie calculated repeatedly)
        var decimals = config.labelDecimals || -1,
            numericSymbols = this.series.chart.options.lang.numericSymbols,
            numericSymbolMagnitude = this.series.chart.options.lang.numericSymbolMagnitude || 1000, // 1000
            numericSymbolPower = Math.round(Math.log10(numericSymbolMagnitude)), // 3
            valuePower = Math.floor(Math.log10(this.point.y)),  // ie 52,000 -> 4
            value = Highcharts.numberFormat(this.point.y / 10 ** ( Math.floor(valuePower / numericSymbolPower) * numericSymbolPower), decimals), // 5.2
            symbolIndex = Math.floor(valuePower / numericSymbolPower) - 1, // 4 / 3 -> 1.3 -> 1 -> 0
            suffix = config.numberFormat === "percentage" ? '%' : config.suffix || '',
            prefix = config.numberFormat === "currency" ? '$' : config.prefix ||'';

        console.log(this.point.y, numericSymbols,numericSymbolMagnitude,numericSymbolPower,valuePower,value,symbolIndex);

        if ( symbolIndex >= 0 && symbolIndex < numericSymbols.length ){
            return numericSymbols[symbolIndex] !== null ? prefix + value + numericSymbols[symbolIndex] + suffix : prefix + Highcharts.numberFormat(this.point.y, decimals) + suffix;
        } else {
            return prefix + Highcharts.numberFormat(this.point.y, decimals) + suffix;
        }
    }
}