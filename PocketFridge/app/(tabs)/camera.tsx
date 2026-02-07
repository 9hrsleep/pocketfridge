import { useState, useCallback } from 'react'; // <--- 1. Import useCallback
import { View, Text, ActivityIndicator, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useFocusEffect } from 'expo-router'; // <--- 2. Import useFocusEffect
import { LinearGradient } from 'expo-linear-gradient';
import { parseReceipt } from '../../services/openaiService';
import CameraButton from '../../components/CameraButton'; 

export default function CameraScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false); // <--- 3. Safety Flag
  const router = useRouter();

  // 4. THE TRIGGER: Runs every time you tab into this screen
  useFocusEffect(
    useCallback(() => {
      // Only launch if we aren't already loading and haven't just scanned
      if (!loading && !hasScanned) {
        takePicture();
      }

      // Reset flag when leaving screen (optional, depends on preference)
      return () => {
        // If you want it to ALWAYS auto-open when coming back, uncomment this:
        // setHasScanned(false);
      };
    }, [loading, hasScanned])
  );

  const takePicture = async () => {
    setHasScanned(true); // Mark as "in progress" so it doesn't loop

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera access is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.Images, // DO NOT CHANGE THIS LINE
      base64: true, 
      quality: 0.5, 
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      processReceipt(result.assets[0].base64);
    } else {
      // If user hit "Cancel", we allow them to try again manually
      // or we can just leave hasScanned=true so they see the manual button
    }
  };

  const processReceipt = async (base64: string) => {
    setLoading(true);
    // ... (Your existing AI logic remains exactly the same) ...
    const data = await parseReceipt(base64);
    const foods = data?.new_foods || data?.items;

    if (foods) {
      router.push({
        pathname: "/confirm",
        params: { 
          items: JSON.stringify(foods),
          receiptUri: imageUri 
        } 
      });
      // Reset everything so if they come back, it's fresh
      setTimeout(() => {
        setImageUri(null);
        setHasScanned(false); 
      }, 500);
    } else {
      Alert.alert("Error", "Could not read receipt.");
    }
    
    setLoading(false);
  };

  // ... (Loading Screen Logic remains the same) ...
  if (loading && imageUri) {
    return (
      <LinearGradient 
        colors={['#B2D459', '#285B23']} 
        style={styles.gradientContainer}
      >
        <Text style={styles.processTitle}>Processing Items...</Text>
        <View style={styles.card}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
        <ActivityIndicator size="large" color="#F9FF83" style={{ marginTop: 20 }} />
      </LinearGradient>
    );
  }

  // --- MANUAL FALLBACK SCREEN ---
  // This is what they see if they hit "Cancel" on the camera.
  // It gives them a way to re-trigger it manually.
  return (
    <LinearGradient 
      colors={['#B2D459', '#285B23']} 
      style={styles.gradientContainer}
    >
      <Text style={styles.manualTitle}>Scan Receipt</Text>
      <Text style={styles.instructions}>Tap below to open camera</Text>
      
      {/* Passing a style prop if your CameraButton accepts it, 
          otherwise it just sits nicely on the green */}
      <CameraButton onPress={takePicture} />
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  // DELETE the old 'container' style if you want, or leave it unused.
  
  // Reusing this for both Loading AND Manual screens so they match
  gradientContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // New Title Style for the fallback screen
  manualTitle: {
    fontFamily: 'Offbit-DotBold',
    fontSize: 36,
    color: '#FCFEEF',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  instructions: { 
    fontSize: 16, 
    fontFamily: 'Helvetica-Light', // or your pixel font if preferred
    marginBottom: 40, 
    color: '#E0E0E0', // Light grey/white to stand out on green
    textAlign: 'center',
  },

  processTitle: { 
    fontFamily: 'Offbit-DotBold',
    fontSize: 40, 
    fontWeight: 'bold', 
    color: '#FCFEEF', 
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },

  card: {
    width: 280,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
});