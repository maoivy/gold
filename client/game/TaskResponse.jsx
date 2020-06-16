import React from "react";

export class Location extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let className = "location";
    if (this.props.dug) {
      className += " location-revealed";
    } else {
      className += " location-hidden";
    }

    let content = "";
    if (this.props.dug && this.props.mine) {
      content = "G";
    }

    return <div className={className}>{content}</div>;
  }
}

export default class TaskResponse extends React.Component {
  constructor(props) {
    super(props);
    const { stage } = this.props;
    this.state = {
      row: null,
      column: null,
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

  handleRowChange = (value) => {
    this.setState({ row: value });
  };

  handleColChange = (value) => {
    this.setState({ column: value });
  };

  handleDig = (event) => {
    event.preventDefault();
    const { stage, player } = this.props;
    const old_score = player.get("score");
    if (
      this.validateInput(this.state.row) &&
      this.validateInput(this.state.column)
    ) {
      const updatedWorld = this.state.world;
      updatedWorld[this.state.row][this.state.column]["dug"] = true;
      this.setState({ world: updatedWorld });
      if (
        parseInt(this.state.row) === stage.get("mineRow") &&
        parseInt(this.state.column) === stage.get("mineCol")
      ) {
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

    let digFeedback = "";
    if (this.state.gold === true) {
      digFeedback = "You found gold!";
    } else if (this.state.gold === false) {
      digFeedback = "There's no gold here.";
    }

    return (
      <div className="task-response">
        <div className="world">
          {this.state.world.map((row, k) => (
            <div key={k} className="row">
              {row.map((location) => (
                <Location
                  key={location["key"]}
                  dug={location["dug"]}
                  mine={location["mine"]}
                />
              ))}
            </div>
          ))}
        </div>
        <form onSubmit={this.handleSubmit}>
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
          <button onClick={(event) => this.handleDig(event)}>Dig</button>
          <button type="submit">Finish</button>
        </form>
        {digFeedback}
        {this.state.message}
      </div>
    );
  }
}
