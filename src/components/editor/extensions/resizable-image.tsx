import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useRef, MouseEvent as ReactMouseEvent } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Maximize } from 'lucide-react'

const ResizableImageComponent = (props: any) => {
  const { node, updateAttributes, selected } = props
  const [isResizing, setIsResizing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const width = node.attrs.width || '100%'
  const align = node.attrs.align || 'center'
  
  const startResize = (e: ReactMouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startWidth = imageRef.current?.offsetWidth || 0
    const parentWidth = imageRef.current?.parentElement?.parentElement?.offsetWidth || 1000

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX
      // Calculate width delta
      const diffX = currentX - startX
      let newWidth = startWidth + diffX * 2 // Multiply by 2 assuming center resize feeling, or adjust later
      
      const percentage = Math.max(10, Math.min(100, (newWidth / parentWidth) * 100))
      updateAttributes({ width: `${percentage}%` })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const setAlign = (newAlign: string) => {
    updateAttributes({ align: newAlign })
  }

  return (
    <NodeViewWrapper className={`relative group flex ${align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'} my-4`}>
      <div 
        className={`relative ${selected ? 'ring-2 ring-[#3B82F6]' : ''}`} 
        style={{ width: width !== '100%' ? width : '100%', maxWidth: '100%' }}
      >
        {/* The Image */}
        <img 
          ref={imageRef}
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          className="block w-full h-auto rounded-md object-contain"
          style={{ maxHeight: '80vh' }}
        />
        
        {/* Resize Handle */}
        {selected && (
          <div 
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#3B82F6] rounded flex items-center justify-center cursor-ew-resize z-10 shadow-sm"
            onMouseDown={startResize}
          >
            <div className="w-0.5 h-4 bg-white rounded-full opacity-70" />
          </div>
        )}

        {/* Alignment Toolbar */}
        {selected && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1E293B]/90 backdrop-blur-sm p-1 rounded-md shadow-lg border border-[#334155] z-10">
            <button type="button" onClick={() => setAlign('left')} className={`p-1.5 rounded transition-colors ${align === 'left' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E2E8F0]'}`}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setAlign('center')} className={`p-1.5 rounded transition-colors ${align === 'center' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E2E8F0]'}`}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setAlign('right')} className={`p-1.5 rounded transition-colors ${align === 'right' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E2E8F0]'}`}>
              <AlignRight className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#334155] mx-0.5" />
            <button type="button" onClick={() => updateAttributes({ width: '100%' })} className={`p-1.5 rounded transition-colors ${width === '100%' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E2E8F0]'}`}>
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => {
          return {
            width: attributes.width,
            style: `width: ${attributes.width}`,
          }
        },
      },
      align: {
        default: 'center',
        renderHTML: attributes => {
          return {
            'data-align': attributes.align,
          }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})
