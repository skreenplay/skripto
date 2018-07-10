import React, { Component } from 'react';
import '../App.css';
import './Tree.css';
const fs = window.require('fs');
const pluginslib =  require('../lib/plugins');
//const m = require('module');


export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
    /* properties */
    // - scripto
    // - onFileSaved()
    // - plugins
  }
  render() {
    console.log('toolbar');
    console.log(this.props.plugins);
    if (this.props.plugins) {
      var that = this;
      /* Get plugin */
      var plugin = pluginslib.pluginFromPath(this.props.plugins.Toolbar[0].path);
      console.log(plugin);
      var items = this.props.plugins.Toolbar.map(function(item) {
        var plugin = pluginslib.pluginFromPath(item.path);
        return (
          <div className="Toolbar-item">
            <plugin.Main scripto={that.props.scripto} onFileSaved={(e)=>that.props.onFileSaved(e)}/>
          </div>
        )
        // <plugin.Main scripto={that.props.scripto} onFileSaved={(e)=>this.props.onFileSaved(e)}/>

      })
    } else {
      items= null;
    }
    return (
      <div className="Toolbar-Items">
        {items}
      </div>
    )
  }
}
