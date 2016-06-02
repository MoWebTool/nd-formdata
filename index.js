/**
 * @module FormData
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

function trim(value) {
  return value.replace(/^\s+|\s+$/g, '');
}

function each(data, callback) {
  var i, n;

  for (i = 0, n = data.length; i < n; i++) {
    if (callback(data[i], i, data) === false) {
      break;
    }
  }
}

/**
 * FormData
 *
 * @class FormData
 * @constructor
 */
var _FormData = function(fields) {
  return this.initialize(fields);
};

_FormData.prototype._each = function(callback) {
  each(this.dataArray, callback);
};

_FormData.prototype._field = function(fields) {
  var that = this;

  each(fields, function(field) {
    if (!field.name) {
      return;
    }

    if (field.disabled) {
      return;
    }

    if (field.type === 'radio' || field.type === 'checkbox') {
      if (!field.checked) {
        return;
      }
    }

    if (field.tagName.toLowerCase() === 'select' &&
        field.multiple &&
        field.selectedIndex !== -1) {
      var i;
      var options = field.options;
      var n = field.options.length;

      for (i = 0; i < n; i++) {
        if (options[i].selected) {
          that.append(field.name, options[i].value);
        }
      }
    } else {
      that.append(field.name, field.value);
    }

  });
};

_FormData.prototype.initialize = function(fields) {
  this.dataArray = [];

  if (fields) {
    this._field(fields);
  }

  return this;
};

_FormData.prototype.append = function(name, value) {
  var found;

  if (typeof value === 'string') {
    //value = trim(value);

    var firstChar = value.charAt(0);
    var lastChar = value.slice(-1);

    if ((firstChar === '[' && lastChar === ']') ||
        (firstChar === '{' && lastChar === '}')) {
      try {
        value = JSON.parse(value);
      } catch(e) {
      }
    }
  }

  this._each(function(pair) {
    if (pair.name === name) {
      found = true;

      if (pair.value && pair.value.constructor === Array) {
        pair.value.push(value);
      } else {
        pair.value = [pair.value, value];
      }

      return false;
    }
  });

  if (!found) {
    this.dataArray.push({
      name: name,
      value: value
    });
  }
};

_FormData.prototype.remove = function(name, value) {
  this._each(function(pair, i, dataArray) {
    if (pair.name === name) {
      if (pair.value === value || (typeof value === 'undefined')) {
        dataArray.splice(i, 1);
      }

      return false;
    }
  });
};

_FormData.prototype.get = function(name) {
  var value;

  this._each(function(pair) {
    if (pair.name === name) {
      value = pair.value;

      return false;
    }
  });

  return value;
};

_FormData.prototype.set = function(name, value) {
  this._each(function(pair) {
    if (pair.name === name) {
      if (typeof value === 'string') {
        value = trim(value);

        try {
          value = JSON.parse(value);
        } catch(e) {
        }
      }

      pair.value = value;

      return false;
    }
  });
},

_FormData.prototype.toParam = function() {
  var encode = window.encodeURIComponent,
    param = [];

  this._each(function(pair) {
    var name = pair.name,
      value = pair.value;

    if (name) {
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }

      param.push(encode(name) + '=' + encode(value));
    }
  });

  return param.join('&');
};

_FormData.prototype.toJSON = function() {
  var json = {};

  this._each(function(pair) {
    if (pair.name) {
      json[pair.name] = pair.value;
    }
  });

  return json;
};

module.exports = _FormData;
