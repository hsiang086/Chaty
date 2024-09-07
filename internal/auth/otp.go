package auth

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type OTP struct {
	Key       string
	CreatedAt time.Time
}

type RetentionMap map[string]OTP

func NewRetentionMap(ctx context.Context, retentionPeriod time.Duration) RetentionMap {
	rm := make(RetentionMap)

	go rm.Retention(ctx, retentionPeriod)

	return rm
}

func (rm RetentionMap) NewOTP() OTP {
	o := OTP{
		Key:       uuid.New().String(),
		CreatedAt: time.Now(),
	}

	rm[o.Key] = o
	return o
}

func (rm RetentionMap) VerifyOTP(otp string) bool {
	if _, oK := rm[otp]; !oK {
		return false
	}

	delete(rm, otp)
	return true
}

func (rm RetentionMap) Retention(ctx context.Context, retentionPeriod time.Duration) {
	ticker := time.NewTicker(retentionPeriod)

	for {
		select {
		case <-ticker.C:
			for _, otp := range rm {
				if time.Now().After(otp.CreatedAt.Add(retentionPeriod)) {
					delete(rm, otp.Key)
				}
			}
		case <-ctx.Done():
			return
		}
	}
}
