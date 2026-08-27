import { Vibration } from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export type SoundOption = {
  id: string;
  name: string;
  uri?: string;
  icon?: string;
  isCustom?: boolean;
};

export const DEFAULT_SOUNDS: SoundOption[] = [
  {
    id: "beep",
    name: "เสียงบี๊บมาตรฐาน (Loud Beep)",
    uri: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    icon: "volume-high-outline",
    isCustom: false
  },
  {
    id: "radar",
    name: "เสียงเรดาร์ตรวจจับ (Radar Ping)",
    uri: "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
    icon: "radio-outline",
    isCustom: false
  },
  {
    id: "chime",
    name: "เสียงกระดิ่งสำเร็จ (Success Chime)",
    uri: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    icon: "notifications-outline",
    isCustom: false
  },
  {
    id: "double",
    name: "เสียงดับเบิ้ลบี๊บ (Double Beep)",
    uri: "https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3",
    icon: "play-forward-outline",
    isCustom: false
  },
  {
    id: "walkie",
    name: "เสียงวอตรวจจุด (Walkie Chirp)",
    uri: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
    icon: "mic-outline",
    isCustom: false
  },
  {
    id: "security_bell",
    name: "เสียงกริ่งความปลอดภัย (Security Bell)",
    uri: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3",
    icon: "shield-checkmark-outline",
    isCustom: false
  }
];

let customSoundsList: SoundOption[] = [...DEFAULT_SOUNDS];
let currentSoundObject: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;
let appVolume: number = 1.0;

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}

export const soundHelper = {
  getSounds(): SoundOption[] {
    return customSoundsList && customSoundsList.length > 0 ? customSoundsList : [...DEFAULT_SOUNDS];
  },

  getVolume(): number {
    return appVolume;
  },

  setVolume(vol: number) {
    appVolume = Math.max(0.1, Math.min(1.0, vol));
    notify();
  },

  addCustomSound(name: string, uri: string): SoundOption {
    const newSound: SoundOption = {
      id: `custom_${Date.now()}`,
      name: name || `เสียงกำหนดเอง ${customSoundsList.length + 1}`,
      uri: uri,
      icon: "musical-notes",
      isCustom: true
    };
    customSoundsList = [newSound, ...customSoundsList];
    notify();
    return newSound;
  },

  removeCustomSound(id: string) {
    customSoundsList = customSoundsList.filter((s) => s.id !== id);
    notify();
  },

  async playSound(soundIdOrUri: string, overrideVol?: number) {
    try {
      Vibration.vibrate(80);

      // Force Audio Mode to use Main Loudspeaker at Full Volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false
      });

      if (currentSoundObject) {
        try {
          await currentSoundObject.stopAsync();
          await currentSoundObject.unloadAsync();
        } catch {}
        currentSoundObject = null;
      }

      // Find sound URI
      const found = customSoundsList.find((s) => s.id === soundIdOrUri || s.name === soundIdOrUri);
      const url = found?.uri || soundIdOrUri || DEFAULT_SOUNDS[0].uri;
      const targetVolume = overrideVol !== undefined ? overrideVol : appVolume;

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: true,
          volume: targetVolume,
          isMuted: false
        }
      );
      currentSoundObject = sound;
      await sound.setVolumeAsync(targetVolume);
      await sound.playAsync();
    } catch (err) {
      Vibration.vibrate([0, 100, 50, 100]);
    }
  },

  async startRecording(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      if (currentRecording) {
        try {
          await currentRecording.stopAndUnloadAsync();
        } catch {}
        currentRecording = null;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      currentRecording = recording;
      return true;
    } catch (err) {
      return false;
    }
  },

  async stopRecording(): Promise<string | null> {
    try {
      if (!currentRecording) return null;
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      currentRecording = null;

      // Reset Audio Mode back to Speakerphone Playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false
      });

      return uri;
    } catch (err) {
      currentRecording = null;
      return null;
    }
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export default soundHelper;
