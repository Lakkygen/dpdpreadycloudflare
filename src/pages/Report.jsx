import { useParams } from 'react-router-dom';
import ReportViewer from '../components/ReportViewer';

export default function Report() {
  const { scanId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Report</h1>
        <ReportViewer scanId={scanId} />
      </div>
    </div>
  );
}
