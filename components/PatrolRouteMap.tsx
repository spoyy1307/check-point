import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CheckpointItem, PatrolRound } from "../types/patrol";
import { COLORS } from "../constants/colors";

interface PatrolRouteMapProps {
  round: PatrolRound;
  currentPointIndex: number;
  onSelectPoint?: (index: number) => void;
  onClose?: () => void;
}

// Relative pin coordinates (%) on the factory campus layout
const PIN_COORDINATES: { [key: number]: { top: number; left: number } } = {
  1: { top: 72, left: 24 }, // ประตูทางเข้าหลัก (Main Gate bottom-left)
  2: { top: 56, left: 44 }, // อาคารสำนักงาน
  3: { top: 22, left: 54 }, // โรงจอดรถ / อาคารด้านบน
  4: { top: 32, left: 74 }, // จุดพักกลาง / โกดัง A
  5: { top: 52, left: 68 }, // โกดังสินค้า B
  6: { top: 62, left: 82 }, // ด้านหลังอาคาร
  7: { top: 82, left: 78 }, // ลานจอดรถด้านใน
  8: { top: 86, left: 88 }  // ประตูทางออก (Exit Gate)
};

export default function PatrolRouteMap({
  round,
  currentPointIndex,
  onSelectPoint,
  onClose
}: PatrolRouteMapProps) {
  const checkpoints = round.checkpoints;
  const [selectedIdx, setSelectedIdx] = useState<number>(currentPointIndex);

  const selectedPoint: CheckpointItem = checkpoints[selectedIdx] || checkpoints[0];
  const userCurrentPoint: CheckpointItem = checkpoints[currentPointIndex] || checkpoints[0];

  const handleStartNativeNavigation = (point: CheckpointItem) => {
    const lat = point.latitude || 16.8156;
    const lng = point.longitude || 100.262;
    const label = encodeURIComponent(`จุดตรวจที่ ${point.id} : ${point.name}`);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      })
      .catch(() => {
        Alert.alert(
          "เปิดแผนที่นำทาง",
          `พิกัด GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n(จุดตรวจ: ${point.name})`
        );
      });
  };

  const handleNavigateHere = () => {
    if (onSelectPoint) {
      onSelectPoint(selectedIdx);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      {/* Modal Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="map" size={20} color="#0C4A94" />
          <Text style={styles.headerTitle}>แผนที่จุดตรวจ : รอบที่ {round.id}</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#64748B" />
        </Pressable>
      </View>

      {/* Main Dual-Pane Body */}
      <View style={styles.body}>
        {/* Left Pane: Checkpoint Selection List */}
        <View style={styles.leftPane}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {checkpoints.map((cp, idx) => {
              const isSelected = idx === selectedIdx;
              const isUserHere = idx === currentPointIndex;
              const isCompleted = cp.status === "on_time" || cp.status === "late";

              return (
                <Pressable
                  key={cp.id}
                  style={[
                    styles.checkItem,
                    isSelected && styles.checkItemActive,
                    isCompleted && styles.checkItemCompleted
                  ]}
                  onPress={() => setSelectedIdx(idx)}
                >
                  <View
                    style={[
                      styles.itemNumberCircle,
                      isSelected && styles.itemNumberCircleActive,
                      isCompleted && styles.itemNumberCircleCompleted
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={13} color="white" />
                    ) : (
                      <Text
                        style={[
                          styles.itemNumberText,
                          isSelected && styles.itemNumberTextActive
                        ]}
                      >
                        {cp.id}
                      </Text>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        isSelected && styles.itemNameActive
                      ]}
                      numberOfLines={1}
                    >
                      {cp.name}
                    </Text>

                    {isUserHere && (
                      <View style={styles.userHereBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.userHereText}>คุณอยู่ที่นี่</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Pane: Interactive Campus / Route Map */}
        <View style={styles.rightPane}>
          {/* Architectural Campus Map Canvas */}
          <View style={styles.mapCanvas}>
            {/* Campus Background & Building Blocks */}
            <View style={styles.campusGrassBg}>
              {/* Road Network Lines */}
              <View style={styles.roadMainH} />
              <View style={styles.roadMainV} />
              <View style={styles.roadCurve} />

              {/* Water Canal / Basin at bottom */}
              <View style={styles.waterBasin} />

              {/* Architectural Buildings */}
              <View style={styles.buildingOffice}>
                <Text style={styles.buildingLabel}>อาคารสำนักงาน</Text>
              </View>
              <View style={styles.buildingFactoryA}>
                <Text style={styles.buildingLabel}>โรงงาน A</Text>
              </View>
              <View style={styles.buildingWarehouse}>
                <Text style={styles.buildingLabel}>คลังสินค้า</Text>
              </View>
              <View style={styles.buildingParking}>
                <Text style={styles.buildingLabel}>ลานจอดรถ</Text>
              </View>

              {/* Dotted Route Connector Track */}
              <View style={styles.routeTrack1to2} />
              <View style={styles.routeTrack2to3} />
              <View style={styles.routeTrack3to4} />
              <View style={styles.routeTrack4to5} />
              <View style={styles.routeTrack5to7} />
              <View style={styles.routeTrack7to8} />

              {/* Checkpoint Markers (1 - 8) */}
              {checkpoints.map((cp, idx) => {
                const coord = PIN_COORDINATES[cp.id] || { top: 50, left: 50 };
                const isSelected = idx === selectedIdx;
                const isUserHere = idx === currentPointIndex;
                const isCompleted = cp.status === "on_time" || cp.status === "late";

                return (
                  <Pressable
                    key={cp.id}
                    style={[
                      styles.pinMarkerWrap,
                      { top: `${coord.top}%`, left: `${coord.left}%` },
                      isSelected && styles.pinMarkerWrapActive
                    ]}
                    onPress={() => setSelectedIdx(idx)}
                    hitSlop={8}
                  >
                    {/* User Radar Pulse Ring */}
                    {isUserHere && (
                      <View style={styles.radarPulseOuter}>
                        <View style={styles.radarPulseInner} />
                      </View>
                    )}

                    {/* Pin Bubble */}
                    <View
                      style={[
                        styles.pinBubble,
                        isSelected && styles.pinBubbleActive,
                        isCompleted && styles.pinBubbleCompleted
                      ]}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color="white" />
                      ) : (
                        <Text
                          style={[
                            styles.pinText,
                            isSelected && styles.pinTextActive
                          ]}
                        >
                          {cp.id}
                        </Text>
                      )}
                    </View>

                    {/* "คุณอยู่ที่นี่" Floating Tag on Current Point */}
                    {isUserHere && (
                      <View style={styles.floatingUserTag}>
                        <Text style={styles.floatingUserTagText}>คุณอยู่ที่นี่</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}

              {/* Floating "ตำแหน่งปัจจุบัน" Reset Button */}
              <Pressable
                style={styles.btnCurrentLocation}
                onPress={() => setSelectedIdx(currentPointIndex)}
              >
                <Ionicons name="locate" size={14} color="#0C4A94" />
                <Text style={styles.btnCurrentLocationText}>ตำแหน่งปัจจุบัน</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Selected Point Info Banner */}
      <View style={styles.pointInfoBanner}>
        <View style={styles.pointInfoLeft}>
          <View style={styles.pointIconWrap}>
            <Ionicons name="location" size={18} color="#0C4A94" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pointInfoTitle}>
              จุดตรวจที่ {selectedPoint.id} : {selectedPoint.name}
            </Text>
            <Text style={styles.pointInfoSub}>
              เวลาตรวจ {selectedPoint.scheduledTime} • รัศมี {selectedPoint.radiusMeters || 100} ม.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Action Buttons (ตามแบบ Image 2) */}
      <View style={styles.footerActions}>
        {/* Left: เริ่มนำทาง (เปิด Google / Apple Maps) */}
        <Pressable
          style={({ pressed }) => [styles.btnStartNav, pressed && styles.btnPressed]}
          onPress={() => handleStartNativeNavigation(selectedPoint)}
        >
          <Ionicons name="navigate-outline" size={18} color="#0C4A94" />
          <Text style={styles.btnStartNavText}>เริ่มนำทาง</Text>
        </Pressable>

        {/* Right: นำทางไปยังจุดนี้ (เลือกจุดนี้ในแอป) */}
        <Pressable
          style={({ pressed }) => [styles.btnGoToPoint, pressed && styles.btnPressed]}
          onPress={handleNavigateHere}
        >
          <Ionicons name="arrow-forward" size={18} color="white" />
          <Text style={styles.btnGoToPointText}>นำทางไปยังจุดนี้</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 16,
    paddingBottom: 20,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A"
  },
  closeBtn: {
    padding: 4
  },

  // Main Dual-Pane Body
  body: {
    flexDirection: "row",
    height: 330,
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10
  },

  // Left Pane: Checkpoint List
  leftPane: {
    width: "36%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden"
  },
  listContent: {
    padding: 6,
    gap: 5
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  checkItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD"
  },
  checkItemCompleted: {
    borderColor: "#DCFCE7"
  },
  itemNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  itemNumberCircleActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  itemNumberCircleCompleted: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A"
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B"
  },
  itemNumberTextActive: {
    color: "white"
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155"
  },
  itemNameActive: {
    color: "#0C4A94",
    fontWeight: "800"
  },
  userHereBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981"
  },
  userHereText: {
    fontSize: 9.5,
    color: "#059669",
    fontWeight: "800"
  },

  // Right Pane: Campus Map Canvas
  rightPane: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  mapCanvas: {
    flex: 1,
    position: "relative"
  },
  campusGrassBg: {
    flex: 1,
    backgroundColor: "#EBF3E8",
    position: "relative"
  },

  // Road & Path Network
  roadMainH: {
    position: "absolute",
    top: "46%",
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#CBD5E1",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#94A3B8"
  },
  roadMainV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "38%",
    width: 18,
    backgroundColor: "#CBD5E1",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#94A3B8"
  },
  roadCurve: {
    position: "absolute",
    bottom: "20%",
    left: "38%",
    right: "15%",
    height: 16,
    backgroundColor: "#CBD5E1"
  },
  waterBasin: {
    position: "absolute",
    bottom: 8,
    left: 10,
    width: "42%",
    height: 28,
    backgroundColor: "#BAE6FD",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7DD3FC"
  },

  // Buildings
  buildingOffice: {
    position: "absolute",
    top: "16%",
    left: "48%",
    width: "36%",
    height: "26%",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  buildingFactoryA: {
    position: "absolute",
    top: "48%",
    left: "50%",
    width: "34%",
    height: "28%",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center"
  },
  buildingWarehouse: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "24%",
    height: "28%",
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  buildingParking: {
    position: "absolute",
    bottom: "12%",
    right: "8%",
    width: "22%",
    height: "24%",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  buildingLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    textAlign: "center"
  },

  // Dotted Patrol Tracks (Route connecting points)
  routeTrack1to2: {
    position: "absolute",
    top: "64%",
    left: "26%",
    width: "20%",
    height: 2,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },
  routeTrack2to3: {
    position: "absolute",
    top: "35%",
    left: "46%",
    width: 2,
    height: "26%",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },
  routeTrack3to4: {
    position: "absolute",
    top: "24%",
    left: "56%",
    width: "20%",
    height: 2,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },
  routeTrack4to5: {
    position: "absolute",
    top: "35%",
    left: "72%",
    width: 2,
    height: "20%",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },
  routeTrack5to7: {
    position: "absolute",
    top: "56%",
    left: "72%",
    width: 2,
    height: "28%",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },
  routeTrack7to8: {
    position: "absolute",
    top: "84%",
    left: "80%",
    width: "8%",
    height: 2,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#2563EB"
  },

  // Pin Markers
  pinMarkerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    marginTop: -15,
    zIndex: 10
  },
  pinMarkerWrapActive: {
    zIndex: 20
  },
  radarPulseOuter: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59, 130, 246, 0.25)",
    alignItems: "center",
    justifyContent: "center"
  },
  radarPulseInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.35)"
  },
  pinBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3
  },
  pinBubbleActive: {
    backgroundColor: "#0C4A94",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5
  },
  pinBubbleCompleted: {
    backgroundColor: "#16A34A"
  },
  pinText: {
    fontSize: 12,
    fontWeight: "900",
    color: "white"
  },
  pinTextActive: {
    fontSize: 13
  },
  floatingUserTag: {
    position: "absolute",
    top: -20,
    backgroundColor: "#059669",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  floatingUserTagText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800"
  },

  // Floating Control Button
  btnCurrentLocation: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  btnCurrentLocationText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0C4A94"
  },

  // Selected Point Info Banner
  pointInfoBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  pointInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  pointIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  pointInfoTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A"
  },
  pointInfoSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },

  // Footer Action Buttons
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 12
  },
  btnStartNav: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0C4A94",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  btnStartNavText: {
    color: "#0C4A94",
    fontSize: 14,
    fontWeight: "900"
  },
  btnGoToPoint: {
    flex: 1.2,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0C4A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnGoToPointText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  }
});
