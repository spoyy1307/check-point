import { Vibration } from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_CUSTOM_SOUNDS_PREFIX = "checkpoint_custom_sounds_guard_";
const STORAGE_VOLUME_PREFIX = "checkpoint_app_volume_guard_";

let currentGuardId: string = "default";
let customSoundsList: SoundOption[] = [...DEFAULT_SOUNDS];
let currentSoundObject: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;
let appVolume: number = 1.0;

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}

async function loadPersistedSoundsForGuard(guardId: string) {
  currentGuardId = guardId || "default";
  try {
    const key = `${STORAGE_CUSTOM_SOUNDS_PREFIX}${currentGuardId}`;
    const volKey = `${STORAGE_VOLUME_PREFIX}${currentGuardId}`;

    const savedSoundsJson = await AsyncStorage.getItem(key);
    if (savedSoundsJson) {
      const parsed: SoundOption[] = JSON.parse(savedSoundsJson);
      if (Array.isArray(parsed)) {
        customSoundsList = [...parsed, ...DEFAULT_SOUNDS];
      } else {
        customSoundsList = [...DEFAULT_SOUNDS];
      }
    } else {
      customSoundsList = [...DEFAULT_SOUNDS];
    }

    const savedVol = await AsyncStorage.getItem(volKey);
    if (savedVol) {
      const volNum = parseFloat(savedVol);
      if (!isNaN(volNum)) {
        appVolume = volNum;
      }
    } else {
      appVolume = 1.0;
    }
  } catch (err) {
    console.log("Error loading custom sounds for guard:", err);
    customSoundsList = [...DEFAULT_SOUNDS];
  } finally {
    notify();
  }
}

async function saveCustomSoundsForGuard() {
  try {
    const key = `${STORAGE_CUSTOM_SOUNDS_PREFIX}${currentGuardId || "default"}`;
    const onlyCustom = customSoundsList.filter((s) => s.isCustom);
    await AsyncStorage.setItem(key, JSON.stringify(onlyCustom));
  } catch (err) {
    console.log("Error saving custom sounds for guard:", err);
  }
}

// Initial load
loadPersistedSoundsForGuard("default");

export const soundHelper = {
  async loadSoundsForGuard(guardId: string) {
    if (guardId !== currentGuardId) {
      await loadPersistedSoundsForGuard(guardId);
    }
  },

  getSounds(): SoundOption[] {
    return customSoundsList && customSoundsList.length > 0 ? customSoundsList : [...DEFAULT_SOUNDS];
  },

  getVolume(): number {
    return appVolume;
  },

  setVolume(vol: number) {
    appVolume = Math.max(0.1, Math.min(1.0, vol));
    const volKey = `${STORAGE_VOLUME_PREFIX}${currentGuardId || "default"}`;
    AsyncStorage.setItem(volKey, appVolume.toString()).catch(() => {});
    notify();
  },

  addCustomSound(name: string, uri: string): SoundOption {
    const newSound: SoundOption = {
      id: `custom_${currentGuardId}_${Date.now()}`,
      name: name || `เสียงกำหนดเอง ${customSoundsList.filter(s => s.isCustom).length + 1}`,
      uri: uri,
      icon: "musical-notes",
      isCustom: true
    };
    customSoundsList = [newSound, ...customSoundsList];
    saveCustomSoundsForGuard();
    notify();
    return newSound;
  },

  removeCustomSound(id: string) {
    customSoundsList = customSoundsList.filter((s) => s.id !== id);
    saveCustomSoundsForGuard();
    notify();
  },

  async playSound(soundIdOrUri: string, overrideVol?: number) {
    try {
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

      let soundUri: string | null = null;
      const targetSound = customSoundsList.find((s) => s.id === soundIdOrUri);

      if (targetSound?.uri) {
        soundUri = targetSound.uri;
      } else if (soundIdOrUri.startsWith("file://") || soundIdOrUri.startsWith("http://") || soundIdOrUri.startsWith("https://")) {
        soundUri = soundIdOrUri;
      } else {
        soundUri = DEFAULT_SOUNDS[0].uri!;
      }

      const volumeToPlay = typeof overrideVol === "number" ? overrideVol : appVolume;

      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true, volume: volumeToPlay }
      );

      currentSoundObject = sound;
      await sound.setVolumeAsync(volumeToPlay);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (currentSoundObject === sound) {
            currentSoundObject = null;
          }
        }
      });
    } catch (err) {
      console.log("Error playing audio sound:", err);
    }
  },

  async startRecording(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return false;

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
