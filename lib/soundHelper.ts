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

const STORAGE_CUSTOM_SOUNDS_KEY = "checkpoint_custom_sounds_v1";
const STORAGE_VOLUME_KEY = "checkpoint_app_volume_v1";

let customSoundsList: SoundOption[] = [...DEFAULT_SOUNDS];
let currentSoundObject: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;
let appVolume: number = 1.0;
let isInitialized = false;

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}

// Load saved custom sounds & volume from local storage on app startup
async function loadPersistedSounds() {
  if (isInitialized) return;
  try {
    const savedSoundsJson = await AsyncStorage.getItem(STORAGE_CUSTOM_SOUNDS_KEY);
    if (savedSoundsJson) {
      const parsed: SoundOption[] = JSON.parse(savedSoundsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        customSoundsList = [...parsed, ...DEFAULT_SOUNDS];
      }
    }
    const savedVol = await AsyncStorage.getItem(STORAGE_VOLUME_KEY);
    if (savedVol) {
      const volNum = parseFloat(savedVol);
      if (!isNaN(volNum)) {
        appVolume = volNum;
      }
    }
  } catch (err) {
    console.log("Error loading custom sounds from storage:", err);
  } finally {
    isInitialized = true;
    notify();
  }
}

// Automatically initiate load
loadPersistedSounds();

async function saveCustomSounds() {
  try {
    const onlyCustom = customSoundsList.filter((s) => s.isCustom);
    await AsyncStorage.setItem(STORAGE_CUSTOM_SOUNDS_KEY, JSON.stringify(onlyCustom));
  } catch (err) {
    console.log("Error saving custom sounds to storage:", err);
  }
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
    AsyncStorage.setItem(STORAGE_VOLUME_KEY, appVolume.toString()).catch(() => {});
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
    saveCustomSounds();
    notify();
    return newSound;
  },

  removeCustomSound(id: string) {
    customSoundsList = customSoundsList.filter((s) => s.id !== id);
    saveCustomSounds();
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
