import { HighchartsAPI } from './HighchartsAPI.js';

export default function returnAPIItem(value){
    var originalArray = value.split('.');
    function recursiveVerify(idx, acc){
        if ( idx === originalArray.length - 1 ){
            let obj = acc[originalArray[idx]];
            return obj;
        }
        return recursiveVerify(idx + 1, acc[originalArray[idx]].children);
    }
    var configItem = recursiveVerify(0,HighchartsAPI);
    //var configItem = originalArray.reduce(recursiveVerify, HighchartsAPI);
    return configItem;
}