import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import TopBar from "../../components/TopBar";

const scores = [88, 92, 90, 95, 93, 94, 95];

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="สรุปผลคะแนน" />
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>คะแนนความประพฤติ</Text>
        <Text style={styles.score}>95<Text style={styles.scoreSlash}>/100</Text></Text>
        <Text style={styles.good}>● ดีมาก</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>คะแนนย้อนหลัง 7 วัน</Text>
        <View style={styles.chart}>
          {scores.map((value, i) => (
            <View style={styles.barWrap} key={i}>
              <Text style={styles.barValue}>{value}</Text>
              <View style={[styles.bar, { height: Math.max(30, (value - 80) * 5) }]} />
            </View>
          ))}
        </View>
        <View style={styles.axis}>
          {["8","9","10","11","12","13","14"].map((d) => <Text key={d}>{d}</Text>)}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.stats}>
          <Stat title="28" label="ตรวจตรงเวลา" />
          <Stat title="2" label="ตรวจล่าช้า" danger />
          <Stat title="0" label="ขาดตรวจ" />
        </View>
      </View>

      <Pressable style={styles.detailBtn} onPress={() => router.push("/score-detail")}>
        <Text style={styles.detailText}>ดูรายละเอียดคะแนน</Text>
        <Ionicons name="chevron-forward" size={24} color={COLORS.blue} />
      </Pressable>
    </ScrollView>
  );
}

function Stat({ title, label, danger }: { title: string; label: string; danger?: boolean }) {
  return (
    <View style={{ flex:1, alignItems:"center" }}>
      <Text style={[styles.statTitle, danger && { color: COLORS.red }]}>{title}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex:1, backgroundColor: COLORS.background },
  hero: { alignItems:"center", paddingVertical:28 },
  heroLabel: { color: COLORS.muted, fontWeight:"700" },
  score: { fontSize:52, fontWeight:"900", color:COLORS.blue, marginTop:4 },
  scoreSlash: { fontSize:24, color:COLORS.muted },
  good: { color:COLORS.green, fontWeight:"900" },
  card: { margin:14, padding:16, borderRadius:16, backgroundColor:"white", borderWidth:1, borderColor:COLORS.border },
  cardTitle:{ fontWeight:"900", color:COLORS.text, marginBottom:10 },
  chart:{ height:155, flexDirection:"row", alignItems:"flex-end", gap:9, borderBottomWidth:1, borderBottomColor:COLORS.border },
  barWrap:{ flex:1, alignItems:"center", justifyContent:"flex-end", gap:3 },
  bar:{ width:18, borderRadius:6, backgroundColor:COLORS.blue2 },
  barValue:{ fontSize:9, color:COLORS.muted },
  axis:{ flexDirection:"row", justifyContent:"space-between", paddingTop:5 },
  stats:{ flexDirection:"row" },
  statTitle:{ fontSize:26, fontWeight:"900", color:COLORS.blue },
  statLabel:{ fontSize:11, color:COLORS.muted, marginTop:2 },
  detailBtn:{ marginHorizontal:14, minHeight:54, borderWidth:2, borderColor:COLORS.blue, borderRadius:14, backgroundColor:"white", flexDirection:"row", justifyContent:"center", alignItems:"center", gap:5 },
  detailText:{ color:COLORS.blue, fontWeight:"900" }
});
