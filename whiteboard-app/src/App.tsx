import { Tldraw, Editor, loadSnapshot, getSnapshot } from 'tldraw'
import { useState, useEffect, useRef } from 'react'

function App() {
	const [isReady, setIsReady] = useState(false)
	const [snapshotData, setSnapshotData] = useState<any>(null)
	const editorRef = useRef<Editor | null>(null)

	// Fetch the file on component mount
	useEffect(() => {
		fetchHomepageTldrawFile()
		
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault(); // Prevent browser's save dialog
			console.log("SAVE")
			saveFile(editorRef.current!);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}

	}, [])

	const fetchHomepageTldrawFile = async () => {
		const result = await fetch('/index.tldr')
		const json = await result.json()
		// const converted = convertTldrToSnapshot(json)
		setSnapshotData(json)
		setIsReady(true)
	}

	const handleMount = (editor: Editor) => {
		editorRef.current = editor // Store the editor reference
		const isDevelopment = import.meta.env.DEV
		const mode = import.meta.env.MODE
		
		console.log('onMount')
		console.log('Environment:', isDevelopment ? 'DEV' : 'PROD', `(mode: ${mode})`)
				
		editor.updateInstanceState({ isReadonly: (isDevelopment == false) })
		
		if (snapshotData) {
			loadSnapshot(editor.store, snapshotData)
		}

		editor.setCurrentTool('hand')
	}

	// Render logic
	if (!isReady) {
		return <LoadingScreen />
	}

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw 
				onMount={handleMount}
				licenseKey={"tldraw-2026-02-15/WyI5R1FkWTZNMyIsWyIqIl0sMTYsIjIwMjYtMDItMTUiXQ.ugmNPpEZku5mG2j2Af8ObzD3FurasGWQqFx8yiN08hcfz6VWLbohDDEsj4PaVMxZtyf1Cl9zU6O1kRiHprmwTw"} 
			/>
		</div>
	)
}

function LoadingScreen() {
	return (
		<div style={{
			position: 'fixed',
			inset: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: '#fff'
		}}>
			<div>loading whiteboard...</div>
		</div>
	)
}

// const convertTldrToSnapshot = (tldrData: any) => {
// 	const store: any = {}
	
// 	tldrData.records.forEach((record: any) => {
// 		store[record.id] = record
// 	})

// 	return {
// 		store: store,
// 		schema: tldrData.schema
// 	}
// }

const saveFile = async (editor: Editor, filename: string = 'index') => {
	try {
		const snapshot = getSnapshot(editor.store)

		const response = await fetch('/api/save-tldraw-file', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ snapshot, filename })
		});
		const result = await response.json();
		console.log('Saved:', result);
	} catch (error) {
		console.error('Save failed:', error);
	}
};

export default App