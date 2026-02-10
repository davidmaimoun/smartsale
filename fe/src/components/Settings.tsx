import React, { useState } from 'react';
import { Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { wooCommerceAPI } from '../services/api';
import type { WooCommerceConfig } from '../types';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<WooCommerceConfig>({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setTestResult(null);
    setSaveResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await wooCommerceAPI.testConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to connect. Please check your credentials.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      await wooCommerceAPI.saveConfig(config);
      setSaveResult('Configuration saved successfully!');
    } catch (error) {
      setSaveResult('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your WooCommerce store connection</p>
      </div>

      <div className="" style={{ maxWidth: '800px' }}>
        <div className="chart-header">
          <h3>WooCommerce API Configuration</h3>
          <p>Enter your WooCommerce REST API credentials</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="storeUrl">Store URL</label>
            <input
              type="text"
              id="storeUrl"
              name="storeUrl"
              value={config.storeUrl}
              onChange={handleChange}
              placeholder="https://your-store.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="consumerKey">Consumer Key</label>
            <input
              type="text"
              id="consumerKey"
              name="consumerKey"
              value={config.consumerKey}
              onChange={handleChange}
              placeholder="ck_xxxxxxxxxxxxx"
            />
          </div>

          <div className="form-group">
            <label htmlFor="consumerSecret">Consumer Secret</label>
            <input
              type="password"
              id="consumerSecret"
              name="consumerSecret"
              value={config.consumerSecret}
              onChange={handleChange}
              placeholder="cs_xxxxxxxxxxxxx"
            />
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.875rem',  }}>
                <strong>How to get API credentials:</strong>
                <ol style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  <li>Go to WooCommerce → Settings → Advanced → REST API</li>
                  <li>Click "Add key"</li>
                  <li>Set permissions to "Read"</li>
                  <li>Click "Generate API key"</li>
                  <li>Copy the Consumer key and Consumer secret</li>
                </ol>
              </div>
            </div>
          </div>

          {testResult && (
            <div
              style={{
                padding: '1rem',
                background: testResult.success
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                border: `1px solid ${
                  testResult.success
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                }`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {testResult.success ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <XCircle size={20} color="#ef4444" />
              )}
              <span style={{ color: testResult.success ? '#10b981' : '#ef4444' }}>
                {testResult.message}
              </span>
            </div>
          )}

          {saveResult && (
            <div
              style={{
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <CheckCircle size={20} color="#10b981" />
              <span style={{ color: '#10b981' }}>{saveResult}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleTestConnection}
              disabled={testing || !config.storeUrl || !config.consumerKey || !config.consumerSecret}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveConfig}
              disabled={saving || !config.storeUrl || !config.consumerKey || !config.consumerSecret}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
