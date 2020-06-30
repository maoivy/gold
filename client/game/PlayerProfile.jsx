import React from "react";

import Timer from "./Timer.jsx";

// import red from "../../public/red.png";
// import blue from "../../public/blue.png";

// const AVATAR_MAP = {
//   red: red,
//   blue: blue,
// };

export default class PlayerProfile extends React.Component {
  renderProfile() {
    const { player } = this.props;
    return (
      <div className="profile-score">
        <h3>Your Profile</h3>
        <img src={player.get("avatar")} className="profile-avatar" />
      </div>
    );
  }

  renderScore() {
    const { player } = this.props;
    return (
      <div className="profile-score">
        <h4>Total gold</h4>
        <span>${(player.get("score") || 0).toFixed(2)}</span>
      </div>
    );
  }

  render() {
    const { stage } = this.props;

    return (
      <aside className="player-profile">
        {this.renderProfile()}
        {this.renderScore()}
        <Timer stage={stage} />
      </aside>
    );
  }
}
