FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY cmd ./cmd
COPY internal ./internal
COPY migrations ./migrations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /bin/inventory-service ./cmd/main.go

FROM alpine:3.20

RUN adduser -D -H appuser && apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /bin/inventory-service /app/inventory-service
COPY --from=builder /app/migrations /app/migrations

USER appuser

EXPOSE 8080

CMD ["/app/inventory-service"]
