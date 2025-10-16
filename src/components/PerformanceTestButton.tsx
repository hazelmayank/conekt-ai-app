import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { performanceTester } from '../utils/performanceTest';
import { useAlert } from '../context/AlertContext';

interface PerformanceTestButtonProps {
  style?: any;
}

const PerformanceTestButton: React.FC<PerformanceTestButtonProps> = ({ style }) => {
  const { showAlert } = useAlert();
  const [isRunning, setIsRunning] = useState(false);

  const runQuickTest = async () => {
    setIsRunning(true);
    try {
      const results = await performanceTester.runFullPerformanceTest();
      
      const successful = results.filter(m => m.success);
      const avgResponseTime = successful.length > 0 
        ? successful.reduce((sum, m) => sum + m.responseTime, 0) / successful.length 
        : 0;
      
      const slowest = successful.length > 0 
        ? successful.reduce((max, m) => m.responseTime > max.responseTime ? m : max)
        : null;
      
      showAlert({
        title: 'Performance Test Results',
        message: `Tests: ${results.length} | Success: ${successful.length} | Failed: ${results.length - successful.length}\n\nAverage Response Time: ${avgResponseTime.toFixed(2)}ms\nSlowest: ${slowest ? `${slowest.endpoint} (${slowest.responseTime.toFixed(2)}ms)` : 'N/A'}`,
        type: 'info',
        buttons: [{ text: 'OK' }]
      });
    } catch (error) {
      showAlert({
        message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={runQuickTest}
      disabled={isRunning}
    >
      <Text style={styles.buttonText}>
        {isRunning ? 'Testing...' : '🚀 Test Performance'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#53C920',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default PerformanceTestButton;
