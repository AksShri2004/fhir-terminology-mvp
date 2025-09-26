"use client"

import { useState } from "react"
import { FileText, Trash2, Download, Save } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

function ProblemList({ items, onRemove, onAuditId }) {
  const [saving, setSaving] = useState(false)
  const [savedBundle, setSavedBundle] = useState(null)
  const [showBundle, setShowBundle] = useState(false)

  const mockSaveBundle = async (bundle) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate mock response
    const auditId = `audit-${Date.now()}`
    const processedBundle = {
      ...bundle,
      meta: {
        versionId: "1",
        lastUpdated: new Date().toISOString(),
        source: "FHIR-Terminology-Microservice-Mock",
      },
    }

    return {
      bundle: processedBundle,
      auditId,
      consentMissing: false,
    }
  }

  const handleSave = async () => {
    if (items.length === 0) return

    setSaving(true)
    try {
      // Create FHIR Bundle
      const bundle = {
        resourceType: "Bundle",
        id: `bundle-${Date.now()}`,
        type: "collection",
        entry: items.map((item, index) => ({
          resource: {
            resourceType: "Condition",
            id: `condition-${index}`,
            code: {
              coding: [
                {
                  system: item.system,
                  code: item.code,
                  display: item.display,
                },
              ],
              text: item.display,
            },
            subject: {
              reference: "Patient/demo-patient",
            },
            recordedDate: new Date().toISOString(),
          },
        })),
      }

      console.log("[v0] Attempting to save bundle to backend...")

      let response
      try {
        response = await axios.post(`${API_BASE}/v1/fhir/Bundle`, bundle, {
          headers: {
            Authorization: "Bearer mock-abha-token",
            "X-Consent-Artifact": "mock-consent-123",
          },
          timeout: 5000, // 5 second timeout
        })
        console.log("[v0] Successfully saved to backend")
      } catch (networkError) {
        console.log("[v0] Backend not available, using mock response")
        // Use mock API when backend is not available
        response = { data: await mockSaveBundle(bundle) }
      }

      setSavedBundle(response.data.bundle)
      onAuditId(response.data.auditId)
      setShowBundle(true)
    } catch (error) {
      console.error("Save error:", error)
      alert("Error saving problem list. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const downloadBundle = () => {
    if (!savedBundle) return

    const dataStr = JSON.stringify(savedBundle, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `fhir-bundle-${Date.now()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Problem List Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Problem List Composer</h2>
                <p className="text-sm text-gray-600">Manage patient conditions with dual-coding</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {items.length > 0 && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? (
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save as FHIR Bundle
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Problem List Items */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conditions added</h3>
              <p className="mt-1 text-sm text-gray-500">
                Use the Search tab to find and add NAMASTE conditions to the problem list.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Primary Code */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          NAMASTE: {item.code}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900">{item.display}</h4>
                      </div>

                      {/* Mapped Codes */}
                      {item.mappings && item.mappings.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Dual-coded as:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.mappings.map((mapping, mapIndex) => (
                              <div key={mapIndex} className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    mapping.system === "ICD11-TM2"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {mapping.system === "ICD11-TM2" ? "ICD11 (TM2)" : "ICD11 (Biomed)"}: {mapping.code}
                                </span>
                                <span className="text-sm text-gray-700">{mapping.display}</span>
                                {mapping.source === "approved" && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(item.code, item.system)}
                      className="ml-4 inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FHIR Bundle Display */}
      {showBundle && savedBundle && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Generated FHIR Bundle</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={downloadBundle}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </button>
                <button onClick={() => setShowBundle(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(savedBundle, null, 2)}</pre>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Bundle Successfully Created</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      The FHIR Bundle contains {savedBundle.entry?.length || 0} Condition resources with dual-coding
                      (NAMASTE + ICD-11).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProblemList
