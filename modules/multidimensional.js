export default function buildMultidimensionalConfig(dataset){
    // data- attributes that have dots will result be placed as nested properties in an object
    // attributes without dots will be top-level properties of the object
    function tryToCoerce(string){
        if ( isNaN(+string) || string === '' || string === null || string === 'null') {
            return string;
        }
        return +string;
    }
    function reduceHandler(acc, cur){
        var original = cur;
        function recursive(acc, cur){
            var splitName = cur.split('.');
            var key = splitName[0];
            acc[key] = splitName.length === 1 ? tryToCoerce(dataset[original]) : recursive(acc[key] || {}, splitName.slice(1).join('.') );
            return acc;
        }
        return recursive(acc, cur);
    }
                                // series configuration is handled in the data onComplete function, so they are separated out here
    return {
        general: Object.keys(dataset).filter(key => key.indexOf('series.') !== 0 ).reduce(reduceHandler, {}),
        series: Object.keys(dataset).filter(key => key.indexOf('series.') === 0 ).reduce(reduceHandler, {})
    };

}