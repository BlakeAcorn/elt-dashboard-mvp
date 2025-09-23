const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, '..', 'data', 'dashboard.db');
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('📊 Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    const tables = [
      // Uploaded files metadata
      `CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        file_size INTEGER,
        status TEXT DEFAULT 'uploaded'
      )`,
      
      // Quarterly data storage
      `      CREATE TABLE IF NOT EXISTS quarterly_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER,
        quarter TEXT NOT NULL,
        year INTEGER NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL,
        metric_unit TEXT,
        category TEXT,
        target_value REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_id) REFERENCES files (id)
      );

      CREATE TABLE IF NOT EXISTS insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        insights_text TEXT NOT NULL,
        qoq_data TEXT,
        current_quarter TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Dashboard configurations
      `CREATE TABLE IF NOT EXISTS dashboard_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_name TEXT UNIQUE NOT NULL,
        config_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach(sql => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
        }
      });
    });
  }

  // File operations
  saveFileMetadata(filename, originalName, fileType, fileSize) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO files (filename, original_name, file_type, file_size) 
                   VALUES (?, ?, ?, ?)`;
      this.db.run(sql, [filename, originalName, fileType, fileSize], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getFiles() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM files ORDER BY upload_date DESC`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Data operations
  saveQuarterlyData(fileId, quarter, year, metricName, metricValue, metricUnit, category, targetValue = null, status = null) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO quarterly_data 
                   (file_id, quarter, year, metric_name, metric_value, metric_unit, category, target_value, status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      this.db.run(sql, [fileId, quarter, year, metricName, metricValue, metricUnit, category, targetValue, status], 
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
    });
  }

  getQuarterlyData(quarter = null, year = null) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM quarterly_data`;
      const params = [];
      
      if (quarter && year) {
        sql += ` WHERE quarter = ? AND year = ?`;
        params.push(quarter, year);
      } else if (quarter) {
        sql += ` WHERE quarter = ?`;
        params.push(quarter);
      } else if (year) {
        sql += ` WHERE year = ?`;
        params.push(year);
      }
      
      sql += ` ORDER BY year DESC, quarter DESC, metric_name`;
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getMetricsComparison(quarters = []) {
    return new Promise((resolve, reject) => {
      if (quarters.length === 0) {
        // Get all quarters
        const sql = `SELECT DISTINCT quarter, year FROM quarterly_data ORDER BY year DESC, quarter DESC LIMIT 4`;
        this.db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const quarterYears = rows.map(row => `${row.year}-${row.quarter}`);
            this.getMetricsComparison(quarterYears).then(resolve).catch(reject);
          }
        });
        return;
      }

      const placeholders = quarters.map(() => '?').join(',');
      const sql = `SELECT quarter, year, metric_name, metric_value, metric_unit, category
                   FROM quarterly_data 
                   WHERE (year || '-' || quarter) IN (${placeholders})
                   ORDER BY year DESC, quarter DESC, metric_name`;
      
      this.db.all(sql, quarters, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Configuration operations
  saveDashboardConfig(configName, configData) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR REPLACE INTO dashboard_config (config_name, config_data, updated_at)
                   VALUES (?, ?, CURRENT_TIMESTAMP)`;
      this.db.run(sql, [configName, JSON.stringify(configData)], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getDashboardConfig(configName) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT config_data FROM dashboard_config WHERE config_name = ?`;
      this.db.get(sql, [configName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? JSON.parse(row.config_data) : null);
        }
      });
    });
  }

  // Historical data methods
  getHistoricalData(metricName = null, limit = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          quarter,
          year,
          metric_name,
          metric_value,
          metric_unit,
          category,
          target_value,
          status,
          created_at
        FROM quarterly_data 
      `;
      
      const params = [];
      
      if (metricName) {
        sql += ` WHERE metric_name = ?`;
        params.push(metricName);
      }
      
      sql += ` ORDER BY year DESC, 
        CASE quarter 
          WHEN 'Q1' THEN 1 
          WHEN 'Q2' THEN 2 
          WHEN 'Q3' THEN 3 
          WHEN 'Q4' THEN 4 
        END DESC`;
        
      if (limit) {
        sql += ` LIMIT ?`;
        params.push(limit);
      }
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getQuarterOverQuarterComparison(metricName, currentQuarter, currentYear) {
    return new Promise((resolve, reject) => {
      // Get previous quarter data
      const prevQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                         currentQuarter === 'Q2' ? 'Q1' :
                         currentQuarter === 'Q3' ? 'Q2' : 'Q3';
      const prevYear = currentQuarter === 'Q1' ? currentYear - 1 : currentYear;
      
      const sql = `
        SELECT 
          quarter,
          year,
          metric_value,
          metric_unit,
          target_value,
          status
        FROM quarterly_data 
        WHERE metric_name = ? 
        AND ((quarter = ? AND year = ?) OR (quarter = ? AND year = ?))
        ORDER BY year DESC, 
          CASE quarter 
            WHEN 'Q1' THEN 1 
            WHEN 'Q2' THEN 2 
            WHEN 'Q3' THEN 3 
            WHEN 'Q4' THEN 4 
          END DESC
      `;
      
      this.db.all(sql, [metricName, currentQuarter, currentYear, prevQuarter, prevYear], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const current = rows.find(r => r.quarter === currentQuarter && r.year === currentYear);
          const previous = rows.find(r => r.quarter === prevQuarter && r.year === prevYear);
          
          resolve({
            current: current || null,
            previous: previous || null,
            change: current && previous ? current.metric_value - previous.metric_value : null,
            changePercent: current && previous && previous.metric_value !== 0 ? 
              ((current.metric_value - previous.metric_value) / previous.metric_value) * 100 : null
          });
        }
      });
    });
  }

  getMetricsByQuarter(quarter, year) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          metric_name,
          metric_value,
          metric_unit,
          category,
          target_value,
          status
        FROM quarterly_data 
        WHERE quarter = ? AND year = ?
        ORDER BY category, metric_name
      `;
      
      this.db.all(sql, [quarter, year], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getAvailableQuarters() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT DISTINCT quarter, year
        FROM quarterly_data 
        ORDER BY year DESC, 
          CASE quarter 
            WHEN 'Q1' THEN 1 
            WHEN 'Q2' THEN 2 
            WHEN 'Q3' THEN 3 
            WHEN 'Q4' THEN 4 
          END DESC
      `;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getTrendData(metricName, quarters = 8) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          quarter,
          year,
          metric_value,
          target_value,
          created_at
        FROM quarterly_data 
        WHERE metric_name = ?
        ORDER BY year DESC, 
          CASE quarter 
            WHEN 'Q1' THEN 1 
            WHEN 'Q2' THEN 2 
            WHEN 'Q3' THEN 3 
            WHEN 'Q4' THEN 4 
          END DESC
        LIMIT ?
      `;
      
      this.db.all(sql, [metricName, quarters], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Reverse to show chronologically
          resolve(rows.reverse());
        }
      });
    });
  }

  // Insights methods
  saveInsights(insightsText, qoqData = null, currentQuarter = null) {
    return new Promise((resolve, reject) => {
      const qoqDataJson = qoqData ? JSON.stringify(qoqData) : null;
      const currentQuarterJson = currentQuarter ? JSON.stringify(currentQuarter) : null;
      
      this.db.run(
        'INSERT INTO insights (insights_text, qoq_data, current_quarter) VALUES (?, ?, ?)',
        [insightsText, qoqDataJson, currentQuarterJson],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  getLatestInsights() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM insights ORDER BY created_at DESC LIMIT 1',
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              // Parse JSON fields
              const insights = {
                ...row,
                qoq_data: row.qoq_data ? JSON.parse(row.qoq_data) : null,
                current_quarter: row.current_quarter ? JSON.parse(row.current_quarter) : null
              };
              resolve(insights);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  updateLatestInsights(insightsText, qoqData = null, currentQuarter = null) {
    return new Promise((resolve, reject) => {
      const qoqDataJson = qoqData ? JSON.stringify(qoqData) : null;
      const currentQuarterJson = currentQuarter ? JSON.stringify(currentQuarter) : null;
      
      this.db.run(
        'UPDATE insights SET insights_text = ?, qoq_data = ?, current_quarter = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM insights ORDER BY created_at DESC LIMIT 1)',
        [insightsText, qoqDataJson, currentQuarterJson],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new DatabaseService();
