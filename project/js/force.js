

/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

ForceVis = function(_parentElement, _data, _metaData, _eventHandler){
    var that = this
    this.parentElement = _parentElement;
    this.eventHandler = _eventHandler;
    this.metaData = _metaData
    this.data = _data;
    this.displayData = [];
    console.log(this.metaData)
    this.brushStart = 0
    this.brushEnd = 0
    
    // TODO: define all constants here
    this.margin = 30
    this.height = 700
    this.width = 900
    this.clicked = []
    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
ForceVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    //TODO: create axis and scales

    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin)
        .attr("height", this.height + this.margin)
        //.style("background", "lightgray")
        
    this.graph = this.svg.append("g")
        .attr("transform", "translate(" + that.margin + "," + 0 + ")")
    
    this.forcedata = {nodes:[], links: []}
    this.forcedata.nodes = that.data
    console.log(that.forcedata.nodes)
    //this.totalAppearances = d3.sum(that.forcedata.nodes, function(d){return d.appearances})
    
    this.nodes = that.graph.selectAll(".node")
        .data(that.forcedata.nodes)
        .enter()
        .append("g").attr("class", function(d){return "node n" + d["id"]})
        
    this.winRateData = new Object()
    var winRateList = []
    
    this.forcedata.nodes.forEach(function(d){
        var winLength = d.unique.winner.length
        var winCount = 0
        for (var i = 0; i < winLength; i ++) {
            if (d.unique.winner[i] == true) {
                winCount++;
            }
        }
        that.winRateData[d["id"]] = winCount* 100/winLength
        winRateList.push(winCount* 100/winLength)
    })
    this.defaultWinRateData = that.winRateData
    this.defaultWinRateList = winRateList
    
    
    
    
    var maxWin = d3.max(that.forcedata.nodes, function(d){return d.popularity})
    var minWin = d3.min(that.forcedata.nodes, function(d){return d.popularity})
    
    
    this.radScale = d3.scale.pow()
        .exponent(0.1)
        .domain([minWin, maxWin])
        .range([10,30])
    var opacityScale = d3.scale.pow()
        .exponent(0.1)
        .domain([minWin, maxWin])
        .range([0.3,1])
    
    
    this.clips = this.nodes.append("clipPath")
        .attr("id", "cut-off")
        .append("circle")
        .attr("cx", function(d){
            d.radius = that.radScale(d.popularity) 
            return d.radius
        })
        .attr("cy", function(d,i){
            return d.radius
        })
        .attr("r", function(d,i){
            
            return d.radius
        })
    

    this.images = this.nodes.append("image")
        .attr("xlink:href", function(d){
            return "img/champions/" + d["id"] + "_Web_0.jpg"    
        })
        .attr("width", function(d,i){
            return (d.radius)  * 2
        })
        .attr("height", function(d,i){
            return (d.radius)*2
        })
        .attr("clip-path", "url(#cut-off)")
        .attr("class", "circ")
        
        //.style("border-radius", "50%")



    //this.nodes.append("circle")
    //    .attr("id", "temp")
    //    .attr("cx", function(d){
    //
    //        return radScale(that.winRateData[d.id]) 
    //    })
    //    .attr("cy", function(d,i){
    //        return radScale(that.winRateData[d.id]) 
    //    })
    //    .attr("r", function(d,i){
    //        d.radius = radScale(that.winRateData[d.id])
    //        return radScale(that.winRateData[d.id])
    //    })
    //    .attr("fill", "red")
    //    .style("opacity", "0.5")


    
    this.nodes
        .style("opacity", function(d){
            return opacityScale(d.popularity)
        })
        .style("cursor", "hand")
        //.on("mouseover", function(d){
        //    that.nodes.style("opacity", "0.5")
        //    d3.select(this).style("opacity", "1")
        //    
        //    
        //})
        //.on("mouseout", function(d){
        //    that.nodes
        //        .style("opacity", function(d){
        //            return opacityScale(winRateData[d.id])
        //        })
        //    
        //})
        .on("click", function(d){
            var index = that.clicked.indexOf(d)
            if (index != -1) {
                that.clicked.splice(index,1)
            }
            else {
                that.clicked.push(d)
            }
            
            if (that.clicked.length > 5) {
                that.clicked.splice(0,1)
            }
            
            that.force
                .charge(function(d, i) { return (that.clicked.indexOf(d) != -1) ? -3000/that.clicked.length : 0; })
                .links(createLinks(that.clicked))
            
            that.force.start()
            
            that.selectedChamps.remove()
            
            that.selectedChamps = that.displayer.selectAll(".selected")
                .data(that.clicked)
                .enter().append("text")
                .attr("class", "selected")
                .attr("x", 20)
                .attr("y", function(d,i){return 30 * i + 60})
                .text(function(d,i){return (i+1) + ". " + that.metaData.champions[d.id]})
            
            
            

            selectedChampsChange()
        })
        
    this.force = d3.layout.force()
        .size([that.width, that.height])
        .charge(function(d, i) { return 0})
        //.charge(function(d){return -Math.pow(d.radius,2)/10})
        .linkDistance(10)
        .gravity(0.05)
        .on("tick", function(e) {
            var k = 6 * e.alpha
            
            var q = d3.geom.quadtree(that.forcedata.nodes),
                j = 0,
                n = that.forcedata.nodes.length;
            
            while (++j < n) q.visit(collide(that.forcedata.nodes[j]));
            
            that.nodes
                .transition().duration(50)
                .attr("transform", function(d,i) {
                    d.x += -0.75 * k
                    //d.radius = that.radScale(that.testWinRateData[d.id])
                    //if (isNaN(d.radius)) {
                    //    d.radius = that.radScale.domain()[0]
                    //}
                    return "translate("+(d.x - (d.radius)) +","+(d.y - (d.radius))+")"; 
                });

            
        })
        .on("start", function(d) {})
        .on("end", function(d) {})
    
    this.force
        .nodes(that.forcedata.nodes)
        .links([])
        .start();
    
    
    
    this.displayer = that.graph.append("g")
        .attr("transform", "translate(" + (that.width - 175) + "," + (that.height - 200) + ")")
              
    this.displayer.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("width", 175)
        .attr("height", 200)
        .attr("fill", "white")
        .style("stroke", "black")
    
    this.displayer.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .text("Selected Champions")
    
    this.selectedChamps = that.displayer.selectAll(".selected")
    
    function selectedChampsChange() {
        $(that.eventHandler).trigger("selectionChanged", [that.clicked]);
    }
    
    
    
    // filter, aggregate, modify data
    this.wrangleData(null);
    
    // call the update method
    this.updateVis();
}
function createLinks(links) {
    var linkArray = []
    for (var i = 0; i < links.length; i ++) {
        for (var j = i+1; j < links.length; j ++) {
            var link = {source: links[i], target: links[j]}
            linkArray.push(link)
        }
    }
    return linkArray
}


