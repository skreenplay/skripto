import React, { Component } from 'react';
import { TextSimple } from './MindMapComponents';

const {ipcRenderer} = window.require('electron');

var sampleList = [
  {
    x:110,
    y:100,
    w:200,
    h:300,
    title:"Start",
    component: (
      <div>
        <ul>
          <li>
            <input type="text" />
          </li>
        </ul>
      </div>
    )
  },
  {
    x:800,
    y:130,
    w:200,
    h:300,
    title:"End",
    component: (
      <div>
        <ul>
          <li>
            <input type="text" />
          </li>
        </ul>
      </div>
    )
  }
]


function drawGrid(ctx, size, offset, unit, color){
  ctx.clearRect(0,0, size.width, size.height);
  var lineNumLeft = Math.floor(size.width/unit)+2;
  for (var i = 0; i < lineNumLeft; i++) {
    var position = i*unit;
    ctx.beginPath();
    ctx.lineWidth=0.8;
    ctx.moveTo(position+offset.x,0);
    ctx.lineTo(position+offset.x,size.height);
    ctx.strokeStyle=color;
    ctx.stroke();
  }
  var lineNumTop = Math.floor(size.height/unit)+2;
  for (var i = 0; i < lineNumTop; i++) {
    var position = i*unit;
    ctx.beginPath();
    ctx.lineWidth=0.8;
    ctx.moveTo(0,position+offset.y);
    ctx.lineTo(size.width,position+offset.y);
    ctx.strokeStyle=color;
    ctx.stroke();
  }
}

export class MindMapItem extends Component {
  constructor(props){
    super(props);
    this.state= {
      item:null,
      offset: {
        x:0,
        y:0
      }
    }
  }
  componentWillMount(){
    this.setState({item:this.props.item})
    document.addEventListener ('mouseup', e => this.mouseUp(e), true);
    document.addEventListener ('mousemove', e => this.mouseMove(e), true);
  }

  mouseMove(e) {
    if (this.state.dragItem) {

      var baseOffset = this.state.offset;
      if (e.movementX && e.movementY) {
        this.setState({
          offset: {
            x: baseOffset.x+ e.movementX,
            y: baseOffset.y+ e.movementY
          }
        })
      }
    }
    e.preventDefault ();
  }

  mouseDown() {
    this.setState({dragItem:true})
    this.props.itemDrag(true);
  }
  mouseUp() {
    if (this.state.dragItem===true) {
      var offset = this.state.offset;
      var newitem = this.state.item;
      newitem.x += offset.x;
      newitem.y+= offset.y;
      this.props.updateMindMapItem(newitem);
      this.setState({item:newitem, offset:{x:0, y:0}})
    }
    this.setState({dragItem:false})
    this.props.itemDrag(false);
  }

  render() {
    var itemStyle = {
      position:'absolute',
      backgroundColor:this.props.style.backgroundColor,
      top:this.state.item.y+this.props.position.y,
      left:this.state.item.x+this.props.position.x,
      width:this.state.item.w,
      height:this.state.item.h,
      transform:'translate('+this.state.offset.x+'px, '+this.state.offset.y+'px)'
    }
    return (
      <div style={itemStyle} className="MindMap-Item node">
        <div className="MindMap-Item-Header"  onMouseDown={()=>{this.mouseDown()}}>
          <span className="title">{this.props.item.title}</span>
          <button className="MindMap-Item-Header Button">

          </button>
        </div>
        <div className="MindMap-Item-Content">
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default class MindMapActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragState:false,
      itemDrag:false,
      itemMovement:{
        x:0,
        y:0
      },
      position: {
        x:0,
        y:0
      },
      offset: {
        x:0,
        y:0
      },
      unitInPixels:32,
      mindmap:null,
      items : null
    }

  }

  componentWillMount(){
    document.addEventListener ('scroll', e => this.onSpaceDrag(e, "scroll"), true);
  }

