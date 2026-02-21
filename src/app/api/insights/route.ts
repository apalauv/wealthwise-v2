import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// GET - Get AI insights
export async function GET() {
  try {
    // Get dashboard data
    const assets = await db.asset.findMany({
      where: { isActive: true }
    })
    
    const snapshots = await db.monthlySnapshot.findMany({
      orderBy: { date: 'desc' },
      take: 6
    })
    
    // Calculate summary
    let totalPatrimony = 0
    const byType: Record<string, number> = {}
    
    for (const asset of assets) {
      const value = asset.quantity * asset.currentPrice
      totalPatrimony += value
      byType[asset.type] = (byType[asset.type] || 0) + value
    }
    
    // Create AI prompt
    const prompt = `You are a financial advisor AI. Analyze this portfolio data and provide 3-5 actionable insights.

Portfolio Summary:
- Total Patrimony: €${totalPatrimony.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
- Number of Assets: ${assets.length}

Distribution by Type:
${Object.entries(byType).map(([type, value]) => `- ${type}: €${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })} (${((value / totalPatrimony) * 100).toFixed(1)}%)`).join('\n')}

Recent Snapshots:
${snapshots.slice(0, 3).map((s, i) => `- Month ${i + 1}: €${s.totalPatrimony.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`).join('\n')}

Assets:
${assets.slice(0, 20).map(a => `- ${a.name} (${a.type}): ${a.quantity} units @ €${a.currentPrice} = €${(a.quantity * a.currentPrice).toFixed(2)}`).join('\n')}

Please provide:
1. Portfolio health assessment
2. Risk analysis
3. Diversification suggestions
4. Specific actionable recommendations

Format the response in Markdown with clear sections. Write in Spanish.`

    // Get AI response
    const zai = await ZAI.create()
    const result = await zai.functions.invoke('llm', {
      messages: [
        { role: 'system', content: 'You are a professional financial advisor AI assistant. Provide clear, actionable insights in Spanish.' },
        { role: 'user', content: prompt }
      ],
      model: 'default'
    })
    
    return NextResponse.json({
      success: true,
      data: {
        insights: result.data?.content || result.data?.message?.content || 'No se pudieron generar insights en este momento.',
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ 
      success: true, 
      data: {
        insights: `## Análisis de tu Portfolio

### Estado Actual
Tu patrimonio total está distribuido entre diferentes tipos de activos. 

### Recomendaciones Generales
1. **Diversificación**: Considera mantener una distribución equilibrada entre diferentes tipos de activos.
2. **Rebalanceo**: Revisa tu portafolio periódicamente para mantener tus objetivos de asignación.
3. **Monitoreo**: Mantén un seguimiento regular de tus inversiones.

### Próximos Pasos
- Revisa tus activos con mayor peso en el portafolio
- Considera nuevas oportunidades de inversión
- Establece alertas para cambios significativos

*Nota: Este es un análisis genérico. Para un análisis personalizado, asegúrate de tener datos actualizados.*`,
        generatedAt: new Date().toISOString()
      }
    })
  }
}
