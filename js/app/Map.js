define(['lib/topojson', 'market'], function () {

  const d3       = require('lib/d3');
  const topojson = require('lib/topojson');
  const Market   = require('market');

  const defaultFill = "#aaa";

  class Map {

    constructor() {
      this._markets = [];
    }

    get markets() {
      return this._markets;
    }

    get total_population() {
      if (this._total_population == null) {
        this._total_population = Market.count_population(this.markets);
      }
      return this._total_population;
    }

    initialize(callback) {
      this._initialize_map();
      this._draw_markets(callback);
    }

    // Creates SVG and D3 drawing surface.
    _initialize_map() { //{{{
      let width = 800,
          height = 500;
      // sets the type of view
      let projection = d3.geoAlbersUsa()
          .scale(1070) // size, bigger is bigger
          .translate([width / 2, height / 2]);

      //creates a new geographic path generator
      this._path = d3.geoPath().projection(projection);
      let xScale = d3.scaleLinear()
          .domain([0, 7])
          .range([0, 500]);

      let xAxis = d3.axisBottom()
          .scale(xScale)
          .tickSize(13)
          .tickFormat(d3.format("0.0f"));


      //set svg window
      // let svg = d3.select("body")
      //       .append("svg")
      this._svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height)

      let graticule = d3.geoGraticule()
          .extent([[-98 - 45, 38 - 45], [-98 + 45, 38 + 45]])
          .step([5, 5]);

      // adding a blank background
      this._svg.append("rect")
          .datum(graticule)
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height)
         // .on("click", clicked);

      //declare g as our appended svg
      this._g = this._svg.append("g");
    } //}}}

    // Loads JSON data and draws markets on the map.
    // Then calls initialize_markets() to create Market instances for each.
    _draw_markets(callback) { //{{{
      this._with_data(function (data) {

        let market_objects = {};
        let original_fill_color = null;

        market_objects.fills = this._g.append("g")
          .attr("id", "dmas")
          .selectAll("path")
          .data(topojson.feature(data, data.objects.nielsen_dma).features)
          .enter()
          .append("path")
          .attr("d", this._path)
          .attr("opacity", 0.9)
          .attr("fill", defaultFill);
          //.on("click", clicked)

          // .on("mouseover", function(d){
          //   let element = d3.select(this);
          //   original_fill_color = element.attr('fill');
          //   element.attr("fill", "white");

          //   let prop = d.properties;

          //   d3.select('#cluster_' + prop.cluster_id)
          //     .dispatch('activate');
          //   d3.select('#market_' + prop.dma)
          //     .dispatch('activate');
          // })



        // add dma borders
        market_objects.outlines = this._g.append("path", ".graticule")
            .datum(topojson.mesh(data, data.objects.nielsen_dma, function(a, b) { 
              return true;
            }))
            .attr("id", "dma-borders")
            .attr("d", this._path);

        market_objects.fills    = market_objects.fills._groups[0];
        market_objects.outlines = market_objects.outlines._groups[0];

        this._initialize_markets(market_objects);

        callback.call(null, this);

        // window.market_processor = new MarketProcessor(market_objects);
        // window.market_processor.process();

      }.bind(this));

      // // via http://stackoverflow.com/a/2901298
      // function numberWithCommas(x) {
      //     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // }

    } //}}}

    // Wrapper for data acquisition.
    _with_data(callback) { //{{{
      d3.json("data/nielsentopo.json", function(error, dma) {

        let nielsen = dma.objects.nielsen_dma.geometries;

        // adding data from tv json (number of TVs, etc) to map json
        d3.json("data/tv.json", function(error, tv){
          for (let i = 0; i < nielsen.length; i++){
            let dma_code = nielsen[i].id;
            for (let key in tv[dma_code]){
              nielsen[i].properties[key] = tv[dma_code][key];
            }
          }
          dma.objects.nielsen_dma.geometries = nielsen;

          callback.call(this, dma);
        });
      });
    } //}}}

    // Creates Market instances for each market drawn on the map.
    _initialize_markets(market_objects) { //{{{
      let i;

      let d3_markets = [];
      for (i = 0; i < market_objects.fills.length; i++) {
        d3_markets.push({
          data: market_objects.fills[i].__data__.properties,
          fill: market_objects.fills[i]
        });
      }

      // // TODO: outlines is current a single mesh; break this into separate
      // // meshes
      // for (i = 0; i < market_objects.outlines.length; i++) {
      // }

      this._markets = [];
      for (i = 0; i < d3_markets.length; i++) {
        let market = new Market(d3_markets[i].data, d3_markets[i].fill, null);
        this._markets.push(market);
      }
    } //}}}

  }

  return Map;
});
