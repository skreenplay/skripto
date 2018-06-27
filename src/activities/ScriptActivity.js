import React, { Component } from 'react';
import TextareaAutosize from 'react-autosize-textarea';
const {remote, ipcRenderer, dialog} = window.require('electron');


export default class ScriptActivity extends Component {
  constructor(props) {
    super(props);
    /* properties :
      - scripto
      - onFileSaved
    */

    this.state = {
      focusItem:null,
    }

    this.focusItem = null;

    this.focusItemRef = element => {
      this.focusItem = element;
    };

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
      this.props.scripto.addScriptItem(item.id, {type:item.type,content:'', id:item.id+1});
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
  render() {

    if (this.props.scripto) {

      var scriptMetadata = this.props.scripto.getMetaData();
      var scriptContent = this.props.scripto.getScript().map((item) => {
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

    return (
      <div className="Whole-Script">
        {scriptContent}
      </div>
    )
  }
}
