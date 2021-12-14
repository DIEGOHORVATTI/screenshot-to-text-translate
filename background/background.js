// Background processing, injects other content scripts for execution

// Helper for injecting scripts
function chromeInject(tab, filename, res){
  chrome.tabs.executeScript(tab.id, {file: filename, runAt: 'document_start'}, res)
} 

// Inject function/init function- sends a message for initialization and injects content scripts
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
   
    // OCR script
    chromeInject(tab, 'content/tesseract.min.js', () => {
      // Nesting content injection in tesseract injection to satisfy the dependency
      chromeInject(tab, 'content/content.js')
    })

    setTimeout(() => {
      console.log("init")
      chrome.tabs.sendMessage(tab.id, {message: 'init'})
    }, 100)
  }, 100)
}

// Initialize/run when the user clicks on the tab
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

// Add a listener for capturing an image once the user completes area selection
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'capture') {
    console.log(`Capturing the selected region at: ${req.area}`)
    chrome.tabs.getSelected(null, (tab) => {

      chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, (image) => {
        // image is base64
        crop(image, req.area, req.dpr, "png", (cropped) => {
          res({message: 'image', image: cropped})
        })
      })
    })
  }
  return true
})

// Add a listener for toggling icon appearance and text for when selection is active
chrome.runtime.onMessage.addListener(() => {
  if (req.message === 'active') {
    if (req.active) {
      console.log("Extension Activated. Screen selection in progress")
      chrome.browserAction.setTitle({tabId: sender.tab.id, title: 'Crop'})
      chrome.browserAction.setBadgeText({tabId: sender.tab.id, text: '◩'})
    }
    else {
      console.log("Screen selection completed.")
      chrome.browserAction.setTitle({tabId: sender.tab.id, title: 'Screenshot Capture'})
      chrome.browserAction.setBadgeText({tabId: sender.tab.id, text: ''})
    }
  }
  return true
})

// Crop the image to the selected dimensions, calls done(image) on completion
function crop (image, area, dpr, format, done) {
  console.log("Cropping image to selected area.")
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
