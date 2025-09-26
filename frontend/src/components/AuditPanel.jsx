"use client"

import { useState, useEffect } from "react"
import { Activity, Clock, AlertTriangle } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

const mockAuditLogs = [
  {
    id: "audit-001",
    timestamp: new Date().toISOString(),
    action: "bundle_processed",
    details: {
      bundle_id: "bundle-demo-001",
      entry_count: 3,
      audit_id: "audit-001",
    },
    consent_missing: false,
  },
  {
    id: "audit-002",
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    action: "chat_query",
    details: {
      query: "fever symptoms",
      patient_ref: "demo-patient",
      suggestions_count: 2,
    },
    consent_missing: true,
  },
  {
    id: "audit-003",
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    action: "mapping_approved",
    details: {
      from_code: "NAM001",
      to_code: "MG30",
      confidence: 0.9,
    },
    consent_missing: false,
  },
]

function AuditPanel({ auditId }) {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAuditLogs()
  }, [auditId])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      console.log("[v0] Attempting to load audit logs from backend...")
      const response = await axios.get(`${API_BASE}/v1/audit/logs`, {
        timeout: 5000, // 5 second timeout
      })
      console.log("[v0] Successfully loaded audit logs from backend")
      setAuditLogs(response.data)
    } catch (error) {
      console.log("[v0] Backend not available, using mock audit logs")
      setAuditLogs(mockAuditLogs)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "bundle_processed":
        return <Activity className="w-4 h-4 text-blue-600" />
      case "chat_query":
        return <Activity className="w-4 h-4 text-green-600" />
      case "mapping_approved":
        return <Activity className="w-4 h-4 text-green-600" />
      case "mapping_rejected":
        return <Activity className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      bundle_processed: "FHIR Bundle Processed",
      chat_query: "Chat Query",
      mapping_approved: "Mapping Approved",
      mapping_rejected: "Mapping Rejected",
    }
    return labels[action] || action
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
          </div>
          {auditId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Latest: {auditId.slice(0, 8)}...
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </div>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit entries</h3>
            <p className="mt-1 text-sm text-gray-500">Activity will appear here as you use the system.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Recent Activity (Last 10)</h4>
            {auditLogs
              .slice()
              .reverse()
              .map((log, index) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    log.consent_missing ? "bg-orange-50 border border-orange-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{getActionLabel(log.action)}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                    </div>

                    {log.details && (
                      <div className="mt-1">
                        {log.action === "bundle_processed" && (
                          <p className="text-xs text-gray-600">
                            Bundle ID: {log.details.bundle_id} • {log.details.entry_count} entries
                          </p>
                        )}
                        {log.action === "chat_query" && (
                          <p className="text-xs text-gray-600">
                            Query: "{log.details.query}" • {log.details.suggestions_count} suggestions
                          </p>
                        )}
                        {(log.action === "mapping_approved" || log.action === "mapping_rejected") && (
                          <p className="text-xs text-gray-600">
                            {log.details.from_code} → {log.details.to_code}
                            {log.details.confidence && ` • ${Math.round(log.details.confidence * 100)}% confidence`}
                          </p>
                        )}
                      </div>
                    )}

                    {log.consent_missing && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-orange-600">Consent artifact missing</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditPanel
