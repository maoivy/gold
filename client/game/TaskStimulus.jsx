import React from "react";

export default class TaskStimulus extends React.Component {
  render() {
    const { round, stage, player } = this.props;

    let mineLocation = "The mine's location is unknown.";
    if (player.get("chosen") || player.get("knows")) {
      mineLocation = `The mine is at ${stage.get("mine")}`;
    }

    return <div className="task-stimulus">{mineLocation}</div>;
  }
}
