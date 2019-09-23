/* css */
import './css/styles.scss';

/* node_modules */
import cloneDeep from 'lodash.clonedeep';
import defaultsDeep from  'lodash.defaultsdeep';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HCExporting from 'highcharts/modules/exporting';
import HCOfflineExporting from 'highcharts/modules/offline-exporting';
import HCAnnotations from 'highcharts/modules/annotations';
import HCData from 'highcharts/modules/data';
import HCVariwide from 'highcharts/modules/variwide';
import HCSeriesLabel from './series-label-es6';

/* my modules */
import relaxLabels from './modules/relax-labels.js';
import UseNumericSymbol from './modules/numeric-symbol.js';
import ReturnBaseConfig from './modules/return-base-config.js';
import buildMultidimensionalConfig from './modules/multidimensional.js';
import DefaultConfigs from './modules/default-configs.js';

export { default as returnAPIItem } from './modules/returnAPIItem.js';

HCAnnotations(Highcharts);
HCData(Highcharts);
HCSeriesLabel(Highcharts);
HCVariwide(Highcharts);
HCExporting(Highcharts);
HCOfflineExporting(Highcharts);

const _ = {
    cloneDeep,
    defaultsDeep
};
const styleKeys = ['minWidth','maxWidth'];
const classNameKeys = ['paletteTeal', 'paletteMonoTeal'];
const useNumericSymbol = UseNumericSymbol(Highcharts);
const defaultConfigs = DefaultConfigs(Highcharts);
const returnBaseConfig = ReturnBaseConfig(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _, defaultConfigs);


Highcharts.setOptions({
    lang: {
        thousandsSep: ',',
        numericSymbols: ['K','M','B','T']
    }
});

