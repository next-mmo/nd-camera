import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { importLocalPhoto, pickPhoto, shareOriginal } from './features/photos/photo-service';
import { errorMessage, type ImportedPhoto, type PhotoInput } from './features/photos/photo-policy';
import { useIncomingPhoto } from './features/photos/use-incoming-photo';
import { ND_STYLES } from './features/styles/catalog';
import { renderStyledPhoto, shareStyled, type RenderResult } from './features/styles/style-service';
import './index.css';

export function Studio() {
  const [originalPhoto, setOriginalPhoto] = useState<ImportedPhoto | null>(null);
  const [renderedPhoto, setRenderedPhoto] = useState<RenderResult | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('natural');
  const [styleStrength, setStyleStrength] = useState<number>(1.0);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operation = useRef(0);
  const reportError = useCallback((value: unknown) => setError(errorMessage(value)), []);

  // Re-render when original photo, style, or strength changes
  const applySelectedStyle = useCallback(
    async (source: ImportedPhoto, styleId: string, strength: number) => {
      const id = ++operation.current;
      setIsRendering(true);
      setError(null);
      try {
        const result = await renderStyledPhoto(source, styleId, strength);
        if (id === operation.current) {
          setRenderedPhoto(result);
        }
      } catch (err) {
        if (id === operation.current) {
          reportError(err);
        }
      } finally {
        if (id === operation.current) {
          setIsRendering(false);
        }
      }
    },
    [reportError],
  );

  const onPhotoLoaded = useCallback(
    (imported: ImportedPhoto) => {
      setOriginalPhoto(imported);
      void applySelectedStyle(imported, selectedStyleId, styleStrength);
    },
    [applySelectedStyle, selectedStyleId, styleStrength],
  );

  const receive = useCallback(
    async (input: PhotoInput) => {
      setBusy(true);
      setError(null);
      try {
        const imported = await importLocalPhoto(input, 'share');
        onPhotoLoaded(imported);
      } catch (value) {
        reportError(value);
      } finally {
        setBusy(false);
      }
    },
    [onPhotoLoaded, reportError],
  );

  useIncomingPhoto(receive, reportError);

  const importPhoto = async () => {
    setBusy(true);
    setError(null);
    try {
      const imported = await pickPhoto();
      if (imported) onPhotoLoaded(imported);
    } catch (value) {
      reportError(value);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectStyle = (styleId: string) => {
    setSelectedStyleId(styleId);
    if (originalPhoto) {
      void applySelectedStyle(originalPhoto, styleId, styleStrength);
    }
  };

  const handleSelectStrength = (strength: number) => {
    setStyleStrength(strength);
    if (originalPhoto) {
      void applySelectedStyle(originalPhoto, selectedStyleId, strength);
    }
  };

  const handleShare = async () => {
    if (!originalPhoto || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (renderedPhoto && selectedStyleId !== 'original') {
        await shareStyled(renderedPhoto, originalPhoto);
      } else {
        await shareOriginal(originalPhoto);
      }
    } catch (value) {
      reportError(value);
    } finally {
      setBusy(false);
    }
  };

  const handleShareOriginalOnly = async () => {
    if (!originalPhoto || busy) return;
    setBusy(true);
    setError(null);
    try {
      await shareOriginal(originalPhoto);
    } catch (value) {
      reportError(value);
    } finally {
      setBusy(false);
    }
  };

  const activeStyle = ND_STYLES.find((s) => s.id === selectedStyleId);
  const displayUri =
    showOriginalComparison || selectedStyleId === 'original' || !renderedPhoto
      ? originalPhoto?.uri
      : renderedPhoto.uri;

  const styleLabel =
    selectedStyleId === 'original'
      ? 'Original'
      : `${activeStyle?.name ?? 'Styled'} (${Math.round(styleStrength * 100)}%)`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1017' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mx-auto w-full max-w-2xl gap-6 p-5">
          {/* Header */}
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
            <View className="rounded-full border border-border px-3 py-1.5 bg-card">
              <Text className="text-xs text-primary font-semibold">v0.2 MVP</Text>
            </View>
          </View>

          {/* Title Banner */}
          <View className="gap-2">
            <Text accessibilityRole="header" className="text-3xl font-extrabold leading-tight text-foreground">
              Your camera.{"\n"}Your workflow.
            </Text>
            <Text className="text-sm leading-5 text-muted">
              Bring any photo from your gallery or camera. Apply calibrated ND styles with zero cloud upload and your originals kept untouched.
            </Text>
          </View>

          {/* Photo Display Card */}
          <View className="overflow-hidden rounded-3xl border border-border bg-card">
            {originalPhoto ? (
              <View>
                <View style={{ position: 'relative', width: '100%', height: 380, backgroundColor: '#070b10' }}>
                  {displayUri && (
                    <Image
                      accessibilityLabel={`Photo: ${originalPhoto.name ?? 'Imported image'}`}
                      source={{ uri: displayUri }}
                      resizeMode="contain"
                      style={{ width: '100%', height: '100%' }}
                      onError={() => reportError(new Error('Preview unavailable. Try importing a JPEG version.'))}
                    />
                  )}

                  {/* Active Profile Pill Overlay */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      backgroundColor: 'rgba(11, 16, 23, 0.85)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#222f3e',
                    }}>
                    <Text style={{ color: '#88e040', fontSize: 12, fontWeight: '700' }}>
                      {showOriginalComparison ? 'Comparing: Original' : styleLabel}
                    </Text>
                  </View>

                  {/* Rendering Indicator */}
                  {isRendering && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        backgroundColor: 'rgba(11, 16, 23, 0.85)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                      <ActivityIndicator size="small" color="#88e040" />
                      <Text style={{ color: '#ffffff', fontSize: 11 }}>Styling...</Text>
                    </View>
                  )}

                  {/* Hold to Compare Button */}
                  {selectedStyleId !== 'original' && (
                    <Pressable
                      onPressIn={() => setShowOriginalComparison(true)}
                      onPressOut={() => setShowOriginalComparison(false)}
                      style={{
                        position: 'absolute',
                        bottom: 14,
                        right: 14,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#444',
                      }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                        Hold to Compare
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* File Metadata */}
                <View className="gap-1 p-4 border-t border-border">
                  <Text numberOfLines={1} className="font-semibold text-foreground">
                    {originalPhoto.name}
                  </Text>
                  <Text className="text-xs text-muted">
                    {originalPhoto.width} × {originalPhoto.height} •{' '}
                    {(originalPhoto.byteSize / 1024 / 1024).toFixed(1)} MB • {styleLabel}
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => void importPhoto()}
                className="items-center gap-3 px-6 py-16 active:opacity-80">
                <View className="h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                  <Text className="text-3xl text-primary font-bold">+</Text>
                </View>
                <Text className="text-xl font-bold text-foreground">Start with a photo</Text>
                <Text className="text-center text-sm leading-5 text-muted max-w-xs">
                  Tap to choose an image from your gallery, or share an image to ND Camera from any app.
                </Text>
              </Pressable>
            )}
          </View>

          {/* Error Banner */}
          {error && (
            <View
              accessibilityLiveRegion="polite"
              className="rounded-2xl border border-red-400/40 bg-red-950/40 p-4">
              <Text className="text-sm leading-5 text-red-200">{error}</Text>
            </View>
          )}

          {/* Styles Selector */}
          {originalPhoto && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text accessibilityRole="header" className="text-lg font-bold text-foreground">
                  ND Styles
                </Text>
                <Text className="text-xs text-primary font-semibold">CALIBRATED SDR</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {/* Original Style Card */}
                <Pressable
                  onPress={() => handleSelectStyle('original')}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: selectedStyleId === 'original' ? '#88e040' : '#222f3e',
                    backgroundColor: selectedStyleId === 'original' ? '#142010' : '#111722',
                    minWidth: 130,
                  }}>
                  <Text style={{ color: selectedStyleId === 'original' ? '#88e040' : '#fff', fontWeight: '700', fontSize: 14 }}>
                    Original
                  </Text>
                  <Text style={{ color: '#8899a6', fontSize: 11, marginTop: 4 }}>
                    Unaltered source
                  </Text>
                </Pressable>

                {/* Available ND Styles */}
                {ND_STYLES.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  return (
                    <Pressable
                      key={style.id}
                      onPress={() => handleSelectStyle(style.id)}
                      style={{
                        padding: 14,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: isSelected ? '#88e040' : '#222f3e',
                        backgroundColor: isSelected ? '#142010' : '#111722',
                        minWidth: 140,
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: isSelected ? '#88e040' : '#fff', fontWeight: '700', fontSize: 14 }}>
                          {style.name}
                        </Text>
                      </View>
                      <Text style={{ color: '#8899a6', fontSize: 11, marginTop: 4 }}>
                        {style.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Strength Presets (if styled) */}
              {selectedStyleId !== 'original' && (
                <View className="mt-2 rounded-2xl border border-border bg-card p-4 gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold text-foreground">Style Strength</Text>
                    <Text className="text-xs font-bold text-primary">{Math.round(styleStrength * 100)}%</Text>
                  </View>
                  <View className="flex-row gap-2">
                    {[0.25, 0.5, 0.75, 1.0].map((val) => (
                      <Pressable
                        key={val}
                        onPress={() => handleSelectStrength(val)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: styleStrength === val ? '#88e040' : '#1a2332',
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: styleStrength === val ? '#0b1017' : '#fff',
                          }}>
                          {Math.round(val * 100)}%
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3 pt-2">
            {originalPhoto ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy || isRendering }}
                  disabled={busy || isRendering}
                  onPress={() => void handleShare()}
                  className="min-h-14 items-center justify-center rounded-2xl bg-primary px-5 py-4 active:opacity-80 disabled:opacity-50">
                  {busy ? (
                    <ActivityIndicator color="#102000" />
                  ) : (
                    <Text className="text-base font-bold text-primary-foreground">
                      {selectedStyleId === 'original'
                        ? 'Share original photo'
                        : `Share ${activeStyle?.name ?? 'styled'} photo`}
                    </Text>
                  )}
                </Pressable>

                {selectedStyleId !== 'original' && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => void handleShareOriginalOnly()}
                    className="min-h-12 items-center justify-center rounded-2xl border border-border px-5 py-3 active:opacity-70 disabled:opacity-50">
                    <Text className="text-sm font-semibold text-foreground">Share original unaltered file</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => void importPhoto()}
                  className="min-h-12 items-center justify-center rounded-2xl border border-border/60 px-5 py-3 active:opacity-70">
                  <Text className="text-sm font-semibold text-muted">Choose another photo</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => void importPhoto()}
                className="min-h-14 items-center justify-center rounded-2xl bg-primary px-5 py-4 active:opacity-80 disabled:opacity-50">
                {busy ? (
                  <ActivityIndicator color="#102000" />
                ) : (
                  <Text className="text-base font-bold text-primary-foreground">Import a photo</Text>
                )}
              </Pressable>
            )}
            <Text className="text-xs leading-5 text-muted text-center">
              Originals are never modified or overwritten. Styled outputs are rendered in 8-bit sRGB and saved as new exports.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Studio />
    </SafeAreaProvider>
  );
}
