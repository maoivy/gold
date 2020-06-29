import React from "react";

export default class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
    };
  }

  // toggleSelect = () => {
  //   this.props.handleSelect(this.props.location);
  //   this.setState((prevState) => ({
  //     selected: !prevState.selected,
  //   }));
  // };

  handleSelect = () => {
    if (this.props.selectable) {
      this.props.handleSelect(this.props.location);
    }
  };

  render() {
    let className = "location";
    if (this.props.revealed) {
      className += " location-revealed";
    } else {
      className += " location-hidden";
    }

    if (this.props.hovered) {
      className += " location-hovered";
    }

    if (this.props.selectable) {
      className += " location-selectable";
    }

    if (this.props.selected) {
      className += " location-selected";
    }

    let content = "";
    if (this.props.revealed) {
      content = <img src={this.props.terrain} className="location-terrain" />;
    }

    return (
      <div className={className} onClick={() => this.handleSelect()}>
        {content}
      </div>
    );
  }
}
