package utils

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// ValidateGeoFence - sample implementation: checks if lat,lon within allowed bounding boxes.
// In production, replace bounding boxes with an on-chain list or external trusted registry.
func ValidateGeoFence(location string) error {
	// location expected "lat,lon" e.g. "23.456,77.123"
	parts := strings.Split(location, ",")
	if len(parts) != 2 {
		return fmt.Errorf("invalid location format")
	}
	lat, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	if err != nil {
		return fmt.Errorf("invalid latitude: %v", err)
	}
	lon, err := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
	if err != nil {
		return fmt.Errorf("invalid longitude: %v", err)
	}

	// demo bounding box: replace with real zones
	// Example allowed zone: lat [22.0 - 25.0], lon [76.0 - 79.0]
	if lat < 22.0 || lat > 25.0 || lon < 76.0 || lon > 79.0 {
		return fmt.Errorf("location %f,%f is outside allowed harvesting zones", lat, lon)
	}
	return nil
}

// ValidateSeason - sample: check month of harvest against allowed months per species
func ValidateSeason(species string, timestamp string) error {
	// timestamp ISO8601 expected
	t, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		// accept simple date fallback
		t, err = time.Parse("2006-01-02", timestamp)
		if err != nil {
			return fmt.Errorf("timestamp parse error: %v", err)
		}
	}

	month := t.Month()

	// demo rules: map species->allowed months
	allowed := map[string][]time.Month{
		"Ashwagandha": {time.September, time.October, time.November},
		"GenericHerb": {time.January, time.February, time.March},
	}

	if months, ok := allowed[species]; ok {
		for _, m := range months {
			if m == month {
				return nil
			}
		}
		return fmt.Errorf("species %s cannot be harvested in month %s", species, month.String())
	}
	// if species not found, allow by default but warn
	return nil
}

// ValidateConservation - sample limit check
func ValidateConservation(species string) error {
	// demo: block species named "EndangeredHerb"
	if species == "EndangeredHerb" {
		return fmt.Errorf("harvesting of species %s is prohibited (conservation rule)", species)
	}
	return nil
}

// ValidateQuality - basic QC threshold check on lab results string
// results expected to be a JSON string like {"moisture":8,"pesticide":"PASS","dna":"MATCH"}
func ValidateQuality(results string) error {
	var r map[string]interface{}
	if err := json.Unmarshal([]byte(results), &r); err != nil {
		return fmt.Errorf("invalid results JSON: %v", err)
	}

	// check moisture threshold
	if m, ok := r["moisture"]; ok {
		switch v := m.(type) {
		case float64:
			if v > 12.0 {
				return fmt.Errorf("moisture %v exceeds threshold 12.0", v)
			}
		case string:
			f, err := strconv.ParseFloat(v, 64)
			if err == nil && f > 12.0 {
				return fmt.Errorf("moisture %v exceeds threshold 12.0", v)
			}
		}
	}
	// check pesticide status
	if p, ok := r["pesticide"]; ok {
		if s, ok := p.(string); ok {
			if strings.ToUpper(s) != "PASS" {
				return fmt.Errorf("pesticide test status is not PASS: %s", s)
			}
		}
	}
	// dna check optional
	return nil
}
