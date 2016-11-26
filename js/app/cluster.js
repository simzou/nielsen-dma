define(['market'], function () {

  let id_iterator = 0;

  const d3 = require('lib/d3');
  const Market = require('market');

  const DEFAULT_FILL_COLOR = '#aaa';

  class Cluster {

    constructor(markets) {
      this.markets = markets;
      this._fill_color = DEFAULT_FILL_COLOR;
      this._id = ++id_iterator;
      this.assign_self_to_markets();
    }

    set fill_color(color) {
      this._fill_color = color;
      for (let i = 0; i < this.markets.length; i++) {
        this.markets[i].fill_color = color;
      }
    }
    get fill_color() {
      return this._fill_color;
    }

    get id() { return this._id; }
    get total_population() {
      if (this._total_population == null) {
        this._total_population = Market.count_population(this.markets);
      }
      return this._total_population;
    }

    assign_self_to_markets() {
      for (let i = 0; i < this.markets.length; i++) {
        this.markets[i].cluster = this;
      }
    }

  }

  return Cluster;
});
