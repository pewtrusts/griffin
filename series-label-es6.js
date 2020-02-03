/* global module define Highcharts */

/*
 Highcharts JS v7.0.3 (2019-02-06)

 (c) 2009-2019 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(n) { console.log(n); "object" === typeof module && module.exports ? (n["default"] = n, module.exports = n) : "function" === typeof define && define.amd ? define(function() { return n }) : n("undefined" !== typeof Highcharts ? Highcharts : void 0) })(function(n) {
    (function(r) {
        function n(d, c, a, g, e, f) { d = (f - c) * (a - d) - (g - c) * (e - d); return 0 < d ? !0 : !(0 > d) }

        function w(d, c, a, g, e, f, b, h) { return n(d, c, e, f, b, h) !== n(a, g, e, f, b, h) && n(d, c, a, g, e, f) !== n(d, c, a, g, b, h) }

        function B(d, c, a, g, e, f, b, h) {
            return w(d, c, d + a, c, e, f, b, h) || w(d + a, c, d + a, c + g, e, f, b, h) || w(d, c + g, d + a,
                c + g, e, f, b, h) || w(d, c, d, c + g, e, f, b, h)
        }

        function C(d) {
            var c = this,
                a = Math.max(r.animObject(c.renderer.globalAnimation).duration, 250);
            c.labelSeries = [];
            c.labelSeriesMaxSum = 0;
            r.clearTimeout(c.seriesLabelTimer);
            c.series.forEach(function(g) {
                var e = g.options.label,
                    f = g.labelBySeries,
                    b = f && f.closest;
                e.enabled && g.visible && (g.graph || g.area) && !g.isSeriesBoosting && (c.labelSeries.push(g), e.minFontSize && e.maxFontSize && (g.sum = g.yData.reduce(function(a, b) { return (a || 0) + (b || 0) }, 0), c.labelSeriesMaxSum = Math.max(c.labelSeriesMaxSum,
                    g.sum)), "load" === d.type && (a = Math.max(a, r.animObject(g.options.animation).duration)), b && (void 0 !== b[0].plotX ? f.animate({ x: b[0].plotX + b[1], y: b[0].plotY + b[2] }) : f.attr({ opacity: 0 })))
            });
            c.seriesLabelTimer = r.syncTimeout(function() { c.series && c.labelSeries && c.drawSeriesLabels() }, c.renderer.forExport ? 0 : a)
        }
        var D = r.addEvent,
            E = r.extend,
            x = r.isNumber,
            y = r.pick,
            z = r.Series,
            F = r.SVGRenderer,
            A = r.Chart;
        r.setOptions({
            plotOptions: {
                series: {
                    label: {
                        enabled: !0,
                        connectorAllowed: !1,
                        connectorNeighbourDistance: 24,
                        minFontSize: null,
                        maxFontSize: null,
                        onArea: null,
                        style: { fontWeight: "bold" },
                        boxesToAvoid: []
                    }
                }
            }
        });
        F.prototype.symbols.connector = function(d, c, a, g, e) { var f = e && e.anchorX;
            e = e && e.anchorY; var b, h, k = a / 2;
            x(f) && x(e) && (b = ["M", f, e], h = c - e, 0 > h && (h = -g - h), h < a && (k = f < d + a / 2 ? h : a - h), e > c + g ? b.push("L", d + k, c + g) : e < c ? b.push("L", d + k, c) : f < d ? b.push("L", d, c + g / 2) : f > d + a && b.push("L", d + a, c + g / 2)); return b || [] };
        z.prototype.getPointsOnGraph = function() {
            /* eslint no-redeclare: off */
            function d(a) { var b = Math.round(a.plotX / 8) + "," + Math.round(a.plotY / 8);
                n[b] || (n[b] = 1, e.push(a)) }
            if (this.xAxis ||
                this.yAxis) {
                var c = this.points,
                    a, g, e = [],
                    f, b, h, k;
                b = this.graph || this.area;
                h = b.element;
                var q = this.chart.inverted,
                    v = this.xAxis;
                a = this.yAxis;
                var t = q ? a.pos : v.pos,
                    q = q ? v.pos : a.pos,
                    v = y(this.options.label.onArea, !!this.area),
                    l = a.getThreshold(this.options.threshold),
                    n = {};
                if (this.getPointSpline && h.getPointAtLength && !v && c.length < this.chart.plotSizeX / 16) {
                    b.toD && (g = b.attr("d"), b.attr({ d: b.toD }));
                    k = h.getTotalLength();
                    for (f = 0; f < k; f += 16) a = h.getPointAtLength(f), d({ chartX: t + a.x, chartY: q + a.y, plotX: a.x, plotY: a.y });
                    g && b.attr({ d: g });
                    a = c[c.length - 1];
                    a.chartX = t + a.plotX;
                    a.chartY = q + a.plotY;
                    d(a)
                } else
                    for (k = c.length, f = 0; f < k; f += 1) {
                        a = c[f];
                        g = c[f - 1];
                        a.chartX = t + a.plotX;
                        a.chartY = q + a.plotY;
                        v && (a.chartCenterY = q + (a.plotY + y(a.yBottom, l)) / 2);
                        if (0 < f && (b = Math.abs(a.chartX - g.chartX), h = Math.abs(a.chartY - g.chartY), b = Math.max(b, h), 16 < b))
                            for (b = Math.ceil(b / 16), h = 1; h < b; h += 1) d({
                                chartX: g.chartX + h / b * (a.chartX - g.chartX),
                                chartY: g.chartY + h / b * (a.chartY - g.chartY),
                                chartCenterY: g.chartCenterY + h / b * (a.chartCenterY - g.chartCenterY),
                                plotX: g.plotX + h / b * (a.plotX - g.plotX),
                                plotY: g.plotY + h / b * (a.plotY - g.plotY)
                            });
                        x(a.plotY) && d(a)
                    }
                return e
            }
        };
        z.prototype.labelFontSize = function(d, c) { return d + this.sum / this.chart.labelSeriesMaxSum * (c - d) + "px" };
        z.prototype.checkClearPoint = function(d, c, a, g) {
            var e = Number.MAX_VALUE,
                f = Number.MAX_VALUE,
                b, h, k = y(this.options.label.onArea, !!this.area),
                q = k || this.options.label.connectorAllowed,
                v = this.chart,
                t, l, n, r, p, m;
            for (p = 0; p < v.boxesToAvoid.length; p += 1)
                if (l = v.boxesToAvoid[p], m = d + a.width, t = c, n = c + a.height, !(d > l.right || m < l.left || t > l.bottom || n < l.top)) return !1;
            for (p = 0; p < v.series.length; p += 1)
                if (t = v.series[p], l = t.interpolatedPoints, t.visible && l) {
                    for (m = 1; m < l.length; m += 1) { if (l[m].chartX >= d - 16 && l[m - 1].chartX <= d + a.width + 16) { if (B(d, c, a.width, a.height, l[m - 1].chartX, l[m - 1].chartY, l[m].chartX, l[m].chartY)) return !1;
                            this === t && !b && g && (b = B(d - 16, c - 16, a.width + 32, a.height + 32, l[m - 1].chartX, l[m - 1].chartY, l[m].chartX, l[m].chartY)) }!q && !b || this === t && !k || (n = d + a.width / 2 - l[m].chartX, r = c + a.height / 2 - l[m].chartY, e = Math.min(e, n * n + r * r)) }
                    if (!k && q && this === t && (g && !b || e < Math.pow(this.options.label.connectorNeighbourDistance,
                            2))) { for (m = 1; m < l.length; m += 1) b = Math.min(Math.pow(d + a.width / 2 - l[m].chartX, 2) + Math.pow(c + a.height / 2 - l[m].chartY, 2), Math.pow(d - l[m].chartX, 2) + Math.pow(c - l[m].chartY, 2), Math.pow(d + a.width - l[m].chartX, 2) + Math.pow(c - l[m].chartY, 2), Math.pow(d + a.width - l[m].chartX, 2) + Math.pow(c + a.height - l[m].chartY, 2), Math.pow(d - l[m].chartX, 2) + Math.pow(c + a.height - l[m].chartY, 2)), b < f && (f = b, h = l[m]);
                        b = !0 }
                } return !g || b ? { x: d, y: c, weight: e - (h ? f : 0), connectorPoint: h } : !1
        };
        A.prototype.drawSeriesLabels = function() {
            var d = this,
                c = this.labelSeries;
            d.boxesToAvoid = [];
            c.forEach(function(a) { a.interpolatedPoints = a.getPointsOnGraph();
                (a.options.label.boxesToAvoid || []).forEach(function(a) { d.boxesToAvoid.push(a) }) });
            d.series.forEach(function(a) {
                function c(a, b, c) { var d = Math.max(t, y(x, -Infinity)),
                        e = Math.min(t + r, y(z, Infinity)); return a > d && a <= e - c.width && b >= l && b <= l + w - c.height }
                if (a.xAxis || a.yAxis) {
                    var e, f, b, h = [],
                        k, q, n = a.options.label,
                        t = (b == d.inverted) ? a.yAxis.pos : a.xAxis.pos,
                        l = b ? a.xAxis.pos : a.yAxis.pos,
                        r = d.inverted ? a.yAxis.len : a.xAxis.len,
                        w = d.inverted ? a.xAxis.len :
                        a.yAxis.len,
                        p = a.interpolatedPoints,
                        m = y(n.onArea, !!a.area),
                        u = a.labelBySeries;
                    e = n.minFontSize;
                    f = n.maxFontSize;
                    var x, z;
                    m && !b && (b = [a.xAxis.toPixels(a.xData[0]), a.xAxis.toPixels(a.xData[a.xData.length - 1])], x = Math.min.apply(Math, b), z = Math.max.apply(Math, b));
                    if (a.visible && !a.isSeriesBoosting && p) {
                        u || (a.labelBySeries = u = d.renderer.label(a.name, 0, -9999, "connector").addClass("highcharts-series-label-color-" + a.colorIndex +  " highcharts-series-label highcharts-series-label-" + a.index + " " + (a.options.className || "")).css(E({
                            color: m ? d.renderer.getContrast(a.color) : a.color
                        }, a.options.label.style)), e && f && u.css({ fontSize: a.labelFontSize(e, f) }), u.attr({ padding: 0, opacity: d.renderer.forExport ? 1 : 0, stroke: a.color, "stroke-width": 1, zIndex: 3 }).add().animate({ opacity: 1 }, { duration: 200 }));
                        e = u.getBBox();
                        e.width = Math.round(e.width);
                        for (q = p.length - 1; 0 < q; --q) m ? (f = p[q].chartX - e.width / 2, b = p[q].chartCenterY - e.height / 2, c(f, b, e) && (k = a.checkClearPoint(f, b, e))) : (f = p[q].chartX + 3, b = p[q].chartY - e.height - 3, c(f, b, e) && (k = a.checkClearPoint(f, b, e, !0)), k && h.push(k), f = p[q].chartX + 3, b = p[q].chartY +
                            3, c(f, b, e) && (k = a.checkClearPoint(f, b, e, !0)), k && h.push(k), f = p[q].chartX - e.width - 3, b = p[q].chartY + 3, c(f, b, e) && (k = a.checkClearPoint(f, b, e, !0)), k && h.push(k), f = p[q].chartX - e.width - 3, b = p[q].chartY - e.height - 3, c(f, b, e) && (k = a.checkClearPoint(f, b, e, !0))), k && h.push(k);
                        if (n.connectorAllowed && !h.length && !m)
                            for (f = t + r - e.width; f >= t; f -= 16)
                                for (b = l; b < l + w - e.height; b += 16)(k = a.checkClearPoint(f, b, e, !0)) && h.push(k);
                        if (h.length) {
                            if (h.sort(function(a, b) { return b.weight - a.weight }), k = h[0], d.boxesToAvoid.push({
                                    left: k.x,
                                    right: k.x +
                                        e.width,
                                    top: k.y,
                                    bottom: k.y + e.height
                                }), h = Math.sqrt(Math.pow(Math.abs(k.x - u.x), 2), Math.pow(Math.abs(k.y - u.y), 2))) n = { opacity: d.renderer.forExport ? 1 : 0, x: k.x, y: k.y }, p = { opacity: 1 }, 10 >= h && (p = { x: n.x, y: n.y }, n = {}), a.labelBySeries.attr(E(n, { anchorX: k.connectorPoint && k.connectorPoint.plotX + t, anchorY: k.connectorPoint && k.connectorPoint.plotY + l })).animate(p), a.options.kdNow = !0, a.buildKDTree(), a = a.searchPoint({ chartX: k.x, chartY: k.y }, !0), u.closest = [a, k.x - a.plotX, k.y - a.plotY]
                        } else u && (a.labelBySeries = u.destroy())
                    } else u &&
                        (a.labelBySeries = u.destroy())
                }
            })
        };
        D(A, "load", C);
        D(A, "redraw", C)
    })(n)
});
//# sourceMappingURL=series-label.js.map