//{{{ Pre-Existing Initialization
var width = 800,
    height = 500;
// sets the type of view
var projection = d3.geoAlbersUsa()
    .scale(1070) // size, bigger is bigger
    .translate([width / 2, height / 2]);

//creates a new geographic path generator
var path = d3.geoPath().projection(projection);
var xScale = d3.scaleLinear()
    .domain([0, 7])
    .range([0, 500]);

var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickSize(13)
    .tickFormat(d3.format("0.0f"));


//set svg window
// var svg = d3.select("body")
//       .append("svg")
var svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height)

var graticule = d3.geoGraticule()
    .extent([[-98 - 45, 38 - 45], [-98 + 45, 38 + 45]])
    .step([5, 5]);

// adding a blank background
svg.append("rect")
    .datum(graticule)
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
   // .on("click", clicked);

//declare g as our appended svg
var g = svg.append("g");

var defaultFill = "#aaa";
// END Pre-Existing Initialization }}}


// BEGIN addition by Andrew Ashbacher {{{
// ######################################


// ####################################
// END addition by Andrew Ashbacher }}}

d3.json("nielsentopo.json", function(error, dma) {

  var nielsen = dma.objects.nielsen_dma.geometries;

  // adding data from tv json (number of TVs, etc) to map json
  d3.json("tv.json", function(error, tv){
    for (var i = 0; i < nielsen.length; i++){
      var dma_code = nielsen[i].id;
      for (key in tv[dma_code]){
        nielsen[i].properties[key] = tv[dma_code][key];
      }
    }
  dma.objects.nielsen_dma.geometries = nielsen;

  var dma_objects = {};
  var original_fill_color = null;

  dma_objects.fills = g.append("g")
    .attr("id", "dmas")
    .selectAll("path")
    .data(topojson.feature(dma, dma.objects.nielsen_dma).features)
    .enter()
    .append("path")
    .attr("d", path)
    //.on("click", clicked)

    .on("mouseover", function(d){
      var element = d3.select(this);
      original_fill_color = element.attr('fill');
      element.attr("fill", "white");

      var prop = d.properties;

      // var string = "<p><strong>Market Area Name</strong>: " + prop.dma1 + "</p>";
      // string += "<p><strong>Homes with TVs</strong>: " + numberWithCommas(prop["TV Homes"]) + "</p>";
      // string += "<p><strong>% with Cable</strong>: " + prop.cableperc + "%</p>";
      // string += "<p><strong>Nielsen Rank</strong>: " + prop.Rank + "</p>";

      // d3.select("#textbox")
      //   .html("")
      //   .append("text")
      //   .html(string);
    
      d3.select('#cluster_' + prop.cluster_id)
        .dispatch('activate');
      d3.select('#market_' + prop.dma)
        .dispatch('activate');
    })

    .on("mouseout", function(d) {
      var prop = d.properties;
      d3.select(this)
        .attr("fill", original_fill_color);
      d3.select('#cluster_' + prop.cluster_id)
        .dispatch('deactivate');
      d3.select('#market_' + prop.dma)
        .dispatch('deactivate');
    })

    .on("highlight", function (d) {
      d3.select(this)
      .attr("fill", "red");
    })
    
    .attr("opacity", 0.9)
    .attr("fill", defaultFill);

    dma_objects.fills.on('highlight2', function () {});

  // add dma borders
  dma_objects.outlines = g.append("path", ".graticule")
      .datum(topojson.mesh(dma, dma.objects.nielsen_dma, function(a, b) { 
        return true;
      }))
      .attr("id", "dma-borders")
      .attr("d", path);

    dma_objects.fills    = dma_objects.fills._groups;
    dma_objects.outlines = dma_objects.outlines._groups;

    window.market_processor = new MarketProcessor(dma_objects);
    window.market_processor.process();



  }) // END d3.json('tv.json', ...)

}) // END d3.json('nielsentopo.json', ...)

// // via http://stackoverflow.com/a/2901298
// function numberWithCommas(x) {
//     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