  componentDidMount(){

    /* Get Mind Map*/
    if (this.props.scripto) {

      var mindmap = this.props.scripto.getMindMap();
      var latestCount = 0;
      for (var i = 0; i < mindmap.items.length; i++) {
        if (typeof mindmap.items[i].id === "number") {
          latestCount = mindmap.items[i].id
        } else {
          mindmap.items[i].id = latestCount
        }
        latestCount+=1;
      }
      this.setState({mindmap: mindmap, items:mindmap.items})
    }

    /* Initialize the canvas */
    this.refs.canvas.width = this.refs.mindmapregion.clientWidth;
    this.refs.canvas.height = this.refs.mindmapregion.clientHeight;
    drawGrid(this.refs.canvas.getContext('2d'),
      {
        width:this.refs.canvas.width,
        height:this.refs.canvas.height
      },
      {
        x:this.state.offset.x,
        y:this.state.offset.y
      },
      this.state.unitInPixels,
      this.props.style.borderColor
    )
  }
  onMouseDown(e) {
    this.setState({dragState:true})
  }
  onMouseUp(e) {
    this.setState({dragState:false})
  }
  onSpaceDrag(e, From) {
    if (this.state.dragState===true && this.state.itemDrag===false) {

      /* set position */
      var pos = this.state.position;
      if (From==="mouse") {
        pos.x+=e.nativeEvent.movementX;
        pos.y+=e.nativeEvent.movementY;
      }
      if (From==="scroll"){
        console.log(e);
        pos.x+=0;
        pos.y+=0
      }
      this.setState({
        position:pos
      });
      /*set offset position for grid*/
      var offset = {
        x:pos.x,
        y:pos.y
      }
      if (offset.x>this.state.unitInPixels || offset.x<-this.state.unitInPixels) {
        var of = (Math.floor(offset.x/this.state.unitInPixels));
        offset.x = offset.x - of*this.state.unitInPixels;
      }
      if (offset.y>this.state.unitInPixels || offset.y<-this.state.unitInPixels) {
        var of2 = (Math.floor(offset.y/this.state.unitInPixels));
        offset.y = offset.y - of2*this.state.unitInPixels;
      }
      /* draw grid */
      var canvas = this.refs.canvas;
      var ctx = canvas.getContext('2d');
      /* Update grid */
      drawGrid(ctx,
        {
          width:canvas.width,
          height:canvas.height
        },
        {
          x:offset.x,
          y:offset.y
        },
        this.state.unitInPixels,
        this.props.style.borderColor
      )
    }
  }
  onItemDrag(v) {
    this.setState({itemDrag:v})
  }
  onItemDataChange(item, newdata) {
    var newmind = this.state.mindmap;
    for (var i = 0; i < newmind.items.length; i++) {
      if (newmind.items[i]===item.id) {
        var newitem = item;
        newitem.data = newdata
        newmind.items[i]=newitem
      }
    }
    this.setState({mindmap:newmind});
    this.props.scripto.setMindMap(newmind)
  }
  updateItem(item) {
    var newmind = this.state.mindmap;
    for (var i = 0; i < newmind.items.length; i++) {
      if (newmind.items[i]===item.id) {
        newmind.items[i]=item
      }
    }
    this.setState({mindmap:newmind});
    this.props.scripto.setMindMap(newmind)
  }

  render() {
    if (this.state.mindmap) {
      var Items = this.state.mindmap.items.map((i) => {
        var cuStyle = {
          position: "absolute",
          backgroundColor:this.props.style.backgroundColor,
        }
        if (i.type==="text-simple") {
          var component = <TextSimple data={i.data} onDataChange={(d)=>{this.onItemDataChange(i, d)}}/>
        } else {
          var component = null;
        }
        return (
          <MindMapItem
            item={i}
            position={this.state.position}
            style={{backgroundColor:this.props.style.backgroundColor}}
            updateMindMapItem={(item) => {this.updateItem(item)}}
            itemDrag={(v)=>{this.onItemDrag(v)}} >
            {component}
          </MindMapItem>
        )
      });
    } else {
      Items=null;
    }

    return (
      <div onMouseDown={(e)=>this.onMouseDown(e)} onMouseUp={(e)=>this.onMouseUp(e)} onMouseMove={(e) => {this.onSpaceDrag(e, "mouse")}} ref="mindmapregion" style={{position:"relative"}} className="MindMap-Layout">
        <canvas whidth="400" height="600" ref="canvas" style={{backgroundColor:this.props.style.backgroundColor}} className="MindMap-Canvas" >
        </canvas>
        <div className="MindMap-Overlay">
          <p>mindmap, {this.state.position.x}, {this.state.position.y}</p>
        </div>
        <div className="MindMap-Items">
          {Items}
        </div>
      </div>
    )
  }
}

var canvasStyle = {
  position:'absolute'
}
