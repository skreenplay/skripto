import React, { Component } from 'react';
import {HashRouter, Route, Link } from "react-router-dom";
import * as qs from 'query-string';
import TextareaAutosize from 'react-autosize-textarea';
import './App.css';
import './scripto.css';


var scripto = require('./lib/scriptosenso');
const fs = window.require('fs');


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:true,
      file:null,
    }
    this._onScriptUpdate = this._onScriptUpdate.bind(this);
    this._saveScript = this._saveScript.bind(this);
    this._catchEnter = this._catchEnter.bind(this)

  }
  onLightMode(e) {
    console.warn(e.currentTarget.checked);
    this.setState({checked:e.currentTarget.checked})
  }

  componentWillMount() {
    if (qs.parse(this.props.location.search)) {
      var file = qs.parse(this.props.location.search).file;
      this.setState({file:file})
    } else {
      console.log("no file");
    }

  }

  async componentDidMount(e) {
    var scobj = new scripto.Scripto();
    const self = this;

    if (this.state.file) {
      fs.readFile(this.state.file, function read(err, data) {
        if (err) {
            throw err;
        }
        scobj.loadData(data);
        var scrd = scobj.getScript();
        self.setState({scripto:scobj, scriptData:scrd})
      });
    }

  }

  _catchEnter(e, item) {
    if (e.key === 'Enter'){
      this.state.scripto.updateScriptItem(item);
      console.log('saving', item.content);
      this.setState({scriptData:this.state.scripto.getScript()});
    }
  }

  _onScriptUpdate(e,item) {
    var newitem = item;
    newitem.content = e.target.value;
    this.state.scripto.updateScriptItem(newitem);
    /*this.setState({scriptData:this.state.scripto.getScript()});*/
  }
  _saveScript() {
    var sc = this.state.scripto.getStringData();
    fs.writeFile(this.state.file, sc, function(err){
      if (err) {
        return console.log(err);
      }
    });
    console.log('saved');
  }

  render() {

    if (this.state.checked) {
      var headerColor = "#202020";
      var contentColor = "#252525";
      var borderColor = "#1D1B1A";
    } else {
      headerColor = "#E6DED2";
      contentColor = "#E1DAC9";
      borderColor = "#D3CDBD";
    }

    if (this.state.scripto) {
      var scriptContent = this.state.scriptData.map((item) => {
        if (item.type==="§P" || item.type==="§D"){
          return (
            <TextareaAutosize className={"scripto input "+item.type}
                      type="text"
                      name="Paragraph"
                      defaultValue={item.content}
                      key={item.id}
                      ref={item.id}
                      onChange={(e)=>this._onScriptUpdate(e, item)}
                      onKeyPress={(e)=>this._catchEnter(e, item)}>
                      </TextareaAutosize>

          )

        } else {
          return (
            <input className={"scripto input "+item.type}
                  type="text"
                  name="Title"
                  defaultValue={item.content}
                  key={item.id}
                  ref={item.id}
                  onChange={(e)=>this._onScriptUpdate(e, item)}
                  onKeyPress={(e)=>this._catchEnter(e, item)}>
                  </input>
          )
        }

      });
    } else {
      scriptContent = null;
    }
    return (

      <div className="App" >
          <header className="App-header" style={{backgroundColor:headerColor, borderColor:borderColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}></div>
              <div className="Layout-main">
                <p className="App-title">Scripto {this.state.file}</p>
              </div>
            </div>
          </header>
          <div className="App-content" style={{backgroundColor:contentColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}>

              </div>
              <div className="Layout-main">
                <div className="Script-layout">
                  <div className="Script-main">
                      <div className="Script-Placeholder-box">
                        {scriptContent}

                        {
                          !scriptContent &&

                          <div>
                            <div className="Script-Placeholder title">

                            </div>
                            <div className="Script-Placeholder subtitle">

                            </div>
                            <div className="Script-Placeholder c-box"><div className="Script-Placeholder character"></div></div>
                            <div className="Script-Placeholder paragraph">
                              <div className="Script-Placeholder p-line-indent">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                            </div>
                            <div className="Script-Placeholder c-box"><div className="Script-Placeholder character"></div></div>
                            <div className="Script-Placeholder paragraph">
                              <div className="Script-Placeholder p-line-indent">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                              <div className="Script-Placeholder p-line">
                              </div>
                            </div>
                          </div>

                        }
                      </div>
                  </div>
                  <div className="Script-Right">
                    <div className="Script-Right-Button-Box">
                      <p className="Script-Right-Label">Dark</p>
                      <label className="switch">
                        <input type="checkbox" onChange={(e) => this.onLightMode(e) } checked={this.state.checked}/>
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="Script-Right-Button-Box">
                    </div>
                    <div className="Script-Right-Spacer">
                    </div>
                    <div className="Script-Right-Button-Box">
                      <a className="Script-Right-Button">
                        Export to PDF
                      </a>
                    </div>
                    <div className="Script-Right-Button-Box">
                        <a href="#" className="Script-Right-Button Primary" onClick={()=>this._saveScript()}>
                          save script
                        </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script src="autosize.js">
          </script>
          <script>
            autosize(document.querySelectorAll('textarea'));
          </script>
      </div>
    );
  }
}

const App = () => (
  <HashRouter>
    <div>
      <ul>
        <li>
          <Link to="/?file=0">Home</Link>
        </li>
      </ul>

      <hr />
      <Route path="/" component={Main} />
    </div>
  </HashRouter>
);

export default App;
