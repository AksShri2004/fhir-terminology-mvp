"use client"

import { useState } from "react"
import HomePage from "@/components/HomePage"
import App from "../frontend/src/App"

export default function Page() {
  const [currentView, setCurrentView] = useState<"home" | "app">("home")
  const [activeTab, setActiveTab] = useState("search")

  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
    setCurrentView("app")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
  }

  if (currentView === "home") {
    return <HomePage onNavigate={handleNavigate} />
  }

  return <App initialTab={activeTab} onBackToHome={handleBackToHome} />
}
