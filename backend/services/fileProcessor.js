const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class FileProcessor {
  constructor() {
    this.supportedFormats = ['.csv', '.xlsx', '.xls'];
    this.requiredColumns = [
      'quarter', 'year', 'metric_name', 'metric_value'
    ];
    this.optionalColumns = [
      'metric_unit', 'category', 'description', 'target_value', 'status'
    ];
  }

  async processFile(filePath, fileType) {
    try {
      const data = await this.parseFile(filePath, fileType);
      const validatedData = this.validateData(data);
      return validatedData;
    } catch (error) {
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  async parseFile(filePath, fileType) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.csv':
        return await this.parseCSV(filePath);
      case '.xlsx':
      case '.xls':
        return await this.parseExcel(filePath);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data found in file');
    }

    const validatedData = [];
    const errors = [];

    data.forEach((row, index) => {
      try {
        const validatedRow = this.validateRow(row, index + 1);
        if (validatedRow) {
          validatedData.push(validatedRow);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Validation warnings:', errors);
    }

    if (validatedData.length === 0) {
      throw new Error('No valid data rows found');
    }

    return validatedData;
  }

  validateRow(row, rowNumber) {
    // Check required columns
    const missingColumns = this.requiredColumns.filter(col => 
      !row.hasOwnProperty(col) || row[col] === undefined || row[col] === ''
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate quarter format (Q1, Q2, Q3, Q4)
    const quarter = row.quarter.toString().toUpperCase();
    if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
      throw new Error(`Invalid quarter format: ${row.quarter}. Must be Q1, Q2, Q3, or Q4`);
    }

    // Validate year
    const year = parseInt(row.year);
    if (isNaN(year) || year < 2020 || year > 2030) {
      throw new Error(`Invalid year: ${row.year}. Must be between 2020-2030`);
    }

    // Validate metric value
    const metricValue = parseFloat(row.metric_value);
    if (isNaN(metricValue)) {
      throw new Error(`Invalid metric value: ${row.metric_value}. Must be a number`);
    }

    // Validate target value if provided
    let targetValue = null;
    if (row.target_value && row.target_value !== '') {
      targetValue = parseFloat(row.target_value);
      if (isNaN(targetValue)) {
        throw new Error(`Invalid target value: ${row.target_value}. Must be a number`);
      }
    }

    // Validate status if provided
    let status = null;
    if (row.status && row.status !== '') {
      const validStatuses = ['green', 'amber', 'red'];
      const statusValue = row.status.toString().trim().toLowerCase();
      if (validStatuses.includes(statusValue)) {
        status = statusValue;
      } else {
        console.warn(`Invalid status value: ${row.status}. Must be green, amber, or red`);
      }
    }

    return {
      quarter: quarter,
      year: year,
      metric_name: row.metric_name.toString().trim(),
      metric_value: metricValue,
      metric_unit: row.metric_unit ? row.metric_unit.toString().trim() : null,
      category: row.category ? row.category.toString().trim() : null,
      description: row.description ? row.description.toString().trim() : null,
      target_value: targetValue,
      status: status
    };
  }

  // Generate sample data template with historical data
  generateTemplate(format = 'csv') {
    const sampleData = [
      // Q1 2024 Data
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'Total ARR',
        metric_value: '6520000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Annual Recurring Revenue',
        target_value: '7100000',
        status: 'amber'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'Net New ARR Added',
        metric_value: '238000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'New ARR added this quarter',
        target_value: '350000',
        status: 'red'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'Churn',
        metric_value: '-95000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Churn amount (negative value)',
        target_value: '-50000',
        status: 'red'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'NRR',
        metric_value: '105',
        metric_unit: '%',
        category: 'Growth & Retention',
        description: 'Net Revenue Retention',
        target_value: '110',
        status: 'amber'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'Burn Multiple',
        metric_value: '1.35',
        metric_unit: 'x',
        category: 'Financial & Sales',
        description: 'Burn rate multiple',
        target_value: '1',
        status: 'red'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'CAC',
        metric_value: '2340',
        metric_unit: 'USD',
        category: 'Financial & Sales',
        description: 'Customer Acquisition Cost',
        target_value: '2000',
        status: 'red'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'Deployment Frequency',
        metric_value: '12',
        metric_unit: 'per month',
        category: 'Product & Engineering',
        description: 'Number of deployments per month',
        target_value: '15',
        status: 'amber'
      },
      {
        quarter: 'Q1',
        year: '2024',
        metric_name: 'eNPS (Employee Engagement)',
        metric_value: '50',
        metric_unit: 'score',
        category: 'People & Culture',
        description: 'Employee Net Promoter Score',
        target_value: '60',
        status: 'amber'
      },
      
      // Q4 2023 Historical Data
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'Total ARR',
        metric_value: '6282000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Annual Recurring Revenue',
        target_value: '7000000',
        status: 'amber'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'Net New ARR Added',
        metric_value: '285000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'New ARR added this quarter',
        target_value: '300000',
        status: 'amber'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'Churn',
        metric_value: '-125000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Churn amount (negative value)',
        target_value: '-80000',
        status: 'red'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'NRR',
        metric_value: '102',
        metric_unit: '%',
        category: 'Growth & Retention',
        description: 'Net Revenue Retention',
        target_value: '110',
        status: 'red'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'Burn Multiple',
        metric_value: '1.42',
        metric_unit: 'x',
        category: 'Financial & Sales',
        description: 'Burn rate multiple',
        target_value: '1',
        status: 'red'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'CAC',
        metric_value: '2580',
        metric_unit: 'USD',
        category: 'Financial & Sales',
        description: 'Customer Acquisition Cost',
        target_value: '2000',
        status: 'red'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'Deployment Frequency',
        metric_value: '10',
        metric_unit: 'per month',
        category: 'Product & Engineering',
        description: 'Number of deployments per month',
        target_value: '15',
        status: 'red'
      },
      {
        quarter: 'Q4',
        year: '2023',
        metric_name: 'eNPS (Employee Engagement)',
        metric_value: '42',
        metric_unit: 'score',
        category: 'People & Culture',
        description: 'Employee Net Promoter Score',
        target_value: '60',
        status: 'red'
      },
      
      // Q3 2023 Historical Data
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'Total ARR',
        metric_value: '6120000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Annual Recurring Revenue',
        target_value: '6500000',
        status: 'amber'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'Net New ARR Added',
        metric_value: '320000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'New ARR added this quarter',
        target_value: '280000',
        status: 'green'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'Churn',
        metric_value: '-88000',
        metric_unit: 'USD',
        category: 'Growth & Retention',
        description: 'Churn amount (negative value)',
        target_value: '-90000',
        status: 'green'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'NRR',
        metric_value: '108',
        metric_unit: '%',
        category: 'Growth & Retention',
        description: 'Net Revenue Retention',
        target_value: '110',
        status: 'amber'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'Burn Multiple',
        metric_value: '1.28',
        metric_unit: 'x',
        category: 'Financial & Sales',
        description: 'Burn rate multiple',
        target_value: '1',
        status: 'amber'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'CAC',
        metric_value: '2180',
        metric_unit: 'USD',
        category: 'Financial & Sales',
        description: 'Customer Acquisition Cost',
        target_value: '2000',
        status: 'amber'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'Deployment Frequency',
        metric_value: '14',
        metric_unit: 'per month',
        category: 'Product & Engineering',
        description: 'Number of deployments per month',
        target_value: '15',
        status: 'amber'
      },
      {
        quarter: 'Q3',
        year: '2023',
        metric_name: 'eNPS (Employee Engagement)',
        metric_value: '48',
        metric_unit: 'score',
        category: 'People & Culture',
        description: 'Employee Net Promoter Score',
        target_value: '60',
        status: 'amber'
      }
    ];

    if (format === 'csv') {
      return this.convertToCSV(sampleData);
    } else if (format === 'xlsx') {
      return this.convertToExcel(sampleData);
    }

    return sampleData;
  }

  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  convertToExcel(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ELT Data');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Get file statistics
  getFileStats(data) {
    const stats = {
      totalRows: data.length,
      quarters: [...new Set(data.map(row => `${row.year}-${row.quarter}`))],
      metrics: [...new Set(data.map(row => row.metric_name))],
      categories: [...new Set(data.map(row => row.category).filter(Boolean))],
      valueRange: {
        min: Math.min(...data.map(row => row.metric_value)),
        max: Math.max(...data.map(row => row.metric_value))
      }
    };

    return stats;
  }
}

module.exports = new FileProcessor();
