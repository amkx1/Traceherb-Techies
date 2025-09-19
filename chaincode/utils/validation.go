package utils

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// ValidateGeoFence - checks if lat,lon within allowed bounding boxes
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

	// demo bounding box
	if lat < 22.0 || lat > 25.0 || lon < 76.0 || lon > 79.0 {
		return fmt.Errorf("location %f,%f is outside allowed harvesting zones", lat, lon)
	}
	return nil
}

// ValidateSeason - check month of harvest against allowed months per species
func ValidateSeason(species string, timestamp string) error {
	t, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		t, err = time.Parse("2006-01-02", timestamp)
		if err != nil {
			return fmt.Errorf("timestamp parse error: %v", err)
		}
	}

	month := t.Month()
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

	return nil
}

// ValidateConservation - sample limit check
func ValidateConservation(species string) error {
	if species == "EndangeredHerb" {
		return fmt.Errorf("harvesting of species %s is prohibited (conservation rule)", species)
	}
	return nil
}

// ValidateQuality - basic QC threshold check on lab results JSON string
// ValidateQuality - basic QC threshold check on lab results map
func ValidateQuality(results map[string]interface{}) error {
	if results == nil || len(results) == 0 {
		return fmt.Errorf("results cannot be empty")
	}

	// check moisture threshold
	if m, ok := results["moisture"]; ok {
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
	if p, ok := results["pesticide"]; ok {
		if s, ok := p.(string); ok {
			if strings.ToUpper(s) != "PASS" {
				return fmt.Errorf("pesticide test status is not PASS: %s", s)
			}
		}
	}

	return nil
}
