/*
event = {}
on key event:
  if active win is slack (or chrome with slack as title)
    if key is enter:
      if event.typing:
        message = { start: event.start, end: date }
        log(message)
        event.typing = false
    else:
      if !event.typing:
        event.typing = true
        event.start = date
 */
