import React from "react";

import Location from "./Location";

const ROWS = 10;

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

    const location = player.get("location");
    const mineChoices = round.get("mineChoices");

    const discussion = <>{worldMap}</>;

    const dig = <>{worldMap}</>;

    let reveal = null;
    if (stage.name === "reveal") {
      if (location) {
        let foundMine = false;
        let locationIndex = location.row * ROWS + location.col;
        let otherPlayers = null;
        let totalGold = null;
        if (mineChoices[locationIndex]) {
          foundMine = true;
          otherPlayers = mineChoices[locationIndex]["players"].length - 1;
          totalGold = mineChoices[locationIndex]["gold"];
        }
        reveal = (
          <>
            <p>
              You chose to dig at row {location.row}, column {location.col}.
            </p>
            {foundMine ? (
              <p>
                You found a mine! There was {totalGold} total gold at the mine,
                and there were {otherPlayers} other players also digging at the
                same mine.
              </p>
            ) : (
              <p>There's no mine here, so your score stays the same.</p>
            )}
          </>
        );
      } else {
        reveal = <p>You didn't dig anywhere!</p>;
      }
    }

    return (
      <div className="task-stimulus">
        {stage.name === "discussion" && discussion}
        {stage.name === "dig" && dig}
        {stage.name === "reveal" && reveal}
      </div>
    );
  }
}
