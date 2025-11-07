import { Tldraw, Editor, loadSnapshot } from 'tldraw'
import { useState, useEffect } from 'react'

function App() {
	const [isReady, setIsReady] = useState(false)
	const [snapshotData, setSnapshotData] = useState(null)

	// Fetch the file on component mount
	useEffect(() => {
		fetchHomepageTldrawFile()
	}, [])

	const fetchHomepageTldrawFile = async () => {
		const result = await fetch('/index.tldr')
		const json = await result.json()
		const converted = convertTldrToSnapshot(json)
		setSnapshotData(converted)
		setIsReady(true)
	}

	const handleMount = (editor: Editor) => {
		console.log('onMount')
		editor.updateInstanceState({ isReadonly: true })
		
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

const convertTldrToSnapshot = (tldrData: any) => {
	const store: any = {}
	
	tldrData.records.forEach((record: any) => {
		store[record.id] = record
	})

	return {
		store: store,
		schema: tldrData.schema
	}
}

export default App