'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'こんにちは！Shikibu Agentです。何を書きますか？' }
  ])
  const [input, setInput] = useState('')
  const [canvasContent, setCanvasContent] = useState('')
  const [canvasTitle, setCanvasTitle] = useState('')
  const [isLearning, setIsLearning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const newMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    
    // AIレスポンス（シミュレート）
    setTimeout(() => {
      const responses = [
        'その内容について詳しく聞かせてください。',
        '面白いアイデアですね！どのように発展させますか？',
        'それは良い視点です。他の角度からも考えてみましょう。',
        'その文章を改善するポイントはありますか？'
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    }, 1000)
  }

  const saveCanvas = () => {
    if (!canvasContent.trim()) return
    
    const output = {
      title: canvasTitle || '無題',
      content: canvasContent,
      timestamp: new Date().toISOString(),
      type: 'general'
    }
    
    // ローカルストレージに保存
    const saved = JSON.parse(localStorage.getItem('shikibu-outputs') || '[]')
    saved.push(output)
    localStorage.setItem('shikibu-outputs', JSON.stringify(saved))
    
    alert('保存しました！')
    setCanvasContent('')
    setCanvasTitle('')
  }

  const startLearning = () => {
    setIsLearning(true)
    
    // 学習シミュレート
    setTimeout(() => {
      setIsLearning(false)
      alert('学習完了！あなたの文章パターンを分析しました。')
    }, 3000)
  }

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Shikibu Agent</h1>
        <button
          onClick={startLearning}
          disabled={isLearning}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isLearning 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isLearning ? '学習中...' : 'OverDrive'}
        </button>
      </header>

      {/* メインコンテンツ */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* 左パネル - チャット */}
        <div 
          className="flex flex-col bg-white"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="メッセージを入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                送信
              </button>
            </div>
          </div>
        </div>

        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 bg-gray-300 cursor-col-resize hover:bg-blue-400 transition-colors ${
            isDragging ? 'bg-blue-500' : ''
          }`}
        />

        {/* 右パネル - キャンバス */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b">
            <input
              type="text"
              value={canvasTitle}
              onChange={(e) => setCanvasTitle(e.target.value)}
              placeholder="タイトルを入力..."
              className="w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 p-4">
            <textarea
              value={canvasContent}
              onChange={(e) => setCanvasContent(e.target.value)}
              placeholder="ここに文章を書いてください..."
              className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {canvasContent.length} 文字
            </div>
            <button
              onClick={saveCanvas}
              disabled={!canvasContent.trim()}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                canvasContent.trim()
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}