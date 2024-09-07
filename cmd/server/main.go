package main

import (
	"chaty/internal/color"
	"chaty/internal/ws"
	"context"
	"log"
	"net/http"
)

func main() {
	setupAPI()

	log.Fatal(http.ListenAndServeTLS("0.0.0.0:1588", "server.crt", "server.key", nil))
}

func faviconHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./web/static/icon/favicon.ico")
}

func setupAPI() {
	ctx := context.Background()

	manager := ws.NewManager(ctx)

	log.Printf("Server running at: %v%v%v%v", color.Cyan, color.Underline, "https://localhost:1588", color.Reset)

	http.Handle("/", http.FileServer(http.Dir("./web/static")))
	http.HandleFunc("/favicon.ico", faviconHandler)
	http.HandleFunc("/ws", manager.ServeWS)
	http.HandleFunc("/api/login", manager.LoginHandler)
}
