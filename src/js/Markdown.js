import fs from 'fs'
import MarkdownIT from 'markdown-it'
import React, {useMemo, useCallback} from 'react'
import ReactDOM from 'react-dom'
import './Markdown.css'
const Marked = () => {
	const markdown = useMemo(() => {
		const md = MarkdownIT({
			html: true
		})
		const file = fs.readFileSync('./src/README.md', {encoding: 'utf-8'})
		const result = md.render(file)
		return { __html: result}
	}, [])

	console.log('markdown', markdown)
	if(markdown.__html) {
		return (
			<div dangerouslySetInnerHTML={markdown} style={{
				margin: '1em 0 1rm 0',
				maxWidth: '800px',
				width: '80%',
				padding: '1.5em',
				borderRadius: '5px',
				border: '1px solid lightgray'
			}}/>
		)
	}
	return null


}


ReactDOM.render(<Marked />, document.getElementById('root'))