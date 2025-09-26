"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Users, MessageCircle, Download, CheckCircle, Activity, ArrowLeft } from "lucide-react"
import SearchAutocomplete from "./components/SearchAutocomplete"
import ProblemList from "./components/ProblemList"
import CuratorView from "./components/CuratorView"
import ChatWidget from "./components/ChatWidget"
import AuditPanel from "./components/AuditPanel"
import Analytics from "./components/Analytics"
import "./App.css"

const mockProblems = [
  {
    code: "NAMASTE001",
    system: "NAMASTE",
    display: "Vata Dosha Imbalance",
    icd11Code: "MB23.0Z",
    icd11Display: "Traditional medicine condition, unspecified",
    confidence: 0.92,
    status: "active",
    dateAdded: "2024-01-15",
  },
  {
    code: "NAMASTE005",
    system: "NAMASTE",
    display: "Pitta Aggravation",
    icd11Code: "MB24.1Z",
    icd11Display: "Constitutional medicine condition",
    confidence: 0.88,
    status: "active",
    dateAdded: "2024-01-14",
  },
]

const mockAuditLogs = [
  {
    id: "audit-001",
    timestamp: "2024-01-15T10:30:00Z",
    user: "Dr. Sharma",
    action: "Added problem",
    details: "Added Vata Dosha Imbalance to patient problem list",
    patientId: "PAT-001",
  },
  {
    id: "audit-002",
    timestamp: "2024-01-15T09:15:00Z",
    user: "Dr. Patel",
    action: "Approved mapping",
    details: "Approved NAMASTE001 → MB23.0Z mapping",
    confidence: 0.92,
  },
]

function App({ initialTab = "search", onBackToHome }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [problemList, setProblemList] = useState(mockProblems)
  const [auditId, setAuditId] = useState(null)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const addToProblemList = (item) => {
    console.log("[v0] Adding item to problem list:", item)
    const exists = problemList.find((p) => p.code === item.code && p.system === item.system)
    if (!exists) {
      const newItem = {
        ...item,
        status: "active",
        dateAdded: new Date().toISOString().split("T")[0],
      }
      setProblemList([...problemList, newItem])
      console.log("[v0] Item added successfully")
    } else {
      console.log("[v0] Item already exists in problem list")
    }
  }

  const removeFromProblemList = (code, system) => {
    console.log("[v0] Removing item from problem list:", { code, system })
    setProblemList(problemList.filter((p) => !(p.code === code && p.system === system)))
  }

  const tabs = [
    { id: "search", label: "Search & Autocomplete", icon: Search },
    { id: "problemlist", label: "Problem List", icon: FileText },
    { id: "curator", label: "Curator View", icon: Users },
    { id: "chat", label: "Chat Assistant", icon: MessageCircle },
    { id: "analytics", label: "Analytics", icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">FHIR Terminology Microservice</h1>
                <p className="text-sm text-gray-500">NAMASTE to ICD-11 Mapping Demo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                ABHA Mock
              </span>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-3">
            {activeTab === "search" && <SearchAutocomplete onAddToProblemList={addToProblemList} />}
            {activeTab === "problemlist" && (
              <ProblemList items={problemList} onRemove={removeFromProblemList} onAuditId={setAuditId} />
            )}
            {activeTab === "curator" && <CuratorView />}
            {activeTab === "chat" && <ChatWidget onAddToProblemList={addToProblemList} />}
            {activeTab === "analytics" && <Analytics />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AuditPanel auditId={auditId} mockLogs={mockAuditLogs} />

            {/* Problem List Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Problem List</h3>
              {problemList.length === 0 ? (
                <p className="text-gray-500 text-sm">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {problemList.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.system}
                      </span>
                      <span className="text-sm text-gray-900 truncate">{item.display}</span>
                    </div>
                  ))}
                  {problemList.length > 3 && (
                    <p className="text-xs text-gray-500">+{problemList.length - 3} more items</p>
                  )}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FHIR Compliance</span>
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Sources</span>
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Loaded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
