import React, { Component } from 'react';
import {HashRouter, Route, Link } from "react-router-dom";
import * as qs from 'query-string';
import TextareaAutosize from 'react-autosize-textarea';
import './App.css';
import './scripto.css';

import {Placeholder} from './components/basic';


var scripto = require('./lib/scriptosenso');
const fs = window.require('fs');
const {remote, ipcRenderer} = window.require('electron');


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked:false,
      file:null,
      focusItem:null,
      layoutState:"write",
      fileSaved:true
    }

    this.oldItem = null;

    this.oldItemRef = element => {
      this.oldItem = element;
    };

    this.focusItem = null;

    this.focusItemRef = element => {
      this.focusItem = element;
    };

    ipcRenderer.on('file-save', (event, arg) => {
      this._saveScript();
    })

    this._onScriptUpdate = this._onScriptUpdate.bind(this);
    this._saveScript = this._saveScript.bind(this);
    this._catchItemKeys = this._catchItemKeys.bind(this);
    this._catchKeysDown = this._catchKeysDown.bind(this);
    this._catchKeysUp = this._catchKeysUp.bind(this);
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
        console.log(scobj);
        self.setState({scripto:scobj, scriptData:scrd})
      });
    }

  }

  _catchKeysDown(e) {
    console.log('s');
    if (e.key==="Meta") {
      this.setState({commandKey:true})
      console.log('l');
    }
  }
  _catchKeysUp(e) {
    if (e.key==="Meta") {
      this.setState({commandKey:false})
    }
  }

  _catchItemKeys(e, item) {
    if (this.state.fileSaved) {
      this.setState({fileSaved:false})
    }
    var newline = false;
    var removeline = false;
    var nextItemType = null;
    if (e.key === 'Tab'){
      newline = true;
    } else if (e.key==='Backspace' && item.content===""){
      console.log('removing');
      this.state.scripto.removeScriptItem(item);
      this.setState({scriptData:this.state.scripto.getScript(), focusItem:item.id-1});
      this._saveScript();
      removeline=true;
    } else if (e.key === "Enter") {
      if (item.type === "§S" || item.type === "§C" || item.type === "§I") {
        newline = true;
      }
    }

    if (newline) {
      console.log(item);
      this.state.scripto.updateScriptItem(item);
      this.state.scripto.addScriptItem(item.id, {type:item.type,content:'', id:item.id+1});
      this.setState({scriptData:this.state.scripto.getScript(), focusItem:item.id+1});
      this._saveScript();
      if (this.focusItemRef && this.focusItem) {
        console.log('focusing');
        if (this.focusItem.textarea) {
          this.focusItem.textarea.focus()
        } else {
          this.focusItem.focus()
        }
      }
    }
    if (removeline) {
      console.log('focusing 1');
      if (this.focusItemRef && this.focusItem) {
        console.log('focusing');
        if (this.focusItem.textarea) {
          this.focusItem.textarea.focus()
        } else {
          this.focusItem.focus()
        }
      }
    }
  }
  _onScriptUpdate(e,item) {
    if (this.state.fileSaved) {
      this.setState({fileSaved:false})
    }
    var newitem = item;
    newitem.content = e.target.value;
    //this.refs[item.id].defaultValue=newitem.content;
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
    this.state.scripto.loadData(sc);
    this.setState({fileSaved:true, scriptData:this.state.scripto.getScript()})
    console.log('saved');
  }

  render() {

    console.log('updating render');

    if (this.state.checked) {
      var headerColor = "#202020";
      var contentColor = "#252525";
      var borderColor = "#404040";
    } else {
      headerColor = "#E6DED2";
      contentColor = "#E1DAC9";
      borderColor = "#D3CDBD";
    }

    if (this.state.scripto) {

      var scriptMetadata = this.state.scripto.getMetaData();
      var scriptContent = this.state.scriptData.map((item) => {
        if (item.id===this.state.focusItem) {
          var reference = this.focusItemRef;
        } else if (item.id===this.state.focusItem-1) {
          var reference = this.oldItemRef;
        } else {
          reference = null;
        }
        if (item.type==="§P" || item.type==="§D"){
          return (
            <div className="Scripto-item-block" >
              {item.id}{item.type}
              <TextareaAutosize className={"scripto input "+item.type}
                        type="text"
                        name="Paragraph"
                        defaultValue={item.content}
                        key={item.id.toString()+item.content.replace(" ", "-")}
                        ref={reference}
                        onChange={(e)=>this._onScriptUpdate(e, item)}
                        onKeyDown={(e)=>this._catchItemKeys(e, item)}>
                        </TextareaAutosize>
            </div>
          )

        } else {
          return (
            <div>
            {item.id} {item.type}
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

    return (

      <div className="App">
          <header className="App-header" style={{backgroundColor:headerColor, borderColor:borderColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}></div>
              <div className="Layout-main">
                <p className="App-title">Skripto - {this.state.scripto && scriptMetadata.title}</p>
              </div>
            </div>
          </header>
          <div className="App-content" style={{backgroundColor:contentColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}>

                <div className="Global-layout" >
                  <div className="Global-layout-choicebox" style={{borderColor:borderColor}}>
                    <a className="Global-layout-choice info" ></a>
                    <a className="Global-layout-choice write" ></a>
                    <a className="Global-layout-choice info" ></a>
                  </div>
                  <div className="Global-layout-content">
                    {
                      this.state.layoutState==="write" && this.state.scripto &&

                      <div>
                        {scriptMetadata.title}

                      </div>
                    }
                  </div>
                </div>
              </div>
              <div className="Layout-main">
                <div className="Script-layout">
                  <div className="Script-main">
                      <div className="Script-Placeholder-box">
                        {scriptContent}

                        {
                          !scriptContent &&

                          <Placeholder />

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
                        <a className="Script-Right-Button Primary" onClick={()=>this._saveScript()}>
                          {saveState}
                        </a>
                    </div>
                  </div>
                </div>
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
