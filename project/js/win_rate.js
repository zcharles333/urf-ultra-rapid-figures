
WinRateVis = function(_parentElement, _data, _metaData, _eventHandler){
    var that = this
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.win_sort = "descending"
    this.selectedChamps = []
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

    this.width = 1440;
    this.height = 300;

    // this.defaultDisplayDict = {}
    // for (ele in this.data) {
    //     this.defaultdisplayDict[this.data[ele].id] = 
    // }

    // this.winData = {}
    // for (ele in this.data) {
    //     this.winData[this.data[ele].id] = _.countBy(that.data[ele].unique.winner)['1'] / that.data[ele].unique.winner.length
    // }
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
        .rangeRoundBands([0 + that.x_margin, that.width - that.x_margin], .1, 0)
        .domain(that.champNames)

    this.y_scale = d3.scale.linear()
        .range([that.height-that.y_margin,100]);
    //console.log(this.y_scale.range())
    this.g = this.svg.append("g")
    	.attr("transform", "translate(0,0)")

    this.yAxis = d3.svg.axis()
        .scale(this.y_scale)
        .outerTickSize([0])
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
        .style("cursor","hand")
        .on("click", function(d) {
            // var index = that.selectedChamps.indexOf(d[1])
            // if (index >= 0){
            //     that.selectedChamps.splice(index,1)
            // }
            // else {
            //     that.selectedChamps.push(d[1])
            // }
            // that.clickChange()
            console.log("hi")
            that.clickChange(d[1])
        })
        .on("mouseover", function(d) {
            d3.select(this).style("fill","orange")
            //console.log(d)
            that.tooltipGroup.style("display", "initial")
            that.tooltip
                .attr("x", d3.mouse(this)[0]- 50)
                .attr("y", d3.mouse(this)[1]-105)
                .attr("width", 100)
                .attr("height", 100)
                .style("fill", "lightgray")

            that.tooltipText
                .attr("x", d3.mouse(this)[0])
                .attr("y", d3.mouse(this)[1]-105 + 20)
                .text(d[1])
                .style("text-anchor", "middle")

            that.tooltipText2
                .attr("x", d3.mouse(this)[0])
                .attr("y", d3.mouse(this)[1]-105 + 35)
                .text("Win Rate: " + (Math.round(d[0] * 10000) /100) + "%")
                .style("text-anchor", "middle")

            that.tooltipImage
                .attr("x", d3.mouse(this)[0] - 25)
                .attr("y", d3.mouse(this)[1]-105 + 40)
                .attr("width",50)
                .attr("height",50)
                .attr("xlink:href", function(){
                    return "img/champions/" + that.metaData.champs_to_ids[d[1]] + "_Web_0.jpg"    
                })


        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill",function(d) {return that.color_bar(d)})
            that.tooltipGroup.style("display", "none")
        })


    this.draw_yAxis = this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + that.x_margin +",0)")
        .call(this.yAxis)

    this.tooltipGroup = this.svg.append("g")

    this.tooltip = this.tooltipGroup
        .append("rect")
        .attr("class", "tooltips")
        .style("fill", "red")

    this.tooltipText = this.tooltipGroup
        .append("text")
        .attr("class", "tooltiptext")

    this.tooltipText2 = this.tooltipGroup
        .append("text")
        .style("font-size","10")
        .attr("class", "tooltiptext2")
    this.tooltipImage = this.tooltipGroup
        .append("image")
        .attr("class", "tooltipImage")

    that.clickChange = function(name) {
        // var ids = that.selectedChamps.map(function(d) {
        //     return parseInt(that.metaData.champs_to_ids[d])
        // })
        // var selected = []
        // for (ele in that.data) {
        //     if (ids.indexOf(parseInt(that.data[ele].id)) >= 0) {
        //         selected.push(that.data[ele])
        //     }
        // }
        // console.log(selected)
        // $(that.eventHandler).trigger("clickChange", [selected]);
        var selected_id = parseInt(that.metaData.champs_to_ids[name])
        var selected = new Object()
        for (ele in that.data) {
            if (selected_id == parseInt(that.data[ele].id)) {
                selected = that.data[ele]
            }
        }
        console.log(selected)
        $(that.eventHandler).trigger("clickChange", selected);
    }

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
            //if (isNaN(this.displayDict[this.data[ele].id])) {this.displayDict[this.data[ele].id] = 0}
        }
    }

    this.displayHeights = Object.keys(that.displayDict).map(function(key){
        if (isNaN(that.displayDict[key])) {
            return 0
        }
        else {
            return that.displayDict[key]
        }   
        //return that.displayDict[key];
    });

    this.y_min = d3.min(that.displayHeights)
    this.y_max = d3.max(that.displayHeights)

    var keys = Object.keys(that.displayDict)
    this.displayNames = keys.map(function(d) {return that.metaData.champions[d]})

    this.displayTuples = []
    for (ele in that.displayHeights) {
        that.displayTuples.push([that.displayHeights[ele],that.displayNames[ele]])
    }



    this.displayTuples = that.displayTuples.sort(function(a,b) {
        if (that.win_sort == "descending") {
            that.sorting_function = d3.descending(a[0],b[0])
        }
        else if (that.win_sort == "ascending") {
            that.sorting_function = d3.ascending(a[0],b[0])
        }
        else {
            that.sorting_function = d3.ascending(a[1],b[1])
        }
        if (that.sorting_function == 0) {
            that.sorting_function = d3.ascending(a[1],b[1])
        }
        return that.sorting_function
    })
    //console.log(that.win_sort)
    //console.log(that.displayTuples)

    var xs = that.displayTuples.map(function(d) {return d[1]})

    this.x_scale
        .domain(xs)

    this.y_scale
        .domain([d3.max([0,that.y_min - .02]),that.y_max]);

    this.draw_yAxis
        .call(this.yAxis)

    that.color_bar = function(d) {
        if (that.selectedChamps.indexOf(d[1]) >= 0) {
            return "red"
        }
        else {
            return "blue"
        }
    }

    this.drawBars
        .data(that.displayTuples)
        .transition().duration(500)
        .style("fill",function(d) {return that.color_bar(d)})
        .attr("x",function(d,i){return isNaN(that.x_scale(d[1])) ? 0: that.x_scale(d[1])})
        .attr("y",function(d){return isNaN(that.y_scale(d[0])) ? 0 : that.y_scale(d[0])}) //that.y_scale(d)})
        .attr("width", function(d){return isNaN(that.x_scale.rangeBand()) ? 0 : that.x_scale.rangeBand()})
        .attr("height", function(d){return isNaN(that.height - that.y_scale(d[0]) - that.y_margin) ? 0: that.height - that.y_scale(d[0]) - that.y_margin})
}

WinRateVis.prototype.onSelectionChange= function (selected){

    var that = this
    this.selectedChamps = selected.map(function(d) {
        return that.metaData.champions[d.id]
    })
    console.log(this.selectedChamps)
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
