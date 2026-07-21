'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/store/app-store'
import { Book, Plus, FileText, Copy, Trash2, MoreVertical, Pencil, BookOpen, Download } from 'lucide-react'
import { ExportButton } from '@/components/export/export-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface BookData {
  id: string
  title: string
  subtitle?: string
  authorName?: string
  bookType: string
  style: string
  language: string
  wordCountTarget?: number | null
  description?: string
  coverUrl?: string
  status: string
  createdAt: string
  updatedAt: string
  chapters: { id: string; title: string; wordCount: number }[]
}

export function DashboardPage() {
  const { data: session } = useSession()
  const { setView, setSelectedBookId } = useAppStore()
  const [books, setBooks] = useState<BookData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchBooks = useCallback(async () => {
    const userId = (session?.user as any)?.id || session?.user?.email
    if (!userId) return
    try {
      const res = await fetch(`/api/books?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setBooks(data)
      }
    } catch {
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const handleEdit = (book: BookData) => {
    setSelectedBookId(book.id)
    setView('editor')
  }

  const handleDuplicate = async (book: BookData) => {
    const userId = (session?.user as any)?.id || session?.user?.email
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, title: `${book.title} (Copy)`, subtitle: book.subtitle,
          authorName: book.authorName, bookType: book.bookType, style: book.style,
          styleOtherText: null, language: book.language,
          wordCountTarget: book.wordCountTarget, description: book.description,
          bibliographyFormat: 'none',
        }),
      })
      if (res.ok) {
        toast.success('Book duplicated')
        fetchBooks()
      }
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/books/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Book deleted')
        setBooks(prev => prev.filter(b => b.id !== deleteId))
      }
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteId(null)
    }
  }

  const handleQuickExport = async (bId: string, bTitle: string) => {
    try {
      const res = await fetch(`/api/books/${bId}`)
      if (!res.ok) throw new Error('Failed to load book')
      const book = await res.json()
      const chaptersHtml = (book.chapters || []).sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((ch: any) => `<div class="chapter" style="page-break-before:always"><h2>${ch.title}</h2>${ch.content || ''}</div>`).join('')
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${bTitle}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.8;max-width:700px;margin:0 auto;padding:40px 20px;color:#1a1a1a}h1{font-size:24pt}h2{font-size:18pt;margin-top:28pt}.chapter:first-child{page-break-before:auto}p{margin:8pt 0;text-align:justify}</style></head><body><h1>${bTitle}</h1>${book.subtitle ? `<p><em>${book.subtitle}</em></p>` : ''}<p>by ${book.authorName || ''}</p>${chaptersHtml}</body></html>`
      const blob = new Blob([html], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${bTitle}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      await fetch(`/api/books/${bId}/export`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId: bId, format: 'pdf' }) })
      toast.success('Book exported!')
    } catch { toast.error('Export failed') }
  }

  const totalWords = (book: BookData) => book.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-700 text-slate-300',
    writing: 'bg-blue-900/50 text-blue-300',
    editing: 'bg-amber-900/50 text-amber-300',
    complete: 'bg-emerald-900/50 text-emerald-300',
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-48 mb-8 bg-[#1E293B]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-xl bg-[#151C2C]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Library</h1>
          <p className="text-[#94A3B8] mt-1">{books.length} book{books.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setView('wizard')} className="gradient-btn text-white self-start">
          <Plus className="w-4 h-4 mr-2" /> New Book
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[#151C2C] border border-[#1E293B] flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-[#3B82F6]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#E2E8F0] mb-2">Start Your First Book</h2>
          <p className="text-[#94A3B8] max-w-md mb-6">Every great book begins with an idea. Create your first manuscript with AI assistance and write without limits.</p>
          <Button onClick={() => setView('wizard')} className="gradient-btn text-white">
            <Plus className="w-4 h-4 mr-2" /> Create New Book
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="glass-card overflow-hidden group hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer" onClick={() => handleEdit(book)}>
              <div className="h-40 bg-gradient-to-br from-[#1E293B] to-[#151C2C] flex items-center justify-center relative">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <Book className="w-16 h-16 text-[#1E293B]" />
                )}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#0B0F19]/80 backdrop-blur-sm hover:bg-[#0B0F19]">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#151C2C] border-[#1E293B]">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(book) }}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(book) }}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickExport(book.id, book.title) }}>
                        <Download className="w-4 h-4 mr-2" /> Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(book.id) }} className="text-red-400 focus:text-red-300">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Badge className={`absolute top-3 left-3 text-xs ${statusColor[book.status] || ''}`}>{book.status}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#E2E8F0] text-lg leading-tight mb-1 truncate">{book.title}</h3>
                {book.subtitle && <p className="text-sm text-[#94A3B8] mb-3 truncate">{book.subtitle}</p>}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className="text-xs border-[#1E293B] text-[#94A3B8]">{book.bookType === 'fiction' ? 'Fiction' : 'Non-Fiction'}</Badge>
                  <Badge variant="outline" className="text-xs border-[#1E293B] text-[#94A3B8]">{book.style}</Badge>
                  <Badge variant="outline" className="text-xs border-[#1E293B] text-[#94A3B8]">{book.language}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>{book.chapters.length} chapter{book.chapters.length !== 1 ? 's' : ''} · {totalWords(book).toLocaleString()} words</span>
                  <span>{formatDistanceToNow(new Date(book.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151C2C] border-[#1E293B]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E2E8F0]">Delete Book</AlertDialogTitle>
            <AlertDialogDescription className="text-[#94A3B8]">This will permanently delete this book and all its chapters. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1E293B] text-[#E2E8F0] hover:bg-[#334155] border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}