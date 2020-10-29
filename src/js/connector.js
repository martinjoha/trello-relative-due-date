const axios = require('axios')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'
const { checkBoard, updateChildren } = require('./boardFunctions')
const {verifyCard} = require('./badgeFunctions')

const openPopup = (t, opts) => {
  return t.popup({
    title: 'Cards',
    url: './popup.html'
  })
}

const showIframe = (t) => {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  })
}


window.TrelloPowerUp.initialize({
  'card-buttons': (t) => {
    return t.getRestApi()
      .isAuthorized()
      .then((isAuthorized) => {
        if (isAuthorized) {
          return [{
            text: 'Relative due date',
            callback: openPopup
          }];
        } else {
          return [{
            text: 'Relative due date',
            callback: showIframe
          }];
        }
      });
    },
  'card-badges': verifyCard,
  'board-buttons': async (t, opts) => {
      const isAuth = await t.getRestApi().isAuthorized()
      if(isAuth) {
        return [{
            text: 'Sync relative Due Dates',
            callback: checkBoard 
        }]
      } else {
        return [{
            text: 'Authorize Power up',
            callback: showIframe
        }]
      }
  },
  'on-enable': (t, opts) => {
    return t.modal({
      url: './board-form.html',
      height: 500,
      title: 'Welcome to the Trello template for IEEE Conferences'
    })
  }
},
{
  appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
