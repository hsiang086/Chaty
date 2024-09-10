package router

import (
	"pchat/internal/user"
	"pchat/internal/ws"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	r *gin.Engine
)

func InitRouter(userHandler *user.Handler, wsHandler *ws.Handler) {
	r = gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		AllowWebSockets:  true,
	}))

	r.POST("/signup", userHandler.CreateUser)
	r.POST("/login", userHandler.Login)
	r.POST("/logout", userHandler.Logout)

	r.POST("/ws/create-room", wsHandler.CreateRoom)
	r.GET("/ws/join-room/:roomID", wsHandler.JoinRoom)
	r.GET("/ws/get-rooms", wsHandler.GetRooms)
	r.GET("/ws/get-clients/:roomID", wsHandler.GetClients)
}

func Start(addr string) error {
	return r.Run(addr)
}
