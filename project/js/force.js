

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

    this.brushStart = 0
    this.brushEnd = 0
    
    // TODO: define all constants here
    this.margin = 30
    this.height = 600
    this.width = 800
    this.clicked = []
    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
ForceVis.prototype.initVis = function(){

    var that = this; // read about the this

    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin)
        .attr("height", this.height + this.margin)
    
    this.svg.style()
        
    this.graph = this.svg.append("g")
        .attr("transform", "translate(" + that.margin + "," + 0 + ")")
    
    this.forcedata = {nodes:[], links: []}
    this.forcedata.nodes = that.data
    
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
        .range([10,25])
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

    this.nodes.append("title")
        .text(function(d){return that.metaData.champions[d.id]})
    
    this.nodes
        .style("opacity", function(d){
            return opacityScale(d.popularity)
        })
        .style("cursor", "hand")
        .on("click", function(d){

            that.click_ele(d)
        })

    this.click_ele = function(d) {
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
            .charge(function(d, i) { return (that.clicked.indexOf(d) != -1) ? -2000/that.clicked.length : 0; })
            .links(createLinks(that.clicked))
        
        that.force.start()

        selectedChampsChange()
    }
        
    this.force = d3.layout.force()
        .size([that.width, that.height])
        .charge(function(d, i) { return 0})
        .linkDistance(10)
        .gravity(0.05)
        .on("tick", function(e) {
            var k = 6 * e.alpha
            
            var q = d3.geom.quadtree(that.forcedata.nodes),
                j = 0,
                n = that.forcedata.nodes.length;
            
            while (++j < n) q.visit(collide(that.forcedata.nodes[j]));
            
            that.nodes
                .attr("transform", function(d,i) {
                    d.x += -0.75 * k
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
        .attr("transform", "translate(" + 0 + "," + (that.height - 200) + ")")
    
    this.displayer.append("rect")
        .attr("x", 0)
        .attr("y", 205)
        .attr("width", 100)
        .attr("height", 24)
        .attr("fill", "lightgray")
        .style("cursor", "hand")
        .on("click", function(){
            if (that.clicked.length != 0) {
                that.clicked = that.clicked.slice(0,1)
                that.click_ele(that.clicked[0])
            }
            
            
        })
    
    this.displayer.append("text")
        .attr("x", 3)
        .attr("y", 223)
        .text("Reset Selected")
        .style("cursor", "hand")
        .on("click", function(){
            if (that.clicked.length != 0) {
                that.clicked = that.clicked.slice(0,1)
                that.click_ele(that.clicked[0])
            }
            
            
        })
    this.selectedChamps = that.displayer.selectAll(".selected")
    
    function selectedChampsChange() {
        $(that.eventHandler).trigger("selectionChanged", [that.clicked]);
    }
    
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
}
ForceVis.prototype.onSelectionChange = function(data) {
    
    this.brushStart = data[0]
    this.brushEnd = data[1]
    this.updateVis();
}

ForceVis.prototype.onClickChange = function(selected) {
    
    this.click_ele(selected)
    this.updateVis();
}



