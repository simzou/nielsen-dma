define(['lib/d3'], function () {

  const d3                = require('lib/d3');
  const population_format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

  Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
       j = Math.floor( Math.random() * ( i + 1 ) );
       temp = this[i];
       this[i] = this[j];
       this[j] = temp;
    }
    return this;
  }

  class Utils {

    // divide the HSL color wheel into `count` parts
    static create_colors(count) {
      const s = 0.5; // 0-1
      const l = 0.5; // 0-1
      let hsl_increment = Math.floor(360 / count); // 0-360
      let colors = [];
      for (let i = 0; i < count; i++) {
        let h = hsl_increment * (i + 1);
        let color = d3.hsl(h, 0.5, 0.5);
        colors.push(color);
      }
      return colors;
    }

    static format_population(number) {
      return population_format.format(number);
    }

  }

  return Utils;

});
