import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { importLocalPhoto, pickPhoto, shareOriginal } from './features/photos/photo-service';
import { errorMessage, type ImportedPhoto, type PhotoInput } from './features/photos/photo-policy';
import { useIncomingPhoto } from './features/photos/use-incoming-photo';
import { ND_STYLES } from './features/styles/catalog';
import './index.css';

function Studio() {
  const [photo, setPhoto] = useState<ImportedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operation = useRef(0);
  const reportError = useCallback((value: unknown) => setError(errorMessage(value)), []);

  const receive = useCallback(async (input: PhotoInput) => {
    const id = ++operation.current;
    setBusy(true);
    setError(null);
    try {
      const imported = await importLocalPhoto(input, 'share');
      if (id === operation.current) setPhoto(imported);
    } catch (value) {
      if (id === operation.current) reportError(value);
    } finally {
      if (id === operation.current) setBusy(false);
    }
  }, [reportError]);
  useIncomingPhoto(receive, reportError);

  const importPhoto = async () => {
    const id = ++operation.current;
    setBusy(true);
    setError(null);
    try {
      const imported = await pickPhoto();
      if (imported && id === operation.current) setPhoto(imported);
    } catch (value) {
      if (id === operation.current) reportError(value);
    } finally {
      if (id === operation.current) setBusy(false);
    }
  };

  const share = async () => {
    if (!photo || busy) return;
    const id = ++operation.current;
    setBusy(true);
    setError(null);
    try { await shareOriginal(photo); }
    catch (value) { if (id === operation.current) reportError(value); }
    finally { if (id === operation.current) setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1017' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mx-auto w-full max-w-2xl gap-7 p-6">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary">
                <Text className="text-lg font-black text-primary-foreground">ND</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-foreground">ND Camera</Text>
                <Text className="text-xs tracking-widest text-muted">PHOTO COMPANION</Text>
              </View>
            </View>
            <View className="rounded-full border border-border px-3 py-1.5">
              <Text className="text-xs text-muted">v0.1 starter</Text>
            </View>
          </View>
          <View className="gap-3">
            <Text accessibilityRole="header" className="text-4xl font-bold leading-tight text-foreground">Your camera.{"\n"}Your workflow.</Text>
            <Text className="text-base leading-6 text-muted">Keep the capture you love. Bring a photo from your gallery or a compatible editor, including Snapseed exports.</Text>
            <Text className="text-xs font-semibold tracking-widest text-primary">ON-DEVICE / NO ACCOUNT / ORIGINALS UNTOUCHED</Text>
          </View>
          <View className="overflow-hidden rounded-3xl border border-border bg-card">
            {photo ? (
              <View>
                <Image accessibilityLabel={`Original photo: ${photo.name ?? 'Imported image'}`}
                  source={{ uri: photo.uri }} resizeMode="contain"
                  style={{ width: '100%', height: 360, backgroundColor: '#070b10' }}
                  onError={() => reportError(new Error('Preview unavailable. Try importing a JPEG version.'))} />
                <View className="gap-1 p-5">
                  <Text numberOfLines={1} className="font-semibold text-foreground">{photo.name}</Text>
                  <Text className="text-sm text-muted">{photo.width} x {photo.height} / {(photo.byteSize / 1024 / 1024).toFixed(1)} MB / Original</Text>
                </View>
              </View>
            ) : (
              <View className="items-center gap-3 px-6 py-14">
                <View className="h-16 w-16 items-center justify-center rounded-full border border-border"><Text className="text-3xl text-primary">+</Text></View>
                <Text className="text-xl font-semibold text-foreground">Start with a photo</Text>
                <Text className="text-center leading-6 text-muted">Choose one image. ND Camera does not need access to your entire library.</Text>
              </View>
            )}
          </View>
          {error && <View accessibilityLiveRegion="polite" className="rounded-2xl border border-red-400/40 bg-red-950/40 p-4"><Text className="text-sm leading-5 text-red-200">{error}</Text></View>}
          <View className="gap-3">
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
              onPress={() => void importPhoto()}
              className="min-h-14 items-center justify-center rounded-2xl bg-primary px-5 py-4 active:opacity-80 disabled:opacity-50">
              {busy ? <ActivityIndicator color="#102000" accessibilityLabel="Working with your photo" /> : <Text className="text-base font-bold text-primary-foreground">{photo ? 'Import another photo' : 'Import a photo'}</Text>}
            </Pressable>
            {photo && Platform.OS !== 'web' && <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
              onPress={() => void share()} className="min-h-14 items-center justify-center rounded-2xl border border-border px-5 py-4 active:opacity-70 disabled:opacity-50">
              <Text className="text-base font-semibold text-foreground">Share original</Text>
            </Pressable>}
            <Text className="text-xs leading-5 text-muted">{Platform.OS === 'web' ? 'Web is a local preview. Use a mobile build for sharing between apps.' : 'Choose Snapseed if it appears in your share sheet. Original metadata, including location if present, may be shared.'}</Text>
          </View>
          <View className="gap-3">
            <View className="flex-row items-center justify-between"><Text accessibilityRole="header" className="text-xl font-semibold text-foreground">ND Styles</Text><Text className="text-xs text-muted">NEXT MILESTONE</Text></View>
            {ND_STYLES.map((style) => <View key={style.id} className="flex-row items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
              <View className="flex-1 gap-1"><Text className="font-semibold text-foreground">{style.name}</Text><Text className="text-sm text-muted">{style.description}</Text></View>
              <Text className="ml-3 text-xs text-muted">Planned</Text>
            </View>)}
            <Text className="text-sm leading-6 text-muted">Style processing is not implemented in this starter. The preview and shared file are unfiltered originals, not an iPhone look.</Text>
          </View>
          <View className="gap-2 rounded-3xl border border-border p-5">
            <Text accessibilityRole="header" className="font-semibold text-foreground">Made to fit your photo workflow</Text>
            <Text className="text-sm leading-6 text-muted">Stock camera to gallery to ND Camera. Or edit in Snapseed, export, then import here. Snapseed is optional; no editor is embedded.</Text>
            <Text className="text-xs leading-5 text-muted">Android share-in needs a native development build and device testing. iOS share-in, ND capture, and styled export are not enabled yet.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Studio /></SafeAreaProvider>;
}
