import React from "react";
import Location from "./Location";
import SocialExposure from "./SocialExposure.jsx";

const ROWS = 10;

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { game, player } = this.props;
    this.otherPlayers = _.reject(game.players, (p) => p._id === player._id);

    this.state = {
      player: this.otherPlayers[0]._id,
      selected: new Set(),
    };
  }

  handleRowChange = (value) => {
    this.setState({ row: value });
  };

  handleColChange = (value) => {
    this.setState({ col: value });
  };

  handleDig = (event) => {
    event.preventDefault();
    if (this.state.selected !== new Set()) {
      const { player } = this.props;
      player.set("location", this.state.selected);
      player.stage.submit();
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.player.stage.submit();
  };

  handleSend = (event) => {
    event.preventDefault();
    const { game, player } = this.props;
    const sending = { ...player.get("sending") };
    if (
      !this.validateInput(this.state.row) ||
      !this.validateInput(this.state.col)
    ) {
      this.setState({ message: "That's not a valid location!" });
    } else if (!this.state.player) {
      this.setState({ message: "Select a player." });
    } else {
      let message;
      let index = parseInt(this.state.row) * ROWS + parseInt(this.state.col);
      if (sending[this.state.player]) {
        message = sending[this.state.player];
        message.squares.push(index);
      } else {
        message = {
          from: player._id,
          to: this.state.player,
          squares: [index],
        };
      }
      sending[this.state.player] = message;
      player.set("sending", sending);
      this.setState({ message: "Your message was sent!" });
    }
  };

  toggleDiscussionSelect = (location) => {
    let selected = this.state.selected;
    if (selected.has(location)) {
      selected.delete(location);
    } else {
      selected.add(location);
    }
    this.setState({ selected });
  };

  handleDigSelect = (location) => {
    this.setState({ selected: location });
  };

  allowSelect = (location) => {
    const { stage, player } = this.props;
    if (stage.name === "dig") {
      return true;
    } else if (stage.name === "discussion") {
      const revealed = new Set(player.get("revealed"));
      return revealed.has(location);
    }
  };

  renderMap = (handleSquareClick) => {
    const { game, player, stage, round } = this.props;
    const world = round.get("world");
    const revealed = new Set(player.get("revealed"));
    const receiving = new Set(player.get("receiving"));

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
              let shown =
                revealed.has(locationIndex) || receiving.has(locationIndex);

              let selected = false;
              if (stage.name === "discussion") {
                selected = this.state.selected.has(locationIndex);
              } else if (stage.name === "dig") {
                selected = this.state.selected === locationIndex;
              }

              return (
                <Location
                  key={`location${locationIndex}`}
                  location={locationIndex}
                  revealed={shown}
                  selectable={this.allowSelect(locationIndex)}
                  selected={selected}
                  mine={location["mine"]}
                  handleSelect={handleSquareClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
    return worldMap;
  };

  renderSubmitted() {
    return (
      <div className="task-response">
        <div className="response-submitted">
          <h5>Waiting on other players...</h5>
          Please wait until all players are ready.
        </div>
      </div>
    );
  }

  render() {
    const { game, player, stage, round } = this.props;

    if (player.stage.submitted) {
      return this.renderSubmitted();
    }

    const playerSelect = this.otherPlayers.map((player) => (
      <p key={player._id}>{player.id}</p>
    ));

    const discussion = (
      <div>
        <div className="discussion-select">
          {this.renderMap(this.toggleDiscussionSelect)}
          {this.state.selected.size !== 0 && playerSelect}
        </div>
        <button onClick={() => this.setState({ selected: new Set() })}>
          Reset selection
        </button>
        <button onClick={this.handleSubmit}>Finish</button>
      </div>
    );

    const dig = (
      <div>
        {this.renderMap(this.handleDigSelect)}
        <button onClick={this.handleDig}>Finish</button>
      </div>
    );

    const results = (
      <div>
        <form onSubmit={this.handleSubmit}>
          <button type="submit">Next</button>
        </form>
      </div>
    );

    return (
      <div className="task-response">
        {stage.name === "discussion" && discussion}
        {stage.name === "dig" && dig}
        {stage.name === "results" && results}
      </div>
    );
  }
}
