from fastapi import FastAPI, UploadFile, File
import librosa
import numpy as np

app = FastAPI()

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    # read the uploaded file and temp save it
    with open("temp.wav", "wb") as f:
        f.write(await file.read())
    
    # analyze the audio file with librosa
    y, sr = librosa.load("temp.wav")
    
    # Extract pitch and tempo
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    #   Get the pitch with the highest magnitude
    pitch_idx = magnitudes.argmax()
    predicted_pitch = pitches.flatten()[pitch_idx]
    
    return {
        "status": "success",
        "detected_frequency": float(predicted_pitch),
        "tempo": float(librosa.beat.beat_track(y=y, sr=sr)[0]),
        #temp data
        "notes": ["C4", "E4", "G4"] 
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)