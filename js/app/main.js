define(function (require) {

  const d3              = require('lib/d3');
  const Map             = require('map');
  const MarketSegmenter = require('market_segmenter');
  const Cluster         = require('cluster');
  const Utils           = require('utils');

  const TOTAL_SAMSUNG_TELEVISIONS = 16431973;

  let samsung_percentage = null;

  // initialize map
  const map = new Map();
  map.initialize(function (map) {

    // divide markets into clusters
    const market_segmenter = new MarketSegmenter();
    let market_parts = market_segmenter.divide_into(6, map.markets);

    // initialize clusters
    let clusters = [];
    let cluster;
    let i;
    for (i = 0; i < market_parts.length; i++) {
      cluster = new Cluster(market_parts[i]);
      clusters.push(cluster);
    }

    // color clusters
    let colors = Utils.create_colors(clusters.length);
    colors.shuffle();
    for (i = 0; i < clusters.length; i++) {
      clusters[i].fill_color = colors[i];
    }

    write_overview(map);
    write_clusters(clusters);

  });


  function write_overview(map) {
    let $overview = d3.select('#overview').append('table');
    $overview.append('tr').html("<th>Total TV Households</th><th>Total Samsung TVs</th><th>% of Total</th>");
    $overview = $overview.append('tbody');
    samsung_percentage = TOTAL_SAMSUNG_TELEVISIONS / map.total_population;
    let html = "<td>" + Utils.format_population(map.total_population) + "</td>";
    html    += "<td>" + Utils.format_population(TOTAL_SAMSUNG_TELEVISIONS) + "</td>";
    html    += "<td>" + Number(samsung_percentage * 100).toFixed(1) + "%</td>";
    $overview.append('tr').html(html);
  }

  function write_clusters(clusters) {
    let $cluster_list = d3.select('#cluster_list').append('table');
    $cluster_list.append('tr').html("<th>ID</th><th>TV Households</th><th>Samsung TVs</th><th># Markets</th>");
    $cluster_list = $cluster_list.append('tbody');

    for (let i = 0; i < clusters.length; i++) {
      write_cluster($cluster_list, clusters[i]);
    }
  }

  function write_cluster($cluster_list, cluster) {
    let html = "<td>" + cluster.id + "</td>";
    html    += "<td class='number'>" + Utils.format_population(cluster.total_population) + "</td>";
    html    += "<td class='number'>" + Utils.format_population(cluster.total_population * samsung_percentage) + "</td>";
    html    += "<td class='number'>" + cluster.markets.length + "</td>";

    //var cluster_html = d3.creator('p').html(string);

    let original_fill = null;
    let that = this;

    $cluster_list
      .append('tr')
      .attr('id', "cluster_" + cluster.id)
      .html(html)
      .on('mouseover', function (d) {
        original_fill = cluster.fill_color;
        cluster.fill_color = "orange";
        set_active_cluster_tr(this);
        display_cluster_detail(cluster);
      })
      .on('activate', function (d) {
        set_active_cluster_tr(this);
        display_cluster_detail(cluster);
      })
      .on('mouseout', function (d) {
        cluster.fill_color = original_fill;
      })
      .on('deactivate', function (d) {
        d3.select(this).classed('active', false);
      });
  }

  let active_cluster_tr = null
  function set_active_cluster_tr(tr) {
    if (active_cluster_tr != null) {
      d3.select(active_cluster_tr).classed('active', false);
    }
    d3.select(tr).classed('active', true);
    active_cluster_tr = tr;
  }

  function display_cluster_detail(cluster) {
    var $cluster_detail = d3.select('#cluster_detail').html(null).append('table');

    var table_headers = "<th>Market</th>";
    table_headers    += "<th>TV Households</th>";
    table_headers    += "<th>Samsung TVs</th>";
    table_headers    += "<th>% with Cable</th>";
    table_headers    += "<th>Nielsen Rank</th>";

    $cluster_detail.append('tr').html(table_headers);

    $cluster_detail = $cluster_detail.append('tbody');

    for (var i = 0; i < cluster.markets.length; i++) {
      write_market($cluster_detail, cluster.markets[i]);
    }
  }

  function write_market($cluster_detail, market) {
    let html = "<td>" + market.name + "</td>";
    html    += "<td class='number'>" + Utils.format_population(market.total_population) + "</td>";
    html    += "<td class='number'>" + Utils.format_population(market.total_population * samsung_percentage) + "</td>";
    html    += "<td class='number'>" + Number(market.cableperc).toFixed(1) + "%</td>";
    html    += "<td class='number'>" + market.nielsen_rank + "</td>";

    let original_fill = null;

    $cluster_detail
      .append('tr')
      .attr('id', "market_" + market.id)
      .html(html)
      .on('mouseover', function (d) {
        original_fill = market.fill_color;
        market.fill_color = "orange";
        // The following draws a small black circle at the lat/lon of the market.
        //svg.append("circle").attr("r", 5).attr("transform", function() {return "translate(" + projection([data.longitude,data.latitude]) + ")";});
      })
      .on('activate', function (d) {
        d3.select(this).classed('active', true);
      })
      .on('mouseout', function (d) {
        market.fill_color = original_fill;
      })
      .on('deactivate', function (d) {
        d3.select(this).classed('active', false);
      });
  }

});
