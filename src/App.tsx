import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { ND_STYLES, type StyleDefinition } from './features/styles/catalog';
import { renderStyledPhoto, shareStyled, type RenderResult } from './features/styles/style-service';
import { SnapseedModal } from './features/snapseed/SnapseedModal';
import './index.css';

type CategoryFilter = 'all' | 'ios' | 'leica' | 'nd';

export function Studio() {
  const [originalPhoto, setOriginalPhoto] = useState<ImportedPhoto | null>(null);
  const [renderedPhoto, setRenderedPhoto] = useState<RenderResult | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('ios-rich-contrast');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [snapseedVisible, setSnapseedVisible] = useState(false);
  const [styleStrength, setStyleStrength] = useState<number>(1.0);
  const [toneAdjustment, setToneAdjustment] = useState<number>(0.0);
  const [warmthAdjustment, setWarmthAdjustment] = useState<number>(0.0);
  const [vignetteEnabled, setVignetteEnabled] = useState<boolean>(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operation = useRef(0);
  const reportError = useCallback((value: unknown) => setError(errorMessage(value)), []);

  const applySelectedStyle = useCallback(
    async (
      source: ImportedPhoto,
      styleId: string,
      strength: number,
      tone: number,
      warmth: number,
      vignette: boolean,
    ) => {
      const id = ++operation.current;
      setIsRendering(true);
      setError(null);
      try {
        const styleDef = ND_STYLES.find((s) => s.id === styleId);
        const vigVal = vignette
          ? Math.max(0.35, styleDef?.defaultVignette ?? 0.35)
          : (styleDef?.defaultVignette ?? 0);

        const result = await renderStyledPhoto(
          source,
          styleId,
          strength,
          tone,
          warmth,
          vigVal,
        );
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
      void applySelectedStyle(
        imported,
        selectedStyleId,
        styleStrength,
        toneAdjustment,
        warmthAdjustment,
        vignetteEnabled,
      );
    },
    [
      applySelectedStyle,
      selectedStyleId,
      styleStrength,
      toneAdjustment,
      warmthAdjustment,
      vignetteEnabled,
    ],
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

  const handleSelectStyle = (style: StyleDefinition | 'original') => {
    const id = typeof style === 'string' ? 'original' : style.id;
    setSelectedStyleId(id);
    const hasVig = typeof style === 'object' && style.defaultVignette > 0;
    setVignetteEnabled(hasVig);
    if (originalPhoto) {
      void applySelectedStyle(
        originalPhoto,
        id,
        styleStrength,
        toneAdjustment,
        warmthAdjustment,
        hasVig,
      );
    }
  };

  const handleUpdateStrength = (val: number) => {
    setStyleStrength(val);
    if (originalPhoto) {
      void applySelectedStyle(
        originalPhoto,
        selectedStyleId,
        val,
        toneAdjustment,
        warmthAdjustment,
        vignetteEnabled,
      );
    }
  };

  const handleUpdateTone = (val: number) => {
    setToneAdjustment(val);
    if (originalPhoto) {
      void applySelectedStyle(
        originalPhoto,
        selectedStyleId,
        styleStrength,
        val,
        warmthAdjustment,
        vignetteEnabled,
      );
    }
  };

  const handleUpdateWarmth = (val: number) => {
    setWarmthAdjustment(val);
    if (originalPhoto) {
      void applySelectedStyle(
        originalPhoto,
        selectedStyleId,
        styleStrength,
        toneAdjustment,
        val,
        vignetteEnabled,
      );
    }
  };

  const handleToggleVignette = () => {
    const next = !vignetteEnabled;
    setVignetteEnabled(next);
    if (originalPhoto) {
      void applySelectedStyle(
        originalPhoto,
        selectedStyleId,
        styleStrength,
        toneAdjustment,
        warmthAdjustment,
        next,
      );
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

  const filteredStyles =
    activeCategory === 'all'
      ? ND_STYLES
      : ND_STYLES.filter((s) => s.category === activeCategory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1017' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="mx-auto w-full max-w-2xl gap-5 p-5">
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
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => setSnapseedVisible(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#142E1F',
                  borderColor: '#34A853',
                  borderWidth: 1,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  gap: 5,
                }}
                accessibilityRole="button"
                accessibilityLabel="Open Snapseed QR Looks"
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34A853' }} />
                <Text style={{ color: '#4ADE80', fontSize: 11, fontWeight: '800' }}>Snapseed QR</Text>
              </Pressable>
              <View className="rounded-full border border-border px-3 py-1.5 bg-card">
                <Text className="text-xs text-primary font-semibold">Pixel 9 Pro XL</Text>
              </View>
            </View>
          </View>

          {/* Subtitle Banner */}
          <View className="gap-1.5">
            <Text accessibilityRole="header" className="text-2xl font-extrabold leading-tight text-foreground">
              iPhone & Leica Photo Styles
            </Text>
            <Text className="text-xs leading-5 text-muted">
              Turn flat Android HDR into calibrated iOS Photographic Styles or iconic Leica character. 100% on-device.
            </Text>
          </View>

          {/* Snapseed Presets Fast-Access Banner */}
          <Pressable
            onPress={() => setSnapseedVisible(true)}
            style={{
              backgroundColor: '#0F1A14',
              borderColor: '#1D3B28',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ color: '#34A853', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }}>
                  GOOGLE SNAPSEED
                </Text>
                <View style={{ backgroundColor: '#22543D', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                  <Text style={{ color: '#86EFAC', fontSize: 9, fontWeight: '700' }}>12 PRESETS</Text>
                </View>
              </View>
              <Text style={{ color: '#F0FDF4', fontSize: 13, fontWeight: '700' }}>
                Snapseed QR Looks Collection
              </Text>
              <Text style={{ color: '#86EFAC', fontSize: 11 }}>
                Scan Kodak Portra, Vintage Film & B&W directly into Snapseed
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#1E4620',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#34A853',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>Explore ➔</Text>
            </View>
          </Pressable>

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
                      backgroundColor: 'rgba(11, 16, 23, 0.88)',
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
                        backgroundColor: 'rgba(11, 16, 23, 0.88)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                      <ActivityIndicator size="small" color="#88e040" />
                      <Text style={{ color: '#ffffff', fontSize: 11 }}>Rendering...</Text>
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
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#555',
                      }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                        Hold to Compare
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* File Metadata */}
                <View className="gap-1 p-4 border-t border-border">
                  <Text numberOfLines={1} className="font-semibold text-foreground text-sm">
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
                <Text className="text-xl font-bold text-foreground">Import a Photo</Text>
                <Text className="text-center text-sm leading-5 text-muted max-w-xs">
                  Choose any photo from your Google Photos or Gallery to apply iOS or Leica styles.
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

          {/* Preset Styles Section */}
          {originalPhoto && (
            <View className="gap-3">
              {/* Category Pills */}
              <View className="flex-row items-center gap-2">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'ios', label: 'iOS Styles' },
                    { id: 'leica', label: 'Leica' },
                    { id: 'nd', label: 'ND Core' },
                  ] as const
                ).map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setActiveCategory(cat.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 14,
                      backgroundColor: activeCategory === cat.id ? '#88e040' : '#141b25',
                      borderWidth: 1,
                      borderColor: activeCategory === cat.id ? '#88e040' : '#222f3e',
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: activeCategory === cat.id ? '#0b1017' : '#8899a6',
                      }}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Preset Cards Carousel */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {/* Original */}
                {(activeCategory === 'all' || activeCategory === 'nd') && (
                  <Pressable
                    onPress={() => handleSelectStyle('original')}
                    style={{
                      padding: 14,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: selectedStyleId === 'original' ? '#88e040' : '#222f3e',
                      backgroundColor: selectedStyleId === 'original' ? '#142010' : '#111722',
                      minWidth: 145,
                    }}>
                    <Text style={{ color: selectedStyleId === 'original' ? '#88e040' : '#fff', fontWeight: '800', fontSize: 14 }}>
                      Original
                    </Text>
                    <Text style={{ color: '#8899a6', fontSize: 11, marginTop: 4 }}>
                      Unaltered source
                    </Text>
                  </Pressable>
                )}

                {filteredStyles.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  const isLeica = style.category === 'leica';
                  const isIos = style.category === 'ios';
                  return (
                    <Pressable
                      key={style.id}
                      onPress={() => handleSelectStyle(style)}
                      style={{
                        padding: 14,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: isSelected ? '#88e040' : '#222f3e',
                        backgroundColor: isSelected ? '#142010' : '#111722',
                        minWidth: 175,
                        maxWidth: 210,
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ color: isSelected ? '#88e040' : '#fff', fontWeight: '800', fontSize: 14 }}>
                          {style.name}
                        </Text>
                        {isLeica && (
                          <View style={{ backgroundColor: '#dc2626', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>LEICA</Text>
                          </View>
                        )}
                        {isIos && (
                          <View style={{ backgroundColor: '#2563eb', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>iOS</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: '#a0aec0', fontSize: 11, fontWeight: '600', marginBottom: 3 }}>
                        {style.subtitle}
                      </Text>
                      <Text numberOfLines={2} style={{ color: '#718096', fontSize: 10, lineHeight: 14 }}>
                        {style.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Fine Tuning Controls (when styled) */}
              {selectedStyleId !== 'original' && (
                <View className="mt-1 rounded-2xl border border-border bg-card p-4 gap-4">
                  {/* Strength */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-foreground">Style Strength</Text>
                      <Text className="text-xs font-bold text-primary">{Math.round(styleStrength * 100)}%</Text>
                    </View>
                    <View className="flex-row gap-2">
                      {[0.25, 0.5, 0.75, 1.0].map((val) => (
                        <Pressable
                          key={val}
                          onPress={() => handleUpdateStrength(val)}
                          style={{
                            flex: 1,
                            paddingVertical: 7,
                            borderRadius: 10,
                            backgroundColor: styleStrength === val ? '#88e040' : '#1a2332',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: styleStrength === val ? '#0b1017' : '#fff',
                            }}>
                            {Math.round(val * 100)}%
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Tone: Shadow Depth */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-foreground">Tone (Shadows & Contrast)</Text>
                      <Text className="text-xs text-muted">
                        {toneAdjustment < -0.05 ? 'Deep' : toneAdjustment > 0.05 ? 'Lifted' : 'Balanced'}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      {[
                        { label: 'Deep (-)', val: -0.5 },
                        { label: 'Standard', val: 0.0 },
                        { label: 'Lifted (+)', val: 0.5 },
                      ].map((item) => (
                        <Pressable
                          key={item.label}
                          onPress={() => handleUpdateTone(item.val)}
                          style={{
                            flex: 1,
                            paddingVertical: 7,
                            borderRadius: 10,
                            backgroundColor: toneAdjustment === item.val ? '#88e040' : '#1a2332',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: toneAdjustment === item.val ? '#0b1017' : '#fff',
                            }}>
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Warmth: Color Temperature */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-bold text-foreground">Warmth (Color Temp)</Text>
                      <Text className="text-xs text-muted">
                        {warmthAdjustment < -0.05 ? 'Cool' : warmthAdjustment > 0.05 ? 'Warm' : 'Neutral'}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      {[
                        { label: 'Cooler', val: -0.4 },
                        { label: 'Neutral', val: 0.0 },
                        { label: 'Warmer', val: 0.4 },
                      ].map((item) => (
                        <Pressable
                          key={item.label}
                          onPress={() => handleUpdateWarmth(item.val)}
                          style={{
                            flex: 1,
                            paddingVertical: 7,
                            borderRadius: 10,
                            backgroundColor: warmthAdjustment === item.val ? '#88e040' : '#1a2332',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: warmthAdjustment === item.val ? '#0b1017' : '#fff',
                            }}>
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Vignette Toggle */}
                  <View className="flex-row items-center justify-between pt-1 border-t border-border/40">
                    <View>
                      <Text className="text-xs font-bold text-foreground">Optical Vignette</Text>
                      <Text className="text-xs text-muted">Subtle Leica lens edge falloff</Text>
                    </View>
                    <Pressable
                      onPress={handleToggleVignette}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor: vignetteEnabled ? '#88e040' : '#1a2332',
                      }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '800',
                          color: vignetteEnabled ? '#0b1017' : '#fff',
                        }}>
                        {vignetteEnabled ? 'ON' : 'OFF'}
                      </Text>
                    </Pressable>
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
              Originals are never modified or overwritten. Styled outputs are rendered in 8-bit sRGB with full resolution preserved.
            </Text>
          </View>
        </View>
      </ScrollView>
      <SnapseedModal visible={snapseedVisible} onClose={() => setSnapseedVisible(false)} />
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
