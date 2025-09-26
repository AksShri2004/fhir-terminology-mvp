"use client"

import { useState } from "react"
import { MessageCircle, Send, Plus, User, Bot } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

function ChatWidget({ onAddToProblemList }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I can help you find NAMASTE codes and their ICD-11 mappings. Describe symptoms or conditions in natural language.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastSuggestion, setLastSuggestion] = useState(null)

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true)

    try {
      const response = await axios.post(
        `${API_BASE}/v1/chat`,
        {
          query: inputValue.trim(),
          patientRef: "demo-patient",
        },
        {
          headers: {
            Authorization: "Bearer mock-abha-token",
            "X-Consent-Artifact": "mock-consent-123",
          },
        },
      )

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setLastSuggestion(response.data.suggestions[0])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: { error: "Sorry, I encountered an error. Please try again." },
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAddSuggestion = () => {
    if (lastSuggestion && lastSuggestion.namaste) {
      onAddToProblemList({
        system: lastSuggestion.namaste.system,
        code: lastSuggestion.namaste.code,
        display: lastSuggestion.namaste.display,
        mappings: lastSuggestion.mappings || [],
      })
      setLastSuggestion(null)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderBotMessage = (content) => {
    if (typeof content === "string") {
      return <p className="text-gray-800">{content}</p>
    }

    if (content.error) {
      return <p className="text-red-600">{content.error}</p>
    }

    if (content.suggestions && content.suggestions.length > 0) {
      const suggestion = content.suggestions[0]
      return (
        <div className="space-y-3">
          <p className="text-gray-800">I found a matching condition:</p>

          {/* NAMASTE Code */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                NAMASTE: {suggestion.namaste.code}
              </span>
              <span className="font-medium text-gray-900">{suggestion.namaste.display}</span>
            </div>

            {/* Mapped ICD-11 Codes */}
            {suggestion.mappings && suggestion.mappings.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Mapped to:</p>
                {suggestion.mappings.map((mapping, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        mapping.system === "ICD11-TM2" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {mapping.system === "ICD11-TM2" ? "ICD11 (TM2)" : "ICD11 (Biomed)"}: {mapping.code}
                    </span>
                    <span className="text-sm text-gray-700">{mapping.display}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  suggestion.confidence === "high"
                    ? "bg-green-100 text-green-800"
                    : suggestion.confidence === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {suggestion.confidence} confidence
              </span>
            </div>
          </div>

          {/* FHIR Condition Preview */}
          {content.fhirCondition && content.fhirCondition.resourceType && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">FHIR Condition Preview:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(content.fhirCondition, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return (
      <p className="text-gray-800">I couldn't find any matching conditions. Try describing the symptoms differently.</p>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h2>
            <p className="text-sm text-gray-600">Describe symptoms to get NAMASTE code suggestions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "user" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                {message.type === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.type === "user" ? <p>{message.content}</p> : renderBotMessage(message.content)}
                <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {lastSuggestion && (
        <div className="px-6 py-3 border-t border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Add suggested condition to problem list?</span>
            <button
              onClick={handleAddSuggestion}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add to Problem List
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe symptoms (e.g., 'fever and chills', 'difficulty breathing')"
            className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWidget
