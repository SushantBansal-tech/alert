import { useState, useMemo } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { AlertCard } from './AlertCard'
import { Wifi, WifiOff } from 'lucide-react'

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080'

type FilterStatus = 'all' | 'open' | 'resolved'

export const Dashboard = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('open')
  const { alerts, connected, resolveAlert } = useWebSocket(WEBSOCKET_URL)

  const filteredAlerts = useMemo(() => {
    if (filterStatus === 'all') {
      return alerts
    }
    return alerts.filter((a) => a.status === filterStatus)
  }, [alerts, filterStatus])

  const openAlerts = alerts.filter((a) => a.status === 'open')
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved')

  const criticalCount = openAlerts.filter((a) => a.severity === 'CRITICAL').length
  const mediumCount = openAlerts.filter((a) => a.severity === 'MEDIUM').length
  const lowCount = openAlerts.filter((a) => a.severity === 'LOW').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Developer Alert Dashboard
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {connected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Connecting...
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Alerts
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {alerts.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Open Alerts
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {openAlerts.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Critical
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                {criticalCount}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Medium
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {mediumCount}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Resolved
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {resolvedAlerts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 w-fit">
          {(['all', 'open', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {filterStatus === 'open'
                  ? 'No open alerts - great job!'
                  : `No ${filterStatus} alerts`}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={resolveAlert}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
