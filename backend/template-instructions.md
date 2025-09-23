# ELT Dashboard Data Upload Template

## Template Structure

The CSV/Excel template now includes ALL 32 metrics from the dashboard with the following columns:

### Required Columns:
- **quarter**: Q1, Q2, Q3, or Q4
- **year**: 2020-2030
- **metric_name**: Exact name of the metric (see list below)
- **metric_value**: Current value (numeric)

### Optional Columns:
- **metric_unit**: Unit of measurement (USD, %, days, etc.)
- **category**: Metric category (Growth & Retention, Product & Engineering, People & Culture, Financial & Sales)
- **description**: Brief description of the metric
- **target_value**: Target/goal value (numeric)
- **status**: Status indicator (green, amber, red)

## Complete Metric List

### Growth & Retention Metrics (Green/Mint):
1. Total ARR
2. Net New ARR Added
3. Churn
4. NRR
5. ARR Growth (YoY)
6. Logo ARR Added
7. Pipeline
8. Gross Logo Churn

### Product & Engineering Metrics (Purple/Violet):
9. Defect Escape Rate
10. Deployment Frequency
11. Uptime / SLA
12. Feature Adoption
13. Current CSAT
14. Target CSAT

### People & Culture Metrics (Pink/Blush):
15. Headcount vs. Plan
16. Attrition % (Voluntary)
17. NPS (Customer Loyalty)
18. CSAT (Support Satisfaction)
19. Ticket Volume / Velocity
20. Time-to-First-Value
21. eNPS (Employee Engagement)

### Financial & Sales Metrics (Yellow/Sunray):
22. Burn Multiple
23. Runway
24. Gross Margin
25. CAC
26. CAC Payback Period
27. ARR per Head
28. Win Rate
29. Sales Cycle - Mid Market
30. Sales Cycle - Enterprise
31. Pipeline Coverage
32. Current ARR per Person
33. Q1 FY26 Target ARR per Person

## Status Indicators

Use these status values in the **status** column:
- **green**: On Track (meeting or exceeding targets)
- **amber**: At Risk (close to target but not quite there)
- **red**: Behind Target (significantly behind target)

## Example Data

The template includes sample data for all metrics with:
- Current values matching the dashboard
- Target values for key metrics
- Status indicators (green/amber/red)
- Proper categorization
- Realistic units and descriptions

## Usage Instructions

1. Download the template (CSV or Excel format)
2. Fill in your actual data for each metric
3. Ensure metric names match exactly (case-sensitive)
4. Use numeric values only for metric_value and target_value
5. Upload the completed file through the dashboard

## Data Refresh

After uploading new data:
- All metrics will be refreshed with new values
- Status indicators will update based on target comparisons
- Dashboard will reflect the latest uploaded data
- Historical data is preserved for trend analysis
