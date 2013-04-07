package main

import (
	"fmt"
	"net"
	"net/http"
	"net/http/fcgi"
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
	"encoding/json"
	"strconv"
	"math/rand"
	"time"
	"math"
//	"os"
//	"log"
)

// Constants (TODO: setme)
var MaxPlayerSpeed int32 = 15
var MaxPlayerUpdatesPerSecond int64 = (1000/200)-3
var PlayerWidth int32 = 33
var PlayerHeight int32 = 66
var BallWidthHeight int32 = 26
var BallDribbleSpeed float32 = float32(MaxPlayerSpeed + 3)
var BallKickSpeed float32 = BallDribbleSpeed * 1.5
var BallStartX float32 = float32(500 - BallWidthHeight/2)
var BallStartY float32 = float32(300 - BallWidthHeight/2)
var GoalStartY int32 = 222
var GoalEndY int32 = 378

var DeadManWalkingId int64 // Not sure why this is needed...

var DistanceFromPlayerYKickMin int32= -25
var DistanceFromPlayerYKickMax int32= -50

var players *mgo.Collection
var gamestate *mgo.Collection

type Player struct {
	Id int64 `json:"-"`
	Name string
	X uint32
	Y uint32
	OnTeamA bool // TeamA == right -> left
	Direction int16
	LastUpdate int64 `json:"-"`
	Action string
	Fireball bool
}

var TeamSizesId int64 = 1
type TeamSizes struct {
	Id int64 `json:"-"`
	TeamASize uint32
	TeamBSize uint32
}

var BallLocationId int64 = 2
type BallLocation struct {
	Id int64 `json:"-"`
	X float32
	Y float32
	VelocityX float32
	VelocityY float32
}

var TeamScoresId int64 = 3
type TeamScores struct {
	Id int64 `json:"-"`
	TeamAScore uint32
	TeamBScore uint32
}

type IdStruct struct {
	Id int64
}

func checkBallIntersections(ball *BallLocation, player *Player) {
	if (ball == nil) {
		ball = &BallLocation{}
		err := gamestate.Find(bson.M{"id": BallLocationId}).One(ball)
		if (err != nil) { panic(err) }
	}

	/* Check if ball collided with a player */
	var playersSlice []Player = []Player{}
	if (player == nil) {
		//TODO limit
		err := players.Find(bson.M{}).All(&playersSlice)
		if (err != nil) { return }
	} else {
		playersSlice = append(playersSlice, *player)
	}

	for i := range playersSlice {
		var diffX float32
		diffY := ball.Y - float32(playersSlice[i].Y)
		if (!playersSlice[i].OnTeamA) {
			diffX = float32(int32(playersSlice[i].X) + PlayerWidth) - ball.X
		} else {
			diffX = float32(playersSlice[i].X) - (ball.X + float32(BallWidthHeight))
		}

		if diffX <= 0 && diffX >= float32(-BallWidthHeight) && diffY >= float32(-BallWidthHeight) && diffY <= float32(PlayerHeight) {
			ballXCenter := ball.X + float32(BallWidthHeight/2)
			ballYCenter := ball.Y + float32(BallWidthHeight/2)
			playerXCenter := float32(int32(playersSlice[i].X) + PlayerWidth/2)
			playerYCenter := float32(int32(playersSlice[i].Y) + PlayerHeight/2)
			diffX = playerXCenter - ballXCenter
			diffY = playerYCenter - ballYCenter
			ratio := diffY / diffX
			if ratio > 1 { ratio = 1 }

			if (playersSlice[i].OnTeamA) {
				ball.VelocityX = -BallDribbleSpeed
			} else {
				ball.VelocityX = BallDribbleSpeed
			}
			
			ball.VelocityY = BallDribbleSpeed * ratio
			if math.Signbit(float64(ball.VelocityY)) == math.Signbit(float64(diffY)) {
				ball.VelocityY = -ball.VelocityY
			}
		}
	}

	/* Check for WIN */
	if (ball.X <= 0 || int32(ball.X) >= 1000-BallWidthHeight) && ball.Y >= float32(GoalStartY) && ball.Y <= float32(GoalEndY-BallWidthHeight) {
		scores := &TeamScores{}
		err := gamestate.Find(bson.M{"id": TeamScoresId}).One(&scores)
		if (err != nil) { return }

		if ball.X <= 0 { scores.TeamAScore++
		} else { scores.TeamBScore++ }

		ball.X = BallStartX
		ball.Y = BallStartY
		ball.VelocityX = 0
		ball.VelocityY = 0

		gamestate.Update(&IdStruct{Id: TeamScoresId}, scores)
		gamestate.Update(&IdStruct{Id: BallLocationId}, ball)
		for i := range playersSlice {
			if (playersSlice[i].OnTeamA) { playersSlice[i].X = 900
			} else { playersSlice[i].X = 100 }

			playersSlice[i].Y = 300

			players.Update(&IdStruct{Id: playersSlice[i].Id}, playersSlice[i])
		}
		DeadManWalkingId = 0
		return
	}

	/* Check if ball is out of bounds */
	if (ball.X <= 0) {
		ball.X = 0
		if ball.VelocityX < 0 {
			ball.VelocityX = -ball.VelocityX
		}
	}
	if (int32(ball.X) >= 1000-BallWidthHeight) {
		ball.X = float32(1000-BallWidthHeight)
		if ball.VelocityX > 0 {
			ball.VelocityX = -ball.VelocityX
		}
	}

	if (ball.Y <= 0) {
		ball.Y = 0
		if ball.VelocityY < 0 {
			ball.VelocityY = -ball.VelocityY
		}
	}
	if (int32(ball.Y) >= 600-BallWidthHeight) {
		ball.Y = float32(600-BallWidthHeight)
		if ball.VelocityY > 0 {
			ball.VelocityY = -ball.VelocityY
		}
	}

	gamestate.Update(&IdStruct{Id: BallLocationId}, ball)
}

