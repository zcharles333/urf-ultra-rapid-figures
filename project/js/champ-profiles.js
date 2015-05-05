
ProfileVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    
    this.brushStart = 0
    this.brushEnd = 0
    this.width = 1440;
    this.height = 400;
    this.margin = 50;
    this.selected = []
    this.initVis();

}

ProfileVis.prototype.initVis = function(){

    var that = this; 

    this.svg = this.parentElement.append("svg")
        .attr("width",this.width)
        .attr("height",this.height)
        
   
    this.graph = this.svg.append("g")
    	.attr("transform", "translate(" + 0 + "," + 0 + ")")
	
    // calculate the width of each profile (including padding of 20 px)
    this.profileWidth = (that.width - 2*that.margin)/5
    this.profileHeight = that.height - 2*that.margin
    
   
    
    
    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}

ProfileVis.prototype.updateVis = function(){
    var that = this
    this.trinketArray = [3361,3362,3363,3364,3342,3345,3341,3340]
    
    
    if (that.brushStart < that.brushEnd) {
	this.filtered_data = []
	for (var i in that.selected) {
	    placeholder = {unique:{}}
	    var duration_indices = []
	    for (var ele in that.selected[i].unique.duration) {
		if (that.selected[i].unique.duration[ele] >= that.brushStart && that.selected[i].unique.duration[ele] <= that.brushEnd) {
		    duration_indices.push(ele)
		}
	    }
	    placeholder["unique"]["creep_score"] = duration_indices.map(function(d) {
		return that.selected[i].unique.creep_score[d]
	    })
	    placeholder["unique"]["items"] = duration_indices.map(function(d) {
		return that.selected[i].unique.items[d]
	    })
	    placeholder["unique"]["summoner_spells"] = duration_indices.map(function(d){
		return that.selected[i].unique.summoner_spells[d]
	    })
	    placeholder["id"] = that.selected[i].id
	    that.filtered_data.push(placeholder)
	}

    }
    else {
	that.filtered_data = that.selected
	
    }
    for (var i in that.filtered_data) {
	var totalSpells = []
	for (var j in that.filtered_data[i].unique.summoner_spells) {
	    
	    totalSpells = totalSpells.concat(that.filtered_data[i].unique.summoner_spells[j])
	}
	that.filtered_data[i].totalSpells = d3.entries(_.countBy(totalSpells))
	
	that.filtered_data[i].totalSpells.sort(function(a,b){return b.value - a.value})
	that.filtered_data[i].topSpells = that.filtered_data[i].totalSpells.slice(0,2)
    }
    
    for (var i in that.filtered_data) {
	var totalItems = []
	for (var j in that.filtered_data[i].unique.items) {
	    
	    
	    totalItems = totalItems.concat(that.filtered_data[i].unique.items[j])
	}
	that.filtered_data[i].totalItems = d3.entries(_.countBy(totalItems))
	
	that.filtered_data[i].totalItems.sort(function(a,b){return b.value - a.value})
	that.filtered_data[i].topItems = that.filtered_data[i].totalItems.slice(0,6)
    }
    this.profiles = this.graph.selectAll(".profiles")
	.data(that.filtered_data)
    
    this.profiles
	.enter().append("g")
	.attr("class",function(d,i){return "profiles " + i;})
    
    this.rects = this.profiles
	.append("rect")
	.attr("class", "outline")
	.attr("x", function(d,i){return that.margin + 20 + i * (that.profileWidth)})
	.attr("y", "50")
	.attr("width", that.profileWidth-40)
	.attr("height", that.profileHeight)
	.attr("fill", "white")
	.attr("stroke", "black")
	//.style("opacity", "0")
    
    this.images = this.profiles
	.append("image")
	.attr("x", function(d,i){return that.margin + 5+ i * (that.profileWidth)})
	.attr("y", "50")
	.attr("width", (that.profileWidth-40)/2)
	.attr("height", (that.profileHeight/2))
	.attr("xlink:href", function(d){
	   
            return "img/profiles/" + that.metaData.champions[d.id].replace(" ", "").replace(".", "") + "_0.jpg"    
        })
    
    this.names = this.profiles
	.append("text")
	.attr("x", function(d,i){return that.margin + ((that.profileWidth-40)/2)+ i * (that.profileWidth)})
	.attr("y", "80")
	.text(function(d){return "Name: " + that.metaData.champions[d.id]})
    
    this.cs = this.profiles
	.append("text")
	.attr("x", function(d,i){return that.margin + ((that.profileWidth-40)/2)+ i * (that.profileWidth)})
	.attr("y", "120")
	.text(function(d){
	//    if (that.brushStart < that.brushEnd) {
	//	return "Average CS: " + Math.round(d3.sum(d.creep_score)/d.creep_score.length)
	//    }
	    return "Average CS: " + Math.round(d3.sum(d.unique.creep_score)/d.unique.creep_score.length)
	    
	})
    
    this.itemTitle = this.profiles
	.append("text")
	.attr("x", function(d,i){return 10 + ((that.profileWidth)/2)+ i * (that.profileWidth)})
	.attr("y", (that.profileHeight/2) + 70)
	.text("Top 6 Items")
	

    for (var x = 0; x < 6; x ++) {
	this.profiles.append("image")
	    .attr("x", function(d,i){return that.margin + 50+ i * (that.profileWidth) + (x%3) * 60})
	    .attr("y", function(d){return Math.floor(x/3) * 60 + that.profileHeight/2 + 75})
	    .attr("width", 50)
	    .attr("height", 50)
	    .attr("xlink:href", function(d){
		
		if (d === undefined || d.topItems[x] === undefined) {
		    return "img/item/" + 0 + ".png";
		}
		return "img/item/" + d.topItems[x].key + ".png"    
	    })
	
    }
    this.summonerTitle = this.profiles
	.append("text")
	.attr("x", function(d,i){return that.margin + ((that.profileWidth-40)/2)+ i * (that.profileWidth)})
	.attr("y", "150")
	.text("Common Summoner Spells")
	.style("font-size", "10px")
	
    for (var x = 0; x < 2; x ++ ) {
	this.profiles.append("image")
	    .attr("x", function(d,i){return that.margin + 120+ i * (that.profileWidth) + x * 50})
	    .attr("y", 160)
	    .attr("width", 40)
	    .attr("height", 40)
	    .attr("xlink:href", function(d){
	    
		if (d === undefined || d.topSpells[x] === undefined) {
		    return "img/item/" + 0 + ".png";
		}
		return "img/summoners/" + d.topSpells[x].key + ".png"
	    })
    }
    
    that.profiles.exit().remove()
    


}

ProfileVis.prototype.onSelectionChange= function (selected){
    this.selected = selected
    this.updateVis();
}

ProfileVis.prototype.brushChange= function (start, end){
    this.brushStart = start
    this.brushEnd = end
    this.updateVis();
}

ProfileVis.prototype.wrangleData= function(_filterFunction){
    
}

