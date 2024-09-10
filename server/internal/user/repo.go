package user

import (
	"context"
	"database/sql"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

type repo struct {
	db DBTX
}

func NewRepo(db DBTX) Repo {
	return &repo{db: db}
}

func (r *repo) CreateUser(ctx context.Context, user *User) (*User, error) {
	var lastInsertID int
	query := "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id"
	err := r.db.QueryRowContext(ctx, query, user.Username, user.Email, user.Password).Scan(&lastInsertID)
	if err != nil {
		return &User{}, err
	}

	user.ID = int64(lastInsertID)
	return user, nil
}

func (r *repo) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var u User
	query := "SELECT id, username, email, password FROM users WHERE email=$1"
	err := r.db.QueryRowContext(ctx, query, email).Scan(&u.ID, &u.Username, &u.Email, &u.Password)
	if err != nil {
		return &User{}, err
	}

	return &u, nil
}
