
KDAVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];




    // TODO: define all constants here


    this.initVis();

}

KDAVis.prototype.initVis = function(){

    var that = this; // read about the this
    this.total_days = 398
    this.period_days = 398

    this.width = 650;
    this.height = 500;

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
    this.y_margin = 200

    this.g = this.svg.append("g")
    	.attr("transform", "translate(0,0)")


    // this.x = d3.scale.linear()
    //     .range([0+this.x_margin, this.width]);

    // this.y = d3.scale.linear()
    //     .range([this.height-this.y_margin, 0]);

    // this.x_scale = d3.scale.ordinal()
    // 	.rangeRoundBands([that.x_margin, this.width],0.1)
    // 	.domain(that.descriptions)

    // this.y_scale = d3.scale.linear()
    //     .range([this.height-that.y_margin, 0])

    // this.yAxis = d3.svg.axis()
    //     .scale(this.y_scale)
    //     .orient("left");

    // this.xAxis = d3.svg.axis()
    // 	.scale(this.x_scale)
    // 	.orient("bottom")

    // this.drawBars = this.g
    // 	.append("g")
    // 	.attr("class","rects")
    // 	.selectAll(".rect")
    // 	.data(that.descriptions)
    // 	.enter().append("rect")
    // 	.attr("class","rect")
    // 	.style("fill",function(d,i) {return that.metaData.priorities[i]["item-color"]})

    // this.drawAvgs = this.g
    // 	.append("g")
    // 	.attr("class","circs")
    // 	.selectAll(".circ")
    // 	.data(that.descriptions)
    // 	.enter().append("circle")
    // 		.attr("class","circ")
    // 		.attr("fill","black")


    // this.draw_xAxis = this.svg.append("g")
    // 	.attr("class","x axis")
    // 	.attr("transform", "translate(0," + (that.height - that.y_margin) +")")
    // 	.call(this.xAxis)

    // this.draw_xAxis
    // 	.selectAll(".tick").select("text")
    // 		.attr("transform", "rotate(-70) translate(-10,-10)")
    // 		.style("text-anchor","end")


    // this.draw_yAxis = this.svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(" + that.x_margin +",0)")
    //     .call(this.yAxis)

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}

KDAVis.prototype.updateVis = function(){
	var that = this
	var cys = []
    this.kda_selection = "kills"
    this.x_min = 0
    this.x_max = 0
    this.y_min = 0
    this.y_max = 0

    if (that.displayData.length) {
        var count_dicts = []
        this.tuple_arrays = []
        var keys = []
        var values = []
        var sums = []
        var percentages = []
        for (var ele in that.displayData) {
            count_dicts.push(_.countBy(that.displayData[ele].unique[that.kda_selection]))
            console.log(count_dicts[ele])
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
        console.log(keys)
        console.log(that.tuple_arrays)
        this.x_scale = d3.scale.linear()
            .range([0+that.x_margin, that.width])
            .domain([that.x_min,that.x_max]);

        this.y_scale = d3.scale.linear()
            .domain([this.y_min,this.y_max])
            .range([that.height-that.y_margin, 0]);

         this.lines = d3.svg.line()
             .x(function(d) {console.log(d); return that.x_scale(d[0])})
             .y(function(d) {return that.y_scale(d[1])})

        this.kda = this.g.selectAll(".kda")
        this.kda.remove()

        this.kda = this.g.selectAll(".kda")
            .data(that.tuple_arrays)
            .enter()
            .append("g")
                .attr("class","kda")

        this.kda.append("path")
            .attr("class","line")
            .attr("d",function(d) {return that.lines(d)})
            .style("stroke", function(d,i){return "blue"})
            .style("stroke-width", "1px")
            .style("fill", "none")
    }
	// for(var i=0; i<this.displayData.length; i++)
	// {
	// 	cys.push(that.total_votes[i] / that.total_days * that.period_days)
	// }

	// this.y_scale
	// 	//.domain([0,d3.max(this.displayData)])
	// 	.domain([0,d3.max([d3.max(this.displayData),d3.max(cys)])])

	// this.draw_yAxis
	// 	.call(this.yAxis)

	// this.drawBars
	// 	.data(that.displayData)
	// 	.attr("x",function(d,i){return that.x_scale(that.descriptions[i])})
	// 	.attr("y",function(d){return that.y_scale(d)})
	// 	.attr("width", function(d){return that.x_scale.rangeBand()})
	// 	.attr("height", function(d){return that.height - that.y_scale(d) - that.y_margin})

	// this.drawAvgs
	// 	.data(that.displayData)
	// 	.attr("cx", function(d,i){return that.x_scale(that.descriptions[i]) + that.x_scale.rangeBand() / 2})
	// 	//.attr("cy", function(d,i){return that.y_scale(that.total_votes[i] / that.total_days * that.period_days)})
	// 	.attr("cy", function(d,i){return that.y_scale(cys[i])})
	// 	.attr("r",7)

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
    this.displayData = selected
    console.log(this.displayData)
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
