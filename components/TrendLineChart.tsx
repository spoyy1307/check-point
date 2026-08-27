import React, { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

export type TrendPoint = {
  day: string;
  score: number;
  fullDate?: string;
};

type Props = {
  data: TrendPoint[];
  selectedIndex?: number;
  onSelectPoint?: (index: number) => void;
};

export default function TrendLineChart({ data, selectedIndex, onSelectPoint }: Props) {
  const [chartWidth, setChartWidth] = useState<number>(0);

  const chartHeight = 135;
  const yLabels = [100, 80, 60, 40, 20, 0];
  const maxScore = 100;
  const minScore = 0;

  // Check if it's 7 days view or long range (14 / 30 days)
  const isSevenDays = data.length <= 7;

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== chartWidth) {
      setChartWidth(width);
    }
  };

  // Calculate coordinates for points
  const points = data.map((d, index) => {
    const x = data.length > 1 && chartWidth > 0 ? (index / (data.length - 1)) * chartWidth : 0;
    const normalized = (d.score - minScore) / (maxScore - minScore);
    const y = (1 - normalized) * chartHeight + 14;
    return { ...d, x, y, index };
  });

  return (
    <View style={[styles.container, !isSevenDays && { height: 180 }]}>
      {/* 1. Y-Axis Labels and Horizontal Grid Lines */}
      <View style={styles.gridContainer}>
        {yLabels.map((val) => (
          <View key={val} style={styles.gridRow}>
            <Text style={styles.yLabel}>{val}</Text>
            <View style={styles.gridLine} />
          </View>
        ))}
      </View>

      {/* 2. Main Plot Area with Connecting Lines, Area Fill, and Dots */}
      <View style={styles.plotContainer} onLayout={handleLayout}>
        {chartWidth > 0 && (
          <>
            {/* Area Fill Underneath Line */}
            {points.map((pt, i) => {
              if (i === points.length - 1) return null;
              const next = points[i + 1];
              const segLeft = pt.x;
              const segWidth = next.x - pt.x;
              const avgTop = (pt.y + next.y) / 2;
              const segHeight = chartHeight + 16 - avgTop;

              return (
                <View
                  key={`area-${i}`}
                  style={[
                    styles.areaBlock,
                    {
                      left: segLeft,
                      width: segWidth,
                      top: avgTop,
                      height: Math.max(0, segHeight)
                    }
                  ]}
                />
              );
            })}

            {/* Connecting Green Line Segments */}
            {points.map((pt, i) => {
              if (i === points.length - 1) return null;
              const next = points[i + 1];
              const dx = next.x - pt.x;
              const dy = next.y - pt.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              const cx = (pt.x + next.x) / 2;
              const cy = (pt.y + next.y) / 2;

              return (
                <View
                  key={`line-${i}`}
                  style={[
                    styles.lineSegment,
                    {
                      left: cx - length / 2,
                      top: cy - 1.5,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }]
                    }
                  ]}
                />
              );
            })}

            {/* Data Point Dots & Labels */}
            {points.map((pt, i) => {
              const isSelected = selectedIndex === i;

              return (
                <View
                  key={`node-${i}`}
                  style={[
                    styles.nodeHitArea,
                    {
                      left: pt.x - 16,
                      top: pt.y - 16
                    }
                  ]}
                >
                  {/* Score Number: Only shown for 7 Days View */}
                  {isSevenDays && (
                    <View style={styles.scoreTagWrap}>
                      <Text
                        style={[
                          styles.scoreTagText,
                          isSelected && styles.scoreTagTextSelected
                        ]}
                      >
                        {pt.score}
                      </Text>
                    </View>
                  )}

                  {/* Circular Node */}
                  <View
                    style={[
                      styles.dotNode,
                      !isSevenDays && styles.dotNodeSmall,
                      isSelected && styles.dotNodeSelected
                    ]}
                  >
                    <View
                      style={[
                        styles.dotNodeCore,
                        !isSevenDays && styles.dotNodeCoreSmall,
                        isSelected && styles.dotNodeCoreSelected
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>

      {/* 3. X-Axis Date Labels: Only Shown for 7 Days View */}
      {isSevenDays && (
        <View style={styles.xAxisWrap}>
          {data.map((item, index) => (
            <Text key={index} style={styles.xAxisLabel} numberOfLines={1}>
              {item.day}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    position: "relative",
    marginTop: 4
  },
  gridContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 12,
    height: 135,
    justifyContent: "space-between"
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  yLabel: {
    width: 26,
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "600",
    textAlign: "right",
    paddingRight: 6
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F1F5F9"
  },
  plotContainer: {
    position: "absolute",
    left: 32,
    right: 14,
    top: 0,
    height: 160
  },
  areaBlock: {
    position: "absolute",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3
  },
  lineSegment: {
    position: "absolute",
    height: 2.75,
    backgroundColor: "#10B981",
    borderRadius: 1.5,
    zIndex: 2
  },
  nodeHitArea: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  scoreTagWrap: {
    position: "absolute",
    top: -14,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4
  },
  scoreTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A"
  },
  scoreTagTextSelected: {
    color: "#0C4A94",
    fontSize: 12,
    fontWeight: "900"
  },

  dotNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 3
  },
  dotNodeSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.25,
    shadowOpacity: 0,
    elevation: 0
  },
  dotNodeSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0C4A94",
    borderWidth: 2,
    borderColor: "#93C5FD"
  },
  dotNodeCore: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "white"
  },
  dotNodeCoreSmall: {
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75
  },
  dotNodeCoreSelected: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: "white"
  },

  // X-Axis Labels (Only rendered for 7 Days)
  xAxisWrap: {
    position: "absolute",
    bottom: 4,
    left: 28,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  xAxisLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    textAlign: "center",
    flex: 1
  }
});
