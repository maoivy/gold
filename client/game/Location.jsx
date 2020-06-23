import React from "react";

export default class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let className = "location";
    if (this.props.revealed) {
      className += " location-revealed";
    } else {
      className += " location-hidden";
    }

    let content = "";
    if (this.props.revealed && this.props.mine) {
      content = "G";
    }

    return <div className={className}>{content}</div>;
  }
}