function collide(node) {
    var r = node.radius,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}



/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
ForceVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.data

}

ForceVis.prototype.brushChange= function (start, end){
    this.brushStart = start
    this.brushEnd = end

    this.updateVis();
}

// update visualzation
ForceVis.prototype.updateVis = function(){
    var that = this


    //this.winArrays = {}
    //var tempArray = []
    //if (that.brushStart < that.brushEnd) {
    //
    //    for (i in that.data) {
    //        var duration_indices = []
    //        for (ele in that.data[i].unique.duration) {
    //            if (that.data[i].unique.duration[ele] >= that.brushStart && that.data[i].unique.duration[ele] <= that.brushEnd) {
    //                duration_indices.push(ele)
    //            }
    //        }
    //        that.winArrays[that.data[i].id] = duration_indices.map(function(d) {
    //            return that.data[i].unique.winner[d]
    //        })
    //    }
    //    var keys = Object.keys(that.winArrays)
    //    for (ele in keys) {
    //        var value = _.countBy(that.winArrays[keys[ele]])["1"] / that.winArrays[keys[ele]].length
    //        tempArray.push(value)
    //        that.testWinRateData[keys[ele]] = _.countBy(that.winArrays[keys[ele]])["1"] / that.winArrays[keys[ele]].length
    //    }
    //}
    //else {
    //    tempArray = that.defaultWinRateList
    //    this.testWinRateData = that.defaultWinRateData
    //}
    //
    //
    ////this.clips.remove()
    ////this.images.remove()
    //console.log(that.testWinRateData)
    //console.log(tempArray)
    //var maxWin = d3.max(tempArray)
    //var minWin = d3.min(tempArray)
    //console.log(tempArray)
    //
    //this.radScale 
    //    .domain([minWin, maxWin])

    //
    ////
    //this.clips
    //    .attr("cx", function(d){
    //        d.radius = that.radScale(that.testWinRateData[d.id])
    //        if (isNaN(d.radius)) {
    //            d.radius = 0
    //        }
    //        return d.radius
    //    })
    //    .attr("cy", function(d,i){
    //        return d.radius
    //    })
    //    .attr("r", function(d,i){
    //        
    //        return d.radius
    //    })
    //
    //    //.style("stroke-width", "5px")
    //    //.style("stroke", "black")
    //
    //this.images 
    //    .attr("width", function(d,i){
    //        return d.radius  * 2
    //    })
    //    .attr("height", function(d,i){
    //        return d.radius*2
    //    })
    //    .attr("clip-path", "url(#cut-off)")
    // 
    //
    //
    
    
}
ForceVis.prototype.onSelectionChange = function(data) {
    
    this.brushStart = data[0]
    this.brushEnd = data[1]
    this.updateVis();
}



