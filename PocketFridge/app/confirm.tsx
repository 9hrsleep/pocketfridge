// app/confirm.tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFridge } from '../contexts/FridgeContext';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const items = params.items ? JSON.parse(params.items as string) : [];
  const receiptUri = params.receiptUri as string;

  const { addItemsToFridge } = useFridge();

  const handleConfirm = async () => {
    addItemsToFridge(items, receiptUri);
    router.replace('/(tabs)'); 
  };

  return (
    <LinearGradient colors={['#B2D459', '#285B23']} style={styles.gradientRoot}>
      <Text style={styles.headerTitle}>Confirm Items</Text>

      <View style={styles.ticketCard}>
        <View style={styles.rowHeader}>
          <Text style={styles.colQty}>Qt.</Text>
          <Text style={styles.colItem}>Item</Text>
          <Text style={styles.colPrice}>Price</Text>
        </View>

        <View style={styles.dashedLine} />

        <ScrollView style={styles.listContainer}>
          {items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.qtyControl}>
                <TouchableOpacity>
                  <Ionicons name="remove-circle-outline" size={24} color="#CEE67A" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity>
                  <Ionicons name="add-circle-outline" size={24} color="#285B23" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemName}>
                {item.food_type || item.name}
              </Text>

              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.addMoreRow}>
            <Ionicons name="add-circle-outline" size={20} color="#285B23" />
            <Text style={styles.addMoreText}>Add another/missing item</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 36,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#FEFFDE',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  ticketCard: {
    backgroundColor: '#FCFEEF',
    borderRadius: 20,
    flex: 1,
    paddingTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  rowHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  colQty: {
    width: 90,
    fontSize: 18,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#285B23',
    textAlign: 'center',
    letterSpacing: 1,
  },

  colItem: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#285B23',
    textAlign: 'left',
    letterSpacing: 1,
  },

  colPrice: {
    width: 60,
    fontSize: 18,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#285B23',
    textAlign: 'right',
    letterSpacing: 1,
  },

  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#285B23',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    opacity: 0.3,
  },

  listContainer: {
    flex: 1,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  qtyControl: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },

  qtyText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Light',
    color: '#285B23',
  },

  itemName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Helvetica-Light',
    color: '#285B23',
  },

  itemPrice: {
    width: 60,
    fontSize: 16,
    fontFamily: 'Helvetica-Light',
    textAlign: 'right',
    color: '#285B23',
  },

  addMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#CEE67A',
    backgroundColor: '#FDFFB2',
    marginTop: 10,
  },

  addMoreText: {
    marginLeft: 5,
    fontFamily: 'Helvetica-Light',
    color: '#285B23',
  },

  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FCFEEF',
  },

  confirmBtn: {
    backgroundColor: '#B2D459',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 3,
  },

  confirmBtnText: {
    fontSize: 23,
    fontFamily: 'Offbit-DotBold',
    fontWeight: 'normal',
    color: '#285B23',
   
  },
});