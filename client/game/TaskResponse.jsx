import React from "react";
import Location from "./Location";
import SocialExposure from "./SocialExposure.jsx";

const ROWS = 10;

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { game, player } = this.props;
    this.otherPlayers = _.reject(game.players, (p) => p._id === player._id);
    this.revealed = new Set(player.get("revealed"));
    this.receiving = new Set(player.get("receiving"));

    this.state = {
      selected: new Set(),
      hovered: new Set(),
    };
  }

  handleSend = (recipient) => {
    const { game, player } = this.props;
    const sending = player.get("sending");

    let message;
    let selected = this.state.selected;
    if (sending[recipient]) {
      message = sending[recipient];
      message.squares = Array.from(new Set([...message.squares, ...selected]));
    } else {
      message = {
        from: player._id,
        to: recipient,
        squares: [...selected],
      };
    }
    sending[recipient] = message;
    player.set("sending", sending);
  };

  handleRemove = (recipient) => {
    const { game, player } = this.props;
    const sending = player.get("sending");

    if (sending[recipient]) {
      let squares = sending[recipient]["squares"];
      console.log(squares);
      squares = _.reject(squares, (location) =>
        this.state.selected.has(location)
      );
      sending[recipient]["squares"] = squares;
      player.set("sending", sending);
    }
  };

  allowAdd = (recipient) => {
    const { player } = this.props;
    const sending = player.get("sending");
    if (!sending[recipient]) {
      return false;
    }
    let sendingSet = new Set(sending[recipient]["squares"]);
    if (
      [...this.state.selected].some((location) => !sendingSet.has(location))
    ) {
      return true;
    }
    return false;
  };

  allowRemove = (recipient) => {
    const { player } = this.props;
    const sending = player.get("sending");
    if (!sending[recipient]) {
      return false;
    }
    let sendingSet = new Set(sending[recipient]["squares"]);
    if (
      [...this.state.selected].every((location) => sendingSet.has(location))
    ) {
      return true;
    }
    return false;
  };

  handleCancelSend = (recipient) => {
    const { player } = this.props;
    const sending = player.get("sending");
    if (sending[recipient]) {
      delete sending[recipient];
      player.set("sending", sending);
      this.setState({ hovered: new Set() });
    }
  };

  handlePlayerSelectHover = (recipient) => {
    const { player } = this.props;
    const sending = player.get("sending");
    if (sending[recipient]) {
      this.setState({ hovered: new Set(sending[recipient]["squares"]) });
    }
  };

  handleHoverEnd = () => {
    this.setState({ hovered: new Set() });
  };

  allowSelect = (location) => {
    const { stage } = this.props;
    if (stage.name === "dig") {
      return true;
    } else if (stage.name === "discussion") {
      return this.revealed.has(location);
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

  handleDigSelect = (location) => {
    this.setState({ selected: location });
  };

  renderMap = (handleSquareClick) => {
    const { game, player, stage, round } = this.props;
    const world = round.get("world");

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
                this.revealed.has(locationIndex) ||
                this.receiving.has(locationIndex);

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
                  hovered={this.state.hovered.has(locationIndex)}
                  mine={location["mine"]}
                  handleSelect={handleSquareClick}
                  terrain={location["terrain"]}
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

    const sending = player.get("sending");
    const hasSelection = this.state.selected.size !== 0;
    const playerSelect = this.otherPlayers.map((player) => {
      let sendButton = hasSelection ? (
        <button
          className="send-btn"
          onClick={() => this.handleSend(player._id)}
        >
          Send selected squares
        </button>
      ) : (
        <button
          className="send-btn send-btn-disabled"
          aria-disabled="true"
          disabled
        >
          Send selected squares
        </button>
      );

      let canAdd = hasSelection && this.allowAdd();
      let addButton = canAdd ? (
        <button
          className="send-btn"
          onClick={() => this.handleSend(player._id)}
        >
          Add selected squares
        </button>
      ) : (
        <button
          className="send-btn send-btn-disabled"
          aria-disabled="true"
          disabled
        >
          Add selected squares
        </button>
      );

      let canRemove = hasSelection && this.allowRemove();
      let removeButton = canRemove ? (
        <button
          className="send-btn"
          onClick={() => this.handleRemove(player._id)}
        >
          Remove selected squares
        </button>
      ) : (
        <button
          className="send-btn send-btn-disabled"
          aria-disabled="true"
          disabled
        >
          Remove selected squares
        </button>
      );

      return (
        <div
          key={player._id}
          className="player-select-player"
          onMouseOver={() => this.handlePlayerSelectHover(player._id)}
          onMouseOut={() => this.handleHoverEnd()}
        >
          <img src={player.get("avatar")} className="player-select-avatar" />
          {player.id}
          {sending[player._id] ? (
            <div>
              {addButton}
              {removeButton}
              <button onClick={() => this.handleCancelSend(player._id)}>
                Cancel message
              </button>
            </div>
          ) : (
            sendButton
          )}
        </div>
      );
    });

    const discussion = (
      <div>
        <div className="discussion-select">
          {this.renderMap(this.toggleDiscussionSelect)}
          <div className="player-select">{playerSelect}</div>
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
