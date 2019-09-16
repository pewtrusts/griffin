import { HighchartsAPI } from './HighchartsAPI.js';

console.log(HighchartsAPI);
export default function buildMultidimensionalConfig(dataset){
    function reduceHandler(acc, cur){
        var original = cur;
        var originalArray = cur.split('.');
        function verify(value){
            function recursiveVerify(idx, acc){
                if ( idx === originalArray.length - 1 ){
                    let obj = acc[originalArray[idx]];
                    return obj;
                }
                return recursiveVerify(idx + 1, acc[originalArray[idx]].children);
            }
            var configItem = recursiveVerify(0,HighchartsAPI);
            //var configItem = originalArray.reduce(recursiveVerify, HighchartsAPI);
            console.log(configItem);
            return value;
        }
        function recursive(acc, cur){
            var splitName = cur.split('.');
            var key = splitName[0];
            acc[key] = splitName.length === 1 ? verify(dataset[original]) : recursive(acc[key] || {}, splitName.slice(1).join('.') );
            return acc;
        }
        return recursive(acc, cur);
    }
    return Object.keys(dataset).reduce(reduceHandler, {});
}
