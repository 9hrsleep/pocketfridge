import { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { parseReceipt } from '../../services/openaiService';
import CameraButton from '../../components/CameraButton'; 

export default function CameraScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();

  const takePicture = async () => {
    // 1. Request Permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera access is required!");
      return;
    }

    // 2. Open Camera (Using the option YOU said works)
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.Images,
      base64: true, 
      quality: 0.5, 
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      processReceipt(result.assets[0].base64);
    }
  };

  const processReceipt = async (base64: string) => {
    setLoading(true);
    console.log("📸 Sending image to AI Service...");

    // 3. Call your AI Brain
    const data = await parseReceipt(base64);

    console.log("---------------- API RESPONSE ----------------");
    console.log(JSON.stringify(data, null, 2)); 
    console.log("----------------------------------------------");

    // FIX: Check for 'new_foods' OR 'items' to be safe
    const foods = data?.new_foods || data?.items;

    if (foods) {
      console.log(`✅ Success! Found ${foods.length} items.`);
      router.push({
        pathname: "/confirm",
        params: { 
          items: JSON.stringify(foods),
          // PASS THE IMAGE URI HERE:
          receiptUri: imageUri 
        } 
      });
      // Clear image after delay
      setTimeout(() => setImageUri(null), 500);
    } else {
      console.error("❌ Error: API returned null or missing 'new_foods'");
      Alert.alert("Error", "Could not read receipt.");
    }
    
    setLoading(false);
  };

  // --- KAI'S DESIGN: PROCESSING SCREEN ---
  if (loading && imageUri) {
    return (
      <LinearGradient 
        colors={['#B2D459', '#285B23']} 
        style={styles.gradientContainer}
      >
        <Text style={styles.processTitle}>Processing Items...</Text>
        
        {/* The "Receipt" Card */}
        <View style={styles.card}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
        
        <ActivityIndicator size="large" color="#F9FF83" style={{ marginTop: 20 }} />
      </LinearGradient>
    );
  }

  // --- DEFAULT CAMERA SCREEN ---
  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Tap below to scan your receipt</Text>
      <CameraButton onPress={takePicture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  instructions: { fontSize: 16, marginBottom: 50, color: '#666' },
  
  // Kai's Design Styles
  gradientContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  processTitle: { 
    fontSize: 24, 
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