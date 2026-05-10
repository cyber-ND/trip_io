const EARTH_RADIUS_KM = 6371

const toRad = (deg) => (deg * Math.PI) / 180

const calculateDistance = (coord1, coord2) => {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return parseFloat((EARTH_RADIUS_KM * c).toFixed(2))
}

module.exports = { calculateDistance }
