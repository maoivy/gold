import React from "react";
import Location from "./Location";

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { round } = this.props;
    this.state = {
      row: null,
      column: null,
      gold: null,
      world: round.get("world"),
      message: null,
    };
  }

  componentDidUpdate = (prevProps) => {
    const prevPlayer = prevProps.player;
    const { player } = this.props;
    if (player.get("knows") === true && prevPlayer.get("knows") === false) {
      alert("Someone just told you the mine's location!");
    }
  };

  handleRowChange = (value) => {
    this.setState({ row: value });
  };

  handleColChange = (value) => {
    this.setState({ column: value });
  };

  handleDig = (event) => {
    event.preventDefault();
    const { round, player } = this.props;
    const old_score = player.get("score");
    if (
      this.validateInput(this.state.row) &&
      this.validateInput(this.state.column)
    ) {
      const updatedWorld = this.state.world;
      updatedWorld[this.state.row][this.state.column]["dug"] = true;
      this.setState({ world: updatedWorld });
      if (
        parseInt(this.state.row) === round.get("mineRow") &&
        parseInt(this.state.column) === round.get("mineCol")
      ) {
        this.setState({ gold: true, message: "You found gold!" });
        player.set("score", old_score + 1);
      } else {
        this.setState({ gold: false, message: "There's no gold here." });
      }
    } else {
      this.setState({ message: "That's not a valid location!" });
    }
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
    this.handleDig(event);
    this.handleSubmit(event);
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
    const { player, stage } = this.props;

    // If the player already submitted, don't show the slider or submit button
    if (player.stage.submitted) {
      return this.renderSubmitted();
    }

    const discussion = (
      <div>
        discussion
        <form onSubmit={this.handleSubmit}>
          <button type="submit">Finish</button>
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
        reveal{" "}
        <form onSubmit={this.handleSubmit}>
          <button type="submit">Finish</button>
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
