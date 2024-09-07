package ws

import (
	"chaty/internal/auth"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	websocketUpgrader = websocket.Upgrader{
		CheckOrigin:     checkOrigin,
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	retentionPeriod = 5 * time.Minute
	config          = readConfig()
)

type Manager struct {
	clients ClientList
	sync.RWMutex

	otps auth.RetentionMap

	handlers map[string]EventHandler
}

type Config struct {
	AllowedOrigins []string `json:"allowed-origins"`
}

type ChangeChatRoomEvent struct {
	Name string `json:"room"`
}

func NewManager(ctx context.Context) *Manager {
	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
		otps:     auth.NewRetentionMap(ctx, retentionPeriod),
	}

	m.setupEventHandlers()
	return m
}

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = SendMessageHandler
	m.handlers[EventChageChatRoom] = ChangeChatRoomHandler
}

func SendMessageHandler(event Event, c *Client) error {
	var chatevent SendMessageEvent

	if err := json.Unmarshal(event.Payload, &chatevent); err != nil {
		return fmt.Errorf("error unmarshalling payload: %w", err)
	}

	var broadMessage NewMessageEvent

	broadMessage.Sent = time.Now()
	broadMessage.Message = chatevent.Message
	broadMessage.From = chatevent.From

	data, err := json.Marshal(broadMessage)
	if err != nil {
		return fmt.Errorf("error marshalling message: %w", err)
	}

	var outgoingEvent Event

	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewMessage

	for client := range c.manager.clients {
		if client.chatroom == c.chatroom {
			client.egress <- outgoingEvent
		}
	}

	return nil
}

func readConfig() Config {
	var c Config

	f, err := os.Open(".config.json")
	if err != nil {
		log.Fatal(err)
	}

	defer f.Close()

	if err := json.NewDecoder(f).Decode(&c); err != nil {
		log.Fatal(err)
	}

	if len(c.AllowedOrigins) == 0 {
		log.Fatal("no allowed origins specified")
	}

	return c
}

func ChangeChatRoomHandler(event Event, c *Client) error {
	var changeRoomEvent ChangeChatRoomEvent
	if err := json.Unmarshal(event.Payload, &changeRoomEvent); err != nil {
		return fmt.Errorf("error unmarshalling payload: %w", err)
	}

	c.chatroom = changeRoomEvent.Name

	return nil
}

func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, oK := m.handlers[event.Type]; oK {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return fmt.Errorf("no handler for event type: %s", event.Type)
	}
}

func (m *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	otp := r.URL.Query().Get("otp")
	if otp == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if !m.otps.VerifyOTP(otp) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewClient(conn, m)

	m.addClient(client)

	go client.readMessages()
	go client.writeMessages()
}

func (m *Manager) LoginHandler(w http.ResponseWriter, r *http.Request) {
	type userLoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var req userLoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Username == "admin" && req.Password == "admin" {
		type response struct {
			OTP string `json:"otp"`
		}

		otp := m.otps.NewOTP()

		res := response{
			OTP: otp.Key,
		}

		data, err := json.Marshal(res)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write(data)
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, oK := m.clients[client]; oK {
		client.connection.Close()
		delete(m.clients, client)
	}
}

func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")

	for _, allowed := range config.AllowedOrigins {
		if allowed == origin {
			return true
		}
	}

	return false
}
