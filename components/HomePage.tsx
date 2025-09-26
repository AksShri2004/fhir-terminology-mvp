"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Search,
  FileText,
  Users,
  MessageCircle,
  Activity,
  Shield,
  BarChart3,
  Database,
  Code,
  Heart,
  Stethoscope,
  Brain,
} from "lucide-react"

interface HomePageProps {
  onNavigate: (tab: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  const features = [
    {
      id: "search",
      icon: Search,
      title: "Smart Search & Autocomplete",
      description: "Fuzzy search across NAMASTE and ICD-11 terminologies with confidence scoring",
      stats: "20+ NAMASTE terms mapped",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "problemlist",
      icon: FileText,
      title: "Dual-Coded Problem Lists",
      description: "EMR-like interface supporting both traditional and modern medical coding",
      stats: "FHIR R4 compliant",
      color: "bg-green-50 text-green-600",
    },
    {
      id: "curator",
      icon: Users,
      title: "Curator Workflow",
      description: "Review and approve terminology mappings with confidence thresholds",
      stats: "95% accuracy rate",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "chat",
      icon: MessageCircle,
      title: "AI Chat Assistant",
      description: "Natural language queries for medical terminology and code suggestions",
      stats: "Instant responses",
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "analytics",
      icon: Activity,
      title: "Analytics Dashboard",
      description: "Comprehensive metrics on mapping usage and system performance",
      stats: "Real-time insights",
      color: "bg-pink-50 text-pink-600",
    },
  ]

  const mockStats = [
    { label: "Total Mappings", value: "1,247", change: "+12%" },
    { label: "Active Users", value: "89", change: "+8%" },
    { label: "API Calls Today", value: "3,456", change: "+23%" },
    { label: "Accuracy Rate", value: "98.5%", change: "+0.3%" },
  ]

  const recentMappings = [
    { namaste: "Vata Dosha Imbalance", icd11: "MB23.0Z", confidence: 0.92, status: "approved" },
    { namaste: "Pitta Aggravation", icd11: "MB24.1Z", confidence: 0.88, status: "pending" },
    { namaste: "Kapha Stagnation", icd11: "MB25.2Z", confidence: 0.95, status: "approved" },
    { namaste: "Agni Mandya", icd11: "DA90.Z", confidence: 0.85, status: "review" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <Heart className="w-5 h-5 text-white" />
                <span className="text-white font-medium">FHIR R4 Compliant</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance [text-shadow:_0_2px_10px_rgb(0_0_0_/_50%)]">
              Bridge Traditional & Modern
              <span className="block text-yellow-300 [text-shadow:_0_2px_10px_rgb(0_0_0_/_50%)]">
                Medical Terminology
              </span>
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto text-pretty [text-shadow:_0_1px_8px_rgb(0_0_0_/_60%)]">
              Seamlessly map NAMASTE (Ayurvedic) codes to ICD-11 with our intelligent FHIR-compliant terminology
              microservice. Enabling dual-coding for comprehensive healthcare records.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                onClick={() => onNavigate("search")}
              >
                <Search className="w-5 h-5 mr-2" />
                Try Search Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 text-white border-2 border-white hover:bg-blue-700 font-semibold"
                onClick={() => onNavigate("analytics")}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Terminology Management</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our full suite of tools designed for healthcare professionals working with traditional and modern
              medical coding systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onNavigate(feature.id)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{feature.stats}</Badge>
                      <ArrowRight
                        className={`w-4 h-4 transition-transform ${
                          hoveredFeature === feature.id ? "translate-x-1" : ""
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Mappings */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Recent Mappings</h2>
              <p className="text-muted-foreground">Latest NAMASTE to ICD-11 terminology mappings</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("curator")}>
              View All Mappings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid gap-4">
            {recentMappings.map((mapping, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{mapping.namaste}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{mapping.icd11}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      {Math.round(mapping.confidence * 100)}% confidence
                    </div>
                    <Badge
                      variant={
                        mapping.status === "approved"
                          ? "default"
                          : mapping.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {mapping.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Built for Healthcare Standards</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our microservice adheres to the highest healthcare interoperability standards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">FHIR R4 Compliant</h3>
              <p className="text-muted-foreground">
                Full compliance with FHIR R4 standards for healthcare interoperability
              </p>
            </Card>

            <Card className="text-center p-8">
              <Database className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Terminology Services</h3>
              <p className="text-muted-foreground">
                CodeSystem, ConceptMap, and ValueSet resources with full CRUD operations
              </p>
            </Card>

            <Card className="text-center p-8">
              <Brain className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Mapping</h3>
              <p className="text-muted-foreground">
                Intelligent fuzzy matching with confidence scoring for accurate mappings
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Bridge Medical Terminologies?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start exploring our FHIR-compliant terminology microservice and see how traditional and modern medical
            coding can work together seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              onClick={() => onNavigate("search")}
            >
              <Search className="w-5 h-5 mr-2" />
              Start Demo
            </Button>
            <Button
              size="lg"
              className="bg-blue-700 text-white border-2 border-white hover:bg-blue-800 font-semibold"
              onClick={() => onNavigate("problemlist")}
            >
              <FileText className="w-5 h-5 mr-2" />
              View Problem Lists
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
