import React from "react";
import Location from "./Location";

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { game, player } = this.props;
    this.otherPlayers = _.reject(game.players, (p) => p._id === player._id);

    this.state = {
      row: null,
      col: null,
      message: null,
      player: this.otherPlayers[0]._id,
      sent: new Set(),
    };
  }

  // componentDidUpdate = (prevProps) => {
  //   const prevPlayer = prevProps.player;
  //   const { player } = this.props;
  //   if (player.get("knows") === true && prevPlayer.get("knows") === false) {
  //     alert("Someone just told you the mine's location!");
  //   }
  // };

  handleRowChange = (value) => {
    this.setState({ row: value });
  };

  handleColChange = (value) => {
    this.setState({ col: value });
  };

  handleDig = (event) => {
    event.preventDefault();
    const { round, player } = this.props;

    player.set("location", {
      row: parseInt(this.state.row),
      col: parseInt(this.state.col),
    });
  };

  validateInput = (input) => {
    const inputInt = parseInt(input);
    if (!Number.isInteger(inputInt)) {
      return false;
    } else if (inputInt < 0 || inputInt > 19) {
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.player.stage.submit();
  };

  handleDigSubmit = (event) => {
    if (
      this.validateInput(this.state.row) &&
      this.validateInput(this.state.col)
    ) {
      this.handleDig(event);
      this.handleSubmit(event);
    } else {
      event.preventDefault();
      this.setState({ message: "That's not a valid location!" });
    }
  };

  handleSend = (event) => {
    event.preventDefault();
    if (
      !this.validateInput(this.state.row) ||
      !this.validateInput(this.state.col)
    ) {
      this.setState({ message: "That's not a valid location!" });
    } else if (!this.state.player) {
      this.setState({ message: "Select a player." });
    } else if (this.state.sent.has(this.state.player)) {
      this.setState({
        message: "You've already sent a message to this player.",
      });
    } else {
      const { game, player } = this.props;
      const message = {
        author: player,
        row: this.state.row,
        col: this.state.col,
        gold: true,
      };

      game.players.forEach((player) => {
        if (player._id === this.state.player) {
          let messages = player.get("messages");
          messages.push(message);
          player.set("messages", messages);
        }
      });
      this.setState((prevState) => ({
        message: "Your message was sent!",
        sent: prevState.sent.add(this.state.player),
      }));
    }
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
    const { game, player, stage } = this.props;

    if (player.stage.submitted) {
      return this.renderSubmitted();
    }

    const discussion = (
      <div>
        Send a message to the other players!
        <form>
          <div>
            Sending to:
            <select
              value={this.state.player}
              onChange={(event) =>
                this.setState({ player: event.target.value })
              }
            >
              {this.otherPlayers.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.id}
                </option>
              ))}
            </select>
          </div>
          Row:
          <input
            type="text"
            onChange={(event) => this.handleRowChange(event.target.value)}
          />
          Column:
          <input
            type="text"
            onChange={(event) => this.handleColChange(event.target.value)}
          />
          <button onClick={(event) => this.handleSend(event)}>Send</button>
          {this.state.message}
        </form>
      </div>
    );

    const dig = (
      <>
        <form onSubmit={this.handleDigSubmit}>
          Row:
          <input
            type="text"
            onChange={(event) => this.handleRowChange(event.target.value)}
          />
          Column:
          <input
            type="text"
            onChange={(event) => this.handleColChange(event.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        {this.state.message}
      </>
    );

    const reveal = (
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
        {stage.name === "reveal" && reveal}
      </div>
    );
  }
}
