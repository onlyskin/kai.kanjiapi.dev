// Scroll restoration for the hash router: following a link goes to the top,
// back and forward return to where you were on that page.

// Frames of unchanged page height that count as "the content has settled", and
// a backstop in case it never does.
const SETTLED_FRAMES = 30
const MAX_FRAMES = 600

const positions = new Map()

let currentKey = null
let currentSearch = null
let sawPopstate = false
let restoring = null

// Kept pure so the branches are testable without a DOM.
function nextAction({ wasPop, previousSearch, search, saved }) {
  if (wasPop) {
    return { type: 'restore', target: saved || 0 }
  }

  // 'more words' pushes a bigger wordlimit for the same kanji, and staying put
  // is the whole point of that link.
  if (previousSearch !== null && search === previousSearch) {
    return { type: 'stay' }
  }

  return { type: 'top' }
}

function savePosition() {
  // Ignore the scroll events our own restore generates.
  if (restoring !== null || currentKey === null) {
    return
  }

  positions.set(currentKey, window.scrollY)
}

function cancelRestore() {
  restoring = null
}

// Words arrive from the api after the route resolves, so the page is usually
// still too short to hold the saved offset. Keep re-applying it until either it
// sticks or the page stops growing, rather than for a fixed time: on a slow
// connection a deadline expires long before the content lands.
function restore(target) {
  const token = {}
  restoring = token

  let lastHeight = -1
  let settled = 0
  let frames = 0

  const step = () => {
    if (restoring !== token) {
      return
    }

    if (window.scrollY !== target) {
      window.scrollTo(0, target)
    }

    // Hold it until the height stops changing rather than stopping the moment
    // the offset is first reached: late-arriving content shifts the page under
    // us, and scroll anchoring then drags the offset away again.
    const height = document.documentElement.scrollHeight
    settled = height === lastHeight ? settled + 1 : 0
    lastHeight = height
    frames = frames + 1

    if (settled >= SETTLED_FRAMES || frames >= MAX_FRAMES) {
      restoring = null
      return
    }

    window.requestAnimationFrame(step)
  }

  step()
}

function routeChanged(path, search) {
  const action = nextAction({
    wasPop: sawPopstate,
    previousSearch: currentSearch,
    search,
    saved: positions.get(path),
  })

  sawPopstate = false
  currentKey = path
  currentSearch = search

  if (action.type === 'restore') {
    restore(action.target)
  } else if (action.type === 'top') {
    cancelRestore()
    window.scrollTo(0, 0)
  }
}

function init() {
  // Otherwise the browser restores the offset before mithril has rendered.
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  window.addEventListener('popstate', () => {
    sawPopstate = true
  })
  window.addEventListener('scroll', savePosition, { passive: true })
  for (const event of ['wheel', 'touchstart', 'keydown']) {
    window.addEventListener(event, cancelRestore, { passive: true })
  }
}

module.exports = {
  init,
  routeChanged,
  nextAction,
}
