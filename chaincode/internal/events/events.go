package events

import "encoding/json"

func EventName(base string) string { return base }

func Payload(m map[string]string) []byte {
	b, _ := json.Marshal(m)
	return b
}
