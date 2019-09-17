export default function buildMultidimensionalConfig(dataset){
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