
var jcrop, selection

// Add and remove the jcrop overlay for selecting a region to capture
var overlay = ((active) => (state) => {
  active = typeof state === 'boolean' ? state : state === null ? active : !active
  $('.jcrop-holder')[active ? 'show' : 'hide']()
  chrome.runtime.sendMessage({message: 'active', active})
})(false)

// Creates an image to be used for the jcrop selection interaction
var image = (done) => {
  console.log("make fake image")
  var image = new Image()
  image.id = 'fake-image'
  image.src = chrome.runtime.getURL('/images/pixel.png')
  image.onload = () => {
    $('body').append(image)
    done()
  }
}

// Selection logic, updated jcrop selection details
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
    console.log("Initializing Jcrop selection logic.")
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

// Capture logic: send captured parameters to the background and clear the overlay and stored parameters 
var capture = () => {
  console.log(`Capturing jcrop selection at ${selection} and disabling jcrop overlay.`)
  jcrop.release()
  setTimeout(() => {
    chrome.runtime.sendMessage({
      message: 'capture', area: selection, dpr: devicePixelRatio
    }, (res) => {
      overlay(false)
      selection = null
      doOCR(res.image)
    })
  }, 50)
}

// Run OCR {Character Recognition} on the image selection, and notify the user of the result
const doOCR = async (image) => {
  console.log("Running OCR on the image capture")

  const { createWorker } = Tesseract;
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(image);
  console.log(`OCR completed, result text: ${text}`);
  alert(text);
  await worker.terminate();
}

// Cancel the jcrop overlay & capture when the window is resized
window.addEventListener('resize', ((timeout) => () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    jcrop.destroy()
    init(() => overlay(null))
  }, 100)
})())

// Listen for a initialization message from the background process
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'init') {
    console.log("Preparing for image capture")
    res({}) // prevent re-injecting

    if (!jcrop) {
      image(() => init(() => {
        console.log("This is the first capture run on the page. \
          Injections completed and JCrop initialized successfully.")
        overlay()
        capture()
      }))
    }
    else {
      console.log("This is not the first capture on this page. Initialization skipped.")
      overlay()
      capture()
    }
  }
  return true
})
