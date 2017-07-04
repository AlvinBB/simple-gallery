require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imageDatas = require('../data/imageDatas.json');

//在原有的imageDatas单个对象上加上imgURL补全url
imageDatas = (function genImageURL(imageDatasArr){
  for(let i = 0; i < imageDatasArr.length;i++){
    let singleImageData = imageDatasArr[i];
    singleImageData.imgURL =
      require('../images/'+singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

let ImgFigure = React.createClass({
  render() {

    let styleObj = {};

    //如果props属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }

    return (
      <figure className="img-figure" style={styleObj}>
        <img
          src={this.props.data.imgURL}
          alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    )
  }
})

let Stage = React.createClass({
  Constant: {
    centerPos: {
      left: 0,
      right: 0
    },
    hPosRange: {  //水平方向取值范围
      leftSecX: [0,0],
      rightSecX: [0,0],
      y: [0,0]
    },
    vPosRange: {  //垂直方向取值范围
      x: [0,0],
      topY: [0,0]
    }
  },

  getInitialState() {
    return {
      imgsArrangeArr: [
        // {
        //   pos: {
        //     left: '0',
        //     top: '0'
        //   }
        // }
      ]
    }
  },

  componentDidMount() { //加载后为每张图片计算位置范围

    //首先拿到舞台尺寸
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);

    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH= Math.ceil(imgH / 2);

    this.Constant.centerPos = {   //计算中心图片的位置
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };

    //计算左侧右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    //计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = -halfImgW;
    this.Constant.vPosRange.x[1] = halfImgW;

    this.rearrange(0)
  },

  //取范围随机
  getRangeRandom(low,high) {
    return Math.ceil(Math.random() * (high - low) + low);
  },

  //重新布局所有图片
  rearrange(centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      hPosRange = Constant.hPosRange,
      vPosRange = Constant.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRightSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,

      imgsArrangeTopArr = [],
      topImgNum = Math.ceil(Math.random() * 2), //取一个或者不取

      topImgSpliceIndex = 0,

      imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

    //首先居中centerIndex的图片
    imgsArrangeCenterArr[0].pos = centerPos;

    //取出要布局上侧的图片状态信息
    topImgSpliceIndex = Math.ceil(
      Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(
      topImgSpliceIndex,topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach((value,index) => {  //这里imgsArrangeTopArr没有值时不会进入forEach，防止报错
      imgsArrangeTopArr[index].pos = {
        top: this.getRangeRandom(
          vPosRangeTopY[0],vPosRangeTopY[1]),
        left: this.getRangeRandom(
          vPosRangeX[0],vPosRangeX[1])
      }
    });

    //布局左右两侧的图片
    for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
      let hPosRangeLORX = null;

      //前半部分布局左边，右半部分布局右边
      if(i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i].pos = {
        top: this.getRangeRandom(hPosRangeY[0],
          hPosRangeY[1]),
        left: this.getRangeRandom(hPosRangeLORX[0],
          hPosRangeLORX[1])
      }
    }

    //处理后再把处理过的上侧和中间区域图片对象塞回数组（注意顺序）
    if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgsArrangeArr.splice(topImgSpliceIndex, 0,
        imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex, 0,
      imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    });
  },

  render() {

    let styleObj = {
      height: document.documentElement.clientHeight  //获取浏览器高度，设置舞台高度与浏览器高度一致
    }

    let controllerUnits = [],
      imgFigures = [];

    imageDatas.forEach((value,index) => {

      if(!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          }
        }
      }

      imgFigures.push(
        <ImgFigure
          data={value}
          ref={'imgFigure'+index}
          arrange={this.state.imgsArrangeArr[index]}
          key={index}
        />
      );
    });

    return (
      <section className="stage" ref="stage" style={styleObj}>
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
})

class AppComponent extends React.Component {
  render() {
    return (
      <Stage/>
    )
  }
}

AppComponent.defaultProps = {

};

export default AppComponent;