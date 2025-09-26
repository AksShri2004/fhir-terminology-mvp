"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

const mockSearchResults = [
  {
    system: "NAMASTE",
    code: "NAM001",
    display: "Jvara (Fever)",
    synonyms: ["Fever", "Pyrexia", "Jwara"],
    mappings: [
      {
        system: "ICD11-TM2",
        code: "MG30",
        display: "Fever, unspecified",
        confidence: 0.9,
        equivalence: "equivalent",
        source: "approved",
      },
    ],
  },
  {
    system: "NAMASTE",
    code: "NAM002",
    display: "Kasa (Cough)",
    synonyms: ["Cough", "Kasa", "Kapha"],
    mappings: [
      {
        system: "ICD11-TM2",
        code: "MD12",
        display: "Cough",
        confidence: 0.95,
        equivalence: "equivalent",
        source: "approved",
      },
    ],
  },
  {
    system: "NAMASTE",
    code: "NAM003",
    display: "Shwasa (Dyspnea)",
    synonyms: ["Dyspnea", "Breathlessness", "Shwasa"],
    mappings: [
      {
        system: "ICD11-Biomed",
        code: "MD23",
        display: "Dyspnoea",
        confidence: 0.88,
        equivalence: "equivalent",
        source: "approved",
      },
    ],
  },
]

function SearchAutocomplete({ onAddToProblemList }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    const searchTerms = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        console.log("[v0] Attempting to search backend...")
        const response = await axios.get(`${API_BASE}/v1/terminology/autocomplete`, {
          params: { q: query, limit: 10 },
          timeout: 5000, // 5 second timeout
        })
        console.log("[v0] Successfully searched backend")
        setResults(response.data)
      } catch (error) {
        console.log("[v0] Backend not available, using mock search results")
        const filteredResults = mockSearchResults.filter(
          (item) =>
            item.display.toLowerCase().includes(query.toLowerCase()) ||
            item.synonyms.some((synonym) => synonym.toLowerCase().includes(query.toLowerCase())),
        )
        setResults(filteredResults)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchTerms, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) return { label: "High", color: "bg-green-100 text-green-800" }
    if (confidence >= 0.7) return { label: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Low", color: "bg-red-100 text-red-800" }
  }

  const handleAddToProblemList = (item) => {
    onAddToProblemList({
      system: item.system,
      code: item.code,
      display: item.display,
      mappings: item.mappings,
    })
    setSelectedItems([...selectedItems, item.code])
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search NAMASTE Terminology</h2>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for traditional medicine terms (e.g., 'Jvara', 'fever', 'cough')"
          />
        </div>

        {loading && (
          <div className="mt-4 text-center">
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
              Searching...
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-6">
        {results.length === 0 && query.length >= 2 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for "{query}"</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords or check spelling</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Search Results ({results.length})</h3>

            {results.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* NAMASTE Code */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        NAMASTE: {item.code}
                      </span>
                      <h4 className="text-lg font-medium text-gray-900">{item.display}</h4>
                    </div>

                    {/* Synonyms */}
                    {item.synonyms && item.synonyms.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Synonyms: </span>
                        <span className="text-sm text-gray-800">{item.synonyms.join(", ")}</span>
                      </div>
                    )}

                    {/* Mapped ICD-11 Codes */}
                    {item.mappings && item.mappings.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Mapped ICD-11 Codes:</h5>
                        {item.mappings.map((mapping, mapIndex) => {
                          const confidence = getConfidenceBadge(mapping.confidence)
                          return (
                            <div key={mapIndex} className="flex items-center space-x-2 ml-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  mapping.system === "ICD11-TM2"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {mapping.system === "ICD11-TM2" ? "ICD11 (TM2)" : "ICD11 (Biomed)"}: {mapping.code}
                              </span>
                              <span className="text-sm text-gray-900">{mapping.display}</span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${confidence.color}`}
                              >
                                {confidence.label}
                              </span>
                              {mapping.source === "suggested" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Suggested
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddToProblemList(item)}
                    disabled={selectedItems.includes(item.code)}
                    className={`ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      selectedItems.includes(item.code)
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {selectedItems.includes(item.code) ? (
                      "Added"
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Problem List
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo Instructions */}
        {query.length === 0 && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Try searching for:</h3>
              <div className="space-y-2">
                {["Jvara", "Kasa", "Shwasa", "Prameha", "Kamala"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 mr-2"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchAutocomplete
