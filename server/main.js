import Empirica from "meteor/empirica:core";
import "./bots.js";
import "./callbacks.js";

// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.
Empirica.gameInit((game) => {
  game.players.forEach((player, i) => {
    // player.set("avatar", `/avatars/jdenticon/${player._id}`);
    player.set("score", 0);
    if (i % 2 === 0) {
      player.set("chance", 0.05);
      player.set("network", "red");
      player.set("avatar", "red.png");
    } else {
      player.set("chance", 0.1);
      player.set("network", "blue");
      player.set("avatar", "blue.png");
    }
  });

  _.times(10, (i) => {
    const round = game.addRound();
    round.addStage({
      name: "discussion",
      displayName: "Discussion",
      durationInSeconds: 600,
    });
    round.addStage({
      name: "dig",
      displayName: "Dig",
      durationInSeconds: 60,
    });
    round.addStage({
      name: "reveal",
      displayName: "Reveal",
      durationInSeconds: 15,
    });
  });
});
