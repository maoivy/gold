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
        <div className="col-labels">
          <div className="location location-label"></div>
          {[...Array(ROWS).keys()].map((k) => (
            <div key={`col${k}`} className="location location-label">
              {k}
            </div>
          ))}
        </div>
        {world.map((row, k) => (
          <div key={k} className="row">
            <div key={`row${k}`} className="location location-label">
              {k}
            </div>
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

    const messages = player.get("messages");
    const discussion = (
      <>
        <p>Here are the squares we revealed to you.</p>
        {worldMap}
        {messages.length !== 0 ? (
          messages.map((message) => (
            <p>
              {message.author.id} wants to tell you that there is a mine at row{" "}
              {message.row} and column {message.col}.
            </p>
          ))
        ) : (
          <p>You haven't received any messages from other players yet.</p>
        )}
      </>
    );

    const dig = <>{worldMap}</>;

    const location = player.get("location");
    const mineChoices = round.get("mineChoices");
    let reveal = null;
    if (stage.name === "reveal") {
      if (location) {
        let foundMine = false;
        let locationIndex = location.row * ROWS + location.col;
        let otherPlayers = null;
        let totalGold = null;
        let goldReceived = null;
        if (mineChoices[locationIndex]) {
          foundMine = true;
          otherPlayers = mineChoices[locationIndex]["players"].length - 1;
          totalGold = mineChoices[locationIndex]["gold"];
          goldReceived = mineChoices[locationIndex]["distributed"];
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
                same mine, so you got {goldReceived} gold.
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