type FastCGIServer struct{}
func (s FastCGIServer) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	if (req.FormValue("cmd") == "") { return }
	w.Header().Add("Access-Control-Allow-Origin", "*") //TODO
	if req.Method == "POST" {
//		fmt.Printf("Got POST request %s\n", req.FormValue("cmd"))

		switch(req.FormValue("cmd")) {
		case "action":
			if (req.FormValue("action") == "") { return }

			c, err := req.Cookie("Player")
			if (err != nil) { return }
			var cookie int64
			cookie, err = strconv.ParseInt(c.Value, 10, 64)
			if (err != nil) { return }

			player := Player{}
			err = players.Find(bson.M{"id": cookie}).One(&player)
			if (err != nil) { return }

			if player.Fireball || cookie == DeadManWalkingId { return }

			player.Action = req.FormValue("action")

			err = players.Update(&IdStruct{Id: cookie}, player)
			if (err != nil) { panic(err) }
		case "pos":
			if (req.FormValue("x") == "" || req.FormValue("y") == "" || req.FormValue("dir") == "") { return }

			c, err := req.Cookie("Player")
			if (err != nil) { return }
			var cookie int64
			cookie, err = strconv.ParseInt(c.Value, 10, 64)
			if (err != nil) { return }

			player := Player{}
			err = players.Find(bson.M{"id": cookie}).One(&player)
			if (err != nil) { return }

			if player.Fireball || cookie == DeadManWalkingId {
				player.Fireball = true
				player.Direction = -1

				err = players.Update(&IdStruct{Id: cookie}, player)
				if (err != nil) { panic(err) }

				encoder := json.NewEncoder(w)
				encoder.Encode(player)
			}
			now := time.Now().UnixNano()
			if int64(now) - int64(player.LastUpdate) <= int64(int64(1000000000)/MaxPlayerUpdatesPerSecond) {
				var temp uint64
				temp, err = strconv.ParseUint(req.FormValue("x"), 10, 32)
				if (err != nil) { return } else {
					diff := int32(player.X) - int32(temp)
					if (diff <= MaxPlayerSpeed && diff >= -MaxPlayerSpeed) {
						player.X = uint32(temp)
					} else { fmt.Printf("Cheater: %d %d %d\n", player.X, temp, diff) }
				}
				temp, err = strconv.ParseUint(req.FormValue("y"), 10, 32)
				if (err != nil) { return } else {
					diff := int32(player.Y) - int32(temp)
					if (diff <= MaxPlayerSpeed && diff >= -MaxPlayerSpeed) {
						player.Y = uint32(temp)
					} else { fmt.Printf("Cheater: %d %d %d\n", player.Y, temp, diff) }
				}
			} else { fmt.Printf("Cheater: %d, %d\n", now, player.LastUpdate) }

			player.LastUpdate = time.Now().UnixNano()

			var tempB int64
			tempB, err = strconv.ParseInt(req.FormValue("dir"), 10, 16)
			if (err != nil) { return }
			player.Direction = int16(tempB)

			err = players.Update(&IdStruct{Id: cookie}, player)
			if (err != nil) { panic(err) }

			checkBallIntersections(nil, &player)

			encoder := json.NewEncoder(w)
			encoder.Encode(player)
		case "adduser":
			if (req.FormValue("name") == "") { return }

			nameVar := req.FormValue("name")
			player := Player{}
			err := players.Find(bson.M{"name": nameVar}).One(&player)
			if (err == nil) {
				nameRand := rand.Uint32()
				nameVar = fmt.Sprintf("ICantPickAName%u", uint16(nameRand))
			}

			counts := &TeamSizes{}
			err = gamestate.Find(bson.M{"id": TeamSizesId}).One(&counts)
			if (err != nil) { return }

			c, err := req.Cookie("Player")
			if (err == nil) {
				var cookie int64
				cookie, err = strconv.ParseInt(c.Value, 10, 64)
				if (err != nil) { return }

				err = players.Find(bson.M{"id": cookie}).One(&player)
				if (err == nil) {
					player.Name = nameVar
					players.Update(&IdStruct{Id: cookie}, player)

					encoder := json.NewEncoder(w)
					encoder.Encode(player)
					return
				}
			}

			player = Player{Name: nameVar}
			if (counts.TeamBSize < counts.TeamASize) {
				player.OnTeamA = false;
				counts.TeamBSize++
				player.X = 100
			} else {
				player.OnTeamA = true;
				counts.TeamASize++
				player.X = 900
			}
			player.Y = 300
			player.Action = "stand"
			player.Direction = -1
			player.Fireball = false

			player.Id = rand.Int63()

			err = players.Insert(player)
			if (err != nil) { return }

			_, err2 := gamestate.Upsert(&IdStruct{Id: TeamSizesId}, counts)
			if (err2 != nil) { panic(err) }

			w.Header().Add("Set-Cookie", fmt.Sprintf("Player=%d", player.Id))

			encoder := json.NewEncoder(w)
			encoder.Encode(player)
		case "kick":
			c, err := req.Cookie("Player")
			if (err != nil) { return }
			var cookie int64
			cookie, err = strconv.ParseInt(c.Value, 10, 64)
			if (err != nil) { return }

			player := Player{}
			err = players.Find(bson.M{"id": cookie}).One(&player)
			if (err != nil) { return }

			ball := &BallLocation{}
			err = gamestate.Find(bson.M{"id": BallLocationId}).One(ball)
			if (err != nil) { panic(err) }

			var diffX float32
			diffY := ball.Y - float32(player.Y)
			if (!player.OnTeamA) {
				diffX = float32(int32(player.X) + PlayerWidth) - ball.X
			} else {
				diffX = float32(player.X) - (ball.X + float32(BallWidthHeight))
			}

			if diffX <= 15 && diffX >= float32(-BallWidthHeight-15) && diffY >= float32(-BallWidthHeight-15) && diffY <= float32(PlayerHeight+15) {
				ballXCenter := ball.X + float32(BallWidthHeight/2)
				ballYCenter := ball.Y + float32(BallWidthHeight/2)
				goalYCenter := float32(GoalStartY + GoalEndY)/2
				var goalXCenter float32
				if (player.OnTeamA) { goalXCenter = 0 } else { goalXCenter = 1000 }
				diffX = ballXCenter - goalXCenter
				diffY = ballYCenter - goalYCenter
				ratio := diffY / diffX
	
				if (player.OnTeamA) {
					ball.VelocityX = -BallKickSpeed
				} else {
					ball.VelocityX = BallKickSpeed
				}
				
				ball.VelocityY = BallKickSpeed * ratio
				if math.Signbit(float64(ball.VelocityY)) == math.Signbit(float64(diffY)) {
					ball.VelocityY = -ball.VelocityY
				}
			}

			gamestate.Update(&IdStruct{Id: BallLocationId}, ball)

			encoder := json.NewEncoder(w)
			encoder.Encode(player)
		}
	} else {
//		fmt.Printf("Got GET request %s\n", req.FormValue("cmd"))

		switch(req.FormValue("cmd")) {
		case "teamsize":
			result := &TeamSizes{}
			err := gamestate.Find(bson.M{"id": TeamSizesId}).One(&result)
			if (err != nil) { return }

			encoder := json.NewEncoder(w)
			encoder.Encode(result)
		case "all":
			var m bson.M = bson.M{}

			result := &BallLocation{}
			err := gamestate.Find(bson.M{"id": BallLocationId}).One(&result)
			if (err != nil) { return }

			m["ball"] = result

			scores := &TeamScores{}
			err = gamestate.Find(bson.M{"id": TeamScoresId}).One(&scores)
			if (err != nil) { return }

			m["score"] = scores

			var playersSlice []Player
			err = players.Find(bson.M{}).All(&playersSlice)
			if (err != nil) { return }

			for i := range playersSlice {
				if (playersSlice[i].Id == DeadManWalkingId) {
					playersSlice[i].Fireball = true
					playersSlice[i].Direction = -1
				}
			}

			m["players"] = playersSlice

			encoder := json.NewEncoder(w)
			encoder.Encode(m)
		}
	}
}

