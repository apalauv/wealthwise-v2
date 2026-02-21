'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, PageType } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  LayoutDashboard, ChartLine, ShieldCheck, Bitcoin, Globe, Landmark, Rocket, Building, Calendar, SquareCheckBig, Target, Fish, Sparkles, Upload, Settings, LogOut, Menu, X, Plus, Trash2, Edit, Save, RefreshCw, ArrowUp, ArrowDown, ArrowRight, TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, Briefcase, ChevronRight, Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend } from 'recharts'

// Types
interface Asset {
  id: string
  name: string
  type: string
  quantity: number
  buyPrice: number
  currentPrice: number
  currency: string
  symbol: string | null
  description: string | null
  platform: string | null
  wallet: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  history: { id: string; price: number; date: string }[]
}

interface Task {
  id: string
  title: string
  description: string | null
  category: string | null
  priority: string
  status: string
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}

interface Goal {
  id: string
  name: string
  description: string | null
  targetAmount: number
  currentAmount: number
  deadline: string | null
  category: string | null
  status: string
  createdAt: string
}

interface Transaction {
  id: string
  title: string
  description: string | null
  amount: number
  type: string
  category: string | null
  date: string
  createdAt: string
}

interface Snapshot {
  id: string
  date: string
  totalPatrimony: number
  cashValue: number
  cryptoValue: number
  defiValue: number
  etfValue: number
  fundValue: number
  ventureValue: number
  realEstateValue: number
}

interface Whale {
  id: string
  name: string
  description: string | null
  walletAddress: string | null
  holdings: string | null
  notes: string | null
}

interface DashboardData {
  totalPatrimony: number
  totalInvested: number
  totalPnL: number
  totalPnLPercent: number
  monthlyChange: number
  monthlyChangePercent: number
  ytdChange: number
  ytdChangePercent: number
  lastMonthPatrimony: number
  totalsByType: Record<string, number>
  assetsByType: Record<string, Asset[]>
  snapshots: Snapshot[]
  assetCount: number
}

// Utility functions
const formatCurrency = (value: number, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Colors for charts
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
const TYPE_COLORS: Record<string, string> = {
  cash: '#eab308',
  crypto: '#f7931a',
  defi: '#8b5cf6',
  etf: '#3b82f6',
  fund: '#22c55e',
  venture: '#ef4444',
  real_estate: '#06b6d4'
}

const TYPE_NAMES: Record<string, string> = {
  cash: 'Caja Fuerte',
  crypto: 'Criptomonedas',
  defi: 'DeFi',
  etf: 'ETFs',
  fund: 'Fondos',
  venture: 'Venture Capital',
  real_estate: 'Inmuebles'
}

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'evolucion', label: 'Evolución', icon: ChartLine },
  { id: 'caja-fuerte', label: 'Caja Fuerte', icon: ShieldCheck },
  { id: 'criptomonedas', label: 'Criptomonedas', icon: Bitcoin },
  { id: 'defi', label: 'DeFi', icon: Globe },
  { id: 'etfs-fondos', label: 'ETFs y Fondos', icon: Landmark },
  { id: 'venture-capital', label: 'Venture Capital', icon: Rocket },
  { id: 'inmuebles', label: 'Inmuebles', icon: Building },
  { id: 'efemerides', label: 'Efemérides', icon: Calendar },
  { id: 'tareas', label: 'Tareas', icon: SquareCheckBig },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'whales', label: 'Whales', icon: Fish },
  { id: 'market-analysis', label: 'Análisis de Mercado', icon: ChartLine },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'import', label: 'Import', icon: Upload },
]

// Logo Component
const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12l3 3 3-3-3-3-3 3z" fill="currentColor" opacity="0.5"></path>
    <path d="M12 3l3 3 3-3-3-3-3 3z"></path>
    <path d="M12 21l3-3 3 3-3 3-3-3z"></path>
    <path d="M21 12l-3-3-3 3 3 3 3-3z"></path>
    <path d="M12 12l3 3 3-3-3-3-3 3z" fill="currentColor"></path>
  </svg>
)

