/* css */
//import './css/styles.scss';

/* node_modules */
import cloneDeep from 'lodash.clonedeep';
import defaultsDeep from  'lodash.defaultsdeep';
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import HCAnnotations from 'highcharts/modules/annotations';
import HCData from 'highcharts/modules/data';
import HCVariwide from 'highcharts/modules/variwide';
import HCSeriesLabel from './series-label-es6';

/* my modules */
import relaxLabels from './modules/relax-labels.js';
import UseNumericSymbol from './modules/numeric-symbol.js';
import ReturnBaseConfig from './modules/return-base-config.js';
import bringToFront from './modules/bringToFront.js';
import { defaultConfigs } from './modules/default-configs.js';

HCAnnotations(Highcharts);
HCData(Highcharts);
HCSeriesLabel(Highcharts);
HCVariwide(Highcharts);

const _ = {
    cloneDeep,
    defaultsDeep
};
const styleKeys = ['minWidth','maxWidth'];
const classNameKeys = ['showLegend','shareTooltip', 'paletteTeal', 'paletteMonoTeal', 'invertDataLabels'];
const useNumericSymbol = UseNumericSymbol(Highcharts);
const returnBaseConfig = ReturnBaseConfig(Highcharts, classNameKeys, relaxLabels, useNumericSymbol, _);


Highcharts.setOptions({
    lang: {
        thousandsSep: ',',
        numericSymbols: ['K','M','B','T']
    }
});

function setProperties(obj, config){
    for ( var key in config ) {
        if ( config.hasOwnProperty(key) ){
            obj[key] = config[key];
        }
    }
    return obj;
}

function undoCamelCase(str){
    return str.replace(/([A-Z])/g, function(v){return '-' + v.toLowerCase()});
}

function disableLegendMouseEvents(){
    this.series.forEach(series => {
        series.data.forEach(point => {
            point.legendItem.element.onmouseover = function(e){
                e.stopImmediatePropagation();
                e.stopPropagation();
                return null;
            };
            point.legendItem.element.onmouseleave = function(e){
                e.stopImmediatePropagation();
                e.stopPropagation();
                return null;
            };
        });
    });
}

export const Griffin = {
    chartsCollection: [], // empty array that will hold the Charts as they are created
    init(config = {}){ // config e.g. {lazy: true}
        this.griffins = document.querySelectorAll('.griffin-wrapper'); // find all griffin wrappers in the HTML
        this.griffins.forEach((griffin, i) => {
            griffin.dataset.chartHeight = griffin.dataset.chartHeight || '56%';
            
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
                   // window.requestAnimationFrame(() => {
                        this.construct(entry.target.parentElement, Array.from(this.griffins).indexOf(entry.target));
                   // });
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
        var groupConfig = setProperties(Object.create(defaultConfigs[griffin.dataset.chartType || 'line'](griffin.dataset)), griffin.dataset);
        var tables = griffin.querySelectorAll('.js-griffin-table');
        tables.forEach((table, j) => {
            console.log(table.dataset);
            //return an object with own properties those specific to the indiv chart (the <table>); proto is the groupConfig; proto of that is the defaults
            var indivConfig = setProperties(Object.create(groupConfig), table.dataset);
            var container = table.parentNode;
            var highchartsConfig = returnBaseConfig(table, indivConfig); // TO DO: use defaultsdeep here 
            container.classList.add('griffin-' + highchartsConfig.chart.type);
            var chart = Highcharts.chart(table.parentNode, highchartsConfig, function(){
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
            console.log(chart);
            if ( window.navigator.msPointerEnabled ) { // is >=IE 10
                document.querySelectorAll('.griffin-line .highcharts-data-label:first-child text').forEach(label => {
                    label.setAttribute('transform', 'translate(-16, 0)');
                });
            }
            if ( chart.userOptions.enableBringToTop ){
                bringToFront.call(chart);
            }
            if ( chart.userOptions.disableLegendMouseEvents ){
                disableLegendMouseEvents.call(chart);
            }
        });
    }
}