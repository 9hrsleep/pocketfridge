import { TouchableOpacity, Image, StyleSheet } from 'react-native';

// Define what props this button accepts
interface CameraButtonProps {
  onPress: () => void;
}
export default function CameraButton({ onPress }: CameraButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.circleButton} // <--- 1. MAKES IT ROUND
      onPress={onPress}           // <--- 2. MAKES IT WORK
      activeOpacity={0.7}
    >
      <Image 
        source={require('../assets/images/icons/camera-icon.png')} 
        style={styles.iconImage} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    width: 70,              // Width
    height: 70,             // Height (Must match width)
    borderRadius: 35,       // <--- HALF of width = Perfect Circle
    backgroundColor: '#fff',// White background
    justifyContent: 'center', // Center the icon vertically
    alignItems: 'center',     // Center the icon horizontally
    elevation: 5,           // Shadow (Android)
    shadowColor: '#000',    // Shadow (iOS)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconImage: {
    width: 30,  // Icon size inside the button
    height: 30,
    resizeMode: 'contain'
  }
});