// Landing Page Component
function LandingPage() {
  const setCurrentPage = useAppStore(state => state.setCurrentPage)
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">WealthWise</span>
        </div>
        <Button onClick={() => setCurrentPage('dashboard')}>
          Get Started
        </Button>
      </header>
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-6">
            Your Financial Universe, <br className="hidden md:block"/>
            <span className="text-primary">Perfectly Organized.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            WealthWise is the ultimate platform for tracking your net worth, managing investments, and reaching your financial goals with confidence.
          </p>
          <Button size="lg" onClick={() => setCurrentPage('dashboard')}>
            Access Your Dashboard
          </Button>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              A Smarter Way to Manage Your Wealth
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Everything you need for a clear financial future, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: 'Portfolio Overview', desc: 'Get a comprehensive summary of all your assets and liabilities in one unified dashboard.' },
              { icon: TrendingUp, title: 'Investment Tracking', desc: 'Manually log or import transactions to monitor the performance of your investments.' },
              { icon: ChartLine, title: 'Net Worth Calculation', desc: 'Visualize your net worth over time with our interactive and easy-to-understand charts.' },
              { icon: Target, title: 'Goal Setting', desc: 'Set and track your financial goals, from retirement to a down payment on your dream house.' },
              { icon: Sparkles, title: 'Personalized Insights', desc: 'Leverage our AI-powered tool to get suggestions based on your financial data.' },
              { icon: DollarSign, title: 'Financial Clarity', desc: 'Achieve peace of mind with a clear, complete picture of your financial health.' },
            ].map((feature, i) => (
              <Card key={i} className="hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-muted-foreground" />
            <span className="text-md text-muted-foreground">WealthWise</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} WealthWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Sidebar Component
function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useAppStore()
  
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'}
        flex flex-col h-screen
      `}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setCurrentPage('dashboard')}
            >
              <Logo className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">WealthWise</span>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id as PageType)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                    transition-colors
                    ${currentPage === item.id 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-2 border-t border-sidebar-border">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setCurrentPage('landing')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}

// Add Asset Dialog
function AddAssetDialog({ type, onAdded }: { type: string, onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    symbol: '',
    platform: '',
    wallet: '',
    description: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Activo añadido correctamente')
        setForm({ name: '', quantity: '', buyPrice: '', currentPrice: '', symbol: '', platform: '', wallet: '', description: '' })
        setOpen(false)
        onAdded()
      } else {
        toast.error('Error al añadir activo')
      }
    } catch (error) {
      toast.error('Error al añadir activo')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Añadir Activo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir {TYPE_NAMES[type] || 'Activo'}</DialogTitle>
          <DialogDescription>
            Introduce los datos del nuevo activo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Bitcoin, Apple, etc."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyPrice">Precio Compra *</Label>
              <Input
                id="buyPrice"
                type="number"
                step="any"
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Precio Actual</Label>
            <Input
              id="currentPrice"
              type="number"
              step="any"
              value={form.currentPrice}
              onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          {(type === 'crypto' || type === 'etf' || type === 'fund') && (
            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo</Label>
              <Input
                id="symbol"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                placeholder="BTC, ETH, SPY..."
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma/Exchange</Label>
            <Input
              id="platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              placeholder="Binance, Coinbase, etc."
            />
          </div>
          
          {type === 'crypto' && (
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet</Label>
              <Input
                id="wallet"
                value={form.wallet}
                onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                placeholder="Dirección de wallet"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notas adicionales..."
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Asset Dialog
function EditAssetDialog({ asset, onUpdated }: { asset: Asset, onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: asset.name,
    quantity: asset.quantity.toString(),
    buyPrice: asset.buyPrice.toString(),
    currentPrice: asset.currentPrice.toString(),
    symbol: asset.symbol || '',
    platform: asset.platform || '',
    wallet: asset.wallet || '',
    description: asset.description || ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: asset.id, ...form })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success('Activo actualizado correctamente')
        setOpen(false)
        onUpdated()
      } else {
        toast.error('Error al actualizar activo')
      }
    } catch (error) {
      toast.error('Error al actualizar activo')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Activo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Cantidad</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-buyPrice">Precio Compra</Label>
              <Input
                id="edit-buyPrice"
                type="number"
                step="any"
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-currentPrice">Precio Actual</Label>
            <Input
              id="edit-currentPrice"
              type="number"
              step="any"
              value={form.currentPrice}
              onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-symbol">Símbolo</Label>
            <Input
              id="edit-symbol"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-platform">Plataforma</Label>
            <Input
              id="edit-platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Asset Card
function AssetCard({ asset, onUpdated, onDeleted }: { asset: Asset, onUpdated: () => void, onDeleted: () => void }) {
  const currentValue = asset.quantity * asset.currentPrice
  const investedValue = asset.quantity * asset.buyPrice
  const pnl = currentValue - investedValue
  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0
  
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este activo?')) return
    
    try {
      const res = await fetch(`/api/assets?id=${asset.id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Activo eliminado')
        onDeleted()
      } else {
        toast.error('Error al eliminar')
      }
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{asset.name}</CardTitle>
            <CardDescription>
              {asset.symbol && <span className="mr-2">{asset.symbol}</span>}
              {asset.platform && <span>{asset.platform}</span>}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <EditAssetDialog asset={asset} onUpdated={onUpdated} />
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
          <p className="text-2xl font-bold">{formatCurrency(currentValue)}</p>
          <p className={`text-sm font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(pnlPercent)}
          </p>
        </div>
        <Progress value={Math.min(Math.abs(pnlPercent), 100)} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Cantidad:</span>
            <span>{asset.quantity.toLocaleString('es-ES')}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio compra:</span>
            <span>{formatCurrency(asset.buyPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio actual:</span>
            <span>{formatCurrency(asset.currentPrice)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>P&L:</span>
            <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(pnl)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard Page
function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [closingMonth, setClosingMonth] = useState(false)
  
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  const handleCloseMonth = async () => {
    if (!confirm('¿Estás seguro de cerrar el mes? Se guardará una instantánea de tu patrimonio actual.')) return
    
    setClosingMonth(true)
    try {
      const res = await fetch('/api/snapshots', { method: 'POST' })
      const json = await res.json()
      
      if (json.success) {
        toast.success('Mes cerrado correctamente')
        fetchData()
      } else {
        toast.error('Error al cerrar el mes')
      }
    } catch (error) {
      toast.error('Error al cerrar el mes')
    } finally {
      setClosingMonth(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se pudieron cargar los datos</p>
        <Button onClick={fetchData} className="mt-4">Reintentar</Button>
      </div>
    )
  }
  
  const pieData = Object.entries(data.totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, value]) => ({
      name: TYPE_NAMES[type] || type,
      value,
      color: TYPE_COLORS[type] || '#888888'
    }))
  
  const chartData = data.snapshots.slice(0, 12).reverse().map((s, i) => ({
    name: new Date(s.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    total: s.totalPatrimony,
    crypto: s.cryptoValue,
    etf: s.etfValue + s.fundValue,
    cash: s.cashValue,
    other: s.defiValue + s.ventureValue + s.realEstateValue
  }))
  
  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-green-100">Resumen del Portfolio</h2>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleCloseMonth}
              disabled={closingMonth}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              {closingMonth ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Cerrar Mes
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-green-100">Patrimonio Total</h3>
              <p className="text-4xl font-bold">{formatCurrency(data.totalPatrimony)}</p>
              <p className="text-xs flex items-center text-green-200 mt-1">
                {data.monthlyChange >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {formatCurrency(Math.abs(data.monthlyChange))} este mes
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-100">Rendimiento Mensual</h3>
              <p className="text-4xl font-bold">{formatPercent(data.monthlyChangePercent)}</p>
              <p className="text-xs text-green-200">Desde el último cierre</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-100">Rendimiento YTD</h3>
              <p className="text-4xl font-bold">{formatPercent(data.ytdChangePercent)}</p>
              <p className="text-xs text-green-200">Año {new Date().getFullYear()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Distribution Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Distribución Patrimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TYPE_NAMES).map(([type, name]) => {
            const value = data.totalsByType[type] || 0
            const count = data.assetsByType[type]?.length || 0
            const percent = data.totalPatrimony > 0 ? (value / data.totalPatrimony) * 100 : 0
            
            return (
              <Card key={type} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: TYPE_COLORS[type] }}
                      />
                      <span className="font-semibold">{name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(value)}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">{count} activos</span>
                    <span className="text-sm font-medium">{percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={percent} className="h-2 mt-2" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Patrimonio</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="total" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Total" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos históricos. Cierra un mes para empezar a ver la evolución.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay activos. Añade activos para ver la distribución.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Assets Page Template
function AssetsPage({ type }: { type: string }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets?type=${type}`)
      const json = await res.json()
      if (json.success) {
        setAssets(json.data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }, [type])
  
  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])
  
  const handleRefreshPrices = async () => {
    if (type !== 'crypto') {
      toast.info('Solo disponible para criptomonedas')
      return
    }
    
    setRefreshing(true)
    try {
      // Get crypto prices
      const symbols = assets.filter(a => a.symbol).map(a => a.symbol as string)
      if (symbols.length === 0) {
        toast.info('No hay símbolos para actualizar')
        setRefreshing(false)
        return
      }
      
      const res = await fetch(`/api/crypto-prices?symbols=${symbols.join(',')}`)
      const json = await res.json()
      
      if (json.success) {
        // Update each asset with new price
        for (const asset of assets) {
          if (asset.symbol && json.data[asset.symbol]) {
            await fetch('/api/assets', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: asset.id,
                currentPrice: json.data[asset.symbol]
              })
            })
          }
        }
        toast.success('Precios actualizados')
        fetchAssets()
      } else {
        toast.error('Error al obtener precios')
      }
    } catch (error) {
      toast.error('Error al actualizar precios')
    } finally {
      setRefreshing(false)
    }
  }
  
  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0)
  const totalInvested = assets.reduce((sum, a) => sum + a.quantity * a.buyPrice, 0)
  const totalPnL = totalValue - totalInvested
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{TYPE_NAMES[type]}</h2>
              <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                P&L: {formatCurrency(totalPnL)} ({formatPercent(totalPnLPercent)})
              </p>
            </div>
            <div className="flex gap-2">
              {type === 'crypto' && (
                <Button variant="outline" onClick={handleRefreshPrices} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualizar Precios
                </Button>
              )}
              <AddAssetDialog type={type} onAdded={fetchAssets} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Assets Grid */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No tienes activos en esta categoría</p>
            <AddAssetDialog type={type} onAdded={fetchAssets} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onUpdated={fetchAssets} 
              onDeleted={fetchAssets}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Tasks Page
