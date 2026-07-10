import { useState, useCallback } from 'react';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async (scanId) => {
    try {
      const data = await reportService.generate(scanId);
      toast.success('Report generation started');
      return data.reportId;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  }, []);

  const pollUntilReady = useCallback(async (reportId) => {
    let ready = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!ready && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      try {
        const data = await reportService.getStatus(reportId);
        if (data.status === 'ready') ready = true;
        else if (data.status === 'failed') throw new Error('Report generation failed');
      } catch {
        if (attempts > 5) ready = true;
      }
    }
    return true;
  }, []);

  const download = useCallback(async (reportId) => {
    try {
      const blob = await reportService.download(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dpdp-report-${reportId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  const fetchReports = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const data = await reportService.getHistory(page, limit);
      setReports(data.reports || data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReport = useCallback(async (reportId) => {
    try {
      await reportService.delete(reportId);
      toast.success('Report deleted');
      fetchReports();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchReports]);

  return {
    reports,
    loading,
    generate,
    pollUntilReady,
    download,
    fetchReports,
    deleteReport,
  };
}
