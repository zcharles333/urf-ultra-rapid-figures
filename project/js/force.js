

/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

ForceVis = function(_parentElement, _data){
    var that = this
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    
    // TODO: define all constants here
    this.margin = 30
    this.height = 600
    this.width = 600

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
        
    this.graph = this.svg.append("g")
        .attr("transform", "translate(" + that.margin + "," + 0 + ")")
    
    this.forcedata = {nodes:[], links: []}
    this.forcedata.nodes = that.data
    
    this.nodes = that.graph.selectAll(".node")
        .data(that.forcedata.nodes)
        .enter()
        .append("g").attr("class", function(d){return "node n" + d["id"]})
        
    this.nodes.append("clipPath")
        .attr("id", "cut-off")
        .append("circle")
        .attr("cx", 15)
        .attr("cy", 15)
        .attr("r", 15)
        
                
    this.nodes.append("image")
        .attr("xlink:href", function(d){
            return "img/champions/" + d["id"] + "_Web_0.jpg"    
        })
        .attr("width", 30)
        .attr("height", 30)
        .attr("clip-path", "url(#cut-off)")
        .attr("class", "circ")
        .style("border-radius", "50%")
        .style("stroke", "black")
        
        
    this.force = d3.layout.force()
        .size([that.width, that.height])
        .charge(-50)
        .linkStrength(0)
        .on("tick", function(d) {
            that.nodes
                .transition().duration(0)
                .attr("transform", function(d) {
                    
                    return "translate("+d.x+","+d.y+")"; 
                });

            
        })
        .on("start", function(d) {})
        .on("end", function(d) {})
    
    this.force
        .nodes(that.forcedata.nodes)
        .links([])
        .start();
    
    this.nodes
        .call(that.force.drag)
    //console.log(that.keys)
    
    // filter, aggregate, modify data
    this.wrangleData(null);
    
    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
ForceVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.data

}

// update visualzation
ForceVis.prototype.updateVis = function(){
    
    var that = this
    
    
}



