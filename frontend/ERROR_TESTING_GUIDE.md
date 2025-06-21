# Error Handling Testing Guide

This guide shows you how to test the error pages and error handling functionality in the OpenLLM Monitor application.

## 🚀 Quick Start

### Method 1: Visual Testing Interface (Recommended)

1. Start your development server:

   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to [http://localhost:3000/test-errors](http://localhost:3000/test-errors)

3. Click any of the error buttons to see the corresponding error page

4. Use your browser's back button to return to the test page

### Method 2: Direct URL Navigation

Navigate directly to these URLs to see the error pages:

- **Rate Limit Error**: [http://localhost:3000/error/429](http://localhost:3000/error/429)
- **Server Error**: [http://localhost:3000/error/500](http://localhost:3000/error/500)
- **Network Error**: [http://localhost:3000/error/network](http://localhost:3000/error/network)
- **404 Not Found**: [http://localhost:3000/some-invalid-url](http://localhost:3000/some-invalid-url)

### Method 3: Dashboard Quick Access

1. Go to the Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Look for the "Test Errors" card in the Quick Actions section
3. Click it to access the error testing interface

## 🧪 Advanced Testing with Mock API

For more realistic testing, you can use our mock API service that simulates real backend errors:

### Browser Console Testing

1. Open your browser's developer console (F12)

2. Activate the error testing service:

   ```javascript
   window.testErrors.activate();
   ```

3. Now all API calls will randomly return errors. Try using the app normally (view logs, analytics, etc.)

4. To test specific errors:

   ```javascript
   // Test rate limiting
   window.testErrors.simulateRateLimit();

   // Test server errors
   window.testErrors.simulateServerError();

   // Test network errors
   window.testErrors.simulateNetworkError();
   ```

5. Deactivate when done:
   ```javascript
   window.testErrors.deactivate();
   ```

### Testing with Query Parameters

You can also force specific errors by adding query parameters to API calls:

- `?test-error=429` - Rate limit error
- `?test-error=500` - Server error
- `?test-error=network` - Network error
- `?test-error=404` - Not found error

## 🎯 What to Test

### Error Pages

- [ ] **Rate Limit (429)**: Shows countdown timer and retry suggestions
- [ ] **Server Error (500)**: Shows maintenance message with support options
- [ ] **Network Error**: Shows connection troubleshooting steps
- [ ] **404 Not Found**: Shows helpful navigation options

### Error Handling Features

- [ ] **Automatic Retries**: Failed requests are retried automatically
- [ ] **Toast Notifications**: Users see informative error messages
- [ ] **Graceful Degradation**: App continues working when possible
- [ ] **Error Recovery**: Users can recover from errors easily

### User Experience

- [ ] **Consistent Design**: Error pages match the app's design language
- [ ] **Helpful Actions**: Each error page provides relevant next steps
- [ ] **Animations**: Smooth transitions and engaging micro-animations
- [ ] **Responsive**: Error pages work well on all device sizes

## 🔧 Testing Different Scenarios

### 1. Network Disconnection

- Disconnect your internet connection
- Try using various features in the app
- Reconnect and see how the app recovers

### 2. Backend Server Down

- Stop your backend server (if running)
- Try features that require API calls
- Restart the server and test recovery

### 3. Slow Network

- Use browser dev tools to throttle network speed
- Test how the app handles slow responses
- Look for timeout handling and loading states

### 4. API Rate Limiting

- Use the mock service to simulate rate limits
- Test how the app handles retry-after headers
- Verify the countdown timer works correctly

## 📱 Testing on Different Devices

### Desktop

- Test all error pages in different browser sizes
- Verify animations and hover effects work
- Test keyboard navigation

### Mobile

- Use browser dev tools device emulation
- Test touch interactions
- Verify responsive layouts

### Tablet

- Test medium screen sizes
- Verify layout adapts properly
- Test both portrait and landscape

## 🐛 Common Issues to Look For

### Visual Issues

- [ ] Text overflow or truncation
- [ ] Broken layouts on small screens
- [ ] Missing or broken animations
- [ ] Inconsistent spacing or colors

### Functional Issues

- [ ] Buttons that don't work
- [ ] Broken navigation links
- [ ] Missing error messages
- [ ] Infinite loading states

### Performance Issues

- [ ] Slow page loads
- [ ] Janky animations
- [ ] Memory leaks
- [ ] Excessive API calls

## 📊 Testing Checklist

Use this checklist to ensure comprehensive testing:

- [ ] All error pages load correctly
- [ ] Error pages have consistent styling
- [ ] Navigation from error pages works
- [ ] Retry mechanisms function properly
- [ ] Toast notifications appear and disappear
- [ ] App recovers gracefully from errors
- [ ] Console shows no JavaScript errors
- [ ] Error pages are accessible (keyboard nav, screen readers)
- [ ] Error pages work on different screen sizes
- [ ] Error pages work in different browsers

## 🔄 Integration Testing

Test how errors interact with other app features:

### WebSocket Connection

- Disconnect WebSocket
- Verify reconnection logic
- Test real-time features during connection issues

### State Management

- Trigger errors while app state is loading
- Verify state consistency after errors
- Test error recovery with cached data

### Navigation

- Trigger errors during route changes
- Test browser back/forward with errors
- Verify deep linking to error pages

## 💡 Tips for Effective Testing

1. **Test Early and Often**: Don't wait until the end to test errors
2. **Use Real Conditions**: Test with slow networks and real devices
3. **Think Like a User**: Consider what users would actually do
4. **Document Issues**: Keep track of bugs and edge cases
5. **Test Recovery**: Always test how users can get back to working state

## 🆘 Troubleshooting

### Error Testing Service Not Working

```javascript
// Check if service is loaded
console.log(window.errorTestingService);

// Manually reload the service
import("/src/utils/errorTestingService.js");
```

### Errors Not Showing

- Check browser console for JavaScript errors
- Verify API service is properly imported
- Check network tab in dev tools

### Styling Issues

- Clear browser cache
- Check for CSS conflicts
- Verify Tailwind classes are working

---

## 📞 Need Help?

If you encounter issues with the error testing:

1. Check the browser console for error messages
2. Verify all files are properly imported
3. Ensure the development server is running
4. Try refreshing the page and clearing cache

Happy testing! 🎉
