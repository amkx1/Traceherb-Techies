package geo

import (
	"errors"
	"math"
)

// Simple point-in-polygon test (ray casting). Polygons stored off-chain or coded per species.
// For demo purpose, we include a small in-memory polygon map per species.

var speciesZones = map[string][][]float64{
	"ashwagandha": {{28.6, 77.2}, {28.61, 77.25}, {28.59, 77.27}, {28.58, 77.2}},
}

// IsPointAllowed returns true if the point is inside any allowed polygon for a species
func IsPointAllowed(lat, lon float64, species string) bool {
	polys, ok := speciesZones[species]
	if !ok {
		// No zones configured -> deny by default
		return false
	}
	return pointInPolygon(lat, lon, polys)
}

// pointInPolygon simple ray casting for a single polygon (lat/lon pairs)
func pointInPolygon(lat, lon float64, poly [][]float64) bool {
	n := len(poly)
	if n < 3 {
		return false
	}
	inside := false
	for i, j := 0, n-1; i < n; j, i = i, i+1 {
		xi := poly[i][0]
		yi := poly[i][1]
		xj := poly[j][0]
		yj := poly[j][1]
		intersect := ((yi > lon) != (yj > lon)) && (lat < (xj-xi)*(lon-yi)/(yj-yi)+xi)
		if intersect {
			inside = !inside
		}
	}
	return inside
}

// Haversine distance helper (if needed)
func DistanceKm(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

// For production: replace speciesZones with private-data collections or off-chain policy store
func LoadZonesFromBytes(_ []byte) error { return errors.New("not implemented") }
