# Theme Implementation Guide

## Overview
SkinSenseAI now supports both Light and Dark modes with system-based automatic theme detection.

## Features
- **Three Theme Modes:**
  - Light Mode
  - Dark Mode
  - Auto (System-based)
- **Theme Persistence:** User's theme preference is saved in AsyncStorage
- **System Integration:** Automatically detects and respects system theme preference in Auto mode

## Usage

### Using Theme in Components

```javascript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { isDark, colors, themeMode, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

### Available Theme Properties

- `themeMode`: Current theme mode ('light', 'dark', or 'system')
- `isDark`: Boolean indicating if current active theme is dark
- `colors`: Object containing all theme colors
- `setTheme(mode)`: Function to change theme mode
- `activeTheme`: The actual active theme ('light' or 'dark')
- `isLoading`: Boolean indicating if theme is being loaded

### Available Colors

```javascript
colors = {
  // Background colors
  background: isDark ? '#000000' : '#FFFFFF',
  surface: isDark ? '#1a1a1a' : '#F5F5F5',
  surfaceLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  surfaceBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  
  // Text colors
  text: isDark ? '#FFFFFF' : '#000000',
  textSecondary: isDark ? '#888888' : '#666666',
  textTertiary: isDark ? '#666666' : '#999999',
  
  // Accent colors (consistent across themes)
  primary: '#00f5ff',
  primaryBlue: '#0080ff',
  primaryPurple: '#8000ff',
  
  // Status colors
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff4444',
  info: '#00f5ff',
  
  // Gradient colors
  gradientStart: isDark ? '#000000' : '#FFFFFF',
  gradientMiddle: isDark ? '#1a1a1a' : '#F5F5F5',
  gradientEnd: isDark ? '#000000' : '#FFFFFF',
}
```

### Changing Theme

Users can change the theme from the Profile Screen under the "Preferences" section. Three buttons are available:
- **Light**: Force light mode
- **Dark**: Force dark mode
- **Auto**: Follow system preference

## Implementation Details

### ThemeContext Location
- File: `src/contexts/ThemeContext.js`
- Provider wraps the entire app in `App.js`

### Updated Screens
The following screens have been updated to support theming:
- `ProfileScreen.js` - Includes theme toggle
- `WelcomeScreen.js`
- `HomeScreen.js`

### Adding Theme to More Screens

To add theme support to additional screens:

1. Import the theme hook:
```javascript
import { useTheme } from '../contexts/ThemeContext';
```

2. Use the hook in your component:
```javascript
const { isDark, colors } = useTheme();
```

3. Replace hardcoded colors with theme colors:
```javascript
// Before
style={{ backgroundColor: '#000000', color: '#FFFFFF' }}

// After
style={{ backgroundColor: colors.background, color: colors.text }}
```

4. Update StatusBar based on theme:
```javascript
<StatusBar style={isDark ? "light" : "dark"} />
```

## Best Practices

1. **Use theme colors consistently**: Always use `colors.text`, `colors.background`, etc. instead of hardcoded values
2. **Keep accent colors consistent**: Colors like primary cyan (#00f5ff) should remain the same across themes for brand consistency
3. **Test both themes**: Always test your screens in both light and dark mode
4. **Consider readability**: Ensure text is readable on both light and dark backgrounds

## Future Enhancements

- Add theme-specific gradients
- Implement custom color palettes
- Add more granular theme customization options
- Support for high-contrast mode
