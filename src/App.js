import React, { Component } from 'react';
import {HashRouter, Route, Link } from "react-router-dom";
import * as qs from 'query-string';
import TextareaAutosize from 'react-autosize-textarea';
import './App.css';
import './styles/ui.css';
import './styles/skripto.css';

import {Placeholder} from './components/basic';
import TreeView from './components/TreeView';

import WelcomeActivity from './activities/WelcomeActivity';
import ControlActivity from './activities/ControlActivity';
import ScriptActivity from './activities/ScriptActivity';


var scripto = require('./lib/scriptosenso');
const fs = window.require('fs');
const {remote, ipcRenderer, dialog} = window.require('electron');
const pathlib = window.require('path');


class Main extends Component {
  /* GLOBAL STUFF */
  constructor(props) {
    super(props);
    this.state = {
      lightMode:false,
      file:null,
      activity:'write',
      newfilePath:null,
      newfileName:null,
      layoutState:"write",
      fileSaved:true
    }

    this.focusItem = null;

    this.focusItemRef = element => {
      this.focusItem = element;
    };

    /* EVENTS SENT FROM ELECTRON */
    ipcRenderer.on('config-ui-lightmode', (event, arg) => {
      console.log('o');
      if (this.state.lightMode) {
        this.setState({lightMode:false})
      } else {
        this.setState({lightMode:true})
      }
    })
    ipcRenderer.on('file-save', (event, arg) => {
      this._saveScript();
    })

    ipcRenderer.on('openfile-choose-reply', (event, arg) => {
      if (!this.state.file || !this.state.scripto) {
        var scobj = new scripto.Skripto();
        const self = this;
        fs.readFile(arg[0], function read(err, data) {
            if (err) {
                throw err;
            }
            scobj.loadData(data);
            var scrd = scobj.getScript();
            self.setState({file:arg[0], scripto:scobj, scriptData:scrd})
        });
      } else {
        /* if file is already open*/
      }
    })

    this._saveScript = this._saveScript.bind(this);
  }
  /*
    UI EVENTS
  */
  ui_onLightMode(e) {
    this.setState({lightMode:e.currentTarget.checked})
  }
  ui_changeActivity(act) {
    this.setState({activity:act})
  }

  /*
    UPDATE SCRIPT
  */

  /* SAVE WHOLE SKRIPT TO FILE */
  _saveScript() {
    if (this.state.scripto) {
      var sc = this.state.scripto.getStringData();
      fs.writeFile(this.state.file, sc, function(err){
        if (err) {
          return console.log(err);
        }
      });
      this.state.scripto.loadData(sc);
      this.setState({fileSaved:true, scriptData:this.state.scripto.getScript()})
    } else {
      console.log('Error : no script data');
    }
    console.log('saved');
  }
  _changeSavedState(bool) {
    if (this.state.fileSaved!==bool){
      this.setState({fileSaved:bool})
    }
  }


  /*
      CREATED FILE EVENT
  */
  _newFileCreated(f, scr) {
    this.setState({file:f, scripto:scr,scriptData:scr.getScriptObjects(), fileSaved:true,activity:'control'});
  }


  componentWillMount() {
    /* Get file input, if it exists*/
    if (qs.parse(this.props.location.search)) {
      var file = qs.parse(this.props.location.search).file;
      var activity = qs.parse(this.props.location.search).activity || 'write';
      this.setState({file:file, activity:activity})
    } else {
      console.log("no file");
    }
  }

  async componentDidMount(e) {
    /* Load file, if it exists*/
    const self = this;

    if (this.state.file) {
      fs.readFile(this.state.file, function read(err, data) {
        if (err) {
            throw err;
        }
        var scobj = new scripto.Skripto();
        scobj.loadData(data);
        var scrd = scobj.getScript();
        self.setState({scripto:scobj, scriptData:scrd})
      });
    }

  }


