

/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

BarVis = function(_parentElement, _data){
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
BarVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    //TODO: create axis and scales

    this.svg = this.parentElement
        .append("svg")
        .attr("width", this.width + this.margin)
        .attr("height", this.height + this.margin)
        
    this.graph = this.svg.append("g")
        .attr("transform", "translate(" + that.margin + "," + 0 + ")")
    
    
    
    // filter, aggregate, modify data
    this.wrangleData(null);
    
    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
BarVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.data

}

// update visualzation
BarVis.prototype.updateVis = function(){
    
    var that = this
    
    
}



