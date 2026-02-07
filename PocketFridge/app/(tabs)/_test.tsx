import { View, Text, Button, StyleSheet } from 'react-native';
import { runHelperTests, runContextTests } from '../../tests/manualTests';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Runner</Text>
      
      <Button 
        title="🧪 Run Helper Tests" 
        onPress={() => {
          console.log('\n--- RUNNING HELPER TESTS ---\n');
          runHelperTests();
        }} 
      />
      
      <Button 
        title="🧪 Run Context Tests" 
        onPress={() => {
          console.log('\n--- RUNNING CONTEXT TESTS ---\n');
          runContextTests();
        }} 
      />
      
      <Button 
        title="🧪 Run All Tests" 
        onPress={() => {
          console.log('\n--- RUNNING ALL TESTS ---\n');
          runHelperTests();
          runContextTests();
        }} 
      />
      
      <Text style={styles.note}>
        Check your terminal/console for results
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  }
});