import { Tldraw, Editor, loadSnapshot, getSnapshot } from 'tldraw'
import { useState, useEffect, useRef } from 'react'

/**

TODO

- Avoid storing images inside json file 
	- When you paste an image write it to the public/images/ directory
- 

 */

function App() {
	const [isReady, setIsReady] = useState(false)
	const [snapshotData, setSnapshotData] = useState<any>(null)
	const editorRef = useRef<Editor | null>(null)
	const [notification, setNotification] = useState<string | null>(null)

	// Auto-dismiss notification after 2 seconds
	useEffect(() => {
		if (notification) {
			const timer = setTimeout(() => {
				setNotification(null)
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [notification])

	// Function to show notification
	const showNotification = (text: string) => {
		setNotification(text)
	}

	// Fetch the file on component mount
	useEffect(() => {
		// Get page name from query parameter once on mount
		const params = new URLSearchParams(window.location.search)
		const pageName = params.get('page') || 'index'
		
		fetchTldrawFile(pageName)
		
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault(); // Prevent browser's save dialog
			console.log("SAVE")
			saveFile(editorRef.current!, showNotification, pageName);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	const fetchTldrawFile = async (page: string) => {
		try {
			const result = await fetch(`/${page}.tldr`)
			const json = await result.json()
			// const converted = convertTldrToSnapshot(json)
			setSnapshotData(json)
			setIsReady(true)
		} catch (e) {
			console.log("Failed to load page", page)
			console.error(e)
			// Create a new page
			setIsReady(true)
		}
		
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
			<Notification text={notification} />
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

function Notification({ text }: { text: string | null }) {
	if (!text) return null

	return (
		<div style={{
			position: 'fixed',
			bottom: '20px',
			right: '20px',
			color: 'gray',
			padding: '12px 20px',
			fontSize: '14px',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			zIndex: 10000,
		}}>
			{text}
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

const saveFile = async (editor: Editor, showNotification: (text: string) => void, filename: string = 'index') => {
	try {
		const snapshot = getSnapshot(editor.store)

		const response = await fetch('/api/save-tldraw-file', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ snapshot, filename })
		});
		const result = await response.json();
		console.log('Saved:', result);
		showNotification('saved');
	} catch (error) {
		console.error('Save failed:', error);
		showNotification('(ERROR SAVING)');
	}
};

export default App