  render() {
    if (this.state.lightMode) {
      var headerColor = "#EDE7E1";
      var contentColor = "#F1EDE5";
      var borderColor = "#D3CDBD";
      var uiLighState = "light";
    } else {
      headerColor = "#202022";
      contentColor = "#252527";
      borderColor = "#404040";
      uiLighState = "dark";
    }
    if (this.state.scripto) {
      var scriptMetadata = this.state.scripto.getMetaData();
      var scriptContent = this.state.scriptData.map((item) => {
        if (item.id===this.state.focusItem) {
          console.log('focused : ', item.id);
          var reference = this.focusItemRef;
        } else {
          reference = null;
        }
        if (item.type==="§P" || item.type==="§D"){
          return (
            <div className="Script-layout">

              <div className="Script-main" >
                <span className="debug-info">{item.id} {item.type}</span>
                <TextareaAutosize className={"scripto input "+item.type}
                          type="text"
                          name="Paragraph"
                          defaultValue={item.content}
                          key={item.id.toString()+item.content.replace(" ", "-")}
                          ref={reference}
                          onChange={(e)=>this._onScriptUpdate(e, item)}
                          onKeyDown={(e)=>this._catchItemKeys(e, item)}
                          >
                          </TextareaAutosize>
              </div>
              <div className="Script-Right">
              </div>
            </div>
          )

        } else {
          return (
            <div className="Script-layout">
              <div className="Script-main">
                <span className="debug-info">{item.id} {item.type}</span>
                <input className={"scripto input "+item.type}
                      type="text"
                      name="Title"
                      defaultValue={item.content}
                      key={item.id.toString()+item.content.replace(" ", "-")}
                      ref={reference}
                      onChange={(e)=>this._onScriptUpdate(e, item)}
                      onKeyDown={(e)=>this._catchItemKeys(e, item)}>
                      </input>
              </div>
              <div className="Script-Right">
              </div>
          </div>
          )
        }

      });
    } else {
      scriptContent = null;
    }

    if (this.state.fileSaved) {
      var saveState = "file saved"
    } else {
      saveState = "not saved"
    }

    if (this.state.newfileName && this.state.newfilePath) {
      var canCreate = <button className="CreateFile-save" onClick={()=> {this._createScriptSaveFile()}}>Create file</button>
    } else {
      canCreate = <button className="CreateFile-save disabled">Create file</button>
    }

    return (

      <div className="App">
          <header className="App-header" style={{backgroundColor:headerColor, borderColor:borderColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}></div>
              <div className="Layout-main">
                <p className="App-title">Skripto - {this.state.scripto && scriptMetadata.title}</p>
                <label className="switch">
                  <input type="checkbox" onChange={(e) => this.ui_onLightMode(e) } checked={this.state.lightMode}/>
                  <span className="slider round"></span>
                  <p className="label">{uiLighState}</p>

                </label>
              </div>
            </div>
          </header>
          <div className="App-content" style={{backgroundColor:contentColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}>

                <div className="Global-layout" >
                  <div className="Global-layout-choicebox" style={{borderColor:borderColor}}>
                    <a className="Global-layout-choice info" onClick={()=>{this.ui_changeActivity('control')}} ></a>
                    <a className="Global-layout-choice write" onClick={()=>{this.ui_changeActivity('write')}} ></a>
                    <a className="Global-layout-choice info" ></a>
                  </div>
                  <div className="Global-layout-content">
                    {
                      this.state.activity==="write" && this.state.scripto &&

                      <div>
                        <TreeView  items={this.state.scripto.getScriptTree()}/>

                      </div>
                    }
                  </div>
                </div>
                <div className="Settings-layout" style={{borderColor:borderColor}}>
                  <div className="Settings-Settings"  style={{borderColor:borderColor}}></div>
                  <div className="Settings-IO">
                    <div className="Row">
                      <button className="Settings-export">[export]</button>
                    </div>
                    <div className="Row">
                      {(() => {
                        switch (this.state.fileSaved) {
                          case true:return (<button className="Settings-saveFile disabled">file saved</button>); break;
                          case false:return (<button className="Settings-saveFile" onClick={()=>{this._saveScript()}}>Save file</button>);break;

                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="Layout-main">
                {
                  !this.state.file &&

                  <div className="Whole-Script">
                    <WelcomeActivity scripto={this.state.scripto} onFileSaved={(b) => this._changeSavedState(b)} onFileCreated={(f, scripto) => this._newFileCreated(f, scripto)} />
                  </div>
                }
                {
                  this.state.activity==="write" && this.state.file &&

                  <div className="Whole-Script">
                    <ScriptActivity scripto={this.state.scripto} onFileSaved={(b) => this._changeSavedState(b)} />
                  </div>
                }

                {
                  this.state.activity==='control' && this.state.file &&

                  <div className="Whole-Script">
                    <ControlActivity scripto={this.state.scripto} onFileSaved={(b) => this._changeSavedState(b)} />
                  </div>
                }
              </div>
            </div>
          </div>
      </div>
    );
  }
}

class App extends Component {
    render() {
      return (
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
    }
}

export default App;
