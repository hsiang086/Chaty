PostgresInit:
	docker run --name chaty -p 5433:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=123456 -d postgres

Postgres:
	docker exec -it chaty psql

CreateDB:
	docker exec -it chaty createdb --username=root --owner=root chaty

DropDB:
	docker exec -it chaty dropdb chaty

MigrateUp:
	migrate -path db/migrations -database "postgresql://root:123456@localhost:5433/chaty?sslmode=disable" -verbose up

MigrateDown:
	migrate -path db/migrations -database "postgresql://root:123456@localhost:5433/chaty?sslmode=disable" -verbose down

.PHONY: PostgresInit Postgres CreateDB DropDB MigrateUp MigrateDown

