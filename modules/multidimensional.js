export default function buildMultidimensionalConfig(dataset){
    // data- attributes that have dots will result be placed as nested properties in an object
    // attributes without dots will be top-level properties of the object
    function reduceHandler(acc, cur){
        var original = cur;
        function recursive(acc, cur){
            var splitName = cur.split('.');
            var key = splitName[0];
            acc[key] = splitName.length === 1 ? dataset[original] : recursive(acc[key] || {}, splitName.slice(1).join('.') );
            return acc;
        }
        return recursive(acc, cur);
    }
    return Object.keys(dataset).reduce(reduceHandler, {});
}