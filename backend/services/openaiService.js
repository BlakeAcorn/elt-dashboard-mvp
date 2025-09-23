const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-4'; // or 'gpt-3.5-turbo' for cost efficiency
  }

  async analyzeDashboardData(dashboardData, qoqComparisons = null, currentQuarter = null) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.createAnalysisPrompt(dashboardData, qoqComparisons, currentQuarter);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a business intelligence analyst specializing in SaaS metrics. Provide actionable insights and recommendations based on the dashboard data provided.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        analysis: response.data.choices[0].message.content,
        usage: response.data.usage
      };

    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  createAnalysisPrompt(data, qoqComparisons = null, currentQuarter = null) {
    let prompt = `
Please analyze the following SaaS dashboard metrics and provide insights:

CURRENT QUARTER METRICS:
- Total ARR: $${data.totalARR}M (Target: $${data.targetARR}M) - Status: ${data.arrStatus}
- Net New ARR Added: $${data.netNewARR}K (Target: $${data.targetNetNewARR}K) - Status: ${data.netNewARRStatus}
- Pipeline: $${data.pipeline}M (Target: $${data.targetPipeline}M) - Status: ${data.pipelineStatus}
- Churn: $${data.churn}K (Target: $${data.targetChurn}K) - Status: ${data.churnStatus}
- NRR: ${data.nrr}% (Target: ${data.targetNRR}%) - Status: ${data.nrrStatus}
- Burn Multiple: ${data.burnMultiple}x (Target: ${data.targetBurnMultiple}x) - Status: ${data.burnMultipleStatus} (Lower is better)
- CAC: $${data.cac} (Target: $${data.targetCAC}) - Status: ${data.cacStatus} (Lower is better)
- Deployment Frequency: ${data.deploymentFreq}/month (Target: ${data.targetDeploymentFreq}/month) - Status: ${data.deploymentFreqStatus}
- eNPS: ${data.enps} (Target: ${data.targetENPS}) - Status: ${data.enpsStatus}
`;

    if (qoqComparisons && currentQuarter) {
      prompt += `\nQUARTER-OVER-QUARTER COMPARISON (${currentQuarter.quarter} ${currentQuarter.year} vs Previous Quarter):\n`;
      
      Object.entries(qoqComparisons).forEach(([metric, comparison]) => {
        const change = comparison.change;
        const changePercent = comparison.changePercent;
        const isPositive = change > 0;
        const changeText = isPositive ? `+${change}` : `${change}`;
        const trend = isPositive ? '↗️' : '↘️';
        
        prompt += `- ${metric}: ${changeText} (${changePercent?.toFixed(1)}%) ${trend} - Current: ${comparison.current.metric_value}${comparison.current.metric_unit}, Previous: ${comparison.previous.metric_value}${comparison.previous.metric_unit}\n`;
      });
      
      prompt += `\nAnalyze both the current quarter performance AND the quarter-over-quarter trends to provide comprehensive insights.\n`;
    }

    prompt += `
Please provide:
1. EXECUTIVE SUMMARY (2-3 sentences focusing on current performance and trends)
2. KEY INSIGHTS (3-5 bullet points highlighting both current metrics and QoQ changes)
3. AREAS OF CONCERN (red status items and declining trends)
4. RECOMMENDATIONS (actionable next steps based on current performance and trends)
5. TRENDS TO WATCH (metrics showing significant QoQ changes that need attention)

Format the response in clear, business-friendly language suitable for executive presentation. Focus on both current quarter performance and the quarter-over-quarter trends to provide actionable insights.
    `;

    return prompt;
  }

  async generateInsights(metricData, qoqComparisons = null, currentQuarter = null) {
    try {
      const response = await this.analyzeDashboardData(metricData, qoqComparisons, currentQuarter);
      return response;
    } catch (error) {
      throw new Error(`Insights generation failed: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();
