import React, { Component } from 'react';
import '../App.css';
import './Tree.css';
const pluginslib =  require('../lib/plugins');
//const m = require('module');

class ToolbarContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      panelOpen:false,
      hasError:false
    }
  }
  _openPanel() {
    if (this.state.panelOpen) {
      this.setState({panelOpen:false})
    } else {
      this.setState({panelOpen:true})
    }
  }
  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    console.error(error);
    // You can also log the error to an error reporting service
  }
  render() {
    if (this.props.plugin) {
      if (this.state.hasError) {
        return (
          <div className="Toolbar-i">
            <div className="Toolbar-item Error" style={this.props.style}>
              Error loading plugin
            </div>

          </div>
        )
      } else {
        return (
          <div className="Toolbar-i">

            <a className="Toolbar-item" onClick={() => this._openPanel()} style={this.props.style}>
              <this.props.plugin.ToolbarItem scripto={this.props.scripto} onFileSaved={(e)=>this.props.onFileSaved(e)}/>
            </a>
            {
              this.state.panelOpen && this.props.panel &&

              <div className="Toolbar-item-menu" style={{...this.props.style, ...{height:this.props.config.height}}}>
                <this.props.plugin.ToolbarMenu scripto={this.props.scripto} onFileSaved={(e)=>this.props.onFileSaved(e)}/>
              </div>
            }
          </div>
        )
      }
    }
  }
}

export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelOpen:false,
      items:null
    }
    /* properties */
    // - scripto
    // - onFileSaved()
    // - plugins
    // - style
  }
  componentWillMount() {
    this._updatePlugins();
  }
  _updatePlugins() {

  }
  render() {
    if (this.props.plugins) {
      var that = this;
      /* Get plugin */
      var items = this.props.plugins.Toolbar.map(function(item) {
        var plugin = pluginslib.pluginFromPath(item.path);
        if (plugin) {
          var toolbarPanel = item.config.Toolbar.panel || false;
          return (
            <ToolbarContainer
                scripto={that.props.scripto}
                onFileSaved={(e)=>that.props.onFileSaved(e)}
                panel={toolbarPanel}
                plugin={plugin}
                config={item.config.Toolbar}
                style={that.props.style}
                />
            )
        }
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
