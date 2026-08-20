import * as Location from "expo-location";

export type GPSResult = {
  granted: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distanceMeters?: number;
  insideRadius?: boolean;
  message: string;
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function readGPS(
  targetLat: number,
  targetLon: number,
  radius: number
): Promise<GPSResult> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    return {
      granted: false,
      message: "ยังไม่ได้อนุญาตการใช้ตำแหน่ง GPS"
    };
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High
  });

  const { latitude, longitude, accuracy } = location.coords;
  const distance = distanceMeters(latitude, longitude, targetLat, targetLon);

  return {
    granted: true,
    latitude,
    longitude,
    accuracy: accuracy ?? undefined,
    distanceMeters: distance,
    insideRadius: distance <= radius,
    message:
      distance <= radius
        ? "อยู่ในพื้นที่ตรวจสอบ"
        : `ยังไม่ถึงจุดตรวจ • ห่างประมาณ ${Math.round(distance)} เมตร`
  };
}
