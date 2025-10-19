import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $getSelection, $isRangeSelection } from 'lexical'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const POPOVER_WIDTH = 282

export const FloatMenu = ({ children }: { children: ReactNode }) => {
  const [editor] = useLexicalComposerContext()
  const [show, setShow] = useState(false)
  const [anchorPosition, setAnchorPosition] = useState({
    top: 0,
    left: 0,
  })
  const anchorRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const updateToolbar = () => {
    const selection = $getSelection()
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const domSelection = window.getSelection()
      if (domSelection && domSelection.rangeCount > 0) {
        const domRange = domSelection.getRangeAt(0)

        const rects = domRange.getClientRects()
        if (rects.length > 0) {
          const rect = rects[0]
          const leftPosition = rect.left + window.scrollX - POPOVER_WIDTH * 0.2
          setAnchorPosition({
            top: rect.top + window.scrollY - 50,
            left: leftPosition,
          })
          setShow(true)
        }
      }
    } else {
      setShow(false)
    }
  }

  useEffect(() => {
    if (show) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [show])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      })
    )
  }, [editor])

  return createPortal(
    <div
      ref={anchorRef}
      style={{
        top: anchorPosition.top,
        left: anchorPosition.left - 60,
        display: show ? 'block' : 'none',
      }}
      className="absolute z-50 flex items-center gap-1 rounded-lg bg-popover border border-accent shadow-lg p-1 pr-1"
    >
      <div ref={popoverRef} className="flex items-end flex-1">
        {children}
      </div>
    </div>,
    document.body
  )
}
