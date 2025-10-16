import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { performanceTester, PerformanceMetrics } from '../utils/performanceTest';
import { useAlert } from '../context/AlertContext';

const PerformanceTestScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState<{
    totalTests: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    slowest: PerformanceMetrics | null;
    fastest: PerformanceMetrics | null;
  } | null>(null);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setMetrics([]);
    setSummary(null);
    
    try {
      const results = await performanceTester.runFullPerformanceTest();
      setMetrics(results);
      
      // Calculate summary
      const successful = results.filter(m => m.success);
      const failed = results.filter(m => !m.success);
      
      const avgResponseTime = successful.length > 0 
        ? successful.reduce((sum, m) => sum + m.responseTime, 0) / successful.length 
        : 0;
      
      const slowest = successful.length > 0 
        ? successful.reduce((max, m) => m.responseTime > max.responseTime ? m : max)
        : null;
      
      const fastest = successful.length > 0 
        ? successful.reduce((min, m) => m.responseTime < min.responseTime ? m : min)
        : null;
      
      setSummary({
        totalTests: results.length,
        successful: successful.length,
        failed: failed.length,
        averageResponseTime: avgResponseTime,
        slowest,
        fastest
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

  const clearResults = () => {
    setMetrics([]);
    setSummary(null);
    performanceTester.clearMetrics();
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#4CAF50' : '#F44336';
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 500) return '#4CAF50'; // Green - Fast
    if (responseTime < 1000) return '#FF9800'; // Orange - Medium
    return '#F44336'; // Red - Slow
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Performance Test</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.runButton, isRunning && styles.buttonDisabled]}
            onPress={runPerformanceTest}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Running...' : 'Run Performance Test'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Test Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tests:</Text>
              <Text style={styles.summaryValue}>{summary.totalTests}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Successful:</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{summary.successful}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Failed:</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>{summary.failed}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Avg Response Time:</Text>
              <Text style={[styles.summaryValue, { color: getResponseTimeColor(summary.averageResponseTime) }]}>
                {formatResponseTime(summary.averageResponseTime)}
              </Text>
            </View>
            {summary.slowest && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Slowest:</Text>
                <Text style={styles.summaryValue}>{summary.slowest.endpoint} ({formatResponseTime(summary.slowest.responseTime)})</Text>
              </View>
            )}
            {summary.fastest && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fastest:</Text>
                <Text style={styles.summaryValue}>{summary.fastest.endpoint} ({formatResponseTime(summary.fastest.responseTime)})</Text>
              </View>
            )}
          </View>
        )}

        {/* Results */}
        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricEndpoint}>{metric.endpoint}</Text>
                <View style={styles.metricStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(metric.success) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(metric.success) }]}>
                    {metric.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.metricDetails}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Method:</Text>
                  <Text style={styles.metricValue}>{metric.method}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Response Time:</Text>
                  <Text style={[styles.metricValue, { color: getResponseTimeColor(metric.responseTime) }]}>
                    {formatResponseTime(metric.responseTime)}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Timestamp:</Text>
                  <Text style={styles.metricValue}>{new Date(metric.timestamp).toLocaleTimeString()}</Text>
                </View>
                {metric.error && (
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Error:</Text>
                    <Text style={[styles.metricValue, { color: '#F44336' }]}>{metric.error}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          
          {metrics.length === 0 && !isRunning && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No test results yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Run Performance Test" to start</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  backButton: {
    padding: tokens.spacing[2],
  },
  backButtonText: {
    fontSize: 16,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 60,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    gap: tokens.spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
  },
  runButton: {
    backgroundColor: '#53C920',
  },
  clearButton: {
    backgroundColor: '#6D7E72',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    padding: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: tokens.spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[2],
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6D7E72',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  results: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: tokens.spacing[3],
    padding: tokens.spacing[4],
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  metricEndpoint: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    flex: 1,
  },
  metricStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: tokens.spacing[1],
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  metricDetails: {
    gap: tokens.spacing[2],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6D7E72',
  },
  metricValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6D7E72',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
});

export default PerformanceTestScreen;
