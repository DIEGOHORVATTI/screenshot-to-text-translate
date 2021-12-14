
var jcrop, selection

var overlay = ((active) => (state) => {
  active = typeof state === 'boolean' ? state : state === null ? active : !active
  $('.jcrop-holder')[active ? 'show' : 'hide']()
  chrome.runtime.sendMessage({message: 'active', active})
})(false)

var image = (done) => {
  var image = new Image()
  image.id = 'fake-image'
  image.src = chrome.runtime.getURL('/images/pixel.png')
  image.onload = () => {
    $('body').append(image)
    done()
  }
}

var init = (done) => {
  $('#fake-image').Jcrop({
    bgColor: 'none',
    onSelect: (e) => {
      selection = e
      capture()
    },
    onChange: (e) => {
      selection = e
    },
    onRelease: (e) => {
      setTimeout(() => {
        selection = null
      }, 100)
    }
  }, function ready () {
    console.log("jcroping")
    jcrop = this

    $('.jcrop-hline, .jcrop-vline').css({
      backgroundImage: `url(${chrome.runtime.getURL('/images/Jcrop.gif')})`
    })

    if (selection) {
      jcrop.setSelect([
        selection.x, selection.y,
        selection.x2, selection.y2
      ])
    }

    done && done()
  })
}

var capture = () => {
  console.log("capturing")
  jcrop.release()
  setTimeout(() => {
    chrome.runtime.sendMessage({
      message: 'capture', area: selection, dpr: devicePixelRatio
    }, (res) => {
      overlay(false)
      selection = null
      process(res.image)
    })
  }, 50)
}

var process = (image) => {
  console.log(`Test: ${typeof(image)}, ${image.nodeName}`)
  console.log(image)
  // TODO process and image that's been captured
  doOCR(image)
}

const doOCR = async (image) => {
  console.log("doing ocr")
  const result = Object()
  console.log(`image ${typeof(image)}. result ${typeof(result)}`)

  const { createWorker } = Tesseract;
  const worker = createWorker();
  
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(image);
  console.log(text);
  result.innerHTML = `<p>OCR Result:</p><p>${text}</p>`;
  await worker.terminate();
}


window.addEventListener('resize', ((timeout) => () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    jcrop.destroy()
    init(() => overlay(null))
  }, 100)
})())

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'init') {
    res({}) // prevent re-injecting

    image(() => init(() => {
      overlay()
      capture()
    }))
  }
  return true
})
