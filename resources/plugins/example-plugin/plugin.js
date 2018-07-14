(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Main = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Hello;
function Hello(l) {
  return "Hello, " + l;
};
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarMenu = exports.ToolbarItem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _other = require('./other.js');

var _other2 = _interopRequireDefault(_other);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// imports from sandbox
var fetch = imports.fetch;
// Local imports
/* babel-plugin-inline-import './image.png' */var image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAABG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+Gkqr6gAAAYNpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZFNS0JBFIYftTDKSKhFixYS1soiDaI2QUpYICFm0NdGr1+B2uVeI6Rt0FYoiNr0tahfUNugdRAURRAtWrUualNxO1cFJWyGOefhnTmHmXfAGs0qOb1pCHL5ghYJ+l3zC4su+wt22nEyiC2m6OpEOBzi3/F5j8XMtwNmr//PNRxtiaSugKVFeFxRtYLwlHBovaCavCPcpWRiCeEzYY8mFxS+M/V4hV9NTlf422QtGgmA1SnsStdxvI6VjJYTlpfjzmXXlOp9zJc4kvm5Wcm9snrQiRDEj4tpJgkwgpcxiSMM4BOHvOJd4/qhcv0Mq1KrSFQporFCmgwFPKKuSfek5JToSZlZiqb/f33VU8O+SneHH5qfDeO9D+zb8FMyjK8jw/g5BtsTXOZr9auHMPoheqmmuQ+gYxPOr2pafBcutqD7UY1psbJkk2VNpeDtFNoXoPMGWpcqnlX3OXmA6IZ81TXs7UO/nO9Y/gUqIWfKEuasgwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAPFJREFUSIntlb1xwkAQRh8uwRGiBciQQ7dhAvdACRt8HUANInAdOJMUugUrMy0Q6JjxeHx7+jEemNGbUbSrfbfSrgQTE7fOrE+ymS2APFwAFVBJ+vxToZk9AnvgNZJyALaSvkYLzewZeAOyRGoDbCQdBwtDZx/APHWwb9KV1+lDosC+hwzap7DzEqIdmlkGdB6GHywkNb8FvA5zJ5ZiHQtcS/g0RHgVPGE1om7538K6tzBM2WGArIhNqCsMbGmXuStNuCeKKwxfjE1HaQO8SDoNFgbpEVgBhZNWAEtJ76l6fX9PGe1SX/asBGrvnU1M3B9nyzQ+0heiJPwAAAAASUVORK5CYII=';

var ToolbarItem = exports.ToolbarItem = function (_Component) {
  _inherits(ToolbarItem, _Component);

  function ToolbarItem(props) {
    _classCallCheck(this, ToolbarItem);

    return _possibleConstructorReturn(this, (ToolbarItem.__proto__ || Object.getPrototypeOf(ToolbarItem)).call(this, props));
    // Default Props :
    // - skripto (ability to change file's data)
    // - settings (ability to change user settings)
  }

  _createClass(ToolbarItem, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement('img', { src: image, style: { marginLeft: 8, marginTop: 5, width: 28, height: 28, cursor: 'pointer' } })
      );
    }
  }]);

  return ToolbarItem;
}(Component);

var ToolbarMenu = exports.ToolbarMenu = function (_Component2) {
  _inherits(ToolbarMenu, _Component2);

  function ToolbarMenu(props) {
    _classCallCheck(this, ToolbarMenu);

    return _possibleConstructorReturn(this, (ToolbarMenu.__proto__ || Object.getPrototypeOf(ToolbarMenu)).call(this, props));
    // Default Props :
    // - skripto (ability to change file's data)
    // - settings (ability to change user settings)
  }

  _createClass(ToolbarMenu, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement('input', { type: 'text' }),
        React.createElement(
          'button',
          null,
          'press me'
        ),
        React.createElement(
          'p',
          null,
          (0, _other2.default)('user')
        )
      );
    }
  }]);

  return ToolbarMenu;
}(Component);
},{"./other.js":1}]},{},[1,2])(2)
});
