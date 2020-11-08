const Card = require('../models/card')

const addNewCard = async (data) => {
	try {
		const {cardId, cardName, boardId, due_date, url, description, labels} = data
		const baseCard = await Card.findOne({cardName, boardId: 'base'})
		if (baseCard) {
			const card = await new Card({
				cardId,
				cardName,
				boardId,
				due_date,
				url,
				description,
				labels,
				difference: baseCard.difference,
				parent: baseCard.parent,
				children: baseCard.children
			}).save()
			return card
		} else {
			const card = await new Card({
				cardId,
				cardName,
				boardId,
				due_date,
				url,
				description,
				labels
			}).save()
			return card
		}
	} catch(err) {
		console.log(err)
		throw err
	}
}


// Adds a child to a parent
const addChildToParent = async (childName, parentName, boardId) => {
	try {
		const parentCard = await Card.findOne({ cardName: parentName, boardId })
		if(!parentCard.children.includes(childName)) {
			parentCard.children = [...parentCard.children, childName]
		}
		await parentCard.save()
		return 
	} catch(err) {
		throw err
	}
}


// Add parent to child, and remove the child from previous parent if applicable
const addParentToChild = async (childName, parentName, difference, boardId) => {
	try {
		const childCard = await Card.findOne({cardName: childName, boardId})
		childCard.difference = difference
		if(childCard.parent && childCard.parent !== parentName) {
			const previousParent = await Card.findOne({ cardName: childCard.parent, boardId })
			previousParent.children = previousParent.children.filter(name => name !== childName)
			await previousParent.save()
		}
		const newParent = await Card.findOne({cardName: parentName, boardId})
		childCard.parent = parentName
		if (newParent.due_date) {
			const timestamp = Date.parse(newParent.due_date)
			const childTimestamp = timestamp + 1000 * 3600 * 24 * 31 * difference
			const childDate = new Date(childTimestamp).toISOString()
			childCard.due_date = childDate
		}
		else {
			childCard.due_date = null

		}
		await childCard.save()
		return childCard
	} catch (err) {
		throw err
	}
}

const createCalendarLink = async (boardId, label) => {
	try {
		const cards = await Card.find({boardId})
		const versionProperty = new Property({name: 'VERSION', value: 2})
		let calendar
		calendar = new Component({name: 'VCALENDAR'})
		calendar = calendar.pushProperty(versionProperty)
		const calendarCards = []
		cards.forEach(card => {
			if(card.labels.includes(label) && card.due) {
				calendarCards.push(card)
				let event
				event = new Component({name: 'VEVENT'})
				const start = new Property({
					name: 'DTSTART',
					parameters: {VALUE: 'DATE'},
					value: new Date(card.due_date)
				})
				event = event.pushProperty(start)
				const duration = new Property({
					name: 'DURATION',
					value: 'PT1H'
				})
				event = event.pushProperty(duration)
				const description = new Property({
					name: 'DESCRIPTION',
					value: card.description
				})
				event = event.pushProperty(description)
				const url = new Property({
					name: 'URL',
					value: card.url
				})
				event = event.pushProperty(url)
				const title = new Property({
					name: 'SUMMARY',
					value: card.cardName
				})
				event = event.pushProperty(title)
				calendar = calendar.pushComponent(event)
			}
		})
		const blob = new Blob([calendar.toString()], {type: 'text/plain;charset=utf-8'})
		return blob
	} catch(err) {
		throw err
	}
}


module.exports = (app) => {
	app.post('/addParent', async (req, res) => {
		const { cardName, newParent, difference, boardId } = req.body
		try {
			await addChildToParent(cardName, newParent, boardId)
			const newChild = await addParentToChild(cardName, newParent, difference, boardId)
			return res.send({card: newChild})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/getcard', async (req, res) => {
		try {
			const { cardid, cardname, boardid } = req.query
			let card
			if(cardid) card = await Card.findOne({cardId: cardid})
			else card = await Card.findOne({ cardName: cardname, boardId: boardid })
			return res.send({card})
		} catch(err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/getboard', async (req, res) => {
		try { 
			const { boardid } = req.query
			const board = await Card.find({boardId: boardid})
			return res.send({ board })
		} catch(err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.post('/updatedate', async (req, res) => {
		try {
			const {cardId, due_date} = req.body
			const card = await Card.findOne({cardId})
			card.due_date = due_date

			await card.save()
			return res.status(200).send({message: 'OK'})
		} catch (err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
    app.post('/updatename', async (req, res) => {
			try {
				const {cardId, cardName} = req.body
				const card = await Card.findOne({cardId: cardId})
				const oldName = card.cardName
				console.log(oldName)
				if(card.parent) {
					const parentCard = await Card.findOne({boardId: card.boardId, cardName: card.parent})
					parentCard.children = [...parentCard.children.filter(child => child !== oldName), cardName]
					await parentCard.save()
				}
				card.cardName = cardName
				await Card.updateMany({parent: oldName}, {parent: cardName})
				await card.save()
				return res.send({card, message: 'ok'})
			} catch(err) {
				console.log(err)
				res.status(500).send({message: 'Internal Server Error.'})
			} 
	})
	app.post('/updatelabels', async (req, res) => {
		try {
			const {cardId, labels} = req.body
			const card = await Card.findOne({cardId})
			card.labels = labels
			await card.save()
			res.send({card, message: 'OK'})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error'})
		}
	})
	app.post('/updatedescription', async (req, res) => {
		try {
			const {cardId, description} = req.body
			const card = await Card.findOne({cardId})
			card.description = description
			await card.save()
			res.send({card, message: 'OK'})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error'})
		}
	})

	app.get('/setbase', async (req, res) => {
		try {
			const set = await Card.updateMany({}, {boardId: 'base', cardId: 'base', due_date: null})
			console.log(set)
			return res.send(set)
		} catch(err){
			res.status(500).send({message: 'Internal server error.'})
		}
	})

	app.delete('/deleteboard', async (req, res) => {
		try {
			const {boardid} = req.query
			const del  = await Card.deleteMany({boardId: boardid})
			return res.send({del })
		} catch (err) {
			res.status(500).send({message: 'Internal server error. '})
		}
	})

	app.put('/addcard', async (req, res) => {
		try { 
			const card = await addNewCard(req.body)
			return res.status(200).send({message: 'ok', card})
		} catch (err) { 
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/calendar', async (req, res) => {
		try {
			const {boardid, label} = req.query
			const blob = createCalendarLink(boardid, label)
			res.send(blob)
		} catch (err) {
			console.log(err) 
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
}
