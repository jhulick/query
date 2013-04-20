
/**
 * Expose `Variable`.
 */

module.exports = Variable;

/**
 * https://github.com/slightlyoff/cassowary-js-refactor
 */

function Variable(val) {
  this.name = val;

  val = val.split('.');

  switch (val.length) {
    case 3:
      this.adapter = val[0];
      this.model = val[1];
      this.attr = val[2];
      break;
    case 2:
      // result.adapter = defaultAdapter
      this.model = val[0];
      this.attr = val[1];
      break;
    case 1:
      this.attr = val[0];
      break;
  }
}