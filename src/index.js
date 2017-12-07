import 'whatwg-fetch'
import './styles/index'

import './scripts/countdown'
import * as api from './scripts/api'

import num from 'numeral'

import countries from './scripts/countries'

const restrictedCoutries = [
  'China',
  'South Korea',
  'United States',
  'United States Minor Outlying Islands',
  'Canada',
  'Australia',
  'New Zealand'
]

const form2Json = form =>
  Array.from(form.querySelectorAll('[name]')).reduce((acc, {name, value}) => {
    acc[name] = value
    return acc
  }, {})

const validateEmail = form => {
  const email = form.querySelector('#email')
  email &&
    email.addEventListener('change', e => {
      if (!email.validity.valid) {
        email.classList.add('error')
      }
    })
}

const validateAmount = form => {
  const amount = form.querySelector('#amount')
  amount &&
    amount.addEventListener('keypress', e => {
      if (e.which < 48 || e.which > 57) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    })
}

const validate = form => {
  const inputs = form.querySelectorAll('[name]')
  const invalidFields = Array.from(inputs).filter(x => !x.value)
  invalidFields.forEach(x => {
    x.classList.add('error')
  })

  return (
    invalidFields.length === 0 && form.querySelector('#email').validity.valid
  )
}

const attachValidateHandler = form => {
  form.querySelectorAll('[name]').forEach(x =>
    x.addEventListener('change', e => {
      if (e.currentTarget.value) {
        x.classList.remove('error')
      }
    })
  )
  validateEmail(form)
  validateAmount(form)
}

const convert = (amount, asset) => {
  api.convert({from: 'LKK2Y', amount: amount, to: asset}).then(res => {
    document.querySelector('#totalAmount').textContent = `${num(
      res.amount
    ).format('0[.]00')} ${res.asset}`
  })
}

window.onload = () => {
  document.querySelector('body').classList.add('loaded')

  document.querySelectorAll('.form-control').forEach(x =>
    x.addEventListener('change', e => {
      e.currentTarget.value && x.classList.add('form-control--focus')
    })
  )

  const frmWhitelist = document.querySelector('#frmWhitelist')
  frmWhitelist && attachValidateHandler(frmWhitelist)
  const frmSubscribe = document.querySelector('#frmSubscribe')
  frmSubscribe && attachValidateHandler(frmSubscribe)

  if (frmWhitelist) {
    document.querySelector('#amount').addEventListener('input', e => {
      const amount = Number(e.currentTarget.value) || 0
      const asset = document.querySelector('#currency').value
      convert(amount, asset)
    })

    document.querySelector('#currency').addEventListener('change', e => {
      const amount = Number(document.querySelector('#amount').value) || 0
      const asset = e.currentTarget.value
      convert(amount, asset)
    })

    const filteredCountries = countries
      .map(x => x.name)
      .filter(x => restrictedCoutries.indexOf(x) < 0)
      .map(x => `<option value="${x}">${x}</option>`)

    document.querySelector('#country').innerHTML = [
      `<option value="" selected hidden></option>`,
      ...filteredCountries
    ]

    document.querySelector('#btnWhitelist').addEventListener('click', e => {
      e.preventDefault()
      if (validate(frmWhitelist)) {
        const json = form2Json(frmWhitelist)
        api
          .order(json)
          .then(() =>
            location.replace(
              `thankyou.html?${location.search}&a=${btoa(JSON.stringify(json))}`
            )
          )
          .catch(error => console.error(error))
      }
    })
  }

  if (frmSubscribe) {
    document.querySelector('#btnSubscribe').addEventListener('click', e => {
      e.preventDefault()
      if (validate(frmSubscribe)) {
        api
          .subscribe(form2Json(frmSubscribe))
          .then(resp => {
            document.querySelector('#subscribeResult').style.display = 'block'
          })
          .catch(error => console.error(error))
      }
    })
  }
}
