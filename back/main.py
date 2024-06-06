import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
import pytesseract
from PIL import Image
import os
from fastapi.middleware.cors import CORSMiddleware
import nest_asyncio
from pyngrok import ngrok
import uvicorn

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ocr_image(image_path):
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        logger.debug(f"OCR successful for {image_path}")
        return text
    except Exception as e:
        logger.error(f"Error during OCR: {e}")
        return ""

@app.post("/upload")
async def upload_file(before: UploadFile = File(...), after: UploadFile = File(...)):
    if not allowed_file(before.filename) or not allowed_file(after.filename):
        raise HTTPException(status_code=400, detail="File not allowed")

    before_path = os.path.join(UPLOAD_FOLDER, before.filename)
    after_path = os.path.join(UPLOAD_FOLDER, after.filename)

    with open(before_path, "wb") as f:
        f.write(await before.read())
    with open(after_path, "wb") as f:
        f.write(await after.read())

    logger.debug(f"Saved before image to {before_path}")
    logger.debug(f"Saved after image to {after_path}")

    before_text = ocr_image(before_path)
    after_text = ocr_image(after_path)

    # Print the extracted text for debugging
    logger.debug("Before Image Text: %s", before_text)
    logger.debug("After Image Text: %s", after_text)

    if before_text != after_text:
        result = 'changed'
    else:
        result = 'no_change'

    return {
        "result": result,
        "before_text": before_text,
        "after_text": after_text
    }

if __name__ == "__main__":
    # Start ngrok tunnel
    ngrok.set_auth_token("2glUelop2JcU8XCTT4xhq0HsxtX_7GcjPCEYtCKkQaNiFsWY2")

    ngrok_tunnel = ngrok.connect(8000)
    print('Public URL:', ngrok_tunnel.public_url)
    
    # Apply nest_asyncio
    nest_asyncio.apply()
    
    # Run the FastAPI app with Uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
