import Empirica from "meteor/empirica:core";

const fetch = require("node-fetch");

const ROWS = 10;
const COLS = 10;
const MAX_MINES = 10;
const MAX_FOREST = 20;
const MAX_MOUNTAIN = 30;
const MAX_GOLD = 10;
const REVEALED = 10;

// onGameStart is triggered opnce per game before the game starts, and before
// the first onRoundStart. It receives the game and list of all the players in
// the game.
Empirica.onGameStart((game) => {});

// onRoundStart is triggered before each round starts, and before onStageStart.
// It receives the same options as onGameStart, and the round that is starting.
Empirica.onRoundStart((game, round) => {
  // generate number of each terrain
  const numMines = Math.floor(Math.random() * (MAX_MINES - 1)) + 1;
  const numForest = Math.floor(Math.random() * (MAX_FOREST - 1)) + 1;
  const numMountain = Math.floor(Math.random() * (MAX_MOUNTAIN - 1)) + 1;

  // generate the map
  fetch(
    `http://flask-env.eba-85qkbak4.us-east-2.elasticbeanstalk.com/?total=${
      ROWS * COLS
    }&mines=${numMines}&forest=${numForest}&mountain=${numMountain}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const mineIndices = new Set(data["mines"]);
      const forestIndices = new Set(data["forest"]);
      const mountainIndices = new Set(data["mountain"]);
      const seaIndices = new Set(data["sea"]);
      // generate the world and set square properties
      let world = [];
      let mines = [];
      for (let i = 0; i < ROWS; i++) {
        let row = [];
        for (let j = 0; j < COLS; j++) {
          let location = i * ROWS + j;
          if (mineIndices.has(location)) {
            // if it's a mine, generate its gold
            let gold = Math.floor(Math.random() * (MAX_GOLD - 1)) + 1;
            mines.push({ location, gold });
            row.push({
              revealed: false,
              mine: true,
              location,
              terrain: "mine.png",
            });
          } else {
            let terrain = "";
            if (forestIndices.has(location)) {
              terrain = "forest.png";
            } else if (mountainIndices.has(location)) {
              terrain = "mountain.png";
            } else if (seaIndices.has(location)) {
              terrain = "sea.png";
            }
            row.push({
              revealed: false,
              mine: false,
              location,
              terrain: terrain,
            });
          }
        }
        world.push(row);
      }
      round.set("mines", mines);
      round.set("world", world);

      // reveal squares for each player
      const numNormal = ROWS * COLS - numMines;
      const normals = [...data["forest"], ...data["mountain"], ...data["sea"]];
      game.players.forEach((player) => {
        let revealed = new Set();
        for (let i = 0; i < REVEALED; i++) {
          let showMine = Math.floor(Math.random()) < player.get("chance");
          let minesRemaining = mines.some(
            (mine) => !revealed.has(mine.location)
          );

          if (showMine && minesRemaining) {
            let index = Math.floor(Math.random() * numMines);
            while (revealed.has(mines[index]["location"])) {
              index = Math.floor(Math.random() * numMines);
            }
            square = mines[index]["location"];
          } else {
            let index = Math.floor(Math.random() * numNormal);
            while (revealed.has(normals[index])) {
              index = Math.floor(Math.random() * numNormal);
            }
            square = normals[index];
          }
          revealed.add(square);
        }
        player.set("revealed", Array.from(revealed));
        // reset previous data for the player
        player.set("location", null);
        player.set("receiving", []);
        player.set("received", []);
        player.set("sending", new Object());
      });

      round.set("messages", []);
      round.set("mineChoices", null);
    });
});

// onStageStart is triggered before each stage starts.
// It receives the same options as onRoundStart, and the stage that is starting.
Empirica.onStageStart((game, round, stage) => {});

getGold = (gold, numPlayers) => {
  return gold / numPlayers;
};

// onStageEnd is triggered after each stage.
// It receives the same options as onRoundEnd, and the stage that just ended.
Empirica.onStageEnd((game, round, stage) => {
  if (stage.name === "discussion") {
    // after the discussion round, consolidate the players' messages and send them

    // initialize the dictionary of messages
    let messages = {};
    let squaresReceived = {};
    game.players.forEach((player) => {
      messages[player._id] = {};
      squaresReceived[player._id] = [];
    });

    // consolidate the messages
    game.players.forEach((player) => {
      let sending = player.get("sending");
      Object.values(sending).forEach((data) => {
        let { to, from, squares } = data;
        messages[to][from] = squares;
        squaresReceived[to].push(...squares);
      });
    });

    // send the messages and squares to their recipients
    game.players.forEach((player) => {
      player.set("received", squaresReceived[player._id]);
      player.set("receiving", messages[player._id]);
    });
    round.set("messages", messages);
  } else if (stage.name === "dig") {
    // after the dig round, consolidate the players' choices and distribute gold
    const mines = round.get("mines");

    // find how many players chose to dig at each mine
    const mineChoices = {};
    mines.forEach(
      (mine) =>
        (mineChoices[mine.location] = {
          players: [],
          gold: mine.gold,
          distributed: null,
        })
    );
    game.players.forEach((player, k) => {
      let location = player.get("location");
      if (location && mineChoices[location]) {
        mineChoices[location]["players"].push(k);
      }
    });

    // distribute gold accordingly
    Object.entries(mineChoices).forEach((entry) => {
      let index = entry[0];
      let data = entry[1];

      let players = data.players;
      let totalGold = data.gold;
      if (players.length !== 0) {
        let goldReceived = getGold(totalGold, players.length);
        mineChoices[index]["distributed"] = goldReceived;
        players.forEach((playerIndex) => {
          let currentScore = game.players[playerIndex].get("score");
          game.players[playerIndex].set("score", currentScore + goldReceived);
        });
      }
    });

    round.set("mineChoices", mineChoices);
  }
});

// onRoundEnd is triggered after each round.
// It receives the same options as onGameEnd, and the round that just ended.
Empirica.onRoundEnd((game, round) => {
  game.players.forEach((player) => {
    const value = player.round.get("value") || 0;
    const prevScore = player.get("score") || 0;
    player.set("score", prevScore + value);
  });
});

// onGameEnd is triggered when the game ends.
// It receives the same options as onGameStart.
Empirica.onGameEnd((game) => {});

// ===========================================================================
// => onSet, onAppend and onChange ==========================================
// ===========================================================================

// onSet, onAppend and onChange are called on every single update made by all
// players in each game, so they can rapidly become quite expensive and have
// the potential to slow down the app. Use wisely.
//
// It is very useful to be able to react to each update a user makes. Try
// nontheless to limit the amount of computations and database saves (.set)
// done in these callbacks. You can also try to limit the amount of calls to
// set() and append() you make (avoid calling them on a continuous drag of a
// slider for example) and inside these callbacks use the `key` argument at the
// very beginning of the callback to filter out which keys your need to run
// logic against.
//
// If you are not using these callbacks, comment them out so the system does
// not call them for nothing.

// // onSet is called when the experiment code call the .set() method
// // on games, rounds, stages, players, playerRounds or playerStages.
// Empirica.onSet((
//   game,
//   round,
//   stage,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue // Previous value
// ) => {
//   // // Example filtering
//   // if (key !== "value") {
//   //   return;
//   // }
// });

// // onAppend is called when the experiment code call the `.append()` method
// // on games, rounds, stages, players, playerRounds or playerStages.
// Empirica.onAppend((
//   game,
//   round,
//   stage,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue // Previous value
// ) => {
//   // Note: `value` is the single last value (e.g 0.2), while `prevValue` will
//   //       be an array of the previsous valued (e.g. [0.3, 0.4, 0.65]).
// });

// // onChange is called when the experiment code call the `.set()` or the
// // `.append()` method on games, rounds, stages, players, playerRounds or
// // playerStages.
// Empirica.onChange((
//   game,
//   round,
//   stage,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue, // Previous value
//   isAppend // True if the change was an append, false if it was a set
// ) => {
//   // `onChange` is useful to run server-side logic for any user interaction.
//   // Note the extra isAppend boolean that will allow to differenciate sets and
//   // appends.
//    Game.set("lastChangeAt", new Date().toString())
// });

// // onSubmit is called when the player submits a stage.
// Empirica.onSubmit((
//   game,
//   round,
//   stage,
//   player // Player who submitted
// ) => {
// });
