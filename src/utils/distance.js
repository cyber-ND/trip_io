// I calculated this based on Haversine formula, you could use anyother one if otherwise

const toRad = (value) => (value * Math.PI) / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null
  ) {
    throw new Error("Invalid coordinates provided");
  }
  // Earth's radius in kilometers
  const R = 6371; 

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

module.exports = calculateDistance;