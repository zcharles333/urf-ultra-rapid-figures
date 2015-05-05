
WinRateVis = function(_parentElement, _data, _metaData, _eventHandler){
    var that = this
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.win_sort = "descending"
    this.brushStart = 0
    this.brushEnd = 0
    this.champNames = Object.keys(that.metaData.champions).map(function(key){
        return that.metaData.champions[key];
    });
    //this.kda_options = {"kills":0, "assists":1, "deaths":2}




    // TODO: define all constants here


    this.initVis();

}

WinRateVis.prototype.initVis = function(){

    var that = this; // read about the this

    this.width = 800;
    this.height = 300;

    // this.defaultDisplayDict = {}
    // for (ele in this.data) {
    //     this.defaultdisplayDict[this.data[ele].id] = 
    // }

    this.winData = {}
    for (ele in this.data) {
        this.winData[this.data[ele].id] = _.countBy(that.data[ele].unique.winner)['1'] / that.data[ele].unique.winner.length
    }
    //console.log(that.winData)

    //TODO: construct or select SVG
    //this.svg = this.parentElement.select("svg");
    this.svg = this.parentElement.append("svg")
        .attr("width",this.width)
        .attr("height",this.height)
        //.style("background-color", "lightcoral")
   
    //TODO: create axis and scales
    this.x_margin = 50
    this.y_margin = 50

    this.x_scale = d3.scale.ordinal()
        .rangeRoundBands([0+that.x_margin, that.width], .1, 0)
        .domain(that.champNames)

    this.y_scale = d3.scale.linear()
        .range([that.height-that.y_margin,0]);
    console.log(this.y_scale.range())
    this.g = this.svg.append("g")
    	.attr("transform", "translate(0,0)")

    this.yAxis = d3.svg.axis()
        .scale(this.y_scale)
        .orient("left");

    this.xAxis = d3.svg.axis()
        .scale(this.x_scale)
        .orient("bottom")

    this.drawBars = this.g
        .append("g")
        .attr("class","rects")
        .selectAll(".rect")
        .data(that.champNames)
        .enter().append("rect")
        .attr("class","rect")
        .style("fill","blue")

    this.draw_yAxis = this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + that.x_margin +",0)")
        .call(this.yAxis)

    // this.draw_xAxis = this.svg.append("g")
    //     .attr("class","x axis")
    //     .attr("transform", "translate(0," + (that.height - that.y_margin) +")")
    //     .call(this.xAxis)

    // this.draw_xAxis
    //     .selectAll(".tick").select("text")
    //         .attr("transform", "rotate(-70) translate(-10,-10)")
    //         .style("text-anchor","end")

    // this.draw_yAxis = this.svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(" + that.x_margin +",0)")
    //     .call(this.yAxis)

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}

WinRateVis.prototype.updateVis = function(){
    var that = this

    // this.x_min = 0
    // this.x_max = 0
    this.y_min = 0
    this.y_max = 0
    this.displayDict = {}
    //this.brushStart = 600
    //this.brushEnd = 1900

    this.winArrays = {}
    if (that.brushEnd > that.brushStart) {

        for (i in that.data) {
            var duration_indices = []
            for (ele in that.data[i].unique.duration) {
                if (that.data[i].unique.duration[ele] >= that.brushStart && that.data[i].unique.duration[ele] <= that.brushEnd) {
                    duration_indices.push(ele)
                }
            }
            that.winArrays[that.data[i].id] = duration_indices.map(function(d) {
                return that.data[i].unique.winner[d]
            })
        }
        var keys = Object.keys(that.winArrays)
        for (ele in keys) {
            that.displayDict[keys[ele]] = _.countBy(that.winArrays[keys[ele]])["1"] / that.winArrays[keys[ele]].length
        }

    }
    else {
        // for (ele in that.data) {
        //     arrayDict[that.data[ele].id] = that.data[ele].unique.winner
        // }
        for (ele in this.data) {
            this.displayDict[this.data[ele].id] = _.countBy(that.data[ele].unique.winner)['1'] / that.data[ele].unique.winner.length
        }
    }

    var values = Object.keys(that.displayDict).map(function(key){
        return that.displayDict[key];
    });
    //console.log(values)
    this.y_min = d3.min(values)
    this.y_max = d3.max(values)

    this.displayHeights = Object.keys(that.displayDict).map(function(key){
        return that.displayDict[key];
    });

    var keys = Object.keys(that.displayDict)
    this.displayNames = keys.map(function(d) {return that.metaData.champions[d]})

    this.displayTuples = []
    for (ele in that.displayHeights) {
        that.displayTuples.push([that.displayHeights[ele],that.displayNames[ele]])
    }

    this.y_scale
        .domain([d3.max([0,that.y_min - .02]),that.y_max]);

    this.draw_yAxis
        .call(this.yAxis)

    this.drawBars
        .data(that.displayTuples)
        .attr("x",function(d,i){return that.x_scale(d[1])})
        .attr("y",function(d){return that.y_scale(d[0])}) //that.y_scale(d)})
        .attr("width", function(d){return that.x_scale.rangeBand()})
        .attr("height", function(d){return that.height - that.y_scale(d[0]) - that.y_margin})
}

WinRateVis.prototype.onSelectionChange= function (selected){

    // highlight some bars

    this.updateVis();
}

WinRateVis.prototype.winSortChange= function (selected){
    
    this.win_sort = selected
    this.updateVis();
}

WinRateVis.prototype.brushChange= function (start, end){
    this.brushStart = start
    this.brushEnd = end
    this.updateVis();
}

WinRateVis.prototype.wrangleData= function(_filterFunction){
    // displayData should hold the data which is visualized
    //this.displayData = this.filterAndAggregate(_filterFunction);
}

// KDAVis.prototype.filterAndAggregate = function(_filter){


//     // Set filter to a function that accepts all items
//     // ONLY if the parameter _filter is NOT null use this parameter
//     var filter = function(){return true;}
//     if (_filter != null){
//         filter = _filter;
//     }
//     //Dear JS hipster, a more hip variant of this construct would be:
//     // var filter = _filter || function(){return true;}

//     var that = this;

//     // create an array of values for age 0-100
//     var res = d3.range(16).map(function () {
//         return 0;
//     });

//     // implement the function that filters the data and sums the values
//     var in_range = this.data.filter(filter)
//     for (i=0; i<in_range.length; i++)
//     {
//         for(j=0; j<res.length; j++)
//         {
//             res[j] += in_range[i].prios[j]
//         }
//     }
//     return res;

// }
