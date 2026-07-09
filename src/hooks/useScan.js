import { useState, useCallback } from 'react';
import { scanService } from '../services/scanService';
import { toast } from 'react-toastify';

export function useScan() {
  const [scanState, setScanState] = useState('idle');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const scan = useCallback(async (url) => {
    setScanState('scanning');
    setProgress(0);
    try {
      const data = await scanService.startScan(url);
      const scanId = data.scanId || data.id;

      let completed = false;
      let attempts = 0;
      const maxAttempts = 60;

      while (!completed && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
        setProgress(Math.min((attempts / maxAttempts) * 100, 95));

        try {
          const statusRes = await scanService.getStatus(scanId);
          if (statusRes.status === 'completed') {
            completed = true;
          } else if (statusRes.status === 'failed') {
            throw new Error('Scan failed');
          }
        } catch {
          if (attempts > 10) completed = true;
        }
      }

      const resultsRes = await scanService.getResults(scanId);
      setResult(resultsRes.scan || resultsRes);
      setScanState('done');
      setProgress(100);
      toast.success('Scan completed!');
    } catch (err) {
      setScanState('error');
      toast.error(err.message || 'Scan failed');
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1, limit = 20) => {
    setHistoryLoading(true);
    try {
      const data = await scanService.getHistory(page, limit);
      setHistory(data.scans || data);
    } catch (err) {
      toast.error('Failed to load scan history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const rescan = useCallback(async (scanId) => {
    try {
      await scanService.rescan(scanId);
      toast.success('Rescan started');
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const setMonitoring = useCallback(async (scanId, enabled) => {
    try {
      await scanService.setMonitoring(scanId, enabled);
      toast.success(`Monitoring ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const deleteScan = useCallback(async (scanId) => {
    try {
      await scanService.delete(scanId);
      toast.success('Scan deleted');
      fetchHistory();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchHistory]);

  const reset = useCallback(() => {
    setScanState('idle');
    setResult(null);
    setProgress(0);
  }, []);

  return {
    scan,
    scanState,
    result,
    progress,
    history,
    historyLoading,
    fetchHistory,
    rescan,
    setMonitoring,
    deleteScan,
    reset,
  };
}
