import { Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  Pressable,
  Share,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ConfettiBurst } from './src/components/ConfettiBurst';
import { THEME } from './src/constants/theme';
import { styles } from './src/styles/App.styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const FINAL_SCORE = 2840;
const COMBO_STREAK = 7;
const PLAYER_RANK = 3;
const TOTAL_PLAYERS = 1200;


function formatScore(value: number) {
  'worklet';

  const digits = Math.max(0, Math.round(value)).toString();
  let result = '';
  let groupCount = 0;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    result = digits[index] + result;
    groupCount += 1;

    if (groupCount === 3 && index !== 0) {
      result = ',' + result;
      groupCount = 0;
    }
  }

  return result;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    NunitoSans_400Regular,
  });
  const { width, height } = useWindowDimensions();
  const compactLayout = width < 390;

  const shellOpacity = useSharedValue(0);
  const shellTranslateY = useSharedValue(44);
  const scoreValue = useSharedValue(0);
  const scoreCardScale = useSharedValue(0.92);
  const glowScale = useSharedValue(0.94);
  const glowOpacity = useSharedValue(0.45);
  const badgeOpacity = useSharedValue(0);
  const badgeTranslateY = useSharedValue(18);
  const badgeScale = useSharedValue(0);
  const flameScale = useSharedValue(0.92);
  const flameOpacity = useSharedValue(0.65);
  const rankOpacity = useSharedValue(0);
  const rankTranslateY = useSharedValue(44);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(28);
  const buttonScale = useSharedValue(1);
  const shimmerProgress = useSharedValue(0);
  const confettiProgress = useSharedValue(0);

  const replayReveal = () => {
    cancelAnimation(shellOpacity);
    cancelAnimation(shellTranslateY);
    cancelAnimation(scoreValue);
    cancelAnimation(scoreCardScale);
    cancelAnimation(glowScale);
    cancelAnimation(glowOpacity);
    cancelAnimation(badgeOpacity);
    cancelAnimation(badgeTranslateY);
    cancelAnimation(badgeScale);
    cancelAnimation(flameScale);
    cancelAnimation(flameOpacity);
    cancelAnimation(rankOpacity);
    cancelAnimation(rankTranslateY);
    cancelAnimation(buttonOpacity);
    cancelAnimation(buttonTranslateY);
    cancelAnimation(buttonScale);
    cancelAnimation(shimmerProgress);
    cancelAnimation(confettiProgress);

    shellOpacity.value = 0;
    shellTranslateY.value = 44;
    scoreValue.value = 0;
    scoreCardScale.value = 0.92;
    glowScale.value = 0.94;
    glowOpacity.value = 0.45;
    badgeOpacity.value = 0;
    badgeTranslateY.value = 18;
    badgeScale.value = 0;
    flameScale.value = 0.92;
    flameOpacity.value = 0.65;
    rankOpacity.value = 0;
    rankTranslateY.value = 44;
    buttonOpacity.value = 0;
    buttonTranslateY.value = 28;
    buttonScale.value = 1;
    shimmerProgress.value = 0;
    confettiProgress.value = 0;

    shellOpacity.value = withTiming(1, { duration: 650 });
    shellTranslateY.value = withSpring(0, {
      damping: 18,
      stiffness: 125,
      mass: 0.9,
    });

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0.94, {
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 1700 }), withTiming(0.42, { duration: 1700 })),
      -1,
      true,
    );

    badgeOpacity.value = withDelay(420, withTiming(1, { duration: 260 }));
    badgeTranslateY.value = withDelay(
      420,
      withSpring(0, {
        damping: 14,
        stiffness: 170,
      }),
    );
    badgeScale.value = withDelay(
      420,
      withSequence(
        withTiming(1.15, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        }),
        withSpring(1, {
          damping: 9,
          stiffness: 210,
        }),
      ),
    );

    flameScale.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1.14, {
            duration: 650,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0.94, {
            duration: 650,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        true,
      ),
    );

    flameOpacity.value = withDelay(
      700,
      withRepeat(
        withSequence(withTiming(1, { duration: 650 }), withTiming(0.64, { duration: 650 })),
        -1,
        true,
      ),
    );

    shimmerProgress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1750,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    scoreCardScale.value = withDelay(
      120,
      withSequence(
        withSpring(1.03, {
          damping: 14,
          stiffness: 180,
        }),
        withSpring(1, {
          damping: 16,
          stiffness: 165,
        }),
      ),
    );

    scoreValue.value = withDelay(
      260,
      withSequence(
        withTiming(FINAL_SCORE * 1.045, {
          duration: 1650,
          easing: Easing.out(Easing.cubic),
        }),
        withSpring(
          FINAL_SCORE,
          {
            damping: 12,
            stiffness: 190,
            mass: 0.72,
          },
          (finished) => {
            if (!finished) {
              return;
            }

            confettiProgress.value = 0;
            confettiProgress.value = withTiming(1, {
              duration: 1800,
              easing: Easing.out(Easing.cubic),
            });

            rankOpacity.value = withDelay(200, withTiming(1, { duration: 320 }));
            rankTranslateY.value = withDelay(
              200,
              withSpring(0, {
                damping: 14,
                stiffness: 150,
              }),
            );

            buttonOpacity.value = withDelay(380, withTiming(1, { duration: 260 }));
            buttonTranslateY.value = withDelay(
              380,
              withSpring(0, {
                damping: 13,
                stiffness: 160,
              }),
            );
          },
        ),
      ),
    );
  };

  useEffect(() => {
    if (fontsLoaded) {
      replayReveal();
    }
  }, [fontsLoaded]);

  const shellStyle = useAnimatedStyle(() => ({
    opacity: shellOpacity.value,
    transform: [{ translateY: shellTranslateY.value }],
  }));

  const scoreCardStyle = useAnimatedStyle(() => {
    const surge = interpolate(
      scoreValue.value,
      [0, FINAL_SCORE * 0.8, FINAL_SCORE * 1.045],
      [0.97, 1.02, 1.035],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale: scoreCardScale.value * surge }],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeTranslateY.value }, { scale: badgeScale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ scale: flameScale.value }],
  }));

  const rankStyle = useAnimatedStyle(() => ({
    opacity: rankOpacity.value,
    transform: [{ translateY: rankTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }, { scale: buttonScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmerProgress.value, [0, 1], [-240, 260], Extrapolation.CLAMP) },
      { skewX: '-20deg' },
    ],
    opacity: 0.82,
  }));

  const animatedScoreProps = useAnimatedProps(() => {
    const text = formatScore(scoreValue.value);
    return {
      text,
      defaultValue: text,
    };
  });

  const handleShare = async () => {
    buttonScale.value = withSequence(
      withTiming(0.96, {
        duration: 90,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(1, {
        damping: 7,
        stiffness: 280,
      }),
    );

    try {
      await Share.share({
        message: `I just scored ${FINAL_SCORE.toLocaleString()} on Matiks, hit a ${COMBO_STREAK} combo streak, and finished #${PLAYER_RANK} of ${TOTAL_PLAYERS.toLocaleString()}.`,
      });
    } catch {
      // Ignore user-cancelled share flows.
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    /* Main Screen Container with deep background gradient */
    <LinearGradient
      colors={[THEME.backgroundDark, THEME.backgroundDark]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={styles.screen}
    >
      <StatusBar style="dark" />

      {/* Decorative Background Glows - Top Left */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.backGlow,
          glowStyle,
          {
            width: width * 0.72,
            height: width * 0.72,
            top: height * 0.06,
            left: -width * 0.12,
            backgroundColor: 'rgba(169, 249, 158, 0.3)',
          },
        ]}
      />

      {/* Decorative Background Glows - Bottom Right */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.backGlow,
          {
            width: width * 0.8,
            height: width * 0.8,
            bottom: -width * 0.25,
            right: -width * 0.1,
            backgroundColor: 'rgba(177, 250, 99, 0.22)',
            opacity: 0.72,
            transform: [{ rotate: '18deg' }],
          },
        ]}
      />

      {/* Celebration Confetti burst animation */}
      <ConfettiBurst progress={confettiProgress} width={width} height={height} />

      {/* Utility Replay Button to restart the reveal animation */}
      <Pressable onPress={replayReveal} style={styles.replayButton}>
        <Text style={styles.replayButtonText}>Replay</Text>
      </Pressable>

      {/* Main Content Shell - Animates in from bottom with opacity */}
      <Animated.View style={[styles.shell, shellStyle]}>
        {/* Title and Subtitle Block */}
        <View style={styles.headerBlock}>
          <Text style={styles.kicker}>MATIKS DUEL COMPLETE</Text>
          <Text style={[styles.title, compactLayout && styles.titleCompact]}>Victory Locked In</Text>
          <Text style={[styles.subtitle, compactLayout && styles.subtitleCompact]}>
            Your last answer closed the gap and flipped the board in the final seconds.
          </Text>
        </View>

        {/* Animated Score Card - Tilts and scales as score counts up */}
        <Animated.View style={[styles.scoreCard, scoreCardStyle]}>
          <LinearGradient
            colors={[THEME.backgroundDark, THEME.primaryPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCardGradient}
          >
            <Text style={styles.scoreLabel}>Final Score</Text>
            {/* AnimatedTextInput used for counting number effect */}
            <AnimatedTextInput
              animatedProps={animatedScoreProps}
              caretHidden
              contextMenuHidden
              editable={false}
              scrollEnabled={false}
              showSoftInputOnFocus={false}
              style={[styles.scoreValue, compactLayout && styles.scoreValueCompact]}
            />
            <Text style={styles.scoreHint}>Precision multiplier applied</Text>
          </LinearGradient>
        </Animated.View>

        {/* Combo Badge with animated flame Emoji */}
        <Animated.View style={[styles.comboBadge, badgeStyle]}>
          <Animated.Text style={[styles.comboFlame, flameStyle]}>🔥</Animated.Text>
          <Text style={styles.comboText}>{COMBO_STREAK} Combo Streak!</Text>
        </Animated.View>

        {/* Final Ranking/Placement Card */}
        <Animated.View style={[styles.rankCard, rankStyle]}>
          <Text style={styles.rankLabel}>Placement</Text>
          <Text style={styles.rankValue}>
            #{PLAYER_RANK} <Text style={styles.rankMeta}>of {TOTAL_PLAYERS.toLocaleString()}</Text>
          </Text>
        </Animated.View>

        {/* Share Result Button with shimmer effect */}
        <Animated.View style={[styles.shareWrap, buttonStyle]}>
          <Pressable onPress={handleShare} style={styles.shareHitbox}>
            <LinearGradient
              colors={[THEME.primaryGreen, THEME.primaryGreen2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareButton}
            >
              {/* Shimmer Overlay - Moves horizontally across the button */}
              <AnimatedLinearGradient
                colors={['transparent', THEME.backgroundLight, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                pointerEvents="none"
                style={[styles.shimmer, shimmerStyle]}
              />
              <Text style={styles.shareText}>Share Result</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}
