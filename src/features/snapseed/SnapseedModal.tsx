import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SNAPSEED_QR_PRESETS, SnapseedCategory, SnapseedQRPreset } from './catalog';
import { openSnapseed, sharePresetRecipe } from './snapseed-service';

const SNAPSEED_ASSET_MAP: Record<string, any> = {
  'film-portra': require('../../../assets/snapseed/film_portra.jpg'),
  'film-kodachrome': require('../../../assets/snapseed/film_kodachrome.jpg'),
  'film-retro': require('../../../assets/snapseed/film_retro.jpg'),
  'polaroid-light-leak': require('../../../assets/snapseed/polaroid_light_leak.jpg'),
  'portrait-soft-glow': require('../../../assets/snapseed/portrait_soft_glow.jpg'),
  'portrait-warm-glow': require('../../../assets/snapseed/portrait_warm_glow.jpg'),
  'portrait-moody': require('../../../assets/snapseed/portrait_moody.jpg'),
  'bw-moody': require('../../../assets/snapseed/bw_moody.jpg'),
  'bw-urban': require('../../../assets/snapseed/bw_urban.jpg'),
  'summer-golden-hour': require('../../../assets/snapseed/summer_golden_hour.jpg'),
  'cool-moody-blues': require('../../../assets/snapseed/cool_moody_blues.jpg'),
  'beige-paris': require('../../../assets/snapseed/beige_paris.jpg'),
};

interface SnapseedModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SnapseedModal({ visible, onClose }: SnapseedModalProps) {
  const [activeCategory, setActiveCategory] = useState<SnapseedCategory>('all');
  const [fullscreenPreset, setFullscreenPreset] = useState<SnapseedQRPreset | null>(null);

  const filteredPresets = SNAPSEED_QR_PRESETS.filter(
    (preset) => activeCategory === 'all' || preset.category === activeCategory
  );

