import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Encontre prestadoras de confiança',
    subtitle: 'Conectamos você a profissionais verificadas da sua região para qualquer serviço que precisar.',
    icon: '🔍',
  },
  {
    title: 'Contrate com segurança',
    subtitle: 'Seu pagamento fica retido e só é liberado após a confirmação do serviço. Proteção para você e para a prestadora.',
    icon: '🔒',
  },
  {
    title: 'Serviços para o seu cotidiano',
    subtitle: 'De limpeza a aulas particulares, encontre a profissional certa para cada momento da sua vida.',
    icon: '✨',
  },
];

export default function SplashScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      navigation.navigate('Register');
    }
  }

  function handleScroll(e) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.slideIcon}>{slide.icon}</Text>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex < SLIDES.length - 1 ? 'Próximo' : 'Começar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  skip: { position: 'absolute', top: 56, right: SPACING.xl, zIndex: 10 },
  skipText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMedium },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: 60,
  },
  slideIcon: { fontSize: 72, marginBottom: SPACING.xl },
  slideTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 26,
    color: COLORS.petrol,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  slideSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xl },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive: { backgroundColor: COLORS.mustard, width: 20 },
  dotInactive: { backgroundColor: COLORS.border },
  footer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl },
  nextBtn: {
    backgroundColor: COLORS.mustard,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textPrimary },
});
