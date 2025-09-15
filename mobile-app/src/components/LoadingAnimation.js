import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Text,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoadingAnimation({
  type = 'pulse', // pulse, bounce, rotate, fade, slide
  size = 'medium', // small, medium, large
  color = '#90EE90',
  text,
  style,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const animatedValue3 = useRef(new Animated.Value(0)).current;

  const getSizeValue = () => {
    switch (size) {
      case 'small': return 30;
      case 'large': return 80;
      default: return 50;
    }
  };

  useEffect(() => {
    let animation;

    switch (type) {
      case 'pulse':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'bounce':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 600,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'rotate':
        animation = Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        break;

      case 'fade':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'slide':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'dots':
        const createDotAnimation = (value, delay) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(value, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(value, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.delay(800),
            ])
          );
        };

        animation = Animated.parallel([
          createDotAnimation(animatedValue, 0),
          createDotAnimation(animatedValue2, 200),
          createDotAnimation(animatedValue3, 400),
        ]);
        break;

      default:
        animation = Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        );
    }

    animation.start();
    return () => animation.stop();
  }, [type, animatedValue, animatedValue2, animatedValue3]);

  const renderAnimation = () => {
    const sizeValue = getSizeValue();

    switch (type) {
      case 'pulse':
        const scale = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        });
        const opacity = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        });
        return (
          <Animated.View
            style={[
              styles.circle,
              {
                width: sizeValue,
                height: sizeValue,
                backgroundColor: color,
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        );

      case 'bounce':
        const translateY = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        });
        return (
          <Animated.View
            style={[
              styles.circle,
              {
                width: sizeValue,
                height: sizeValue,
                backgroundColor: color,
                transform: [{ translateY }],
              },
            ]}
          />
        );

      case 'rotate':
        const rotate = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        return (
          <Animated.View
            style={[
              styles.square,
              {
                width: sizeValue,
                height: sizeValue,
                backgroundColor: color,
                transform: [{ rotate }],
              },
            ]}
          />
        );

      case 'fade':
        return (
          <Animated.View
            style={[
              styles.circle,
              {
                width: sizeValue,
                height: sizeValue,
                backgroundColor: color,
                opacity: animatedValue,
              },
            ]}
          />
        );

      case 'slide':
        const translateX = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-sizeValue, sizeValue],
        });
        return (
          <View style={[styles.slideContainer, { width: sizeValue * 3 }]}>
            <Animated.View
              style={[
                styles.circle,
                {
                  width: sizeValue / 2,
                  height: sizeValue / 2,
                  backgroundColor: color,
                  transform: [{ translateX }],
                },
              ]}
            />
          </View>
        );

      case 'dots':
        const dotSize = sizeValue / 3;
        return (
          <View style={styles.dotsContainer}>
            {[animatedValue, animatedValue2, animatedValue3].map((value, index) => {
              const dotOpacity = value.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              });
              const dotScale = value.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: color,
                      opacity: dotOpacity,
                      transform: [{ scale: dotScale }],
                    },
                  ]}
                />
              );
            })}
          </View>
        );

      default:
        return (
          <Animated.View
            style={[
              styles.circle,
              {
                width: sizeValue,
                height: sizeValue,
                backgroundColor: color,
                opacity: animatedValue,
              },
            ]}
          />
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderAnimation()}
      {text && (
        <Text style={[styles.text, { color }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

// Predefined loading screens
export function FullScreenLoader({ text = 'جاري التحميل... / Loading...', type = 'pulse' }) {
  return (
    <View style={styles.fullScreen}>
      <LoadingAnimation type={type} size="large" text={text} />
    </View>
  );
}

export function OverlayLoader({ visible, text, type = 'dots' }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <LoadingAnimation type={type} size="large" color="#fff" />
        {text && <Text style={styles.overlayText}>{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  circle: {
    borderRadius: 50,
  },
  square: {
    borderRadius: 8,
  },
  slideContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 4,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#2d5a3d',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 150,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});