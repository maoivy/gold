import Empirica from "meteor/empirica:core";

export const ROWS = 10;
export const COLS = 10;
const MINES = 5;
const MAX_GOLD = 10;
export const REVEALED = 10;

// onGameStart is triggered opnce per game before the game starts, and before
// the first onRoundStart. It receives the game and list of all the players in
// the game.
Empirica.onGameStart((game) => {});

// onRoundStart is triggered before each round starts, and before onStageStart.
// It receives the same options as onGameStart, and the round that is starting.
Empirica.onRoundStart((game, round) => {
  // generate the world
  let world = [];
  let worldSet = new Set();
  for (let i = 0; i < ROWS; i++) {
    let row = [];
    for (let j = 0; j < COLS; j++) {
      row.push({ revealed: false, mine: false, row: i, col: j });
      worldSet.add({ row: i, col: j });
    }
    world.push(row);
  }

  // generate the mines (between 1 and 5)
  const numMines = Math.floor(Math.random() * (MINES - 1)) + 1;
  let mines = [];
  for (let i = 0; i < numMines; i++) {
    let mineRow = Math.floor(Math.random() * ROWS);
    let mineCol = Math.floor(Math.random() * COLS);
    let gold = Math.floor(Math.random() * MAX_GOLD);
    mines.push({ row: mineRow, col: mineCol, gold: gold });
    worldSet.delete({ row: mineRow, col: mineCol });
    world[mineRow][mineCol]["mine"] = true;
  }
  round.set("mines", mines);
  round.set("world", world);

  // reveal squares for each player
  const numNormal = ROWS * COLS - numMines;
  const normals = Array.from(worldSet);

  game.players.forEach((player) => {
    let revealed = new Set();
    for (let i = 0; i < REVEALED; i++) {
      let showMine = Math.floor(Math.random()) < player.get("chance");
      let minesRemaining = mines.some((mine) => !revealed.has(mine));

      if (showMine && minesRemaining) {
        let index = Math.floor(Math.random() * numMines);
        while (revealed.has(mines[index])) {
          index = Math.floor(Math.random() * numMines);
        }
        square = mines[index];
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
    player.set("sending", new Object());
  });

  round.set("messages", []);
  round.set("mineChoices", null);
});

// onStageStart is triggered before each stage starts.
// It receives the same options as onRoundStart, and the stage that is starting.
Empirica.onStageStart((game, round, stage) => {
  console.log(round.get("mines"));
});

getGold = (gold, numPlayers) => {
  return gold / numPlayers;
};

// onStageEnd is triggered after each stage.
// It receives the same options as onRoundEnd, and the stage that just ended.
Empirica.onStageEnd((game, round, stage) => {
  if (stage.name === "discussion") {
    // after the discussion round, consolidate the players' messages and send them
  } else if (stage.name === "dig") {
    // after the dig round, consolidate the players' choices and distribute gold
    const mines = round.get("mines");
    const mineIndices = new Set(
      mines.map((mine) => mine.row * ROWS + mine.col)
    );

    // find how many players chose to dig at each mine
    const mineChoices = {};
    mines.forEach(
      (mine) =>
        (mineChoices[mine.row * ROWS + mine.col] = {
          players: [],
          gold: mine.gold,
          distributed: null,
        })
    );
    game.players.forEach((player, k) => {
      let location = player.get("location");
      if (location) {
        let locationIndex = location.row * ROWS + location.col;
        if (mineIndices.has(locationIndex)) {
          mineChoices[locationIndex]["players"].push(k);
        }
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
