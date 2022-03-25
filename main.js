const CHOICES = (
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  .replace(/[l1oO0]/g, '') // Some characters removed for readability
)

const arrayOfLength = length => new Array(length).fill()

export function generate() {
  const genChar = () => CHOICES[Math.floor(Math.random() * CHOICES.length)]
  return '§' + arrayOfLength(5).map(genChar).join('')
}