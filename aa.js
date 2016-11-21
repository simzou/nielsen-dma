var clusters = [];
var cluster_counter = 0;
var population_format = new Intl.NumberFormat("en-US");

class MarketProcessor {

  constructor(dma_objects) {
    this.dma_objects = dma_objects;
    this.total_population = this.count_population(this.dma_objects.fills[0]);
  }


  process() {

    this.clusters = [];

    this.divide_into(8, this.dma_objects.fills[0]);

    this.color_parts(this.final_parts);

    // populate this.clusters
    for (var i = 0; i < this.final_parts.length; i++) {
      var cluster_id = ++cluster_counter;
      var population = this.count_population(this.final_parts[i]);
      var cluster = { id: cluster_id, parts: this.final_parts[i], population: population };
      this.clusters.push(cluster);
    }

    this.write_clusters();
  }

  divide_into(count, fills) {
    var target_population = Math.ceil(this.total_population / count);
    this.final_parts = [];
    return this.divide_to(target_population, fills);
  }

  // recursive function
  divide_to(target_population, fills, iteration) {
    if (iteration == null) { iteration = 1; }

    var direction = ['longitude', 'latitude'][iteration % 2];

    var output_parts = []

    var parts = this.divide_along(direction, fills);

    // TODO: fix this; shouldn't need to break after set number of iterations
    //if (iteration > 20) return parts;
    for (var i = 0; i < parts.length; i++) {
      var current_population = this.count_population(parts[i]);
      // if (current_population == 12480660) {
      //   for (var j = 0; j < parts[i].length; j++) {
      //     console.log(parseInt(parts[i][j].__data__.properties['TV Homes'], 10));
      //   }
      // }
      if (parts[i].length > 1 && current_population > target_population) {
        parts[i] = this.divide_to(target_population, parts[i], iteration + 1);
      }
      else {
        this.final_parts.push(parts[i]);
      }
    }
    return parts;
  }

  //  ------------
  // |     |      |
  // |     |      |
  //  ------------

  divide_along(property, fills) {
    var fills_sorted = fills.sort(function (fill_a, fill_b) {
      if (fill_a.__data__.properties[property] < fill_b.__data__.properties[property]) {
        return -1;
      }
      return 1;
    });
    return this.divide_in_half(fills_sorted);
  }

  // convenience function
  divide_along_longitude(fills) {
    return this.divide_along('longitude', fills);
  }

  // convenience function
  divide_along_latitude(fills) {
    return this.divide_along('latitude', fills);
  }

  divide_in_half(fills) {
    var parts = [[], []];
    var target_population = Math.ceil(this.count_population(fills) / 2);
    var running_population = 0;
    var i;
    for (i = 0; i < fills.length; i++) {
      var tv_homes = parseInt(fills[i].__data__.properties['TV Homes'], 10);
      // TODO: improve this to choose closer to half
      // ... something like comparing Math.abs(running_population + tv_homes - target_population) and Math.abs(target_population - running_population) 
      parts[0].push(fills[i]);
      running_population += tv_homes;
      if (running_population >= target_population) {
        break;
      }
    }
    parts[1] = fills.slice(i + 1, fills.length);
    return parts;
  }

  count_population(fills) {
    var running_population = 0;
    for (var i = 0; i < fills.length; i++) {
      var tv_homes = parseInt(fills[i].__data__.properties['TV Homes'], 10);
      running_population += tv_homes;
    }
    return running_population;
  }

  color_parts(parts) {
    var parts_count = parts.length;
    var hsl_increment = Math.floor(360 / parts_count); // 0-360
    var s = 0.5; // 0-1
    var l = 0.5; // 0-1
    for (var i = 0; i < parts_count; i++) {
      var h = hsl_increment * (i + 1);
      var color = d3.hsl(h, 0.5, 0.5);
      for (var j = 0; j < parts[i].length; j++) {
        var d = d3.select(parts[i][j]);
        //d.attr('fill', 'hsl(' + h + ', ' + s + ', ' + l + ')');
        d.attr('fill', color);
        //d3.select(parts[i][j]).dispatch('highlight');
      }
    }
  }

  write_clusters() {

    var $cluster_list = d3.select('#cluster_list').append('table');
    $cluster_list.append('tr').html("<th>ID</th><th>Population</th><th>Market Count</th>");
    $cluster_list = $cluster_list.append('tbody');

    for (var i = 0; i < this.clusters.length; i++) {
      this.write_cluster($cluster_list, this.clusters[i]);
    }
  }

  write_cluster($cluster_list, cluster) {
    var html = "<td>" + cluster.id + "</td>";
    html    += "<td class='number'>" + population_format.format(cluster.population) + "</td>";
    html    += "<td class='number'>" + cluster.parts.length + "</td>";

    //var cluster_html = d3.creator('p').html(string);

    var original_fill = null;
    var that = this;

    $cluster_list
      .append('tr')
      .html(html)
      .on('mouseover', function (d) {
        for (var j = 0; j < cluster.parts.length; j++) {
          var dd = d3.select(cluster.parts[j]);
          original_fill = dd.attr('fill');
          dd.attr("fill", "orange");
        }
        that.display_cluster_detail(cluster);
      })
      .on('mouseout', function (d) {
        for (var k = 0; k < cluster.parts.length; k++) {
          var dd = d3.select(cluster.parts[k]);
          //original_fill = dd.attr('fill');
          dd.attr("fill", original_fill);
        }
      });
  }

  display_cluster_detail(cluster) {
    var $cluster_detail = d3.select('#cluster_detail').html(null).append('table');

    var table_headers = "<th>Market</th>";
    table_headers    += "<th>Population</th>";
    table_headers    += "<th>% with Cable</th>";
    table_headers    += "<th>Nielsen Rank</th>";

    $cluster_detail.append('tr').html(table_headers);

    for (var i = 0; i < cluster.parts.length; i++) {
      var cluster_part = cluster.parts[i];
      var data = d3.select(cluster_part).data()[0].properties;
      console.log(cluster_part);
      console.log(data.dma1);
      var html = "<td>" + data.dma1 + "</td>";
      html    += "<td class='number'>" + population_format.format(parseInt(data['TV Homes'], 10)) + "</td>";
      html    += "<td class='number'>" + data.cableperc + "</td>";
      html    += "<td class='number'>" + data.Rank + "</td>";
      $cluster_detail
        .append('tr')
        .html(html);
    }
  }

}
