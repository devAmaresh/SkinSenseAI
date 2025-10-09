# Light/Dark Theme Implementation

## Overview
This PR implements a comprehensive light/dark mode theme system for SkinSenseAI, addressing issue #[issue-number] to improve accessibility and user experience.

## What's New

### 🎨 Theme System
- **Three Theme Modes:**
  - **Light Mode**: Clean white background with dark text for daytime use
  - **Dark Mode**: Sleek black background with light text for low-light environments
  - **Auto Mode**: Automatically follows system theme preference

### 🔧 Technical Implementation

#### New Files
1. **`src/contexts/ThemeContext.js`**
   - React Context for managing theme state
   - Persists user preference in AsyncStorage
   - Auto-detects system theme using React Native's `useColorScheme`
   - Provides theme colors and utilities to all components

2. **`THEME_GUIDE.md`**
   - Comprehensive documentation for developers
   - Usage examples and best practices
   - Color palette reference
   - Integration guide for additional screens

3. **`src/contexts/__tests__/ThemeContext.test.js`**
   - Manual testing checklist
   - Example test cases for future automation

#### Modified Files
1. **`App.js`**
   - Wrapped app with `ThemeProvider`
   - Enables theme context throughout the app

2. **`tailwind.config.js`**
   - Added dark mode support
   - Extended color palette for theming

3. **`ProfileScreen.js`**
   - Added theme toggle in Preferences section
   - Updated UI to use theme colors
   - Three-button toggle (Light/Dark/Auto)

4. **`WelcomeScreen.js`**
   - Updated to use theme colors
   - Adaptive background and text colors

5. **`HomeScreen.js`**
   - Updated all sections with theme colors
   - Maintained consistent accent colors

## Features

### ✨ User-Facing Features
- **Theme Toggle**: Easy-to-use theme switcher in Profile Screen
- **Persistent Preference**: Theme choice is remembered across app restarts
- **System Integration**: "Auto" mode respects device theme settings
- **Smooth Transitions**: Theme changes apply instantly across all screens

### 🎯 Developer Features
- **Easy Integration**: Simple `useTheme()` hook
- **Consistent Colors**: Centralized color palette
- **Flexible Design**: Easy to add theme support to new screens
- **Type Safety**: Well-documented color properties

## Screenshots

### Profile Screen - Theme Toggle
The theme toggle is located in the Profile Screen under "Preferences":

```
┌─────────────────────────┐
│     Preferences         │
├─────────────────────────┤
│ 🌓 Appearance           │
│   [Light] [Dark] [Auto] │
├─────────────────────────┤
│ 🔔 Push Notifications   │
│                    [ON] │
└─────────────────────────┘
```

### Color Palette

#### Dark Mode
- Background: `#000000`
- Surface: `#1a1a1a`
- Text: `#FFFFFF`
- Text Secondary: `#888888`

#### Light Mode
- Background: `#FFFFFF`
- Surface: `#F5F5F5`
- Text: `#000000`
- Text Secondary: `#666666`

#### Accent Colors (Consistent)
- Primary Cyan: `#00f5ff`
- Primary Blue: `#0080ff`
- Primary Purple: `#8000ff`
- Success: `#00ff88`
- Error: `#ff4444`

## Usage Example

```javascript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { isDark, colors, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Hello, {isDark ? 'night' : 'day'}!
      </Text>
      <Button onPress={() => setTheme('light')} title="Light Mode" />
    </View>
  );
}
```

## Testing

### Manual Testing Checklist
- [ ] Theme toggle buttons work correctly
- [ ] Theme changes apply immediately
- [ ] Theme preference persists after app restart
- [ ] Auto mode follows system theme
- [ ] All updated screens are readable in both modes
- [ ] Accent colors remain consistent

See `src/contexts/__tests__/ThemeContext.test.js` for detailed testing instructions.

## Benefits

1. **Improved Accessibility**: Better readability in different lighting conditions
2. **User Preference**: Respects user's system-wide theme choice
3. **Modern UX**: Follows industry standards for theme support
4. **Battery Savings**: Dark mode can reduce battery usage on OLED screens
5. **Eye Comfort**: Reduces eye strain in low-light environments

## Future Enhancements

- [ ] Add theme-specific gradient overlays
- [ ] Implement custom color palettes
- [ ] Add high-contrast mode option
- [ ] Extend theme support to remaining screens
- [ ] Add smooth theme transition animations

## Migration Guide

For developers wanting to add theme support to additional screens:

1. Import the theme hook:
   ```javascript
   import { useTheme } from '../contexts/ThemeContext';
   ```

2. Use the hook in your component:
   ```javascript
   const { isDark, colors } = useTheme();
   ```

3. Replace hardcoded colors:
   ```javascript
   // Before
   <View style={{ backgroundColor: '#000000' }}>
     <Text style={{ color: '#FFFFFF' }}>Hello</Text>
   </View>
   
   // After
   <View style={{ backgroundColor: colors.background }}>
     <Text style={{ color: colors.text }}>Hello</Text>
   </View>
   ```

4. Update StatusBar:
   ```javascript
   <StatusBar style={isDark ? "light" : "dark"} />
   ```

## Documentation

See `THEME_GUIDE.md` for comprehensive documentation including:
- Complete color palette reference
- Best practices and guidelines
- Integration examples
- Troubleshooting tips

## Notes

- Theme preference is stored in AsyncStorage under the key `'themeMode'`
- System theme detection uses React Native's `useColorScheme` hook
- All accent colors (cyan, purple, etc.) remain consistent across themes for brand identity
- The implementation follows React Native best practices and Context API patterns

## Related Issues

Closes #[issue-number]
