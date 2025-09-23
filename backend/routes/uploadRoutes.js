const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const database = require('../services/database');
const fileProcessor = require('../services/fileProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed. Supported types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Upload file endpoint
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();

    // Process the file
    const processedData = await fileProcessor.processFile(filePath, fileType);
    
    // Save file metadata to database
    const fileId = await database.saveFileMetadata(
      req.file.filename,
      req.file.originalname,
      fileType,
      req.file.size
    );

    // Save processed data to database
    const savePromises = processedData.map(row => 
      database.saveQuarterlyData(
        fileId,
        row.quarter,
        row.year,
        row.metric_name,
        row.metric_value,
        row.metric_unit,
        row.category,
        row.target_value,
        row.status
      )
    );

    await Promise.all(savePromises);

    // Get file statistics
    const stats = fileProcessor.getFileStats(processedData);

    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      fileId: fileId,
      filename: req.file.originalname,
      stats: stats,
      processedRows: processedData.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(400).json({
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Get uploaded files
router.get('/files', async (req, res) => {
  try {
    const files = await database.getFiles();
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Download template
router.get('/template/:format', (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    
    if (!['csv', 'xlsx'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Supported: csv, xlsx' });
    }

    const template = fileProcessor.generateTemplate(format);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="elt-data-template.csv"');
      res.send(template);
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="elt-data-template.xlsx"');
      res.send(template);
    }
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

// Delete file
router.delete('/file/:fileId', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    
    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Get file info first
    const files = await database.getFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from database (this will cascade to quarterly_data due to foreign key)
    const db = database.db;
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM files WHERE id = ?', [fileId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    // Delete physical file
    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
