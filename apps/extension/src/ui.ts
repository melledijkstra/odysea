export function getMomentOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hours = new Date().getHours()
  let momentOfDay: 'morning' | 'afternoon' | 'evening'

  if (hours < 12) {
    momentOfDay = 'morning'
  }
  else if (hours < 18) {
    momentOfDay = 'afternoon'
  }
  else {
    momentOfDay = 'evening'
  }

  return momentOfDay
}
