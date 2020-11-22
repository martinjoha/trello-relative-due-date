import React, {useState} from 'react'
import styled from 'styled-components'


const Container = styled.div`
	display: flex;
	width: 85%;
	overflow-x: scroll;
`

const Column = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid lightgrey;
	height: 100%;
	width: calc(20% - 10px);
	justify-content: flex-start;
	align-items: center;
	padding: 5px;
`

const ColumnHeader = styled.div`
	border-bottom: 2px solid lightgrey;
`

const Card = styled.div`
	display: flex;
	flex-direction: column;
	padding: 5px;
	width: calc(100% - 10px);
	border-radius: 3px;
	border: 1px solid lightgrey;
`
const colors = {
	'Application, AP-Fin-spons': 'red',
	'Key Conference Dates': 'lightblue',
	'Finance': 'green',
	'Publicity/Website': 'red',
	'IntEvents': 'red',
	'Article/Review process': 'red',
	'Technical Program': 'red',
	'Venue/Registration': 'red',
	'Proceedings': 'red',
	'Social': 'red',
}

const timelineModes = {
	'weeks': [7, 14, 21, 28, 35],
	'year': [31, 93, 186, 365],
	'complete': []
}


export const CardTimeline = ({cards}) => {
	console.log(cards)
	const [mode, setMode] = useState('year')
	const renderColumn = (column) => {
		return (
			<Column>
				<ColumnHeader>
					<h3>
						test
					</h3>
				</ColumnHeader>
				{column.map(card => (
					<Card>
						<h3>{card.name}</h3>
						<p>Due: {card.due}</p>
					</Card>
				))}
			</Column>
		)
	}

	const renderColumns = () => {
		const columns = []
		const edgeValues = timelineModes[mode] 
		let currentColumn = 0
		const todayTimestamp = new Date(Date.now()).valueOf()
		let newColumn = []
		for(const card of cards) {
			console.log(card)
			if(currentColumn >= edgeValues.length) {
				break
			}

			else if (
				new Date(card.due).valueOf() - todayTimestamp > 
				1000 * 3600 * 24 * timelineModes[mode][currentColumn]) {
					columns.push(newColumn)
					console.log('fdf')
					newColumn = [card]
					currentColumn ++
			} else {
				newColumn.push(card)
			}
		}
		return (
			<Container>
				{columns.map(col => (
					renderColumn(col)
				))}
			</Container>
		)
	}

	return (
		<Container>
			{renderColumns()}
		</Container>
	)
}

export default CardTimeline