import React, { Component } from 'react';
import '../App.css';
import './Tree.css';

export default class TreeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: this.props.items,
      drawerState:{}
    }
  }
  componentWillMount() {

  }

  changeDrawerState(it) {
    console.log('changing drawer state');
    console.log(it);
    console.log(this.state.drawerState, this.state.drawerState[it]);
    var newdr = this.state.drawerState;
    if (this.state.drawerState[it]) {
      newdr[it] = false;
    } else {
      newdr[it] = true
    }
    this.setState({drawerState:newdr})
  }

  render() {
    var children = this.state.tree.subitems.map((item) => {
        if (item.subitems) {
          var subchildren = item.subitems.map((subitem) => {
            return (
              <div className="TreeView-SubItem-Label">
                {subitem.label}
              </div>
            )
          })
        }
      console.log("this is the state ",this.state.drawerState[item.id]);
      if (this.state.drawerState[item.id]===true) {
        var ClassName = "TreeView-Drawer "+true;
      } else if (this.state.drawerState[item.id]===false) {
        var ClassName = "TreeView-Drawer "+false;
      } else {
        var ClassName = "TreeView-Drawer "+false;
      }
      return (
          <div className={ClassName}>
            <a className="TreeView-Item-Label" onClick={()=>this.changeDrawerState(item.id)}>
              {item.label}
            </a>
            {subchildren}
          </div>
      )
    })
    return (
      <div className="TreeView-Layout">
        <div className="TreeView-Label">
          {this.state.tree.label}
        </div>
        {children}
      </div>
    )
  }
}
