import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import TopBar from "../components/TopBar";

export default function ScoreDetailScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="รายละเอียดคะแนน" back />
      <View style={styles.card}>
        <View style={styles.donut}>
          <View style={styles.inner}>
            <Text style={styles.number}>95</Text>
            <Text style={styles.slash}>/100</Text>
          </View>
        </View>

        <View style={styles.legend}>
          <Row label="ตรวจตรงเวลา" value="+90 คะแนน" color={COLORS.green} />
          <Row label="ตรวจล่าช้า" value="-5 คะแนน" color={COLORS.red} />
          <Row label="ขาดตรวจ" value="0 คะแนน" color={COLORS.text} />
          <Row label="โบนัสอื่นๆ" value="+10 คะแนน" color={COLORS.green} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>เกณฑ์การให้คะแนน</Text>
        <Row label="ตรวจตรงเวลา (28 จุด)" value="+90" color={COLORS.green} />
        <Row label="ตรวจล่าช้า (2 จุด)" value="-5" color={COLORS.red} />
        <Row label="ขาดตรวจ (0 จุด)" value="0" color={COLORS.text} />
        <Row label="โบนัสอื่นๆ" value="+10" color={COLORS.green} />
        <View style={styles.full}><Text style={styles.fullText}>คะแนนเต็ม 100 คะแนน</Text></View>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={[styles.value,{color}]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.background},
  card:{margin:14,padding:16,borderRadius:16,backgroundColor:"white",borderWidth:1,borderColor:COLORS.border},
  donut:{width:150,height:150,borderRadius:75,backgroundColor:"#E4ECF7",borderWidth:18,borderColor:COLORS.blue,alignSelf:"center",alignItems:"center",justifyContent:"center"},
  inner:{alignItems:"center"},
  number:{fontSize:34,fontWeight:"900",color:COLORS.blue},
  slash:{fontSize:12,color:COLORS.muted},
  legend:{marginTop:16,gap:10},
  row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:6},
  label:{color:COLORS.text},
  value:{fontWeight:"900"},
  title:{fontSize:16,fontWeight:"900",color:COLORS.text,marginBottom:8},
  full:{marginTop:12,padding:12,borderRadius:10,backgroundColor:"#FFF7D8",alignItems:"center"},
  fullText:{fontWeight:"900",color:"#8D6A00"}
});
