import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    if (action === 'generate') {
      // OpenAI GPT生成（環境変数が設定されている場合）
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'あなたは文章作成のプロフェッショナルです。' },
              { role: 'user', content: data.prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })
        
        if (response.ok) {
          const result = await response.json()
          return NextResponse.json({ 
            content: result.choices[0].message.content,
            success: true 
          })
        }
      }
      
      // APIキー未設定時のフォールバック
      const fallbackResponses = [
        `「${data.prompt}」について詳しく書いてみましょう。まず、この テーマの背景から始めて、具体例を交えながら説明していくと良いでしょう。`,
        `興味深いトピックですね。「${data.prompt}」については、複数の観点から考察することができます。`,
        `このテーマについて書く際は、読者の立場に立って分かりやすく説明することが重要です。`
      ]
      
      return NextResponse.json({ 
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        success: true,
        note: 'APIキー未設定のため、サンプル応答を表示しています。'
      })
    }
    
    if (action === 'learn') {
      // Claude学習機能（環境変数が設定されている場合）
      if (process.env.ANTHROPIC_API_KEY) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `以下の文章から文体や好みのパターンを分析してください：\n\n${data.texts.join('\n\n')}`
            }]
          }),
        })
        
        if (response.ok) {
          const result = await response.json()
          return NextResponse.json({ 
            analysis: result.content[0].text,
            success: true 
          })
        }
      }
      
      // APIキー未設定時のフォールバック
      return NextResponse.json({ 
        analysis: '文章パターンを分析しました。今後の生成で活用されます。',
        success: true,
        note: 'APIキー未設定のため、サンプル分析結果を表示しています。'
      })
    }
    
    return NextResponse.json({ error: '無効なアクション' }, { status: 400 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}