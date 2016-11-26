define([], function () {

  const d3 = require('lib/d3');

  const SAMSUNG_PERCENTAGE = 0.14;

  class Market {

    constructor(data, fill, outline) {
      this._data   = data;
      this.fill    = d3.select(fill);
      this.outline = outline;
      this.cluster = null;

      this.attach_mouseover();
      this.attach_mouseout();
    }

    static count_population(markets) {
      return markets.reduce(function(running_total, market) {
        return running_total + market.total_population;
      }, 0);
    }

    set cluster(cluster) { this._cluster = cluster; }
    set fill_color(color) {
      this.fill.attr("fill", color);
    }
    get fill_color() {
      return this.fill.attr('fill');
    }

    get id()                 { return this._data.dma;                              }
    get name()               { return this._data.dma1;                             }
    get cluster()            { return this._cluster;                               }
    get percentage_of_us()   { return this._data['% of US'];                       }
    get total_population()   {
      if (this._total_population == null) {
        this._total_population = parseInt(this._data['TV Homes'], 10);
      }
      return this._total_population;
    }
    get samsung_population() { return this.total_population * SAMSUNG_PERCENTAGE; }
    get latitude()           { return this._data.latitude;                         }
    get longitude()          { return this._data.longitude;                        }
    get nielsen_rank()       { return this._data['Rank'];                          }

    // uncertain what these are
    get tvperc()             { return this._data.tvperc;                           }
    get cableperc()          { return this._data.cableperc;                        }
    get adsperc()            { return this._data.adsperc;                          }


    attach_mouseover() {
      this.fill.on("mouseover", function(d) {
        this._original_fill_color = this.fill_color;
        this.fill_color = "orange";

        d3.select('#cluster_' + this.cluster.id)
          .dispatch('activate');
        d3.select('#market_' + this.id)
          .dispatch('activate');
      }.bind(this));
    }

    attach_mouseout() {
      this.fill.on("mouseout", function(d) {
        this.fill_color = this._original_fill_color;
        d3.select('#cluster_' + this.cluster.id)
          .dispatch('deactivate');
        d3.select('#market_' + this.id)
          .dispatch('deactivate');
      }.bind(this));
    }

  }

  return Market;
});
