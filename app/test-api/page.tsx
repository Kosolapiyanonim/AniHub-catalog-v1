"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testType, setTestType] = useState<string>("")

  const runTest = async (testName: string, url: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    setTestType(testName)

    try {
      console.log(`🧪 Running ${testName} test...`)
      const response = await fetch(url)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response, got ${contentType}`)
      }

      const result = await response.json()
      console.log(`📊 ${testName} response:`, result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error(`❌ ${testName} error:`, errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-8">🧪 API Test Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button
          onClick={() => runTest("Environment Check", "/api/test")}
          disabled={loading}
          variant="outline"
          className="h-16"
        >
          <div className="text-center">
            <div className="text-lg">🔧 Environment</div>
            <div className="text-sm opacity-70">Check API token</div>
          </div>
        </Button>

        <Button
          onClick={() => runTest("Popular Anime", "/api/anime/popular?limit=5")}
          disabled={loading}
          className="h-16"
        >
          <div className="text-center">
            <div className="text-lg">🎬 Popular</div>
            <div className="text-sm opacity-70">Get top anime</div>
          </div>
        </Button>

        <Button
          onClick={() => runTest("Search Test", "/api/anime/search?q=naruto")}
          disabled={loading}
          variant="outline"
          className="h-16"
        >
          <div className="text-center">
            <div className="text-lg">🔍 Search</div>
            <div className="text-sm opacity-70">Find "naruto"</div>
          </div>
        </Button>

        <Button
          onClick={() => runTest("Anime Details", "/api/anime/movie-123456")}
          disabled={loading}
          variant="secondary"
          className="h-16"
        >
          <div className="text-center">
            <div className="text-lg">📺 Details</div>
            <div className="text-sm opacity-70">Get anime info</div>
          </div>
        </Button>
      </div>

      {loading && (
        <Card className="border-blue-200 bg-blue-50 mb-4">
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-4 text-lg">Running {testType} test...</span>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardHeader>
            <CardTitle className="text-red-800">❌ {testType} Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 font-mono text-sm bg-red-100 p-3 rounded">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ {testType} Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Environment Check Results */}
              {data.hasKodikToken !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Environment:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{data.environment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">KODIK_API_TOKEN:</span>
                      <span className={data.hasKodikToken ? "text-green-600" : "text-red-600"}>
                        {data.hasKodikToken ? "✅ Present" : "❌ Missing"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">PUBLIC Token:</span>
                      <span className={data.hasPublicKodikToken ? "text-green-600" : "text-red-600"}>
                        {data.hasPublicKodikToken ? "✅ Present" : "❌ Missing"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Available env vars:</div>
                    <div className="text-sm bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                      {data.availableEnvVars?.join(", ") || "None"}
                    </div>
                  </div>
                </div>
              )}

              {/* API Results */}
              {data.results && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Results Count:</span>
                    <span className="bg-blue-100 px-3 py-1 rounded-full">{data.results.length}</span>
                  </div>
                  {data.total && (
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">Total Available:</span>
                      <span className="bg-purple-100 px-3 py-1 rounded-full">{data.total}</span>
                    </div>
                  )}
                  {data.time && (
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">API Response Time:</span>
                      <span className="bg-green-100 px-3 py-1 rounded-full">{data.time}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Data */}
              {data.results && data.results.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Sample Result:</div>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <div>
                      <strong>Title:</strong> {data.results[0].title}
                    </div>
                    <div>
                      <strong>Year:</strong> {data.results[0].year}
                    </div>
                    <div>
                      <strong>Type:</strong> {data.results[0].type}
                    </div>
                    <div>
                      <strong>ID:</strong> {data.results[0].id}
                    </div>
                  </div>
                </div>
              )}

              <details>
                <summary className="cursor-pointer font-semibold hover:text-blue-600">📋 Full Response Data</summary>
                <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-auto text-xs max-h-96 border">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>🔧 Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">1</span>
              <span>
                First run <strong>"Environment Check"</strong> to verify your API token is configured
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">2</span>
              <span>
                If token is missing, add <code className="bg-gray-200 px-1 rounded">KODIK_API_TOKEN</code> to your
                environment variables
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">3</span>
              <span>Check browser console and server logs for detailed error messages</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">4</span>
              <span>Verify your Kodik API token is valid and has proper permissions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
