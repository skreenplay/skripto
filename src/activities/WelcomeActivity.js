import React, { Component } from 'react';
const fs = window.require('fs');
const {ipcRenderer} = window.require('electron');
const pathlib = window.require('path');
var scripto = require('../lib/scriptosenso');


export default class WelcomeActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newfilePath:null,
      newfileName:null,
    }

    ipcRenderer.on('newfile-choose-reply', (event, arg) => {
      this.setState({newfilePath:arg[0]})
    })
  }

  /*
      CREATE NEW SCRIPTO FILE
  */

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
      this.props.onFileCreated(wholepath.toString(), sko)
      this.setState({file:wholepath.toString(), scripto: sko, activity:'control'});
      fs.writeFile(wholepath, "", function(err){
        if (err) {
          return console.log(err);
        }
      });
    }
  }

  /*
    OPEN NEW SKRIPTO FILE
  */

  /* SEND EVENT TO ELECTRON TO CHOOSE FILE TO OPEN*/
  _openScriptChooseFile(){
    ipcRenderer.send('openfile-choose', null)
  }

  render() {
    if (this.state.newfileName && this.state.newfilePath) {
      var canCreate = <button className="CreateFile-save" onClick={()=> {this._createScriptSaveFile()}}>Create file</button>
    } else {
      canCreate = <button className="CreateFile-save disabled">Create file</button>
    }
    return (
      <div className="CreateFile-Layout" >
        <div className="CreateFile-Container" style={{borderColor: this.props.style.borderColor}}>
            <div className="CreateFile-Row Header" style={{borderColor: this.props.style.borderColor}}>
              <div className="CreateFile-Column Title" style={{borderColor: this.props.style.borderColor}}>
                <h2 className="CreateFile-HeaderTitle">
                  Welcome to Skripto
                </h2>
              </div>
            </div>
            <div className="CreateFile-Row" style={{borderColor: this.props.style.borderColor}}>
              <div className="CreateFile-Column">
                <h3 className="CreateFile-title" style={{borderColor: this.props.style.borderColor}}>
                  Create new Project
                </h3>
              </div>
              <div className="CreateFile-Column" >

                  { this.state.newfilePath &&
                    <div>
                      <p className="CreateFile-filePath">{this.state.newfilePath}</p>
                      <button className="CreateFile-fileButton" onClick={()=>this._createScriptChooseFileName()}>1. Choose another folder</button>
                    </div>
                  }
                  { !this.state.newfilePath &&
                    <div>
                      <button className="CreateFile-fileButton" onClick={()=>this._createScriptChooseFileName()}>1. Choose a folder</button>
                    </div>
                  }
                <input className="CreateFile-filenameInput" onChange={(e)=>this._createScriptChangeTitle(e)} placeholder="2. What's your project's name?" />

                {canCreate}
              </div>
            </div>
            <div className="CreateFile-Row Open" style={{borderColor: this.props.style.borderColor}}>
              <div className="CreateFile-Column" >
                <h3 className="CreateFile-title" style={{borderColor: this.props.style.borderColor}}>
                  Open Project
                </h3>
              </div>
              <div className="CreateFile-Column">
                <button className="CreateFile-openFile" onClick={()=>this._openScriptChooseFile()}>Open file</button>
              </div>

            </div>
        </div>
      </div>
    )

  }
}
