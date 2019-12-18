import defaultsDeep from  'lodash.defaultsdeep';
import { HighchartsAPI } from './HighchartsAPI.js';

const _ = {defaultsDeep};

export default function returnAPIItem(value, isProto){
    console.log(value);
    var originalArray = value.split('.');
    function recursiveVerify(idx, acc){
        if ( idx === originalArray.length - 1 && !isProto ){
            let obj = acc[originalArray[idx]];
            return obj;
        } else {
            let proto = acc[originalArray[idx]].doclet.extends;
            if ( proto && proto.indexOf(',') !== -1 ){
                //split by comma
                proto = proto.split(',')[1]
            }
            console.log('foobar', proto);
            // use proto to defaults deep the children
            let children = acc[originalArray[idx]].children;
            let defaultChildren = proto ? returnAPIItem(proto, true) : {};
            let combined = _.defaultsDeep(children, defaultChildren);
           let rtn = idx === originalArray.length - 1 ? combined : recursiveVerify(idx + 1, combined);
            return rtn;
        }
    }
    var configItem = recursiveVerify(0,HighchartsAPI);
    //var configItem = originalArray.reduce(recursiveVerify, HighchartsAPI);
    return configItem;
}