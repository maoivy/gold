import React from "react";

import Location from "./Location";

export default class TaskStimulus extends React.Component {
  render() {
    const { round, stage, player } = this.props;

    const world = round.get("world");
    const revealed = new Set(
      player
        .get("revealed")
        .map((location) => location["row"] * 10 + location["col"])
    );

    const worldMap = (
      <div className="world">
        {world.map((row, k) => (
          <div key={k} className="row">
            {row.map((location) => {
              let coords = { row: location["row"], col: location["col"] };
              let sum = location["row"] * 10 + location["col"];

              return (
                <Location
                  key={sum}
                  revealed={revealed.has(sum)}
                  mine={location["mine"]}
                />
              );
            })}
          </div>
        ))}
      </div>
    );

    const discussion = <>{worldMap}</>;
    const dig = <>{worldMap}</>;
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
