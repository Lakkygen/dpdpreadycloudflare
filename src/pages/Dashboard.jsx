import { useEffect } from 'react';
import DashboardStats from '../components/DashboardStats';
import { useScan } from '../hooks/useScan';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { history, historyLoading, fetchHistory } = useScan();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <DashboardStats user={user} scans={history} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Scans</h2>
          {historyLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : history?.length > 0 ? (
            <div className="space-y-4">
              {history.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{scan.url}</p>
                    <p className="text-slate-400 text-sm">
                      Score: {scan.overall_score}/100 • {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      scan.overall_score >= 80
                        ? 'bg-green-900/50 text-green-400'
                        : scan.overall_score >= 50
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-red-900/50 text-red-400'
                    }`}
                  >
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No scans yet. Run your first scan!</p>
          )}
        </div>
      </div>
    </div>
  );
}
