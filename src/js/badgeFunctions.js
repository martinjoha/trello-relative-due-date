const axios = require('axios')
const {updateChildren } = require('./boardFunctions')
export const generateBadgeText = (card) => {
  const beforeOrAfter = card.difference > 0 ? 'After' : 'Before'
  const isPlural = card.difference !== 1 ? 's' : ''
  return `${Math.abs(card.difference)} month${isPlural} ${beforeOrAfter} ${card.parent} `
}


const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'    

export const verifyCard = async (t) => {
  const trelloCard = await t.card('all')
  const list = await t.list('name')
  const board = await t.board('id')
  const listName = list.name
  const cardMetadata = await axios({
    url: `/getcard?cardid=${trelloCard.id}&boardid=${board.id}`
  })
  let relativeCard = cardMetadata.data.card
  if(!relativeCard) {
    const labels = trelloCard.labels.map(label => label.name)
    const description = trelloCard.desc
    relativeCard = await axios({
      method: 'PUT',
      url: '/addcard',
      data: {
        boardId: board.id,
        cardId: trelloCard.id,
        due_date: trelloCard.due,
        cardName: trelloCard.name,
        labels: labels,
        url: trelloCard.url,
        description,
        listName
      }
    })
    relativeCard = relativeCard.data.card
  }
  if(trelloCard.due !== relativeCard.due_date) {
    if(relativeCard.parent){
      const {cardId, due_date} = relativeCard
      const token = await t.getRestApi().getToken()
      await axios({
        method: 'PUT',
        url: `${BASE_URL}cards/${cardId}?key=${appKey}&token=${token}&due=${due_date}`
      })
      return
    }
    relativeCard.due_date = trelloCard.due
    await axios({
      method: 'POST',
      url: '/updatedate',
      data: {
        cardId: relativeCard.cardId,
        due_date: relativeCard.due_date,
        boardId: board.id
      }
    })
    const token = await t.getRestApi().getToken()

    const relativeBoard = await axios({
      url: `/getboard?boardid=${board.id}`
    })
    const relativeCards = relativeBoard.data.board
    console.log(relativeCard.cardName)
    console.log('test')
    await updateChildren(relativeCard, relativeCards, token)
  }

  if(trelloCard.name !== relativeCard.cardName) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatename',
      data: {
          cardId: relativeCard.cardId,
          cardName: trelloCard.name,
          boardId: relativeCard.boardId
      }
    })
  }
  const labels = trelloCard.labels.map(label => label.name)
  if(JSON.stringify(labels) !== JSON.stringify(relativeCard.labels)) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatelabels',
      data: {
        cardId: relativeCard.cardId,
        boardId: board.id,
        labels
      }
    })
  }
  if(trelloCard.desc !== relativeCard.description) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatedescription',
      data: {
        cardId: relativeCard.cardId,
        boardId: board.id,
        description: trelloCard.desc
      }
    })

    if(listName !== relativeCard.listName) {
      relativeCard = await axios({
        method: 'POST',
        url: '/updatelist',
        data: {
          cardId: relativeCard.cardId,
          boardId: board.id,
          listName
        }
      })
    }
  }


  if(relativeCard.parent) {
    return [{text: generateBadgeText(relativeCard)}]
  }

  return [{text: 'No dependencies'}]
}
