import React, {useState, useEffect, cloneElement} from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import styled from 'styled-components'
import TimelineSidebar from './TimelineSidebar'

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`

const Sidebar = styled.div`
	display: flex;
	flex-direction: column;
	width: 10%;
`

const ignoreList = ['Application, AP-Tech-spons', 'Tech-spons']



const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})

const BASE_URL = 'https://api.trello.com/1/'


const Timeline = (props) => {
	const [checkedLabels, setCheckedLabels] = useState([])
	const [board, setBoard] = useState(null)
	const [lists, setLists] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(async () => {
		if(!loading && !board) {
			setLoading(true)
			const board = await t.board('all')
			setBoard(board)
			const lists = await t.lists('all')
			setLists(lists)
		}
		
	})

	const setLabel = (label) => setCheckedLabels([...checkedLabels, label])
	const unsetLabels = (label) => setCheckedLabels(checkedLabels.filter(l => label !== l)) 

	return (
		<Container>
			{lists.length > 0 &&
				<div>
					fdsfd
					<TimelineSidebar
					labels={board.labels}
					checkedLabels={checkedLabels}
					setLabel={setLabel}
					unsetLabel={unsetLabels}/>

				</div>
			}
		</Container>
	)
}

ReactDOM.render(<Timeline />, document.getElementById('root'))