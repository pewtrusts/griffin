export default function(){
    // this = chart
    function bringToFront(type, container){
        //classList is a DOMTokenList, which inherits from Object prototype
        var series = Object.values(this.classList).find(c => c.match(/highcharts-series-\d+/)).replace('highcharts-series-','');
        var siblingType = type === 'series' ? 'markers' : 'series';
        var sibling = container.querySelector(`g.highcharts-${siblingType}.highcharts-series-${series}`);
        [this, sibling].forEach(element => {
            element.parentNode.appendChild(element);
        });
        console.log(this,type, series);
    }
    this.container.querySelectorAll('g.highcharts-series').forEach(g => {
        var container = this.container;
        g.addEventListener('click', function(){
            bringToFront.call(this, 'series', container);
        });
    });
    this.container.querySelectorAll('g.highcharts-markers').forEach(g => {
        var container = this.container;
        g.addEventListener('click', function(){
            bringToFront.call(this,'markers', container);
        });
    }); 
}