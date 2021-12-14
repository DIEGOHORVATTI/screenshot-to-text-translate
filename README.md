
# Screenshot To Text / Browser Extension
Turn any drag and drop selection to text by harnessing the power of OCR!

# Usage:
1. Click the extension
2. Drag and drop to place a box around the text you want to extract
3. The text will pop up in Alert box once the OCR completes!

# Usecases:
Great for extracting text from images with clear text. We needed this for a website with a lot of text in images, where some users need to extract text for translation to their primary language. This can easily be adjusted to read other languages, it's currently set to "eng" but could be changed in a minute. This also has potentially use for blind users with screenreaders, but it does not address the challenge of placing the selection in the correct part of the image. TesseractJS has a function that supports finding text coordinates within an image, so this is feasible.

# Supported Websites:
Currently does not run on most sites, since the OCR is run on the primary worker, which is consumed/restricted in most large sites. Works on:
- zingylearning.com (target site)
- google.com, docs.google.com, cloud.google.com (and other google domains)
- amazon.com, netflix.com
- youtube.com, espn.com
Not working on: yahoo, facebook, linkedin, github, etc


# Derived from

- Screenshot Capture, by Simeon Velichkov
    - [github]: https://github.com/simov/screenshot-capture
    - [paypal]: https://www.paypal.me/simeonvelichkov
- TesseractJS chrome extension, by Jerome Wu
    - [github]: https://github.com/jeromewu/tesseract.js-chrome-extension
    - [sponsor]: https://github.com/sponsors/jeromewu
