import { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { parseReceipt } from '../../services/openaiService';

// Note: I removed storageService and useRouter imports for this test

export default function CameraScreen() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const takePicture = async () => {
    // 1. Request Permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera access to scan receipts.");
      return;
    }

    // 2. Open Camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.Images,
      base64: true, // <--- CRITICAL: We need the image data for AI
      quality: 0.5, // <--- Lower quality = Faster API upload
    });

    if (!result.canceled && result.assets[0].base64) {
      processReceipt(result.assets[0].base64);
    }
  };

  const processReceipt = async (base64: string) => {
    setLoading(true);
    setLastResult(null); // Clear previous test
    
    console.log("Sending image to OpenAI...");

    // 3. Call your AI Brain
    const data = await parseReceipt(base64);
    
    console.log("---------------- API RESPONSE ----------------");
    console.log(JSON.stringify(data, null, 2)); // Prints pretty JSON to your Terminal
    console.log("----------------------------------------------");

    if (data && data.items) {
      // Show success on phone screen
      const summary = data.items.map((i: any) => `${i.quantity} ${i.name}`).join("\n");
      setLastResult(summary);
      Alert.alert("Success!", `Found ${data.items.length} items:\n\n${summary}`);
    } else {
      Alert.alert("Error", "Could not read receipt or API failed.");
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{marginTop: 10}}>Analyzing Receipt...</Text>
          <Text style={{fontSize: 10, color: 'gray'}}>(Check your terminal for logs)</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Button title="Test Scan Receipt 📸" onPress={takePicture} />
          
          {lastResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Last Scan Found:</Text>
              <ScrollView style={{maxHeight: 200}}>
                <Text>{lastResult}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  center: { alignItems: 'center', width: '100%' },
  resultBox: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 10, 
    width: '100%' 
  },
  resultTitle: { fontWeight: 'bold', marginBottom: 5 }
});