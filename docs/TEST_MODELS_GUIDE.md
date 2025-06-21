# Test Models Feature Documentation

## Overview

The **Test Models** page provides a dedicated interface for testing LLM prompts directly without needing existing logs. This feature complements the existing Replay functionality by allowing users to experiment with fresh prompts and compare model responses.

## Features

### ✨ Direct Model Testing

- **Multiple Provider Support**: Test with OpenAI, Ollama, Mistral, and OpenRouter
- **Dynamic Model Selection**: Automatically loads available models for each provider
- **Real-time Configuration**: Adjust temperature, max tokens, and system messages
- **Instant Results**: See responses, token usage, cost estimates, and performance metrics

### 🔄 Compare Mode

- **Side-by-Side Testing**: Run multiple test configurations simultaneously
- **Multi-Provider Comparison**: Compare the same prompt across different models
- **Performance Benchmarking**: Compare response times, costs, and token usage

### 💾 Prompt Management

- **Save Prompts**: Save frequently used prompts for reuse
- **Example Library**: Pre-built example prompts for different use cases
- **Quick Loading**: Easily load saved or example prompts into any test configuration

### 📊 Advanced Features

- **Cost Estimation**: Preview estimated costs before running tests
- **Token Counting**: Real-time character and estimated token counting
- **Validation**: Pre-flight validation of test configurations
- **Response Analysis**: Detailed metrics including latency, tokens, and costs

## API Endpoints

### Test Prompt

```
POST /api/test/prompt
```

Test a single prompt with specified provider and model.

**Request Body:**

```json
{
  "prompt": "Your test prompt here",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "systemMessage": "You are a helpful assistant.",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "requestId": "test-123456789",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "response": "Assistant response here...",
    "tokenUsage": {
      "promptTokens": 15,
      "completionTokens": 25,
      "totalTokens": 40
    },
    "cost": 0.0012,
    "duration": 1250,
    "timestamp": "2023-12-07T10:30:00Z"
  }
}
```

### Compare Models

```
POST /api/test/compare
```

Test the same prompt with multiple models.

**Request Body:**

```json
{
  "prompt": "Explain quantum computing",
  "models": [
    {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "temperature": 0.7,
      "maxTokens": 500
    },
    {
      "provider": "ollama",
      "model": "llama2",
      "temperature": 0.7,
      "maxTokens": 500
    }
  ]
}
```

### Get Available Models

```
GET /api/test/models
```

Retrieve available models for all configured providers.

### Cost Estimation

```
POST /api/test/estimate
```

Get cost estimates before running tests.

### Configuration Validation

```
POST /api/test/validate
```

Validate test configuration and get recommendations.

## Usage Examples

### Basic Testing

1. Navigate to the **Test Models** page
2. Enter your prompt in the text area
3. Select your preferred provider and model
4. Adjust parameters (temperature, max tokens)
5. Click **Run** to execute the test
6. View results including response, metrics, and costs

### Compare Mode

1. Enable **Compare Mode** in the header
2. Add multiple test configurations using **Add Test**
3. Configure different providers/models for each test
4. Use the same prompt across all configurations
5. Click **Run All Tests** to execute simultaneously
6. Compare results side-by-side

### Using Examples

1. Click the **Load example...** dropdown
2. Select from pre-built prompts like:
   - Creative Writing
   - Code Review
   - Data Analysis
   - Technical Documentation
   - Problem Solving
3. The prompt and appropriate system message will be loaded
4. Modify as needed and run the test

### Saving Prompts

1. Enter or load a prompt you want to save
2. Click **Save Prompt** below the text area
3. Enter a descriptive name
4. Access saved prompts via **Load saved...** dropdown

## Best Practices

### Prompt Design

- **Be Specific**: Clear, detailed prompts generally produce better results
- **Set Context**: Use system messages to establish the assistant's role
- **Test Variations**: Try different phrasings to find optimal results

### Model Selection

- **Start Simple**: Begin with faster, cheaper models like GPT-3.5-turbo
- **Compare Performance**: Use compare mode to evaluate different models
- **Consider Cost**: Balance quality needs with budget constraints

### Parameter Tuning

- **Temperature**:
  - 0.0-0.3: Focused, deterministic responses
  - 0.4-0.7: Balanced creativity and coherence
  - 0.8-1.0: More creative, varied responses
- **Max Tokens**: Set appropriate limits to control response length and cost

### Testing Strategy

1. **Validate First**: Use the validation endpoint to check configurations
2. **Estimate Costs**: Preview costs for expensive models or long prompts
3. **Iterative Testing**: Start with basic prompts and refine based on results
4. **Save Good Prompts**: Build a library of effective prompts for reuse

## Integration with Monitoring

All test requests are automatically logged in the monitoring system with:

- **Special Tagging**: Tests are marked with `isTest: true` metadata
- **Full Tracking**: Same metrics as production requests (latency, costs, tokens)
- **Error Logging**: Failed tests are captured for debugging
- **Analytics Integration**: Test data appears in analytics dashboards

## Troubleshooting

### Common Issues

**"No models available"**

- Check provider configuration in Settings
- Ensure API keys are properly set
- Verify provider services are running (especially Ollama)

**"Test failed" errors**

- Check network connectivity
- Verify API keys and provider settings
- Review error messages in the response
- Check provider-specific documentation

**High costs warning**

- Review max tokens setting
- Consider using smaller/cheaper models for testing
- Use cost estimation before running expensive tests

### Performance Tips

- Use smaller models for rapid iteration
- Set reasonable max token limits
- Test with shorter prompts first
- Monitor token usage to optimize costs

## Security Considerations

- **API Key Safety**: Test prompts use the same API keys as production
- **Data Privacy**: Test prompts are logged and stored
- **Rate Limiting**: Respect provider rate limits during testing
- **Cost Control**: Monitor spending, especially with expensive models

## Future Enhancements

Planned features for future releases:

- **Batch Testing**: Upload CSV files with multiple prompts
- **A/B Testing Framework**: Systematic comparison tools
- **Prompt Templates**: Reusable prompt structures
- **Export Results**: Download test results as CSV/JSON
- **Scheduling**: Automated recurring tests
- **Benchmarking Suites**: Standard evaluation datasets
