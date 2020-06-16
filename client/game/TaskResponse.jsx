import React from "react";

export class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="location">{this.props.dug ? "o" : "x"}</div>;
  }
}

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { stage } = this.props;
    console.log(stage);
    this.state = {
      input: null,
      gold: null,
      world: stage.get("world"),
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

  handleChange = (value) => {
    this.setState({ input: value });
  };

  handleDig = (event) => {
    event.preventDefault();
    const { stage, player } = this.props;
    const old_score = player.get("score");
    if (this.validateInput(this.state.input)) {
      const updatedWorld = this.state.world;
      updatedWorld[this.state.input - 1]["dug"] = true;
      this.setState({ world: updatedWorld });
      if (parseInt(this.state.input) === stage.get("mine")) {
        this.setState({ gold: true });
        player.set("score", old_score + 1);
      } else {
        this.setState({ gold: false });
      }
    } else {
      this.setState({ message: "That's not a valid location!" });
    }
  };

  validateInput = (input) => {
    const inputInt = parseInt(input);
    if (!Number.isInteger(inputInt)) {
      return false;
    } else if (inputInt < 1 || inputInt > 20) {
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.player.stage.submit();
  };

  renderSubmitted() {
    return (
      <div className="task-response">
        <div className="response-submitted">
          <h5>Waiting on other players...</h5>
          Please wait until all players are ready
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

    let digFeedback = "";
    if (this.state.gold === true) {
      digFeedback = "You found gold!";
    } else if (this.state.gold === false) {
      digFeedback = "There's no gold here.";
    }

    return (
      <div className="task-response">
        <div className="world">
          {this.state.world.map((location, k) => (
            <Location key={k} dug={location["dug"]} />
          ))}
        </div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            onChange={(event) => this.handleChange(event.target.value)}
          />
          <button onClick={(event) => this.handleDig(event)}>Dig</button>
          <button type="submit">Finish</button>
        </form>
        {digFeedback}
        {this.state.message}
      </div>
    );
  }
}
