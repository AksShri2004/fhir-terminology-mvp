"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Database, CheckCircle, RefreshCw } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

const mockAnalyticsData = {
  total_namaste_codes: 150,
  mapped_codes: 120,
  coverage_percentage: 80.0,
  total_mappings: 135,
  approved_mappings: 108,
  approval_percentage: 80.0,
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      console.log("[v0] Attempting to load analytics from backend...")
      const response = await axios.get(`${API_BASE}/v1/analytics/coverage`, {
        timeout: 5000, // 5 second timeout
      })
      console.log("[v0] Successfully loaded analytics from backend")
      setAnalytics(response.data)
    } catch (error) {
      console.log("[v0] Backend not available, using mock analytics data")
      console.error("Error loading analytics:", error)
      setAnalytics(mockAnalyticsData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <BarChart3 className="w-8 h-8 text-blue-600 animate-pulse" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Unable to load analytics data</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mapping Analytics</h2>
              <p className="text-sm text-gray-600">Coverage and quality metrics for terminology mappings</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total NAMASTE Codes */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total NAMASTE Codes</p>
                  <p className="text-2xl font-semibold text-blue-900">{analytics.total_namaste_codes}</p>
                </div>
              </div>
            </div>

            {/* Mapped Codes */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Mapped Codes</p>
                  <p className="text-2xl font-semibold text-green-900">{analytics.mapped_codes}</p>
                </div>
              </div>
            </div>

            {/* Coverage Percentage */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Coverage</p>
                  <p className="text-2xl font-semibold text-purple-900">{analytics.coverage_percentage}%</p>
                </div>
              </div>
            </div>

            {/* Approved Mappings */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Approved</p>
                  <p className="text-2xl font-semibold text-orange-900">{analytics.approval_percentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mapping Quality Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Coverage Progress Bar */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Terminology Coverage</span>
                <span>{analytics.coverage_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.coverage_percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.mapped_codes} of {analytics.total_namaste_codes} NAMASTE codes have ICD-11 mappings
              </p>
            </div>

            {/* Approval Progress Bar */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Mapping Approval Rate</span>
                <span>{analytics.approval_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.approval_percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.approved_mappings} of {analytics.total_mappings} mappings have been curator-approved
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Mapping Statistics</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Mappings:</dt>
                    <dd className="text-sm font-medium text-gray-900">{analytics.total_mappings}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Approved Mappings:</dt>
                    <dd className="text-sm font-medium text-green-600">{analytics.approved_mappings}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Pending Review:</dt>
                    <dd className="text-sm font-medium text-orange-600">
                      {analytics.total_mappings - analytics.approved_mappings}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Metrics</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Unmapped Codes:</dt>
                    <dd className="text-sm font-medium text-red-600">
                      {analytics.total_namaste_codes - analytics.mapped_codes}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Coverage Goal:</dt>
                    <dd className="text-sm font-medium text-gray-900">90%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Approval Goal:</dt>
                    <dd className="text-sm font-medium text-gray-900">95%</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {analytics.coverage_percentage < 90 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Improve Coverage</p>
                  <p className="text-sm text-blue-700">
                    {analytics.total_namaste_codes - analytics.mapped_codes} NAMASTE codes still need ICD-11 mappings to
                    reach 90% coverage goal.
                  </p>
                </div>
              </div>
            )}

            {analytics.approval_percentage < 95 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Review Pending Mappings</p>
                  <p className="text-sm text-orange-700">
                    {analytics.total_mappings - analytics.approved_mappings} mappings are waiting for curator review in
                    the Curator View tab.
                  </p>
                </div>
              </div>
            )}

            {analytics.coverage_percentage >= 90 && analytics.approval_percentage >= 95 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Excellent Coverage!</p>
                  <p className="text-sm text-green-700">
                    Your terminology mapping system has achieved high coverage and approval rates. Continue monitoring
                    for new NAMASTE codes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