function undoCamelCase(str){
    return str.replace(/([A-Z])/g, function(v){return '-' + v.toLowerCase()});
}
function stripSeriesProperty(configObj){
    var _config = _.cloneDeep(configObj);
    delete _config.series;
    return _config;
}
export { defaultConfigs };
export const Griffin = {
    chartsCollection: [], // empty array that will hold the Charts as they are created
    init(config = {}){ // config e.g. {lazy: true}
        this.griffins = document.querySelectorAll('.griffin-wrapper'); // find all griffin wrappers in the HTML
        this.griffins.forEach((griffin, i) => {
            griffin.dataset['chart.height'] = griffin.dataset['chart.height'] || '56%';
            griffin.dataset['chart.type'] = griffin.dataset['chart.type'] || 'line';
            griffin.config = _.defaultsDeep(buildMultidimensionalConfig(griffin.dataset).general, stripSeriesProperty(defaultConfigs[griffin.dataset['chart.type']](griffin.dataset)));
            griffin.seriesConfig = buildMultidimensionalConfig(griffin.dataset).series;
            
            // some data- attributes such as minWidth, maxWidth take effect via CSS style declaration, not by Highcharts config.
            // reduce those attributes into a style declaration string
            var styleString = styleKeys.reduce((acc,cur) => {
                var addStyle = griffin.dataset[cur] ? `${undoCamelCase(cur)}: ${griffin.dataset[cur]}; ` : '';
                return acc + addStyle;
            },'');
            griffin.parentNode.setAttribute('style',styleString);
            
            if (!config.lazy){ // if eager mode (not lazy), construct all the charts right away
                this.construct(griffin,i)
            } else {           // if not, set the padding of the placeholder divs to match the height of the chart so that the page doesn't need to reflow  
                
                switch(griffin.dataset.minHeight){
                    case undefined:
                        if ( griffin.dataset.chartHeight.indexOf('%') !== -1){
                            griffin.style.paddingBottom = griffin.dataset.chartHeight; 
                        } else {
                            griffin.style.paddingBottom = griffin.dataset.chartHeight + 'px'; 
                        }
                        break;
                    default: // is not undefined
                        if ( griffin.dataset.chartHeight.indexOf('%') !== -1){ // chartHeight is percentage, need to compare chartHeight at x width to minHeight
                            let calcHeight = ( parseInt(griffin.dataset.chartHeight) / 100 ) * griffin.offsetWidth; // calculated height is xx% of the width of the container
                                                          // the calculated height is less than minHeigh, use minHeight              else use chartHeight
                            griffin.style.paddingBottom = calcHeight < griffin.dataset.minHeight ? griffin.dataset.minHeight + 'px' : griffin.dataset.chartHeight;

                        } else { // chartHeight is absolute pixel, padding should be chartHeigth (ie chartHeight overrides minHeigh if both are pixel)
                            griffin.style.paddingBottom = griffin.dataset.chartHeight + 'px'; 
                        }

                }
                griffin.isPending = true;
                griffin.classList.add('griffin-pending');
                // create an anchor link, positions via CSS, that is observed
                let anchor = document.createElement('a');
                anchor.classList.add('observer-anchor');
                griffin.insertAdjacentElement('afterbegin', anchor);
                griffin.anchor = anchor;
            }
        });
        if ( config.lazy ){  // set the observers that will call the construct method when charts enter the viewport
            this.setObservers();
        }
    },
    setObservers(){
        function observerCallback(entries){
            entries.forEach(entry => {
                if ( entry.target.parentElement.isPending && entry.isIntersecting ){
                    window.requestAnimationFrame(() => {
                        this.construct(entry.target.parentElement, Array.from(this.griffins).indexOf(entry.target));
                    });
                }
            });
        }
        var observer = new IntersectionObserver(observerCallback.bind(this));
        this.griffins.forEach(griffin => {
            observer.observe(griffin.anchor);
        });
    },
    construct(griffin, i){
        griffin.isPending = false;
        griffin.classList.remove('griffin-pending');
        griffin.style.paddingBottom = 0; // TO DO this is what's causing the flash and repainting
                                         // can the charts keep the padding and remain position:absolute?

        this.chartsCollection[i] = []; // an array of arrays. each inner array will hold indiv. charts
                                      // this is so each chart can access its siblings

        // pass wrapper-level dataset to setProperties fn which returns an obj with own properties
        // from the dataset and prototypical properties from the defaults defined above
        console.log(griffin.dataset);
       
        var tables = griffin.querySelectorAll('.js-griffin-table');
        tables.forEach((table, j) => {
            var container = table.parentNode.querySelector('.js-hc-container') || table.parentNode;
            table.style.display = 'none';     
            table.config = {
                general: _.defaultsDeep(buildMultidimensionalConfig(table.dataset).general, griffin.config),
                 series: _.defaultsDeep(buildMultidimensionalConfig(table.dataset).series, griffin.seriesConfig)
            };
            var highchartsConfig = _.defaultsDeep(table.config.general, returnBaseConfig(table, griffin.dataset)); // TO DO: use defaultsdeep here 
            console.log('config', highchartsConfig);
            var chart = Highcharts.chart(container, highchartsConfig, function(){
               // console.log(this);
               // if ( this.currentResponsive && this.chartHeight < this.currentResponsive.mergedOptions.chart.height ){ //  Highcharts responsive rules seem to only take effect
                                                                                                                       // on window resize, not on load. this checks if the chart's
                                                                                                                       // height is too small and calls reflow if so
                   setTimeout(() => {
                    this.reflow();
                },200);
              //  }
            });
            chart.collectionIndex = i;
            chart.indexInCollection = j;
            this.chartsCollection[i].push(chart);
            window.Griffins = this.chartsCollection;
            console.log(chart);
            if ( window.navigator.msPointerEnabled ) { // is >=IE 10
                document.querySelectorAll('.griffin-line .highcharts-data-label:first-child text').forEach(label => {
                    label.setAttribute('transform', 'translate(-16, 0)');
                });
            }
        
        });
    },
    reconstruct(index){
        var griffin = this.griffins[index];
        griffin.config = buildMultidimensionalConfig(griffin.dataset).general;
        console.log(griffin.dataset);
        this.chartsCollection[index].forEach(chart => {
            chart.renderTo.className = 'js-hc-container';
            chart.destroy();
        });
        this.construct(griffin, index);
    }
}