  const categoryLabels: { key: SnapseedCategory; label: string }[] = [
    { key: 'all', label: `All (${SNAPSEED_QR_PRESETS.length})` },
    { key: 'film', label: 'Film (4)' },
    { key: 'portrait', label: 'Portrait (3)' },
    { key: 'bw', label: 'B&W (2)' },
    { key: 'aesthetic', label: 'Aesthetic (3)' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.leafDot} />
              <Text style={styles.headerBadgeText}>GOOGLE SNAPSEED PRESETS</Text>
            </View>
            <Text style={styles.headerTitle}>Snapseed QR Looks</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close Snapseed looks"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* How-To-Scan Guide Banner */}
        <View style={styles.guideBanner}>
          <Text style={styles.guideHeading}>📱 How to Apply in Snapseed:</Text>
          <Text style={styles.guideStep}>
            1. Open photo in <Text style={styles.guideHighlight}>Snapseed</Text>
          </Text>
          <Text style={styles.guideStep}>
            2. Tap the <Text style={styles.guideHighlight}>Edit Stack icon</Text> at top (two
            overlapping layers with arrow)
          </Text>
          <Text style={styles.guideStep}>
            3. Tap <Text style={styles.guideHighlight}>QR Look</Text> ➔{' '}
            <Text style={styles.guideHighlight}>Scan QR Look</Text>
          </Text>
          <Text style={styles.guideStep}>
            4. Aim camera at any QR card below (or tap card to enlarge)!
          </Text>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categoryLabels.map((cat) => {
              const isSelected = activeCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                  onPress={() => setActiveCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      isSelected && styles.categoryTabTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Preset Cards List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {filteredPresets.map((preset) => {
            const categoryBadgeStyle =
              preset.category === 'film'
                ? styles.badgeFilm
                : preset.category === 'portrait'
                ? styles.badgePortrait
                : preset.category === 'bw'
                ? styles.badgeBw
                : styles.badgeAesthetic;

            return (
              <View key={preset.id} style={styles.card}>
                {/* Top Card Info */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{preset.title}</Text>
                    <View style={[styles.badge, categoryBadgeStyle]}>
                      <Text style={styles.badgeText}>{preset.category.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTagline}>{preset.tagline}</Text>
                </View>

                {/* Scannable QR Image Card */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.imageCardWrapper}
                  onPress={() => setFullscreenPreset(preset)}
                >
                  <Image source={SNAPSEED_ASSET_MAP[preset.id]} style={styles.qrImage} resizeMode="cover" />
                  <View style={styles.zoomPill}>
                    <Text style={styles.zoomPillText}>🔍 Tap to Enlarge QR</Text>
                  </View>
                </TouchableOpacity>

                {/* Description & Best For */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardDescription}>{preset.description}</Text>
                  <View style={styles.bestForRow}>
                    <Text style={styles.bestForLabel}>💡 Best for: </Text>
                    <Text style={styles.bestForText}>{preset.bestFor}</Text>
                  </View>

                  {/* Recipe Steps Breakdown */}
                  <View style={styles.recipeBox}>
                    <Text style={styles.recipeTitle}>Recipe Breakdown:</Text>
                    {preset.recipeHighlights.map((step, idx) => (
                      <Text key={idx} style={styles.recipeStep}>
                        • {step}
                      </Text>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.openSnapseedButton}
                      onPress={() => openSnapseed()}
                    >
                      <Text style={styles.openSnapseedText}>🌿 Open Snapseed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.shareRecipeButton}
                      onPress={() => sharePresetRecipe(preset)}
                    >
                      <Text style={styles.shareRecipeText}>📋 Share Recipe</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Fullscreen High-Contrast QR Code Inspection Modal */}
      {fullscreenPreset && (
        <Modal
          visible={true}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setFullscreenPreset(null)}
        >
          <SafeAreaView style={styles.fullscreenSafe}>
            <View style={styles.fullscreenHeader}>
              <View>
                <Text style={styles.fullscreenTitle}>{fullscreenPreset.title}</Text>
                <Text style={styles.fullscreenSubtitle}>Ready to scan with Snapseed</Text>
              </View>
              <TouchableOpacity
                style={styles.fullscreenClose}
                onPress={() => setFullscreenPreset(null)}
              >
                <Text style={styles.fullscreenCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fullscreenCenter}>
              <View style={styles.fullscreenCard}>
                <Image
                  source={SNAPSEED_ASSET_MAP[fullscreenPreset.id]}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.fullscreenHint}>
                Point Snapseed's QR Scanner at this card on another phone or screen!
              </Text>
            </View>

            <View style={styles.fullscreenFooter}>
              <TouchableOpacity
                style={styles.fullscreenAction}
                onPress={() => {
                  sharePresetRecipe(fullscreenPreset);
                }}
              >
                <Text style={styles.fullscreenActionText}>📋 Share Recipe Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fullscreenAction, styles.fullscreenActionPrimary]}
                onPress={() => {
                  setFullscreenPreset(null);
                  openSnapseed();
                }}
              >
                <Text style={styles.fullscreenActionPrimaryText}>🌿 Launch Snapseed</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0D10',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2630',
  },
  headerTitles: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  leafDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34A853',
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#34A853',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: '#F0F4F8',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E252E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  guideBanner: {
    backgroundColor: '#141E18',
    borderColor: '#24452F',
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
  },
  guideHeading: {
    color: '#4ADE80',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  guideStep: {
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 16,
  },
  guideHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryBar: {
    marginVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#161C24',
    borderWidth: 1,
    borderColor: '#26313F',
  },
  categoryTabActive: {
    backgroundColor: '#2A3B4C',
    borderColor: '#38BDF8',
  },
  categoryTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: '#38BDF8',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: '#131920',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#212A36',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 14,
    paddingBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeFilm: {
    backgroundColor: '#3B2912',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  badgePortrait: {
    backgroundColor: '#381E2B',
    borderWidth: 1,
    borderColor: '#EC4899',
  },
  badgeBw: {
    backgroundColor: '#282C34',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  badgeAesthetic: {
    backgroundColor: '#142E3B',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardTagline: {
    color: '#94A3B8',
    fontSize: 12,
  },
  imageCardWrapper: {
    width: '100%',
    height: 190,
    backgroundColor: '#090D11',
    position: 'relative',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  zoomPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  zoomPillText: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    padding: 14,
  },
  cardDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  bestForRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  bestForLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  bestForText: {
    color: '#E2E8F0',
    fontSize: 11,
    flex: 1,
  },
  recipeBox: {
    backgroundColor: '#0B0F14',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1C2430',
  },
  recipeTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  recipeStep: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  openSnapseedButton: {
    flex: 1,
    backgroundColor: '#1E3A28',
    borderColor: '#34A853',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openSnapseedText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
  },
  shareRecipeButton: {
    flex: 1,
    backgroundColor: '#1C2532',
    borderColor: '#2F3E52',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareRecipeText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  // Fullscreen Modal Styles
  fullscreenSafe: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  fullscreenSubtitle: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullscreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullscreenCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111111',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#34A853',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 18,
    textAlign: 'center',
    maxWidth: 300,
  },
  fullscreenFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  fullscreenAction: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenActionText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenActionPrimary: {
    backgroundColor: '#166534',
  },
  fullscreenActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
