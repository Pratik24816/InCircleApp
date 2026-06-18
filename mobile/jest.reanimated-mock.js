const React = require('react');
const { View } = require('react-native');

const chain = () => {
  const self = {
    duration: () => self,
    delay: () => self,
    springify: () => self,
  };
  return self;
};

const AnimatedView = props => React.createElement(View, props);

module.exports = {
  __esModule: true,
  default: {
    View: AnimatedView,
    createAnimatedComponent: Comp => Comp,
  },
  FadeIn: chain(),
  FadeInRight: chain(),
  FadeOut: chain(),
  useSharedValue: init => ({ value: init }),
  useAnimatedStyle: fn => fn(),
  useAnimatedReaction: () => {},
  withTiming: v => v,
  withSpring: v => v,
  runOnJS: fn => fn,
};
