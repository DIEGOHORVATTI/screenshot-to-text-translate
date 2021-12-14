

function chromeInject(tab, filename, res){
  chrome.tabs.executeScript(tab.id, {file: filename, runAt: 'document_start'}, res)
} 

function inject (tab) {
  chrome.tabs.sendMessage(tab.id, {message: 'init'}, (res) => {
    if (res) {
      clearTimeout(timeout)
    }
  })

  var timeout = setTimeout(() => {
    chrome.tabs.insertCSS(tab.id, {file: 'vendor/jquery.Jcrop.min.css', runAt: 'document_start'})
    chrome.tabs.insertCSS(tab.id, {file: 'css/content.css', runAt: 'document_start'})

    chromeInject(tab, 'vendor/jquery.min.js')
    chromeInject(tab, 'vendor/jquery.Jcrop.min.js')
   
    // OCR scripts
   // chromeInject(tab, 'content/worker.min.js', () => {
    chromeInject(tab, 'content/tesseract.min.js', () => {
   //     chromeInject(tab, 'content/tesseract-core.wasm.js', () => {
          chromeInject(tab, 'content/content.js')
   //     })
    })
  //  })

    setTimeout(() => {
      console.log("init")
      chrome.tabs.sendMessage(tab.id, {message: 'init'})
    }, 100)
  }, 100)
}

chrome.browserAction.onClicked.addListener((tab) => {
  inject(tab)
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'take-screenshot') {
    chrome.tabs.getSelected(null, (tab) => {
      inject(tab)
    })
  }
})

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'capture') {
    console.log("capture")
    chrome.tabs.getSelected(null, (tab) => {

      chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, (image) => {
        // image is base64
        crop(image, req.area, req.dpr, "png", (cropped) => {
          res({message: 'image', image: cropped})
        })
      })
    })
  }
  else if (req.message === 'active') {
    console.log("active")
    if (req.active) {
      chrome.browserAction.setTitle({tabId: sender.tab.id, title: 'Crop'})
      chrome.browserAction.setBadgeText({tabId: sender.tab.id, text: '◩'})
    }
    else {
      chrome.browserAction.setTitle({tabId: sender.tab.id, title: 'Screenshot Capture'})
      chrome.browserAction.setBadgeText({tabId: sender.tab.id, text: ''})
    }
  }
  return true
})

function crop (image, area, dpr, format, done) {
  console.log("crop")
  var top = area.y * dpr
  var left = area.x * dpr
  var width = area.w * dpr
  var height = area.h * dpr
  var w = width
  var h = height

  var canvas = null
  if (!canvas) {
    canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
  }
  canvas.width = w
  canvas.height = h

  var img = new Image()
  img.onload = () => {
    var context = canvas.getContext('2d')
    context.drawImage(img,
      left, top,
      width, height,
      0, 0,
      w, h
    )

    var cropped = canvas.toDataURL(`image/${format}`)
    done(cropped)
  }
  img.src = image
}
