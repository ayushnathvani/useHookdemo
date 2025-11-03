import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';

// Custom hooks for React Native specific features
const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  });
3
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

  return orientation;
};

const useBattery = () => {
  // React Native doesn't have battery API, so we'll simulate it
  const [battery, setBattery] = useState({
    level: 0.85,
    charging: false,
    chargingTime: null,
    dischargingTime: 3600,
  });

  useEffect(() => {
    // Simulate battery level changes
    const interval = setInterval(() => {
      setBattery(prev => ({
        ...prev,
        level: Math.max(
          0,
          Math.min(1, prev.level + (Math.random() - 0.5) * 0.02),
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return battery;
};

const useGeolocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const simulatedLocation = {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        accuracy: 10,
        timestamp: Date.now(),
      };
      setLocation(simulatedLocation);
      setIsLoading(false);
    }, 2000);
  };

  return { location, error, isLoading, getCurrentPosition };
};

const DeviceHooksScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <NetworkStateDemo isDarkMode={isDarkMode} />
      <OrientationDemo isDarkMode={isDarkMode} />
      <BatteryDemo isDarkMode={isDarkMode} />
      <GeolocationDemo isDarkMode={isDarkMode} />
      <MediaQueryDemo isDarkMode={isDarkMode} />
      <WindowSizeDemo isDarkMode={isDarkMode} />
    </ScrollView>
  );
};

const NetworkStateDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Note: useNetworkState might not work properly in React Native
  // We'll create a simple simulation
  const [networkState, setNetworkState] = useState({
    online: true,
    downlink: 10,
    effectiveType: '4g',
    saveData: false,
  });

  const toggleConnection = () => {
    setNetworkState(prev => ({
      ...prev,
      online: !prev.online,
      effectiveType: prev.online ? 'offline' : '4g',
    }));
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useNetworkState
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Monitor network connection status and characteristics
      </Text>

      <View style={styles.networkInfo}>
        <View
          style={[
            styles.statusIndicator,
            networkState.online ? styles.online : styles.offline,
          ]}
        >
          <Text style={styles.statusText}>
            {networkState.online ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </View>

        <Text style={[styles.networkDetail, isDarkMode && styles.darkText]}>
          Connection: {networkState.effectiveType.toUpperCase()}
        </Text>
        {networkState.online && (
          <>
            <Text style={[styles.networkDetail, isDarkMode && styles.darkText]}>
              Downlink: {networkState.downlink} Mbps
            </Text>
            <Text style={[styles.networkDetail, isDarkMode && styles.darkText]}>
              Data Saver: {networkState.saveData ? 'Enabled' : 'Disabled'}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={toggleConnection}>
        <Text style={styles.buttonText}>
          Simulate {networkState.online ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Offline handling, data usage optimization, connection
        quality adaptation
      </Text>
    </View>
  );
};

const OrientationDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const orientation = useOrientation();
  const [rotationCount, setRotationCount] = useState(0);

  useEffect(() => {
    setRotationCount(prev => prev + 1);
  }, [orientation]);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useOrientation
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Detect and respond to device orientation changes
      </Text>

      <View style={styles.orientationDisplay}>
        <View
          style={[
            styles.deviceIcon,
            orientation === 'landscape' && styles.deviceLandscape,
          ]}
        >
          <Text style={styles.deviceText}>📱</Text>
        </View>

        <Text style={[styles.orientationText, isDarkMode && styles.darkText]}>
          Current: {orientation.toUpperCase()}
        </Text>
        <Text
          style={[styles.orientationInfo, isDarkMode && styles.darkDescription]}
        >
          Rotations detected: {rotationCount - 1}
        </Text>
      </View>

      <View style={styles.orientationTips}>
        <Text style={[styles.tipTitle, isDarkMode && styles.darkText]}>
          Try rotating your device!
        </Text>
        <Text style={[styles.tipText, isDarkMode && styles.darkDescription]}>
          Portrait: Ideal for reading and scrolling
        </Text>
        <Text style={[styles.tipText, isDarkMode && styles.darkDescription]}>
          Landscape: Better for media and games
        </Text>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Responsive layouts, media players, gaming interfaces
      </Text>
    </View>
  );
};

const BatteryDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const battery = useBattery();

  const getBatteryColor = (level: number) => {
    if (level > 0.5) return '#4caf50';
    if (level > 0.2) return '#ff9800';
    return '#f44336';
  };

  const getBatteryIcon = (level: number, charging: boolean) => {
    if (charging) return '🔌';
    if (level > 0.75) return '🔋';
    if (level > 0.5) return '🔋';
    if (level > 0.25) return '🪫';
    return '🪫';
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useBattery
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Monitor device battery level and charging status (Simulated in React
        Native)
      </Text>

      <View style={styles.batteryDisplay}>
        <Text style={styles.batteryIcon}>
          {getBatteryIcon(battery.level, battery.charging)}
        </Text>

        <View style={styles.batteryMeter}>
          <View style={styles.batteryFrame}>
            <View
              style={[
                styles.batteryFill,
                {
                  width: `${battery.level * 100}%`,
                  backgroundColor: getBatteryColor(battery.level),
                },
              ]}
            />
          </View>
          <Text
            style={[styles.batteryPercentage, isDarkMode && styles.darkText]}
          >
            {Math.round(battery.level * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.batteryInfo}>
        <Text style={[styles.batteryDetail, isDarkMode && styles.darkText]}>
          Status: {battery.charging ? 'Charging' : 'Discharging'}
        </Text>
        {!battery.charging && battery.dischargingTime && (
          <Text style={[styles.batteryDetail, isDarkMode && styles.darkText]}>
            Time remaining: ~{Math.round(battery.dischargingTime / 60)} minutes
          </Text>
        )}
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Power management, performance optimization, low battery
        warnings
      </Text>
    </View>
  );
};

const GeolocationDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { location, error, isLoading, getCurrentPosition } = useGeolocation();

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useGeolocation
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Access user's geographic location (Simulated in demo)
      </Text>

      <View style={styles.locationContainer}>
        {isLoading && (
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            📍 Getting location...
          </Text>
        )}

        {location && !isLoading && (
          <View style={styles.locationInfo}>
            <Text style={[styles.locationText, isDarkMode && styles.darkText]}>
              📍 Location Found!
            </Text>
            <Text
              style={[styles.coordinates, isDarkMode && styles.darkDescription]}
            >
              Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text
              style={[styles.coordinates, isDarkMode && styles.darkDescription]}
            >
              Longitude: {location.longitude.toFixed(6)}
            </Text>
            <Text
              style={[styles.coordinates, isDarkMode && styles.darkDescription]}
            >
              Accuracy: ±{location.accuracy}m
            </Text>
            <Text
              style={[styles.coordinates, isDarkMode && styles.darkDescription]}
            >
              Updated: {new Date(location.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            ❌ Error: {error}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={getCurrentPosition}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Getting Location...' : 'Get Current Location'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Maps, weather apps, location-based services, delivery
        tracking
      </Text>
    </View>
  );
};

const MediaQueryDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { width, height } = Dimensions.get('window');

  // Simulate media queries for React Native
  const isSmallScreen = width < 400;
  const isMediumScreen = width >= 400 && width < 768;
  const isLargeScreen = width >= 768;

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useMediaQuery
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Responsive design based on screen size (Adapted for React Native)
      </Text>

      <View style={styles.screenInfo}>
        <Text style={[styles.screenText, isDarkMode && styles.darkText]}>
          Screen: {width} × {height}
        </Text>

        <View style={styles.breakpoints}>
          <View
            style={[
              styles.breakpoint,
              isSmallScreen && styles.activeBreakpoint,
            ]}
          >
            <Text
              style={[
                styles.breakpointText,
                isSmallScreen && styles.activeBreakpointText,
              ]}
            >
              📱 Small (&lt; 400px)
            </Text>
          </View>
          <View
            style={[
              styles.breakpoint,
              isMediumScreen && styles.activeBreakpoint,
            ]}
          >
            <Text
              style={[
                styles.breakpointText,
                isMediumScreen && styles.activeBreakpointText,
              ]}
            >
              📱 Medium (400-768px)
            </Text>
          </View>
          <View
            style={[
              styles.breakpoint,
              isLargeScreen && styles.activeBreakpoint,
            ]}
          >
            <Text
              style={[
                styles.breakpointText,
                isLargeScreen && styles.activeBreakpointText,
              ]}
            >
              🖥️ Large (&gt; 768px)
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.responsiveDemo,
          isSmallScreen && styles.smallDemo,
          isMediumScreen && styles.mediumDemo,
          isLargeScreen && styles.largeDemo,
        ]}
      >
        <Text style={[styles.responsiveText, isDarkMode && styles.darkText]}>
          Responsive Content
        </Text>
        <Text
          style={[
            styles.responsiveDescription,
            isDarkMode && styles.darkDescription,
          ]}
        >
          Layout adapts to screen size
        </Text>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Responsive layouts, adaptive UI, different layouts per
        device
      </Text>
    </View>
  );
};

const WindowSizeDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const aspectRatio = (dimensions.width / dimensions.height).toFixed(2);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useWindowSize
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Track window/screen dimensions and respond to changes
      </Text>

      <View style={styles.dimensionsDisplay}>
        <View style={styles.dimensionItem}>
          <Text style={[styles.dimensionLabel, isDarkMode && styles.darkText]}>
            Width
          </Text>
          <Text style={[styles.dimensionValue, isDarkMode && styles.darkText]}>
            {Math.round(dimensions.width)}px
          </Text>
        </View>
        <View style={styles.dimensionItem}>
          <Text style={[styles.dimensionLabel, isDarkMode && styles.darkText]}>
            Height
          </Text>
          <Text style={[styles.dimensionValue, isDarkMode && styles.darkText]}>
            {Math.round(dimensions.height)}px
          </Text>
        </View>
        <View style={styles.dimensionItem}>
          <Text style={[styles.dimensionLabel, isDarkMode && styles.darkText]}>
            Ratio
          </Text>
          <Text style={[styles.dimensionValue, isDarkMode && styles.darkText]}>
            {aspectRatio}
          </Text>
        </View>
      </View>

      <View style={styles.windowVisualization}>
        <View
          style={[
            styles.windowRect,
            {
              width: Math.min(200, dimensions.width / 2),
              height: Math.min(
                150,
                (dimensions.width / 2) * (dimensions.height / dimensions.width),
              ),
            },
          ]}
        >
          <Text style={styles.windowLabel}>Screen</Text>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Responsive design, canvas sizing, dynamic layouts, aspect
        ratio calculations
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  useCase: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },
  networkInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  online: {
    backgroundColor: '#e8f5e8',
  },
  offline: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  networkDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  orientationDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIcon: {
    fontSize: 48,
    marginBottom: 12,
    transform: [{ rotate: '0deg' }],
  },
  deviceLandscape: {
    transform: [{ rotate: '90deg' }],
  },
  deviceText: {
    fontSize: 48,
  },
  orientationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  orientationInfo: {
    fontSize: 14,
    color: '#666',
  },
  orientationTips: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  batteryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  batteryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  batteryMeter: {
    alignItems: 'center',
  },
  batteryFrame: {
    width: 100,
    height: 20,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  batteryInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  locationInfo: {
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  screenInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  screenText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  breakpoints: {
    width: '100%',
  },
  breakpoint: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  activeBreakpoint: {
    backgroundColor: '#e3f2fd',
  },
  breakpointText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activeBreakpointText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  responsiveDemo: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  smallDemo: {
    backgroundColor: '#ffebee',
  },
  mediumDemo: {
    backgroundColor: '#e8f5e8',
  },
  largeDemo: {
    backgroundColor: '#e3f2fd',
  },
  responsiveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  responsiveDescription: {
    fontSize: 14,
    color: '#666',
  },
  dimensionsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dimensionItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  dimensionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dimensionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  windowVisualization: {
    alignItems: 'center',
    marginBottom: 8,
  },
  windowRect: {
    borderWidth: 2,
    borderColor: '#1976d2',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  windowLabel: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default DeviceHooksScreen;
