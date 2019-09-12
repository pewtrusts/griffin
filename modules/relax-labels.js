export default function relaxLabels(){ // HT http://jsfiddle.net/thudfactor/B2WBU/ adapted technique
                        // adjusts placement of labels depending on vertical overlap
                        // ie if labels occupy the same vertical space they will be moved
                        // they may not actually overlap, so we call the function twice
                        // for each 'column' of labels . TODO: make more universal by factoring
                        // in horizontal position as well.
    // this = Highchart instance

    var leftLabels = this.container.querySelectorAll('.highcharts-data-label:first-child text'),
        rightLabels = this.container.querySelectorAll('.highcharts-data-label:last-child text');
    relax(leftLabels);
    relax(rightLabels);
    function relax(labels){
        var alpha = 1,
            spacing = 0,
            again = false;
        labels.forEach((labelA, i, array1) => {
            var yA = labelA.getAttribute('y'),
                aMin = Math.round(labelA.getCTM().f) - spacing + parseInt(yA),
                aMax = Math.round(labelA.getCTM().f) + Math.round(labelA.getBBox().height) + 1 + spacing + parseInt(yA),
                aRange = [];
            for ( var j = aMin; j < aMax; j++ ){
                aRange.push(j)
            }
            console.log(aRange);

            labels.forEach(labelB => {
                if ( labelA === labelB ){
                    return;
                }
                var yB = labelB.getAttribute('y'),
                    limitsB = [Math.round(labelB.getCTM().f) - spacing + parseInt(yB), Math.round(labelB.getCTM().f) + labelB.getBBox().height + spacing + parseInt(yB)],
                    sign = limitsB[0] - aRange[aRange.length - 1] <= aRange[0] - limitsB[1] ? 1 : -1,
                    adjust = sign * alpha;
                if ( (aRange[0] < limitsB[0] && aRange[aRange.length - 1] < limitsB[0]) || (aRange[0] > limitsB[1] && aRange[aRange.length - 1] > limitsB[1]) ){
                    //console.log('no collision', a, b);
                    return;
                } // no collison
                
                labelB.setAttribute('y', (+yB - adjust) );
                labelA.setAttribute('y', (+yA + adjust) );
                again = true; 
            });
            if ( i === array1.length - 1 && again === true ) {
                setTimeout(() => {
                    relax(labels);
                },20);
            }
        });
    }
    
}