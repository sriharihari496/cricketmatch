const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());

let db = null;

const connect = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
connect();
const convert = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

app.get("/players/", async (Request, Response) => {
  const queryone = `
    SELECT 
    *
    FROM
    player_details;`;
  const first = await db.all(queryone);
  Response.send(first.map((each) => convert(each)));
});

app.get("/players/:playerId/", async (Request, Response) => {
  const { playerId } = Request.params;
  const querytwo = `
    SELECT 
    *
    FROM
    player_details
    WHERE
    player_id=${playerId};`;
  const second = await db.get(querytwo);
  Response.send(convert(second));
});

app.put("/players/:playerId/", async (Request, Response) => {
  const playerdetails = Request.body;
  const { playerId } = Request.params;
  const { playerName } = playerdetails;
  const querythree = `
    UPDATE
    player_details
    SET 
    player_name='${playerName}'
    WHERE 
    player_id=${playerId};`;
  await db.run(querythree);
  Response.send("Player Details Updated");
});
app.get("/matches/:matchId/", async (Request, Response) => {
  const { matchId } = Request.params;
  const queryfour = `
    SELECT 
    *
    FROM 
    match_details
    WHERE
    match_id=${matchId};`;
  const four = await db.get(queryfour);
  Response.send(four);
});

const convertone = (text) => {
  return {
    matchId: text.match_id,
    match: text.match,
    year: text.year,
  };
};
app.get("/players/:playerId/matches", async (Request, Response) => {
  const { playerId } = Request.params;
  const queryfive = `
    SELECT
    *
    FROM player_match_score NATURAL JOIN match_details
    WHERE 
    player_id=${playerId};`;
  const five = await db.all(queryfive);
  Response.send(five.map((item) => convertone(item)));
});

app.get("/matches/:matchId/players", async (Request, Response) => {
  const { matchId } = Request.params;
  const querysix = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const six = await db.all(querysix);
  Response.send(six);
});
app.get("/players/:playerId/playerScores", async (Request, Response) => {
  const { playerId } = Request.params;
  const queryseven = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const seven = await db.all(queryseven);
  Response.send(seven);
});
module.exports = app;
