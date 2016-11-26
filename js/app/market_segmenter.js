define(['market'], function () {

  const Market = require('market');

  class MarketSegmenter {

    constructor() {
      this.total_population = null;
      this.target_population = null;
    }

    divide_into(count, markets) {
      this.total_population = Market.count_population(markets);
      this.target_population = Math.ceil(this.total_population / count);
      this.final_parts = [];
      // TODO: figure out how to get divide_to() to return single-level array
      // of arrays
      let parts = this.divide_to(this.target_population, markets);
      return this.final_parts;
    }

    divide_to(target_population, markets, iteration) {
      if (iteration == null) { iteration = 1; }

      let direction = ['latitude', 'longitude'][iteration % 2];

      let output_parts = []

      let parts = this.divide_along(direction, markets);

      // TODO: fix this; shouldn't need to break after set number of iterations
      //if (iteration > 20) return parts;
      for (let i = 0; i < parts.length; i++) {
        let current_population = Market.count_population(parts[i]);
        // if (current_population == 12480660) {
        //   for (let j = 0; j < parts[i].length; j++) {
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

    // static count_population(markets) {
    //   return markets.reduce(function(running_total, market) {
    //     return running_total + market.total_population;
    //   }, 0);
    // }

    //  ------------
    // |     |      |
    // |     |      |
    //  ------------

    divide_along(property, markets) {
      let markets_sorted = markets.sort(function (market_a, market_b) {
        if (market_a[property] < market_b[property]) {
          return -1;
        }
        return 1;
      });
      return this.divide_in_half(markets_sorted);
    }

    // convenience function
    divide_along_longitude(markets) {
      return this.divide_along('longitude', markets);
    }

    // convenience function
    divide_along_latitude(markets) {
      return this.divide_along('latitude', markets);
    }

    divide_in_half(markets) {
      let parts = [[], []];
      let target_population = Math.ceil(Market.count_population(markets) / 2);
      let running_population = 0;
      let i;
      for (i = 0; i < markets.length; i++) {
        // TODO: improve this to choose closer to half
        // ... something like comparing Math.abs(running_population + tv_homes - target_population) and Math.abs(target_population - running_population) 
        parts[0].push(markets[i]);
        running_population += markets[i].total_population;
        if (running_population >= target_population) {
          break;
        }
      }
      parts[1] = markets.slice(i + 1, markets.length);
      return parts;
    }

  }

  return MarketSegmenter;
});
