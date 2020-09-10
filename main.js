#!/usr/bin/env node

const CHOICES = (
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  .replace(/[l1oO0]/g, '') // Some characters removed for readability
)

let arrayOfSize = size => new Array(size).fill()

exports.generate = function() {
  let genChar = () => CHOICES[Math.floor(Math.random() * CHOICES.length)]
  return '§' + arrayOfSize(5).map(genChar).join('')
}