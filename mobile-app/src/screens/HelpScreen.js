import React from 'react';
import SupportScreen from './SupportScreen';

// HelpScreen is an alias for SupportScreen
// This provides the same functionality but can be accessed via 'Help' navigation
const HelpScreen = (props) => {
  return <SupportScreen {...props} />;
};

export default HelpScreen;