package ws

import (
	"chaty/internal/color"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10

	maxMessageSize = 1024
)

type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	manager    *Manager

	egress chan Event

	chatroom string
}

func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan Event),
	}
}

func (c *Client) readMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	if err := c.connection.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Printf("err setting read deadline: %v%v%v", color.Red, err, color.Reset)
		return
	}

	c.connection.SetReadLimit(int64(maxMessageSize))

	c.connection.SetPongHandler(c.pongHandler)

	for {
		_, payload, err := c.connection.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("err reading msg: %v%v%v", color.Red, err, color.Reset)
			}
			break
		}

		var request Event

		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("err unmarshaling event: %v%v%v", color.Red, err, color.Reset)
			break
		}

		if err := c.manager.routeEvent(request, c); err != nil {
			log.Printf("err routing event: %v%v%v", color.Red, err, color.Reset)
			break
		}
	}
}

func (c *Client) writeMessages() {
	defer func() {
		c.manager.removeClient(c)
	}()

	ticker := time.NewTicker(pingInterval)

	for {
		select {
		case msg, oK := <-c.egress:
			if !oK {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Printf("conn close msg: %v%v%v", color.Red, err, color.Reset)
				}
				return
			}

			data, err := json.Marshal(msg)
			if err != nil {
				log.Printf("err marshaling msg: %v%v%v", color.Red, err, color.Reset)
				return
			}

			if err := c.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Printf("err writing msg: %v%v%v", color.Red, err, color.Reset)
				return
			}

			log.Printf("msg sent: %v%v%v", color.Green, string(data), color.Reset)

		case <-ticker.C:
			log.Printf("pinging client: %v%v%v", color.Green, c.connection.RemoteAddr(), color.Reset)

			if err := c.connection.WriteMessage(websocket.PingMessage, []byte(``)); err != nil {
				log.Printf("err pinging client: %v%v%v", color.Red, err, color.Reset)
				return
			}
		}
	}
}

func (c *Client) pongHandler(pongMsg string) error {
	log.Printf("pong received: %v%v%v", color.Green, pongMsg, color.Reset)

	return c.connection.SetReadDeadline(time.Now().Add(pongWait))
}
