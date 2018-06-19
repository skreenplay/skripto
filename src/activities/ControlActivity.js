import React, { Component } from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import '../App.css';
const {remote, ipcRenderer, dialog} = window.require('electron');


export default class ControlActivity extends Component {
  constructor(props) {
    super(props);

    /* Properties
       - scripto object

    */
    this.state = {
      metadataTitle:'',
      metadataSynopsis:'',
      metadataAuthors:'',
      /* what should we add ? */
    }
  }

  componentDidMount() {
    if (this.props.scripto) {

      var meta = this.props.scripto.getMetaData();
      console.log(meta);
      this.setState({
        metadataTitle:meta.title || '',
        metadataSynopsis:meta.synopsis || '',
        metadataAuthors:meta.authors || '',
      })
    } else {
      console.log('no scripto');
    }
  }

  _updateTitle(e) {
    var newMetadata = {
      title:e.target.value,
      synopsis:this.state.metadataSynopsis,
      authors : this.state.metadataAuthor
    }
    this.props.scripto.setMetaData(newMetadata);
    this.setState({metadataTitle:e.target.value})
  }
  _updateSynopsis(e) {
    var newMetadata = {
      title:this.state.metadataTitle,
      synopsis:e.target.value,
      authors : this.state.metadataAuthor
    }
    this.props.scripto.setMetaData(newMetadata);
    this.setState({metadataSynopsis:e.target.value})
  }
  _updateAuthors(e) {
    var newMetadata = {
      title:this.state.metadataTitle,
      synopsis:this.state.metadataSynopsis,
      authors : e.target.value
    }
    this.props.scripto.setMetaData(newMetadata);
    this.setState({metadataAuthors:e.target.value})
  }
  render() {
    console.log('update', this.state.metadataTitle);
    return (
      <div>
        {
          !this.props.scripto &&

          <div>Missing the scripto object --> this is an internal error.</div>
        }
        <div className="Control-Metadata">
          <div className="Control-title">
            <h2>
              Change Metadata
            </h2>
          </div>
          <div className="Control-inputs">
            <div className="Control-Input">
              <p>Title</p>
              <input value={this.state.metadataTitle} placeholder="Title" onChange={(e) => this._updateTitle(e)}/>
            </div>
            <div className="Control-Input Synopsis">
              <p>Synopsis</p>
              <textarea value={this.state.metadataSynopsis} placeholder="Synopsis" onChange={(e) => this._updateSynopsis(e)} />
            </div>
            <div className="Control-Input">
              <p>Author</p>
              <input value={this.state.metadataAuthors} placeholder="Authors" onChange={(e) => this._updateAuthors(e)} />
            </div>
          </div>
        </div>
        <div className="Control-Global">

        </div>
      </div>
    )
  }
}
