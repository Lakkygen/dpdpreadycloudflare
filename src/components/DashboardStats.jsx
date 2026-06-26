import { FiActivity, FiFileText, FiShield, FiUsers } from 'react-icons/fi';

const stats = [
  { icon: FiShield, label: 'Compliance Score', value: '87/100', change: '+3', color: 'bg-green-100 text-green-800' },
  { icon: FiActivity, label: 'Sites Monitored', value: '5', change: '+1', color: 'bg-blue-100 text-blue-800' },
  { icon: FiFileText, label: 'Reports Generated', value: '12', change: '+2', color: 'bg-purple-100 text-purple-800' },
  { icon: FiUsers, label: 'Team Members', value: '3', change: '0', color: 'bg-amber-100 text-amber-800' },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-400'}`}>
              {stat.change !== '0' && stat.change}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
          {/* mini trend bar placeholder */}
          <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
