import React, { Component } from 'react';
import TextareaAutosize from 'react-autosize-textarea';
const {remote, ipcRenderer, dialog} = window.require('electron');

var skriptoLists = require('../lib/lists');


export default class ScriptActivity extends Component {
  constructor(props) {
    super(props);
    /* properties :
      - scripto
      - onFileSaved
    */

    this.state = {
      focusItem:null,
      currentItemType:null
    }

    this.focusItem = null;

    this.focusItemRef = element => {
      this.focusItem = element;
    };

    ipcRenderer.on('edit-itemtype', (event, type) => {
      if (this.state.focusItem!==null) {
        var item = this.props.scripto.getScriptItem(this.state.focusItem);
        item.type=type;
        this.props.scripto.updateScriptItem(item);
        this.setState({currentItemType:type})
      }
    })

    this._onScriptUpdate = this._onScriptUpdate.bind(this);
    this._catchItemKeys = this._catchItemKeys.bind(this);
  }
  /* CATCH KEYBOARD BEFORE UPDATING - ADD/REMOVE LINE */
  _catchItemKeys(e, item) {

    this.props.onFileSaved(false);

    var nextItemType = null;
    /*TODO : set specific item type for new item*/

    if (e.key === 'Tab' || e.key==='Enter'){
      /* CREATE NEW LINE */
      e.preventDefault();
      this.props.scripto.updateScriptItem(item);
      try {
        var nextType = skriptoLists.nextItem[item.type]
      } catch (e) {
        nextType = item.type
      }
      this.props.scripto.addScriptItem(item.id, {type:nextType,content:'', id:item.id+1});
      this.setState({focusItem:item.id+1});
    } else if (e.key==='Backspace' && item.content===""){
      /* REMOVE CURRENT LINE */
      e.preventDefault();
      this.props.scripto.removeScriptItem(item);
      this.setState({focusItem:item.id-1});
    }
  }
  /* UPDATE SCRIPT */
  _onScriptUpdate(e,item) {

    this.props.onFileSaved(false);

    var newitem = item;
    newitem.content = e.target.value;
    //this.refs[item.id].defaultValue=newitem.content;
    this.props.scripto.updateScriptItem(newitem);
    /*this.setState({scriptData:this.state.scripto.getScript()});*/
  }

  _updateFocusItem(e, i) {
    this.setState({focusItem:i.id})
  }
  _updateItemType(type) {
    console.log('l');
    if (this.state.focusItem!==null) {
      var item = this.props.scripto.getScriptItem(this.state.focusItem);
      item.type=type;
      this.props.scripto.updateScriptItem(item);
    }
    this.setState({currentItemType:type})
    this.props.onFileSaved(false);
  }

  componentDidUpdate() {
    if (this.focusItem) {
      if (this.focusItem.textarea) {
        this.focusItem.textarea.focus()
      } else {
        this.focusItem.focus()
      }
    }
  }
  render() {

    if (this.props.scripto) {

      var scriptMetadata = this.props.scripto.getMetaData();
      var scriptContent = this.props.scripto.getScriptObjects().map((item) => {
        if (item.id===this.state.focusItem) {
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
                          onFocus={(e)=>this._updateFocusItem(e,item)}
                          >
                          </TextareaAutosize>
              </div>
              <div className="Script-Right">
                {
                  item.id===this.state.focusItem &&

                  <ScriptOptions onOptionSelected={(a)=>this._updateItemType(a)}/>

                }
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
                      onKeyDown={(e)=>this._catchItemKeys(e, item)}
                      onFocus={(e)=>this._updateFocusItem(e,item)}
                      >
                      </input>
              </div>
              <div className="Script-Right">
                {
                  item.id===this.state.focusItem &&

                  <ScriptOptions onOptionSelected={(a)=>this._updateItemType(a)}/>
                }
              </div>
          </div>
          )
        }

      });
    } else {
      scriptContent = null;
    }

    return (
      <div className="Whole-Script">
        {scriptContent}
      </div>
    )
  }
}


class ScriptOptions extends Component {
  _onOptionSelected(e) {
    this.props.onOptionSelected(e)
  }
  render() {
    return (
      <div className="Script-Item-Options">
        <button className="Script-Item-Button" name="§S" onClick={() => {this._onOptionSelected('§S')}}>
          <span className="type">Scene</span><br/>
          <span className="shortcut">Cmd+1</span>
        </button>
        <button className="Script-Item-Button" name="§C" onClick={() => {this._onOptionSelected('§C')}}>
          <span className="type">Character</span><br/>
          <span className="shortcut">Cmd+2</span>
        </button>
        <button className="Script-Item-Button" name="§D" onClick={() => {this._onOptionSelected('§D')}}>
          <span className="type">Dialog</span><br/>
          <span className="shortcut">Cmd+3</span>
        </button>
        <button className="Script-Item-Button" name="§P" onClick={() => {this._onOptionSelected('§P')}}>
          <span className="type">Paragraph</span><br/>
          <span className="shortcut">Cmd+4</span>
        </button>
      </div>
    )
  }
}
