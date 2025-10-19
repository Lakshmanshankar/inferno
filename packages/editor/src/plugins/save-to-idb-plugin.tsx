import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useRef } from 'react'
import { type File, STORE_NAME, useIDBStore } from './../hooks/use-better-idb'
import { useAppConfig } from './../hooks/use-lexical-config'

const FILE_NAME = 0 // we have only one file

export function AutoSaveToIDBPlugin() {
  const [editor] = useLexicalComposerContext()
  const { initStore, setFile, getFile } = useIDBStore()
  const { enableAutoSave } = useAppConfig()
  const FILE_STORE = STORE_NAME.FILE
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const intervalRef = useRef<any | null>(null)

  const handleSave = useCallback(async () => {
    const content = JSON.stringify(editor.getEditorState().toJSON())
    setFile(FILE_STORE, FILE_NAME, content)
  }, [editor, setFile, FILE_STORE])

  const loadFile = async () => {
    const file = (await getFile(FILE_STORE, FILE_NAME)) as unknown as File
    if (!file) return
    const editorState = editor.parseEditorState(file.content)
    editor.setEditorState(editorState)
  }

  useEffect(() => {
    initStore(FILE_STORE)
    loadFile()

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    if (enableAutoSave) {
      intervalRef.current = setInterval(() => {
        handleSave()
      }, 15000)
    }

    return () => {
      if (intervalRef.current && enableAutoSave) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, handleSave, enableAutoSave])

  return null
}
