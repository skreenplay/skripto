import React, { Component } from 'react';
import {HashRouter, Route, Link } from "react-router-dom";
import * as qs from 'query-string';
import TextareaAutosize from 'react-autosize-textarea';
import './App.css';
import './scripto.css';

import {Placeholder} from './components/basic';


var scripto = require('./lib/scriptosenso');
const fs = window.require('fs');
const {remote, ipcRenderer, dialog} = window.require('electron');
const pathlib = window.require('path');


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      darkMode:false,
      file:null,
      newfilePath:null,
      newfileName:null,
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

    ipcRenderer.on('switch-darkmode', (event, arg) => {
      console.log('o');
      if (this.state.darkMode) {
        this.setState({darkMode:false})
      } else {
        this.setState({darkMode:true})
      }
    })

    ipcRenderer.on('file-save', (event, arg) => {
      this._saveScript();
    })
    ipcRenderer.on('newfile-choose-reply', (event, arg) => {
      this.setState({newfilePath:arg[0]})
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

    this._onScriptUpdate = this._onScriptUpdate.bind(this);
    this._saveScript = this._saveScript.bind(this);
    this._catchItemKeys = this._catchItemKeys.bind(this);
    this._createScriptChooseFileName = this._createScriptChooseFileName.bind(this);
  }

  onLightMode(e) {
    console.warn(e.currentTarget.checked);
    this.setState({darkMode:e.currentTarget.checked})
  }

  componentWillMount() {
    /* Get file input, if it exists*/
    if (qs.parse(this.props.location.search)) {
      var file = qs.parse(this.props.location.search).file;
      this.setState({file:file})
    } else {
      console.log("no file");
    }
  }

  async componentDidMount(e) {
    /* Load file, if it exists*/
    var scobj = new scripto.Skripto();
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

  componentDidUpdate() {
    if (this.focusItem) {
      if (this.focusItem.textarea) {
        console.log('updating focus')
        this.focusItem.textarea.focus()
      } else {
        this.focusItem.focus()
      }
    }
  }

  /* CATCH KEYBOARD BEFORE UPDATING - ADD/REMOVE LINE */
  _catchItemKeys(e, item) {

    if (this.state.fileSaved) {
      this.setState({fileSaved:false})
    }

    var nextItemType = null;
    /*TODO : set specific item type for new item*/

    if (e.key === 'Tab' || e.key==='Enter'){
      /* CREATE NEW LINE */
      e.preventDefault();
      this.state.scripto.updateScriptItem(item);
      this.state.scripto.addScriptItem(item.id, {type:item.type,content:'', id:item.id+1});
      this.setState({scriptData:this.state.scripto.getScript(), focusItem:item.id+1});
      this._saveScript();
    } else if (e.key==='Backspace' && item.content===""){
      /* REMOVE CURRENT LINE */
      this.state.scripto.removeScriptItem(item);
      this.setState({scriptData:this.state.scripto.getScript(), focusItem:item.id-1});
      this._saveScript();
    }
  }
  /* UPDATE SCRIPT */
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

  /* SEND EVENT TO ELECTRON TO CHOOSE FILE*/
  _createScriptChooseFileName(){
      ipcRenderer.send('newfile-choose', null)
  }
  /* SET FILE NAME */
  _createScriptChangeTitle(e) {
    this.setState({newfileName:e.target.value})
  }
  /* SAVE FIRST INSTANCE OF FILE - NOTHING IN IT BUT IT'S CREATED*/
  _createScriptSaveFile(){
    if (this.state.newfilePath && this.state.newfileName){
      /* TODO : maybe replace spaces in filename? or prevent this in input tag*/
      var wholepath = pathlib.join(this.state.newfilePath, this.state.newfileName.toString()+'.skripto');
      var sko = new scripto.Skripto();
      sko.loadSkeletonData();
      var baseScriptData = [
        {type:'§S', content:"", id:0}
      ]
      sko.setScript(baseScriptData);
      this.setState({file:wholepath.toString(), scripto: sko , scriptData:baseScriptData});
      fs.writeFile(wholepath, "", function(err){
        if (err) {
          return console.log(err);
        }
      });
    }
  }
  /* SEND EVENT TO ELECTRON TO CHOOSE FILE TO OPEN*/
  _openScriptChooseFile(){
    ipcRenderer.send('openfile-choose', null)
  }

  render() {
    if (this.state.darkMode) {
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

    return (

      <div className="App">
          <header className="App-header" style={{backgroundColor:headerColor, borderColor:borderColor}}>
            <div className="Layout-flex">
              <div className="Layout-left" style={{borderColor:borderColor}}></div>
              <div className="Layout-main">
                <p className="App-title">Skripto - {this.state.scripto && scriptMetadata.title}</p>
                <p className="Script-Right-Label">Dark</p>

                <label className="switch">
                  <input type="checkbox" onChange={(e) => this.onLightMode(e) } checked={this.state.darkMode}/>
                  <span className="slider round"></span>
                </label>
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
                <div className="Whole-Script">
                  {scriptContent}

                  {
                    !scriptContent && this.state.file &&

                    <Placeholder />

                  }

                  {
                    !scriptContent && !this.state.file &&

                    <div className="CreateFile-Layout">
                      <div className="CreateFile-Container">
                        <h2>
                          Create new project
                        </h2>
                        <button onClick={()=>this._createScriptChooseFileName()}>file directory</button>
                        <input onChange={(e)=>this._createScriptChangeTitle(e)} />
                        <button onClick={()=>this._createScriptSaveFile()}>Save file</button>
                        <button onClick={()=>this._openScriptChooseFile()}>Open file</button>

                      </div>
                    </div>

                  }
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
