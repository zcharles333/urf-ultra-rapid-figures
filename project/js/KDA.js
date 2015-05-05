
KDAVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.kda_selection = "kills"
    this.brushStart = 0
    this.brushEnd = 0
    
    this.kda_options = {"kills":0, "assists":1, "deaths":2}




    // TODO: define all constants here


    this.initVis();

}

KDAVis.prototype.initVis = function(){

    var that = this; // read about the this

    this.width = 450;
    this.height = 300;

    //console.log(this.data)
    var kills = []
    var assists = []
    var deaths = []
    var durations = []
    keys = Object.keys(this.data).map(function(key) {return parseInt(key)})
    for (ele in keys) {
        kills = kills.concat(this.data[ele].unique.kills)
        assists = assists.concat(this.data[ele].unique.assists)
        deaths = deaths.concat(this.data[ele].unique.deaths)
        durations = durations.concat(this.data[ele].unique.duration)
    }
    this.defaultData = {}
    this.defaultData["kills"] = kills
    this.defaultData["assists"] = assists
    this.defaultData["deaths"] = deaths
    this.defaultData["durations"] = durations
    


    this.displayData = [this.defaultData];
    this.defaultName = "Average"
    this.displayNames = [this.defaultName]

    // this.descriptions = []
    // for (var i=100;i<116;i++) {
    // 	this.descriptions.push(that.metaData.choices[i+""])
    // }

    // allocate array to hold average daily votes for each choice for the whole period
    // this.total_votes = d3.range(16).map(function () {
    //     return 0;
    // });
    // for (var i=0; i<this.total_votes.length; i++)
    // {
    // 	for (var j=0; j<this.data.length; j++)
    // 	{
    // 		this.total_votes[i] += this.data[j].prios[i]
    // 	}
    // }
    //this.votes_per_period = this.votes_per_day.slice(0)

    //TODO: construct or select SVG
    //this.svg = this.parentElement.select("svg");
    this.svg = this.parentElement.append("svg")
        .attr("width",this.width)
        .attr("height",this.height)
        //.style("background-color", "lightcoral")
   
    //TODO: create axis and scales
    this.x_margin = 50
    this.y_margin = 50

    this.x_scale = d3.scale.linear()
        .range([0+that.x_margin, that.width])

    this.y_scale = d3.scale.linear()
        .range([that.height-that.y_margin, 0]);

    this.g = this.svg.append("g")
    	.attr("transform", "translate(0,0)")

    this.yAxis = d3.svg.axis()
        .scale(this.y_scale)
        .outerTickSize([1])
        .tickFormat(function(d) {return (Math.round(d * 1000) / 10) + "%"})
        .orient("left");

    this.xAxis = d3.svg.axis()
        .scale(this.x_scale)
        .outerTickSize([1])
        .orient("bottom")

    this.draw_xAxis = this.svg.append("g")
        .attr("class","x axis")
        .attr("transform", "translate(0," + (that.height - that.y_margin) +")")
        .call(this.xAxis)


    this.draw_yAxis = this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + that.x_margin +",0)")
        .call(this.yAxis)

    
	
    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}

