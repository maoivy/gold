import React from "react";

import Location from "./Location";

const ROWS = 10;

export default class TaskStimulus extends React.Component {
  render() {
    const { round, stage, player } = this.props;

    const world = round.get("world");

    const messages = player.get("messages");
    const discussion = (
      <>
        <p>Here are the squares we revealed to you.</p>
      </>
    );

    const dig = <>hello</>;

    const digLocation = player.get("location");
    const mineChoices = round.get("mineChoices");
    let results = null;
    if (stage.name === "results") {
      if (digLocation) {
        let foundMine = false;
        let otherPlayers = null;
        let totalGold = null;
        let goldReceived = null;
        if (mineChoices[digLocation]) {
          foundMine = true;
          otherPlayers = mineChoices[digLocation]["players"].length - 1;
          totalGold = mineChoices[digLocation]["gold"];
          goldReceived = mineChoices[digLocation]["distributed"];
        }
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
                  let locationIndex = location["location"];

                  return (
                    <Location
                      key={`location${locationIndex}`}
                      location={locationIndex}
                      revealed={true}
                      selectable={false}
                      selected={locationIndex === digLocation}
                      mine={location["mine"]}
                      handleSelect={null}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
        results = (
          <>
            <p>You chose to dig at at the location shown.</p>
            {worldMap}
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
        results = <p>You didn't dig anywhere!</p>;
      }
    }

    return (
      <div className="task-stimulus">
        {stage.name === "discussion" && discussion}
        {stage.name === "dig" && dig}
        {stage.name === "results" && results}
      </div>
    );
  }
}
