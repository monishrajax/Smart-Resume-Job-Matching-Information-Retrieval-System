import { useState, useRef } from 'react'
import FloatingSymbols from './components/FloatingSymbols'

interface Resume {
  name: string
  content: string
}

interface MatchResult {
  name: string
  score: number
}

function App() {
  const [jobDescription, setJobDescription] = useState<string>('')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [results, setResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Reads uploaded files and converts them to text
   * @param files - FileList from input element
   * @returns Promise resolving to array of Resume objects
   */
  const readFilesToText = async (files: FileList): Promise<Resume[]> => {
    const resumes: Resume[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.name.endsWith('.txt')) {
        errors.push(`File "${file.name}" is not a .txt file. Please upload only .txt files.`)
        continue
      }

      try {
        // Read file content as text
        const content = await file.text()
        
        // Validate content is not empty
        if (!content.trim()) {
          errors.push(`File "${file.name}" is empty.`)
          continue
        }

        resumes.push({
          name: file.name.replace(/\.txt$/i, ''),
          content: content
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Error reading file "${file.name}": ${errorMessage}`)
      }
    }

    // Display errors if any
    if (errors.length > 0) {
      setError(errors.join(' | '))
    }

    return resumes
  }

  /**
   * Handles file upload event
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newResumes = await readFilesToText(files)

    if (newResumes.length > 0) {
      setResumes(prev => [...prev, ...newResumes])
      setError('')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveResume = (index: number) => {
    setResumes(prev => prev.filter((_, i) => i !== index))
  }

  /**
   * Main function to match resumes against job description
   * - Validates inputs
   * - Sends POST request to API
   * - Displays ranked results with similarity percentage
   * - Shows loading spinner while processing
   * - Handles errors properly
   */
  const matchResumes = async (): Promise<void> => {
    // Validation
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    if (resumes.length === 0) {
      setError('Please upload at least one resume')
      return
    }

    // Reset previous results and errors
    setError('')
    setResults([])
    setIsLoading(true)

    try {
      // Prepare request payload
      const payload = {
        resumes: resumes.map(resume => ({
          name: resume.name,
          content: resume.content
        })),
        job_description: jobDescription.trim()
      }

      // Send POST request using fetch API
      const response = await fetch('http://localhost:5000/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          const text = await response.text()
          errorMessage = text || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      // Parse response
      const data = await response.json()

      // Validate response structure
      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from server')
      }

      // Display ranked results
      setResults(data.results)

    } catch (err) {
      // Handle different error types
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Failed to connect to server. Please ensure the backend is running on http://localhost:5000')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while matching resumes')
      }
      
      // Clear results on error
      setResults([])
    } finally {
      // Always stop loading spinner
      setIsLoading(false)
    }
  }

  const handleMatch = () => {
    matchResumes()
  }

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(2)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-green-400'
    if (score >= 0.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  /**
   * Get styling classes for top 3 resumes
   */
  const getTopThreeStyling = (index: number) => {
    if (index === 0) {
      // Gold for #1
      return {
        cardBg: 'bg-gradient-to-br from-yellow-900/30 to-amber-900/20',
        border: 'border-yellow-500/50',
        hoverBorder: 'hover:border-yellow-400',
        badgeBg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        badgeText: '🥇 Top Match'
      }
    } else if (index === 1) {
      // Silver for #2
      return {
        cardBg: 'bg-gradient-to-br from-gray-700/50 to-slate-700/30',
        border: 'border-gray-400/50',
        hoverBorder: 'hover:border-gray-300',
        badgeBg: 'bg-gradient-to-r from-gray-300 to-slate-400',
        badgeText: '🥈 Second'
      }
    } else if (index === 2) {
      // Bronze for #3
      return {
        cardBg: 'bg-gradient-to-br from-orange-900/30 to-amber-900/20',
        border: 'border-orange-600/50',
        hoverBorder: 'hover:border-orange-500',
        badgeBg: 'bg-gradient-to-r from-orange-400 to-amber-600',
        badgeText: '🥉 Third'
      }
    }
    return {
      cardBg: 'bg-gray-700',
      border: 'border-gray-600',
      hoverBorder: 'hover:border-blue-500',
      badgeBg: '',
      badgeText: ''
    }
  }

  return (
    <div className="min-h-screen text-gray-100 relative">
      <FloatingSymbols />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-0">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
            Smart Resume Matching System
          </h1>
          <p className="font-sans text-gray-400 text-lg md:text-xl">
            Match resumes against job descriptions using AI-powered similarity analysis
          </p>
      </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* Job Description Section */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <label htmlFor="job-description" className="block text-sm font-semibold mb-3 text-gray-300 font-sans">
                Job Description
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-64 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                {jobDescription.length} characters
        </p>
      </div>

            {/* Resume Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
              <label htmlFor="resume-upload" className="block text-sm font-semibold mb-3 text-gray-300">
                Upload Resumes (.txt files only)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  id="resume-upload"
                  type="file"
                  accept=".txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-gray-300 font-medium">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-gray-500 text-sm mt-1">
                    Multiple .txt files supported
                  </span>
                </label>
              </div>

              {/* Uploaded Resumes List */}
              {resumes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-300 mb-2">
                    Uploaded Resumes ({resumes.length})
                  </p>
                  {resumes.map((resume, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2"
                    >
                      <span className="text-gray-200 text-sm truncate flex-1">
                        {resume.name}
                      </span>
                      <button
                        onClick={() => handleRemoveResume(index)}
                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                        aria-label="Remove resume"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Match Button */}
            <button
              onClick={handleMatch}
              disabled={isLoading || !jobDescription.trim() || resumes.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Match Resumes</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results Section */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-display text-2xl font-bold mb-4 text-gray-200">Match Results</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {results.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Results will appear here after matching</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, index) => {
                  const topThreeStyle = getTopThreeStyling(index)
                  const isTopThree = index < 3
                  
                  return (
                    <div
                      key={index}
                      className={`${topThreeStyle.cardBg} rounded-lg p-5 border-2 ${topThreeStyle.border} ${topThreeStyle.hoverBorder} transition-all shadow-md hover:shadow-lg ${
                        isTopThree ? 'ring-2 ring-offset-2 ring-offset-gray-800' : ''
                      } ${
                        index === 0 ? 'ring-yellow-500/50' : 
                        index === 1 ? 'ring-gray-400/50' : 
                        index === 2 ? 'ring-orange-500/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {isTopThree && (
                            <div className={`${topThreeStyle.badgeBg} text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                              {topThreeStyle.badgeText}
                            </div>
                          )}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-slate-400' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-600' :
                            'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}>
                            {index + 1}
                          </div>
                          <h3 className={`text-lg font-semibold truncate ${
                            isTopThree ? 'text-gray-100' : 'text-gray-200'
                          }`}>
                            {result.name}
                          </h3>
                        </div>
                        <div className={`text-2xl font-bold ml-3 ${getScoreColor(result.score)}`}>
                          {formatScore(result.score)}%
                        </div>
                      </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400">Similarity Score</span>
                        <span className={`text-xs font-semibold ${getScoreColor(result.score)}`}>
                          {formatScore(result.score)}% match
                        </span>
                      </div>
                      <div className="w-full bg-gray-600/50 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                            result.score >= 0.7
                              ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-400'
                              : result.score >= 0.5
                              ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
                              : 'bg-gradient-to-r from-red-400 via-red-500 to-red-400'
                          }`}
                          style={{ width: `${result.score * 100}%` }}
                        >
                          {/* Animated shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      
                      {/* Score indicator markers */}
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
