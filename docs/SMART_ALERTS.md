# Smart Alerts System

The Smart Alerts system provides intelligent, real-time notifications for your OpenLLM Monitor instance. It analyzes your LLM usage patterns and proactively alerts you to potential issues with detailed insights and recommendations.

## Features

### 🔔 Intelligent Alert Detection

The system automatically monitors four key areas:

1. **Retry Rate Monitoring** (Threshold: 20%)

   - Detects when retry rates spike, indicating provider connectivity issues
   - Shows current rate vs. threshold
   - Provides impact analysis and specific recommendations

2. **Error Rate Monitoring** (Threshold: 15%)

   - Tracks error rates across all providers
   - Identifies patterns in failed requests
   - Offers targeted troubleshooting steps

3. **Cost Threshold Monitoring** (Threshold: $50/day)

   - Monitors daily spending across all providers
   - Alerts when budget limits are approached
   - Suggests cost optimization strategies

4. **Latency Monitoring** (Threshold: 2 seconds)
   - Tracks average response times
   - Identifies performance degradation
   - Recommends optimization techniques

### 📊 Detailed Alert Information

Each alert provides comprehensive details in a modal view:

#### Alert Details Include:

- **Current Metrics**: Real-time values compared to thresholds
- **Impact Analysis**: How the issue affects your system performance
- **Recommendations**: Specific steps to address the problem
- **Timestamps**: When the alert was triggered

## Technical Implementation

### Real-Time Data Integration

The Smart Alerts system integrates with the application's state management:

```javascript
// Alert Detection Logic
useEffect(() => {
  if (!stats) return;

  const newAlerts = [];

  // Check thresholds and create alerts
  if ((stats.retryRate || 0) > 20) {
    // Create retry rate alert with details
  }
  // ... other alert checks

  setAlerts(newAlerts);
}, [stats]);
```

### Alert Structure

Each alert contains comprehensive information:

```javascript
{
  id: "alert-identifier",
  type: "error|warning|info|success",
  title: "Alert Title",
  message: "Brief description",
  timestamp: new Date(),
  details: {
    currentRate: "Current metric value",
    threshold: "Alert threshold",
    impact: "Impact description",
    suggestions: ["Recommendation 1", "Recommendation 2"]
  }
}
```

## Alert States and Behaviors

### Alert Display

- **Bell Icon**: Shows alert count badge when alerts are present
- **Dropdown Panel**: Lists all active alerts with summary information
- **Detailed Modal**: Comprehensive view with metrics, impact analysis, and recommendations

### Alert Lifecycle

1. **Detection**: Continuous monitoring of stats for threshold breaches
2. **Creation**: Alert objects created with detailed context and recommendations
3. **Display**: Alerts appear in notification panel with expandable details
4. **Review**: Users can view detailed analysis and recommendations
5. **Dismissal**: Individual alerts can be dismissed or all cleared at once

## Configuration

### Alert Thresholds

Default thresholds can be customized in the component:

```javascript
// Retry Rate Alert
if ((stats.retryRate || 0) > 20) {
  /* Create alert */
}

// Error Rate Alert
if ((stats.errorRate || 0) > 15) {
  /* Create alert */
}

// Cost Threshold Alert
if ((stats.totalCost || 0) > 50) {
  /* Create alert */
}

// Latency Alert
if ((stats.avgResponseTime || 0) > 3000) {
  /* Create alert */
}
```

### Customization Options

The system supports customization of:

- Alert thresholds for each metric type
- Alert detail modal content and layout
- Alert styling and visual presentation
- Notification display duration

## Data Dependencies

The Smart Alerts system relies on the following data from the application state:

### Required Stats

- `stats.retryRate` - Current retry rate percentage
- `stats.errorRate` - Current error rate percentage
- `stats.totalCost` - Total daily cost in USD
- `stats.avgResponseTime` - Average response time in milliseconds

### State Management

The system uses the `useAppStore` hook to access real-time statistics and integrates with the application's state management system for live updates.

## Usage Examples

### Basic Alert Viewing

1. Click the bell icon in the top header
2. View alert summaries in the dropdown panel
3. Click "Show Details" to open the detailed modal with full analysis

### Alert Review Process

1. Monitor the bell icon for new alert notifications
2. Review alert summaries to understand current issues
3. Open detailed modals to view comprehensive analysis
4. Use the recommendations to address problems manually
5. Dismiss alerts once issues are resolved

## Best Practices

### Alert Management

- Review alerts regularly to maintain system health
- Use the detailed recommendations to address issues promptly
- Set up monitoring workflows based on alert patterns
- Dismiss alerts only after confirming issues are resolved

### Performance Optimization

- Act on latency alerts by investigating slow providers
- Use cost alerts to optimize spending patterns
- Monitor error trends to improve system reliability
- Track retry rates to identify connectivity issues

### Monitoring Strategy

- Enable comprehensive monitoring for all metrics
- Customize thresholds based on your usage patterns
- Regularly review alert recommendations
- Use alerts as early warning indicators for system issues

## Troubleshooting

### Common Issues

**Alerts Not Appearing**

- Verify stats are being fetched successfully from the store
- Check if alert thresholds are appropriate for your usage levels
- Ensure the useAppStore hook is properly connected
- Verify that stats data contains the required properties

**Alerts Not Updating**

- Check that the stats dependency in useEffect is working correctly
- Verify that stats are being updated in real-time
- Ensure React state updates are not being blocked

**Modal Not Displaying**

- Verify selectedAlert state is being set correctly
- Check for CSS conflicts that might hide the modal
- Ensure the modal overlay is not being blocked by other elements

### Debug Information

The Smart Alerts system provides debugging through:

- Browser console logs for alert creation and updates
- React DevTools for state inspection
- Alert object structure examination in modal details

## Future Enhancements

### Planned Features

- **Custom Alert Rules**: User-defined thresholds and conditions
- **Alert History**: Track alert occurrences over time
- **Integration Webhooks**: Send alerts to external systems
- **Machine Learning**: Predictive alerts based on usage patterns
- **Alert Scheduling**: Configure quiet hours and notification schedules
- **Escalation Rules**: Progressive alerts for persistent issues
- **Actionable Integrations**: Direct integration with system controls

### Extensibility

The Smart Alerts system is designed for easy extension:

- Add new alert types by extending the alert detection logic
- Customize alert display with new UI components
- Integrate with external monitoring and notification systems
- Extend alert details with additional metrics and analysis
