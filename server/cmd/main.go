package main

import (
	"log"
	"pchat/db"
	"pchat/internal/user"
	"pchat/internal/ws"
	"pchat/router"
)

func main() {
	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("COULD NOT INITIALIZE DATABASE CONN: %s", err)
	}

	userRep := user.NewRepo(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	router.InitRouter(userHandler, wsHandler)
	router.Start("0.0.0.0:8080")
}
