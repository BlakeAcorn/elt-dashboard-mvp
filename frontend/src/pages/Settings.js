import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database,
  Bell,
  Shield,
  Palette,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dataService } from '../services/api';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    dashboard: {
      refreshInterval: 30,
      autoRefresh: true,
      defaultView: 'overview',
      chartAnimation: true,
      showTrends: true,
    },
    notifications: {
      emailAlerts: true,
      thresholdAlerts: true,
      weeklyReports: true,
      monthlyReports: false,
    },
    data: {
      retentionPeriod: 24,
      autoBackup: true,
      compressionEnabled: true,
    },
    appearance: {
      theme: 'light',
      chartColors: 'default',
      density: 'comfortable',
    }
  });

  const [systemInfo, setSystemInfo] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dataService.getDashboardConfig('user-settings');
      if (response.config) {
        setSettings(prevSettings => ({ ...prevSettings, ...response.config }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, [loadSettings]);

  const loadSystemInfo = async () => {
    try {
      const summary = await dataService.getSummary();
      setSystemInfo(summary.summary);
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await dataService.saveDashboardConfig('user-settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'elt-dashboard-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        dashboard: {
          refreshInterval: 30,
          autoRefresh: true,
          defaultView: 'overview',
          chartAnimation: true,
          showTrends: true,
        },
        notifications: {
          emailAlerts: true,
          thresholdAlerts: true,
          weeklyReports: true,
          monthlyReports: false,
        },
        data: {
          retentionPeriod: 24,
          autoBackup: true,
          compressionEnabled: true,
        },
        appearance: {
          theme: 'light',
          chartColors: 'default',
          density: 'comfortable',
        }
      });
      toast.success('Settings reset to default');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your dashboard preferences and system settings
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={exportSettings}
            className="btn-secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Dashboard Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refresh Interval (seconds)
            </label>
            <select
              value={settings.dashboard.refreshInterval}
              onChange={(e) => handleSettingChange('dashboard', 'refreshInterval', parseInt(e.target.value))}
              className="select"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default View
            </label>
            <select
              value={settings.dashboard.defaultView}
              onChange={(e) => handleSettingChange('dashboard', 'defaultView', e.target.value)}
              className="select"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.dashboard.autoRefresh}
                  onChange={(e) => handleSettingChange('dashboard', 'autoRefresh', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable auto-refresh</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.dashboard.chartAnimation}
                  onChange={(e) => handleSettingChange('dashboard', 'chartAnimation', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable chart animations</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.dashboard.showTrends}
                  onChange={(e) => handleSettingChange('dashboard', 'showTrends', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show trend indicators</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.emailAlerts}
                onChange={(e) => handleSettingChange('notifications', 'emailAlerts', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Email alerts</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.thresholdAlerts}
                onChange={(e) => handleSettingChange('notifications', 'thresholdAlerts', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Threshold alerts</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReports}
                onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Weekly reports</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.monthlyReports}
                onChange={(e) => handleSettingChange('notifications', 'monthlyReports', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Monthly reports</span>
            </label>
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention Period (months)
            </label>
            <select
              value={settings.data.retentionPeriod}
              onChange={(e) => handleSettingChange('data', 'retentionPeriod', parseInt(e.target.value))}
              className="select"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.data.autoBackup}
                onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Automatic backups</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.data.compressionEnabled}
                onChange={(e) => handleSettingChange('data', 'compressionEnabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable compression</span>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Palette className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
              className="select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Color Scheme
            </label>
            <select
              value={settings.appearance.chartColors}
              onChange={(e) => handleSettingChange('appearance', 'chartColors', e.target.value)}
              className="select"
            >
              <option value="default">Default</option>
              <option value="colorful">Colorful</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">System Information</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{systemInfo.totalMetrics}</div>
              <div className="text-sm text-gray-500">Total Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{systemInfo.quarters.length}</div>
              <div className="text-sm text-gray-500">Quarters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{systemInfo.categories.length}</div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{systemInfo.latestQuarter || 'N/A'}</div>
              <div className="text-sm text-gray-500">Latest Quarter</div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border-danger-200">
        <h3 className="text-lg font-medium text-danger-800 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-danger-800">Reset Settings</h4>
            <p className="text-sm text-danger-600">
              Reset all settings to their default values
            </p>
          </div>
          <button
            onClick={resetSettings}
            className="btn-danger"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