KDAVis.prototype.updateVis = function(){
    var that = this

    this.x_min = 0
    this.x_max = 0
    this.y_min = 0
    this.y_max = 0
    var displayArray = []
    //this.brushStart = 600
    //this.brushEnd = 1900


    if (that.brushEnd > that.brushStart) {
        for (i in that.displayData) {
            var duration_indices = []
            for (ele in that.displayData[i]["durations"]) {
                if (that.displayData[i]["durations"][ele] >= that.brushStart && that.displayData[i]["durations"][ele] <= that.brushEnd) {
                    duration_indices.push(ele)
                }
            }
            displayArray.push(duration_indices.map(function(d) {
                return that.displayData[i][that.kda_selection][d]
            }))
        }
    }
    else {
        for (ele in that.displayData) {
            displayArray.push(that.displayData[ele][that.kda_selection])
        }
    }

    var count_dicts = []
    this.tuple_arrays = []
    var keys = []
    var values = []
    var sums = []
    var percentages = []
    for (var ele in displayArray) {
        count_dicts.push(_.countBy(displayArray[ele]))
        // console.log(count_dicts[ele])
        keys.push(Object.keys(count_dicts[ele]).map(function(key) {return parseInt(key);}))
        values.push(keys[ele].map(function(key){return count_dicts[ele][key];}))
        sums.push(d3.sum(values[ele]))
        percentages.push(values[ele].map(function(value) {return Math.round(value / sums[ele] * 100000)/100000}))
        var tuple_array = []
        for (var i in keys[ele]) {
            tuple_array.push([keys[ele][i],percentages[ele][i]])
        }
        that.tuple_arrays.push(tuple_array)
        this.x_min = d3.min([that.x_min,d3.min(keys[ele])])
        this.x_max = d3.max([that.x_max,d3.max(keys[ele])])
        this.y_min = d3.min([that.y_min,d3.min(percentages[ele])])
        this.y_max = d3.max([that.y_max,d3.max(percentages[ele])])
    }
    // console.log(keys)
    // console.log(that.tuple_arrays)
    // console.log(count_dicts)

    this.x_scale
        .domain([that.x_min,that.x_max]);

    this.y_scale
        .domain([this.y_min,this.y_max]);

     this.lines = d3.svg.line()
         .x(function(d) {return that.x_scale(d[0])})
         .y(function(d) {return that.y_scale(d[1])})

    this.kda = this.g.selectAll(".kda")
    this.kda.remove()

    this.kda = this.g.selectAll(".kda")
        .data(that.tuple_arrays)
        .enter()
        .append("g")
            .attr("class","kda")

    color_scale = d3.scale.category10()
        .domain([0,1,2,3,4])

    this.kda.append("path")
        .attr("class","line")
	.transition().duration(100)
        .attr("d",function(d) {return that.lines(d)})
        .style("stroke", function(d,i){return color_scale(i);})
        .style("stroke-width", "1px")
        .style("fill", "none")

    this.draw_xAxis
        .call(that.xAxis)

    this.draw_yAxis
        .call(that.yAxis)


    // if (that.displayData.length) {
    //     var count_dicts = []
    //     this.tuple_arrays = []
    //     var keys = []
    //     var values = []
    //     var sums = []
    //     var percentages = []
    //     for (var ele in that.displayData) {
    //         count_dicts.push(_.countBy(that.displayData[ele].unique[that.kda_selection]))
    //         console.log(count_dicts[ele])
    //         keys.push(Object.keys(count_dicts[ele]).map(function(key) {return parseInt(key);}))
    //         values.push(keys[ele].map(function(key){return count_dicts[ele][key];}))
    //         sums.push(d3.sum(values[ele]))
    //         percentages.push(values[ele].map(function(value) {return Math.round(value / sums[ele] * 100000)/100000}))
    //         var tuple_array = []
    //         for (var i in keys[ele]) {
    //             tuple_array.push([keys[ele][i],percentages[ele][i]])
    //         }
    //         that.tuple_arrays.push(tuple_array)
    //         this.x_min = d3.min([that.x_min,d3.min(keys[ele])])
    //         this.x_max = d3.max([that.x_max,d3.max(keys[ele])])
    //         this.y_min = d3.min([that.y_min,d3.min(percentages[ele])])
    //         this.y_max = d3.max([that.y_max,d3.max(percentages[ele])])
    //     }
    //     console.log(keys)
    //     console.log(that.tuple_arrays)

    //     this.x_scale
    //         .domain([that.x_min,that.x_max]);

    //     this.y_scale
    //         .domain([this.y_min,this.y_max]);

    //      this.lines = d3.svg.line()
    //          .x(function(d) {console.log(d); return that.x_scale(d[0])})
    //          .y(function(d) {return that.y_scale(d[1])})

    //     this.kda = this.g.selectAll(".kda")
    //     this.kda.remove()

    //     this.kda = this.g.selectAll(".kda")
    //         .data(that.tuple_arrays)
    //         .enter()
    //         .append("g")
    //             .attr("class","kda")

    //     this.kda.append("path")
    //         .attr("class","line")
    //         .attr("d",function(d) {return that.lines(d)})
    //         .style("stroke", function(d,i){return "blue"})
    //         .style("stroke-width", "1px")
    //         .style("fill", "none")
    // }


}

KDAVis.prototype.onSelectionChange= function (selected){
	// this.period_days = 397
 //    if (selectionStart < selectionEnd) {
 //    	this.period_days = dateDiff(selectionStart, selectionEnd)
 //        this.wrangleData(function(x) {return x.time >= selectionStart && x.time <= selectionEnd;})
 //    }
 //    else {
 //        this.wrangleData(null);
 //    }
    this.displayNames = []
    if (selected.length) {
        this.displayData = []
        for (ele in selected) {
            var placeholder = {}
            placeholder["kills"] = (selected[ele].unique.kills)
            placeholder["assists"] = (selected[ele].unique.assists)
            placeholder["deaths"] = (selected[ele].unique.deaths)
            placeholder["durations"] = (selected[ele].unique.duration)
            this.displayData.push(placeholder)
            this.displayNames.push(this.metaData["champions"][selected[ele]["id"]])
        }
    }
    else {
        this.displayData = [this.defaultData]
        this.displayNames = [this.defaultName]
    }
    this.updateVis();
}

KDAVis.prototype.kdaRadioChange= function (selected){
    
    this.kda_selection = selected
    this.updateVis();
}

KDAVis.prototype.brushChange= function (start, end){
    this.brushStart = start
    this.brushEnd = end
    this.updateVis();
}

KDAVis.prototype.wrangleData= function(_filterFunction){
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
