
DurationVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    

    // TODO: define all "constants" here

    this.margin = 70
    
    this.height = 100
    this.width = 800


    this.initVis();
}

DurationVis.prototype.initVis = function(){

    var that = this; 
    
    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin)
        .attr("height", this.height + this.margin)
        .append("g")
        .attr("transform", "translate(0,20)")
  
    this.graph = this.svg.append("g")
        .attr("id", "graph")
        .attr("transform", "translate(" + that.margin + "," + 0 + ")")
    
    this.xScale = d3.scale.linear()
            .range([0,that.width - that.margin])
            
    this.yScale = d3.scale.linear()
            .range([that.height,0])

    this.formatMinutes = function(d) { 
        var minutes = Math.floor(d / 60),
            seconds = Math.floor(d - (minutes * 60));
        var output = seconds + 's';
        if (minutes) {
            output = minutes + 'm ' + output;
        }
        return output;
    };
    
    this.xAxis = d3.svg.axis()
        .scale(that.xScale)
        .outerTickSize([0])
        .tickFormat(that.formatMinutes)
        .orient("bottom")
    
    this.yAxis = d3.svg.axis()
        .scale(that.yScale)
        .orient("left")
        
    this.area = d3.svg.area()
        .x(function(d){return that.xScale(d.key)})
        .y0(this.height)
        .y1(function(d){return that.yScale(d.value)})
        
        
    this.drawPath = this.graph
        .append("path")
        .attr("class", "area")
        .attr("fill", "lightblue")
        

    this.drawXAxis = this.graph
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + that.height + ")")
        
    this.drawYAxis = this.graph
        .append("g")
        .attr("class", "y axis")
    
    
    
    this.brush = d3.svg.brush()
        .x(that.xScale)
        .on("brush", brushed);
    
    this.brushSelector = this.graph
        .append("g")
        .attr("class", "brush").call(this.brush)
        .selectAll("rect").attr({
          height: that.height
        })
        .style("background", "lightgray")
        .style("opacity", 0.5);
        
    this.graph.append("text")
        .attr("x", 30)
        .attr("y", "-3")
        .style("font-size", "20px")
        .text("Number of Games")
    function brushed() {

        console.log(that.formatMinutes(that.brush.extent()[0]) + "->" + that.formatMinutes(that.brush.extent()[1]))
        $(that.eventHandler).trigger("brushed", that.brush.extent())
        
    }
    

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
    
    
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
DurationVis.prototype.wrangleData= function(){

    
    this.displayData = this.data;
    durations = []
    for (ele in this.data) {
        var temp = this.data[ele].unique.duration.map(function(d){return Math.floor(d/100) * 100})
        durations = durations.concat(temp)
    }
    
    this.durationCounts = _.countBy(durations)
    
    this.niceDuration = d3.entries(this.durationCounts)
    
    
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
DurationVis.prototype.updateVis = function(){

    
    var x_min = d3.min(this.displayData, function(d){ return d3.min(d.unique.duration)})
    var x_max = d3.max(this.displayData, function(d){return d3.max(d.unique.duration)})
  
    var y_max = d3.max(d3.entries(this.durationCounts), function(d){return d.value})
      
    
    var that = this
    
    
    this.xScale
        .domain([x_min, x_max])
        
    this.yScale
        .domain([0, y_max])
    
    this.drawPath
        .datum(that.niceDuration)
        .attr("d", that.area)
        
    this.xAxis
        .tickValues(d3.range(0, x_max, 600));

    this.drawXAxis 
        .call(that.xAxis);

    this.drawYAxis
        .call(that.yAxis)
    
    d3.select(".y.axis").select("path").style("display", "none")
    d3.select(".y.axis").select(".tick").style("display", "none")
}

DurationVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function

    // do nothing -- no update when brushing


}









