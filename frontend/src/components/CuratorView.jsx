"use client"

import { useState, useEffect } from "react"
import { Users, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

function CuratorView() {
  const [suggestedMappings, setSuggestedMappings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    loadSuggestedMappings()
  }, [])

  const loadSuggestedMappings = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/v1/conceptmap/suggested`)
      setSuggestedMappings(response.data)
    } catch (error) {
      console.error("Error loading suggested mappings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (fromCode, toCode) => {
    setProcessing({ ...processing, [`${fromCode}-${toCode}`]: "approving" })
    try {
      await axios.post(`${API_BASE}/v1/conceptmap/approve/${fromCode}/${toCode}`)
      setSuggestedMappings(suggestedMappings.filter((m) => !(m.fromCode === fromCode && m.toCode === toCode)))
    } catch (error) {
      console.error("Error approving mapping:", error)
      alert("Error approving mapping")
    } finally {
      setProcessing({ ...processing, [`${fromCode}-${toCode}`]: null })
    }
  }

  const handleReject = async (fromCode, toCode) => {
    setProcessing({ ...processing, [`${fromCode}-${toCode}`]: "rejecting" })
    try {
      await axios.post(`${API_BASE}/v1/conceptmap/reject/${fromCode}/${toCode}`)
      setSuggestedMappings(suggestedMappings.filter((m) => !(m.fromCode === fromCode && m.toCode === toCode)))
    } catch (error) {
      console.error("Error rejecting mapping:", error)
      alert("Error rejecting mapping")
    } finally {
      setProcessing({ ...processing, [`${fromCode}-${toCode}`]: null })
    }
  }

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return { label: "High", color: "bg-green-100 text-green-800" }
    if (confidence >= 0.6) return { label: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Low", color: "bg-red-100 text-red-800" }
  }

  const getEquivalenceBadge = (equivalence) => {
    const badges = {
      equivalent: { label: "Equivalent", color: "bg-blue-100 text-blue-800" },
      wider: { label: "Wider", color: "bg-purple-100 text-purple-800" },
      narrower: { label: "Narrower", color: "bg-indigo-100 text-indigo-800" },
      related: { label: "Related", color: "bg-gray-100 text-gray-800" },
    }
    return badges[equivalence] || badges["related"]
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading suggested mappings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Curator Review Panel</h2>
              <p className="text-sm text-gray-600">Review and approve suggested terminology mappings</p>
            </div>
          </div>
          <button
            onClick={loadSuggestedMappings}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {suggestedMappings.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All mappings reviewed</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no pending mapping suggestions to review at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Pending Reviews ({suggestedMappings.length})</h3>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Requires curator approval</span>
              </div>
            </div>

            {suggestedMappings.map((mapping, index) => {
              const confidence = getConfidenceBadge(mapping.confidence)
              const equivalence = getEquivalenceBadge(mapping.equivalence)
              const processingKey = `${mapping.fromCode}-${mapping.toCode}`
              const isProcessing = processing[processingKey]

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Mapping Details */}
                      <div className="space-y-4">
                        {/* From Code */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Source (NAMASTE)</h4>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {mapping.fromCode}
                            </span>
                            <span className="text-sm text-gray-900">
                              {/* This would need to be looked up from the NAMASTE data */}
                              NAMASTE Term
                            </span>
                          </div>
                        </div>

                        {/* To Code */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Target ({mapping.toSystem})</h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                mapping.toSystem === "ICD11-TM2"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {mapping.toCode}
                            </span>
                            <span className="text-sm text-gray-900">
                              {/* This would need to be looked up from the ICD-11 data */}
                              ICD-11 Term
                            </span>
                          </div>
                        </div>

                        {/* Mapping Metadata */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${confidence.color}`}
                            >
                              {confidence.label} ({Math.round(mapping.confidence * 100)}%)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Equivalence:</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${equivalence.color}`}
                            >
                              {equivalence.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(mapping.fromCode, mapping.toCode)}
                        disabled={isProcessing}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isProcessing === "approving" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(mapping.fromCode, mapping.toCode)}
                        disabled={isProcessing}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isProcessing === "rejecting" ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CuratorView