function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: ''
  })
  
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      const json = await res.json()
      if (json.success) {
        setTasks(json.data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const json = await res.json()
      
      if (json.success) {
        toast.success('Tarea creada')
        setForm({ title: '', description: '', category: '', priority: 'medium', dueDate: '' })
        setDialogOpen(false)
        fetchTasks()
      } else {
        toast.error('Error al crear tarea')
      }
    } catch (error) {
      toast.error('Error al crear tarea')
    }
  }
  
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      fetchTasks()
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      toast.success('Tarea eliminada')
      fetchTasks()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }
  
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tareas</h2>
          <p className="text-muted-foreground">{tasks.length} tareas totales</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Tarea</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="investment">Inversión</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Trabajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha límite</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">En Progreso ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">Vence: {formatDate(task.dueDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(task.id, 'in_progress')}>
                      Iniciar
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateStatus(task.id, 'completed')}>
                      Completar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay tareas pendientes</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in_progress" className="mt-4">
          <div className="space-y-2">
            {inProgressTasks.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <p className="font-medium">{task.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(task.id, 'pending')}>
                      Pausar
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateStatus(task.id, 'completed')}>
                      Completar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay tareas en progreso</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="space-y-2">
            {completedTasks.map(task => (
              <Card key={task.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Completada</Badge>
                    <p className="font-medium line-through">{task.title}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {completedTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay tareas completadas</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Goals Page
function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: ''
  })
  
  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/goals')
      const json = await res.json()
      if (json.success) {
        setGoals(json.data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const json = await res.json()
      
      if (json.success) {
        toast.success('Meta creada')
        setForm({ name: '', description: '', targetAmount: '', currentAmount: '', category: '', deadline: '' })
        setDialogOpen(false)
        fetchGoals()
      } else {
        toast.error('Error al crear meta')
      }
    } catch (error) {
      toast.error('Error al crear meta')
    }
  }
  
  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    const newAmount = prompt('Nuevo monto actual:', currentAmount.toString())
    if (newAmount === null) return
    
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentAmount: parseFloat(newAmount) })
      })
      fetchGoals()
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta meta?')) return
    
    try {
      await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
      toast.success('Meta eliminada')
      fetchGoals()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Metas Financieras</h2>
          <p className="text-muted-foreground">{goals.length} metas activas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Meta Financiera</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Fondo de emergencia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto Objetivo *</Label>
                  <Input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monto Actual</Label>
                  <Input
                    type="number"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Ahorros</SelectItem>
                      <SelectItem value="investment">Inversión</SelectItem>
                      <SelectItem value="retirement">Jubilación</SelectItem>
                      <SelectItem value="property">Propiedad</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha límite</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No tienes metas financieras</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      {goal.category && (
                        <Badge variant="outline" className="mt-1">{goal.category}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleUpdateProgress(goal.id, goal.currentAmount)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-muted-foreground">de {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                    {goal.deadline && (
                      <span className="text-muted-foreground">Vence: {formatDate(goal.deadline)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Evolución Page
function EvolucionPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await fetch('/api/snapshots')
        const json = await res.json()
        if (json.success) {
          setSnapshots(json.data)
        }
      } catch (error) {
        console.error('Error fetching snapshots:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSnapshots()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  const chartData = snapshots.slice(0, 12).reverse().map(s => ({
    name: new Date(s.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    total: s.totalPatrimony,
    cash: s.cashValue,
    crypto: s.cryptoValue,
    defi: s.defiValue,
    etf: s.etfValue,
    fund: s.fundValue,
    venture: s.ventureValue,
    realEstate: s.realEstateValue
  }))
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Evolución del Patrimonio</h2>
      
      {snapshots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChartLine className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No hay datos históricos</p>
            <p className="text-sm text-muted-foreground">Cierra un mes desde el Dashboard para empezar a ver la evolución</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Patrimonio Total</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Total" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="cash" name="Caja Fuerte" stackId="a" fill={TYPE_COLORS.cash} />
                  <Bar dataKey="crypto" name="Crypto" stackId="a" fill={TYPE_COLORS.crypto} />
                  <Bar dataKey="defi" name="DeFi" stackId="a" fill={TYPE_COLORS.defi} />
                  <Bar dataKey="etf" name="ETFs" stackId="a" fill={TYPE_COLORS.etf} />
                  <Bar dataKey="fund" name="Fondos" stackId="a" fill={TYPE_COLORS.fund} />
                  <Bar dataKey="venture" name="Venture" stackId="a" fill={TYPE_COLORS.venture} />
                  <Bar dataKey="realEstate" name="Inmuebles" stackId="a" fill={TYPE_COLORS.real_estate} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cierres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {snapshots.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span>{formatDate(s.date)}</span>
                    <span className="font-bold">{formatCurrency(s.totalPatrimony)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// Transactions/Efemérides Page
function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      const json = await res.json()
      if (json.success) {
        setTransactions(json.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const json = await res.json()
      
      if (json.success) {
        toast.success('Transacción creada')
        setForm({ title: '', description: '', amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0] })
        setDialogOpen(false)
        fetchTransactions()
      }
    } catch (error) {
      toast.error('Error al crear transacción')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta transacción?')) return
    
    try {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      toast.success('Transacción eliminada')
      fetchTransactions()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Efemérides</h2>
          <p className="text-muted-foreground">Registro de eventos financieros</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Transacción</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="investment">Inversión</SelectItem>
                      <SelectItem value="dividend">Dividendo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Crear</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay transacciones registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : t.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : ''}`}>
                    {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatCurrency(Math.abs(t.amount))}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Whales Page
function WhalesPage() {
  const [whales, setWhales] = useState<Whale[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    walletAddress: '',
    holdings: '',
    notes: ''
  })
  
  const fetchWhales = useCallback(async () => {
    try {
      const res = await fetch('/api/whales')
      const json = await res.json()
      if (json.success) {
        setWhales(json.data)
      }
    } catch (error) {
      console.error('Error fetching whales:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchWhales()
  }, [fetchWhales])
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/whales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      const json = await res.json()
      
      if (json.success) {
        toast.success('Whale añadido')
        setForm({ name: '', description: '', walletAddress: '', holdings: '', notes: '' })
        setDialogOpen(false)
        fetchWhales()
      }
    } catch (error) {
      toast.error('Error al crear whale')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este whale?')) return
    
    try {
      await fetch(`/api/whales?id=${id}`, { method: 'DELETE' })
      toast.success('Whale eliminado')
      fetchWhales()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Whale Tracking</h2>
          <p className="text-muted-foreground">Monitorea las wallets de grandes inversores</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Whale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Whale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección Wallet</Label>
                <Input
                  value={form.walletAddress}
                  onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label>Holdings</Label>
                <Textarea
                  value={form.holdings}
                  onChange={(e) => setForm({ ...form, holdings: e.target.value })}
                  placeholder="Lista de holdings..."
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {whales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Fish className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay whales en seguimiento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whales.map(whale => (
            <Card key={whale.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{whale.name}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(whale.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {whale.walletAddress && (
                  <p className="text-xs text-muted-foreground font-mono truncate">{whale.walletAddress}</p>
                )}
              </CardHeader>
              <CardContent>
                {whale.holdings && (
                  <p className="text-sm mb-2">{whale.holdings}</p>
                )}
                {whale.notes && (
                  <p className="text-sm text-muted-foreground">{whale.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// AI Insights Page
function InsightsPage() {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  const generateInsights = useCallback(async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/insights')
      const json = await res.json()
      if (json.success) {
        setInsights(json.data.insights)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }, [])
  
  useEffect(() => {
    generateInsights()
  }, [generateInsights])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">Análisis inteligente de tu portfolio</p>
        </div>
        <Button onClick={generateInsights} disabled={generating}>
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Regenerar
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm">{insights}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Import Page
function ImportPage() {
  const [importing, setImporting] = useState(false)
  const [importType, setImportType] = useState('csv')
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n')
      
      // Parse CSV
      let imported = 0
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const parts = line.split(',')
        if (parts.length >= 3) {
          const [name, type, quantity, buyPrice, currentPrice] = parts.map(p => p.trim())
          
          await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              type: type || 'cash',
              quantity: parseFloat(quantity) || 0,
              buyPrice: parseFloat(buyPrice) || 0,
              currentPrice: parseFloat(currentPrice) || 0
            })
          })
          imported++
        }
      }
      
      toast.success(`${imported} activos importados correctamente`)
    } catch (error) {
      toast.error('Error al importar archivo')
    } finally {
      setImporting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Importar Datos</h2>
        <p className="text-muted-foreground">Importa activos desde archivos CSV o JSON</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Importar desde CSV</CardTitle>
          <CardDescription>
            El archivo CSV debe tener el siguiente formato:
            <code className="block mt-2 p-2 bg-muted rounded text-sm">
              name,type,quantity,buyPrice,currentPrice
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                disabled={importing}
              />
              {importing && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Plantilla CSV</CardTitle>
          <CardDescription>Descarga una plantilla para importar tus activos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => {
              const template = 'name,type,quantity,buyPrice,currentPrice\nBitcoin,crypto,0.5,30000,45000\nApple,etf,10,150,180\nFondo Indexado,fund,100,50,55'
              const blob = new Blob([template], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'plantilla_wealthwise.csv'
              a.click()
            }}
          >
            Descargar Plantilla
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Market Analysis Page
function MarketAnalysisPage() {
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/crypto-prices')
        const json = await res.json()
        if (json.success) {
          setCryptoPrices(json.data)
        }
      } catch (error) {
        console.error('Error fetching prices:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPrices()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análisis de Mercado</h2>
        <p className="text-muted-foreground">Precios actuales de criptomonedas</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Precios de Criptomonedas</CardTitle>
          <CardDescription>Actualizados desde CoinGecko</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(cryptoPrices).map(([symbol, price]) => (
              <div key={symbol} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">{symbol}</span>
                </div>
                <span className="font-bold">{formatCurrency(price)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Page Component
export default function Home() {
  const { currentPage, sidebarOpen, toggleSidebar, setCurrentPage } = useAppStore()
  
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />
      case 'dashboard':
        return <DashboardPage />
      case 'evolucion':
        return <EvolucionPage />
      case 'caja-fuerte':
        return <AssetsPage type="cash" />
      case 'criptomonedas':
        return <AssetsPage type="crypto" />
      case 'defi':
        return <AssetsPage type="defi" />
      case 'etfs-fondos':
        return (
          <Tabs defaultValue="etf" className="space-y-6">
            <TabsList>
              <TabsTrigger value="etf">ETFs</TabsTrigger>
              <TabsTrigger value="fund">Fondos</TabsTrigger>
            </TabsList>
            <TabsContent value="etf">
              <AssetsPage type="etf" />
            </TabsContent>
            <TabsContent value="fund">
              <AssetsPage type="fund" />
            </TabsContent>
          </Tabs>
        )
      case 'venture-capital':
        return <AssetsPage type="venture" />
      case 'inmuebles':
        return <AssetsPage type="real_estate" />
      case 'efemerides':
        return <TransactionsPage />
      case 'tareas':
        return <TasksPage />
      case 'goals':
        return <GoalsPage />
      case 'whales':
        return <WhalesPage />
      case 'market-analysis':
        return <MarketAnalysisPage />
      case 'insights':
        return <InsightsPage />
      case 'import':
        return <ImportPage />
      default:
        return <DashboardPage />
    }
  }
  
  if (currentPage === 'landing') {
    return <LandingPage />
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="font-bold">WealthWise</span>
          </div>
        </header>
        
        <div className="p-4 md:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
