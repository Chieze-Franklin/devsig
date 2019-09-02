/*
event = {}
on key event:
  if active win is slack (or chrome with slack as title)
    if (event.lastType && event.lastType - now() > 30 seconds)
      event = {}
    else 
      event.lastType = now()
    if key is enter:
      if event.typing: // ensure shift + enter doesn't make this true
        message = { start: event.start, end: date, channel } //any way of knowing if its public or private?
        log(message)
        event.typing = false
    else:
      if !event.typing:
        event.typing = true
        event.start = date
 */
