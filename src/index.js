import './main.css'

const MS_PER_DAY = 86400000
const GOOGLE_ANALYTICS_DELAY_MS = 30

const EARTH_DAY_LIVE_URLS = {
  en: 'https://www.earthdaylive2020.org/?source=earthdaylivebanner',
  es: 'https://www.earthdaylive2020.org/es/?source=earthdaylivebanner',
  // de: 'https://www.earthdaylive2020.org/de/?source=earthdaylivebanner',
  // fr: 'https://www.earthdaylive2020.org/fr/?source=earthdaylivebanner',
  // nl: 'https://www.earthdaylive2020.org/nl/?source=earthdaylivebanner',
  // tr: 'https://www.earthdaylive2020.org/tr/?source=earthdaylivebanner',
  // pt: 'https://www.earthdaylive2020.org/pt/?source=earthdaylivebanner',
  // it: 'https://www.earthdaylive2020.org/it/?source=earthdaylivebanner',
}

const LOCALE_CODE_MAPPING = {
  en: 'en-EN',
  de: 'de-DE',
  es: 'es-ES',
  cs: 'cs-CZ',
  fr: 'fr-FR',
  nl: 'nl-NL',
  tr: 'tr-TR',
  pt: 'pt-BR',
  it: 'it-IT',
}

let isMaximizing = false
let language = 'en'

function maximize() {
  if (isMaximizing) return
  isMaximizing = true
  postMessage('maximize')
  const stickyheader = document.querySelector('.edl-header')
  stickyheader.style.display = 'none'

  const fullPage = document.querySelector('.edl-full-page')
  fullPage.style.display = 'flex'
}

function showCloseButtonOnFullPageWidget() {
  const fullPageWidget = document.querySelector('.edl-full-page')
  fullPageWidget.style.background = 'none'
  fullPageWidget.classList.add('show-close-button')

  const fullPageCloseButton = document.querySelector('.edl-full-page__close')
  fullPageCloseButton.style.display = 'flex'

  const fullPageCloseButtonContent = document.querySelector('.edl-close')
  fullPageCloseButtonContent.classList.add('edl-full-page-close')

  const fullPageheader = document.querySelector('.edl-full-page__header')
  fullPageheader.style.display = 'none'
}

function isTruthy(str) {
  return typeof(str) === 'undefined' || `${str}` === 'true' || `${str}` === '1'
}

function parseQuery(queryString) {
  var query = {}
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

function postMessage(action, data) {
  data || (data = {})
  data.action = action
  data.EARTH_DAY_LIVE = true
  window.parent.postMessage(data, '*')
}

function handleCloseButtonClick(event) {
  event.preventDefault()
  event.stopPropagation()

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('closeButtonClicked')
  }, GOOGLE_ANALYTICS_DELAY_MS)
}

function handleJoinEDLButtonClick(event) {
  event.preventDefault()
  event.stopPropagation()

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('buttonClicked', { linkUrl: EARTH_DAY_LIVE_URLS[language] })
  }, GOOGLE_ANALYTICS_DELAY_MS)
}

function setEarthDayLiveLinkUrl(selector) {
  const element = document.querySelector(selector)
  element.setAttribute('href', EARTH_DAY_LIVE_URLS[language])
}

function attachEvent(selector, event, callback) {
  var elements = document.querySelectorAll(selector)
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(event, callback)
  }
}

function initGoogleAnalytics() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga')

  if (typeof window.ga !== 'undefined') {
    window.ga('create', 'UA-162257314-2', 'auto')
    window.ga('send', 'pageview')
  }
}

function addTrackingEvents(hostname, forceFullPageWidget) {
  attachEvent('.edl-header .edl-link', 'click', () => trackEvent('header-join-button', 'click', hostname))
  attachEvent('.edl-header .edl-close', 'click', () => trackEvent('header-close-button', 'click', hostname))
  attachEvent('.edl-full-page .edl-link', 'click', () => trackEvent('full-page-join-button', 'click', hostname))
  attachEvent('.edl-full-page .edl-close', 'click', () => trackEvent('full-page-close-button', 'click', hostname))

  if (forceFullPageWidget) {
    trackEvent('full-page-widget', 'load', hostname)
  } else {
    trackEvent('header-widget', 'load', hostname)
  }
}

function trackEvent(category, action, label, value) {
  if (!window.ga) return

  const params = {
    hitType: 'event',
    eventCategory: category,
    eventAction: action
  }

  if (label) {
    params.eventLabel = label
  }

  if (value) {
    params.eventValue = value
  }
  window.ga('send', params)
}

function todayIs(date) {
  var today = new Date()
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
}

function getFormattedDate(date, language) {
  return date.toLocaleDateString(LOCALE_CODE_MAPPING[language], { day: 'numeric', month: 'long' })
}

function appendPartnerReferrerToUrls(partnerReferrer) {
  if (!partnerReferrer) return

  for (let language in EARTH_DAY_LIVE_URLS) {
    EARTH_DAY_LIVE_URLS[language] += '&referrer=' + partnerReferrer
  }
}

function initializeInterface() {
  const query = parseQuery(location.search)
  const fullPageDisplayStartDate = new Date(Date.parse(query.fullPageDisplayStartDate))
  const fullPageDisplayStopDate = new Date(fullPageDisplayStartDate.getTime() + MS_PER_DAY)
  const isFullPage = query.forceFullPageWidget || todayIs(fullPageDisplayStartDate)

  appendPartnerReferrerToUrls(query.partnerReferrer || null)

  setEarthDayLiveLinkUrl('.edl-header .edl-link__wrapper .edl-link')
  setEarthDayLiveLinkUrl('.edl-header .edl-link__wrapper .edl-link__icon')
  setEarthDayLiveLinkUrl('.edl-header__logo')
  setEarthDayLiveLinkUrl('.edl-full-page .edl-link__wrapper .edl-link')
  setEarthDayLiveLinkUrl('.edl-full-page .edl-link__wrapper .edl-link__icon')
  setEarthDayLiveLinkUrl('.edl-full-page__logo')
  attachEvent('.edl-close', 'click', handleCloseButtonClick)
  attachEvent('.edl-link', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-link__icon', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-header__logo', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-full-page__logo', 'click', handleJoinEDLButtonClick)

  language = query.language ? query.language : language

  if (query.showCloseButtonOnFullPageWidget) {
    showCloseButtonOnFullPageWidget()
  }

  if (isTruthy(query.googleAnalytics) && !navigator.doNotTrack) {
    initGoogleAnalytics()
    addTrackingEvents(query.hostname, query.forceFullPageWidget)
  }

  if (isFullPage) {
    maximize()
  }

  // Set display dates on full-size widget
  var fullscreenDateString = getFormattedDate(fullPageDisplayStartDate, language)
  var nextDayDateString = getFormattedDate(fullPageDisplayStopDate, language)
  document.getElementById('edl-strike-date').innerText = fullscreenDateString
  document.getElementById('edl-tomorrow-date').innerText = nextDayDateString
}

document.addEventListener('DOMContentLoaded', initializeInterface)
