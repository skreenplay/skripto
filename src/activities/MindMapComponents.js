import React, { Component } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

const {ipcRenderer} = window.require('electron');


export class TextSimple extends Component {
  constructor(props){
    super(props);
  }
  onDataChange(e) {
    var newdata = this.props.data;
    newdata.body = e.target.value;
    this.props.onDataChange(newdata)
  }
  render() {
    return (
      <textarea type="text" defaultValue={this.props.data.body} onChange={(e) => this.onDataChange(e)} className="Node-Text textarea" />
    )
  }
}
