import { Alert } from '../hooks/useWebSocket'
import { AlertCircle, CheckCircle, AlertTriangle, Bell } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AlertCardProps {
  alert: Alert
  onResolve: (alertId: string) => void
}

export const AlertCard = ({ alert, onResolve }: AlertCardProps) => {
  const severityColors = {
    LOW: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    MEDIUM: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    CRITICAL: 'border-red-500 bg-red-50 dark:bg-red-950',
  }

  const severityIcons = {
    LOW: <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    MEDIUM: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
    CRITICAL: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  }

  const isResolved = alert.status === 'resolved'

  return (
    <div
      className={`border-l-4 rounded-lg p-4 ${severityColors[alert.severity]} ${
        isResolved ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">{severityIcons[alert.severity]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Alert ID: {alert.id}
              </h3>
              {isResolved && (
                <span className="flex items-center gap-1 text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              {alert.description}
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>
                <strong>Severity:</strong> {alert.severity}
              </p>
              <p>
                <strong>Last Raised:</strong>{' '}
                {formatDistanceToNow(new Date(alert.lastRaisedTime), {
                  addSuffix: true,
                })}
              </p>
              <p>
                <strong>Escalation Count:</strong> {alert.escalationCount}
              </p>
            </div>

            {Object.keys(alert.customParams).length > 0 && (
              <details className="mt-3 text-xs">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                  Additional Details
                </summary>
                <pre className="mt-2 bg-gray-200 dark:bg-gray-800 p-2 rounded overflow-auto text-xs max-h-32">
                  {JSON.stringify(alert.customParams, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {!isResolved && (
          <button
            onClick={() => onResolve(alert.id)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium whitespace-nowrap transition-colors"
          >
            Mark Resolved
          </button>
        )}
      </div>
    </div>
  )
}