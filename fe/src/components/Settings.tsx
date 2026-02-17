import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Unplug } from 'lucide-react';
import { wooCommerceAPI } from '../services/api';
import type { WooCommerceConfig } from '../types';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<WooCommerceConfig>({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
  });

  const [connecting, setConnecting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [connectResult, setConnectResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setConnectResult(null);
  };

  const connectToStore = async () => {
    setConnecting(true);
    setConnectResult(null);
    try {
      const test = await wooCommerceAPI.testConnection(config);
      setConnectResult({
        success: test.success,
        message: test.message || (test.success ? 'Connection successful!' : 'Connection failed.'),
      });
    } catch (error) {
      setConnectResult({
        success: false,
        message: 'Authentication failed - Please check your keys.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const resetCredentials = async () => {
    setResetting(true);
    setConnectResult(null);
    try {
      await wooCommerceAPI.disconnect();
      setConfig({ storeUrl: '', consumerKey: '', consumerSecret: '' });
      setConnectResult({ success: true, message: 'Credentials cleared successfully.' });
    } catch {
      setConnectResult({ success: false, message: 'Failed to reset credentials.' });
    } finally {
      setResetting(false);
    }
  };

  const isFormFilled = config.storeUrl && config.consumerKey && config.consumerSecret;
  const isDisabled = connecting || !isFormFilled;

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your WooCommerce store connection</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
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

          {/* Info box */}
          <div className="settings-info-box">
            <AlertCircle size={20} className="settings-info-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem' }}>
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

          {/* Result message */}
          {connectResult && (
            <div className={`settings-result ${connectResult.success ? 'success' : 'error'}`}>
              {connectResult.success
                ? <CheckCircle size={20} />
                : <XCircle size={20} />
              }
              <span>{connectResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={connectToStore}
              disabled={isDisabled}
              style={{
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s ease',
              }}
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>

            <button
              className="btn btn-reset"
              onClick={resetCredentials}
              disabled={resetting}
              style={{
                opacity: resetting ? 0.4 : 1,
                cursor: resetting ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s ease',
              }}
            >
              <Unplug size={16} />
              {resetting ? 'Resetting...' : 'Reset Credentials'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;