func main() {
//	logger := log.New(os.Stderr, "LOG: ", 0xFFFF)
//	mgo.SetLogger(logger)
//	mgo.SetDebug(true)

	rand.Seed(time.Now().UTC().UnixNano())

	session, err := mgo.Dial("user:notSoSecret@127.0.0.1:27017/soccerfuntimego")
	if err != nil {
		panic(err)
	}
	defer session.Close()

	players = session.DB("soccerfuntimego").C("players")
	players.DropCollection()
	gamestate = session.DB("soccerfuntimego").C("gamestate")
	gamestate.DropCollection()


	teamSizes := &TeamSizes{Id: TeamSizesId, TeamASize: 0, TeamBSize: 0}
	gamestate.Insert(teamSizes)
	ballLocation := &BallLocation{Id: BallLocationId, X: BallStartX, Y: BallStartY, VelocityX: 0, VelocityY: 0}
	gamestate.Insert(ballLocation)
	teamScores := &TeamScores{Id: TeamScoresId, TeamAScore: 0, TeamBScore: 0}
	gamestate.Insert(teamScores)

	fmt.Printf("Starting server\n")

	l, _ := net.Listen("tcp", "127.0.0.1:9000")
	b := new(FastCGIServer)
	go func() {
		fcgi.Serve(l, b)
	}()

	go func() {
	for i := 0; i < 1e6; i++ {
		time.Sleep(30*time.Second)

		var playersSlice []Player
		err = players.Find(bson.M{}).All(&playersSlice)
		if (err != nil || len(playersSlice) == 0) { time.Sleep(1*time.Second); continue }

		deadManWalking := playersSlice[rand.Intn(len(playersSlice))]
		DeadManWalkingId = deadManWalking.Id

		time.Sleep(2*time.Second)

		if (deadManWalking.OnTeamA) { deadManWalking.X = 900
		} else { deadManWalking.X = 100 }

		deadManWalking.Y = 300
		deadManWalking.Fireball = false

		err = players.Update(&IdStruct{Id: deadManWalking.Id}, deadManWalking)
		if (err != nil) { panic(err) }

		DeadManWalkingId = 0
	}
	}()

	timerVar := time.Tick(200000000*time.Nanosecond)
	for _ = range timerVar {
		result := &BallLocation{}
		err := gamestate.Find(bson.M{"id": BallLocationId}).One(&result)
		if (err != nil) { panic(err) }

		result.X += result.VelocityX
		result.Y += result.VelocityY
	
		result.VelocityY *= 0.95
		result.VelocityX *= 0.95
	
		checkBallIntersections(result, nil)
	}
}
