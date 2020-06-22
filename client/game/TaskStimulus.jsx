import React from "react";

export default class TaskStimulus extends React.Component {
  render() {
    const { round, stage, player } = this.props;

    let mineLocation = "The mine's location is unknown.";
    if (player.get("chosen") || player.get("knows")) {
      mineLocation = `The mine is at row ${round.get(
        "mineRow"
      )}, column ${round.get("mineCol")}.`;
    }

    const discussion = <p>{mineLocation}</p>;
    const dig = <p>dig</p>;
    const reveal = <p>reveal</p>;

    return (
      <div className="task-stimulus">
        {stage.name === "discussion" && discussion}
        {stage.name === "dig" && dig}
        {stage.name === "reveal" && reveal}
      </div>
    );
  }
}
