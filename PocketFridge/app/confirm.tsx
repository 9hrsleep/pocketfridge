import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import { saveIngredients } from '../services/storageService'; // Use Arielle's save function

export default function ConfirmScreen() {
  const router = useRouter();
  
  // 1. Catch the data passed from Camera
  const params = useLocalSearchParams();
  
  // Parse the string back into an Object
  // (We have to verify it exists to avoid crashes)
  const items = params.items ? JSON.parse(params.items as string) : [];

  const handleConfirm = async () => {
    // 2. Save to "Real" Fridge Memory
    //await saveIngredients(items);
    
    // 3. Go home (The Fridge Tab)
    router.replace('/(tabs)'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Found {items.length} Items!</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.icon}>🥕</Text> 
            {/* You can map item.food_type to emojis later if you want */}
            <View>
              <Text style={styles.name}>{item.food_type}</Text>
              <Text style={styles.detail}>Expires in {item.expiration_days} days</Text>
            </View>
            <Text style={styles.qty}>x{item.quantity}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="Add to Fridge ✅" onPress={handleConfirm} />
        <Button title="Retake" color="red" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  icon: { fontSize: 30, marginRight: 15 },
  name: { fontSize: 18, fontWeight: '600' },
  detail: { color: 'gray' },
  qty: { marginLeft: 'auto', fontSize: 18, fontWeight: 'bold', color: 'blue' },
  footer: { marginTop: 20, gap: 10 }
});