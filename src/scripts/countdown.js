import * as api from './api'
import num from 'numeral'
import 'numeral/locales'

const knownLocales = [
  'bg',
  'chs',
  'cs',
  'da-dk',
  'de-ch',
  'de',
  'en-au',
  'en-gb',
  'en-za',
  'es-es',
  'es',
  'et',
  'fi',
  'fr-ca',
  'fr-ch',
  'fr',
  'hu',
  'it',
  'ja',
  'lv',
  'nl-be',
  'nl-nl',
  'no',
  'pl',
  'pt-br',
  'pt-pt',
  'ru-ua',
  'ru',
  'sk',
  'sl',
  'th',
  'tr',
  'uk-ua',
  'vi'
]

const lang =
  (window.navigator.languages && window.navigator.languages[0]) ||
  window.navigator.userLanguage ||
  window.navigator.language

num.locale(knownLocales.find(x => x.toLowerCase() === lang.toLowerCase()))

function getTimeRemaining (endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date())
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))
  return {
    total: t,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  }
}

function initializeClock (clock, endtime) {
  var daysSpan = clock.querySelector('.days')
  var hoursSpan = clock.querySelector('.hours')
  var minutesSpan = clock.querySelector('.minutes')
  var secondsSpan = clock.querySelector('.seconds')

  function updateClock () {
    var t = getTimeRemaining(endtime)

    daysSpan.innerHTML = t.days
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2)
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2)
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2)

    if (t.total <= 0) {
      clearInterval(timeinterval)
      daysSpan.innerHTML = '0'
      hoursSpan.innerHTML = '00'
      minutesSpan.innerHTML = '00'
      secondsSpan.innerHTML = '00'
    }
  }

  updateClock()
  var timeinterval = setInterval(updateClock, 1000)
}

api.info().then(info => {
  const clock = document.querySelector('#countdown')
  clock && initializeClock(clock, new Date(Math.max(Date.now(), info.startDate * 1000)))

  const fundsReceived = document.querySelector('#fundsReceived')
  if (fundsReceived) {
    fundsReceived.textContent = num(info.fundsTotal).format('(0,0[.]00)')
  }
})
