(function() {

    var w = 800;
    var h = 600;

    var ctx = null;

    var words = null;
    var wordShapes = null;

    var time = 0;
    var timePointLabels = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];

    var currentX = w / 2;
    var currentY = h / 2;

    var minValue = Number.MAX_VALUE;
    var maxValue = Number.MIN_VALUE;

    var maxRotationRad = Math.PI / 6;
    var maxRotationDeg = 30;
    var resizeFactor = 0.5;
    var invisThresh = 6;

    // constructor
    function dwc() {

        if (!(this instanceof dwc)) {
            return new dwc();
        }
        return this;
    }


    // load an existing wordcloud JSON file
    dwc.prototype.load = function() {

        words = wordsFull;

        time = timePointLabels.length - 1;

        var svg = this.generateSVG();
        dwc_ui.create(w, h, wordShapes, svg, time, words, timePointLabels, maxRotationDeg);

        this.setTime(timePointLabels.length - 1);
    }

    //set visualization settings
    dwc.prototype.set = function(value) {

        console.log("changing settings: " + value);

        if (value === 0) {
            words = wordsFull;
        } else if (value === 1) {
            words = wordsNoRot;
        } else if (value === 2) {
            words = wordsNoCol;
        } else if (value === 3) {
            words = wordsOnly;
        }
        d3.select("svg").remove();
        svg = this.generateSVG();
        dwc_ui.create(w, h, wordShapes, svg, time, words, timePointLabels, maxRotationDeg);

        this.setTime(time);
    }

    // generate the word SVG representation using D3
    dwc.prototype.generateSVG = function() {

        console.log("generating SVG from words: ");
        console.log(words);
        console.log(words === null);
        console.log("starting SVG generation...");

        var svg = d3.select("#dwc")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        wordShapes = svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .attr("id", "wordShapes")
            .text(function(d) {
                return d.text;
            })
            .attr("font-size", function(d) {
                return d.tp[0];
            })
            .attr("font-family", function(d) {
                return d.font;
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "rotate(" + d.c[0] * d.c[0] * 30 + " " + d.x[0] + ", " + d.y[0] + ")";
            })
            .attr("x", function(d) {
                return d.x[0];
            })
            .attr("y", function(d) {
                return d.y[0];
            })
            .attr("fill", function(d) {
                if (d.c[0] > 0) {
                    return "rgb(" + (255 * d.c[0]) + ", 0, 0)";
                } else {
                    return "rgb(0, " + (255 * -d.c[0]) + ", 0)";
                }
            });

        return svg;
    }

    // set (and interpolate) current time point for word size/position/rotation/color, etc 
    dwc.prototype.setTime = function(newTime) {

        time = newTime;
        var indexFloor = Math.floor(newTime);
        var indexCeil = Math.ceil(newTime);
        var indexInterp = newTime - indexFloor;
        wordShapes
            .attr("font-size", function(d) {
                return d3.interpolate(d.tp[indexFloor], d.tp[indexCeil])(indexInterp);
            })
            .attr("x", function(d) {
                return d3.interpolate(d.x[indexFloor], d.x[indexCeil])(indexInterp);
            })
            .attr("y", function(d) {
                return d3.interpolate(d.y[indexFloor], d.y[indexCeil])(indexInterp);
            })
            .attr("fill", function(d) {
                return d3.interpolate(d.color[indexFloor], d.color[indexCeil])(indexInterp);
            })
            .attr("transform", function(d) {
                return "rotate(" + d3.interpolate(d.c[indexFloor], d.c[indexCeil])(indexInterp) * maxRotationDeg + " " + d3.interpolate(d.x[indexFloor], d.x[indexCeil])(indexInterp) + ", " + d3.interpolate(d.y[indexFloor], d.y[indexCeil])(indexInterp) + ")";
            });

        for (var i = 0; i < words.length; i++) { // set interpolated changes
            words[i].currentC = d3.interpolate(words[i].c[indexFloor], words[i].c[indexCeil])(indexInterp);
        }
    }


    dwc = new dwc;
    window.dwc = dwc;

})();
