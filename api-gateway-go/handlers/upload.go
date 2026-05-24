package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/h2non/filetype"
)

type UploadResponse struct {
	Status   string `json:"status"`
	Message  string `json:"message"`
	FileName string `json:"file_name,omitempty"`
}

// UploadHandler handles file uploads (with Secure/Vulnerable modes)
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Limit upload size to 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	file, fileHeader, err := r.FormFile("audio")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "File too large or invalid request"})
		return
	}
	defer file.Close()

	uploadDir := "../data/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "Failed to create upload directory"})
		return
	}

	var savePath string
	var savedFileName string

	if IsPentestMode() {
		// VULNERABLE MODE:
		// 1. No file extension verification
		// 2. No Magic Bytes verification (any file type can be uploaded)
		// 3. Path Traversal: direct string concatenation allows saving files outside uploadDir
		savedFileName = fileHeader.Filename
		savePath = uploadDir + "/" + savedFileName
		fmt.Printf("[PENTEST_MODE: ACTIVE] Unsafe upload. Original filename: %s, Saving to: %s\n", savedFileName, savePath)
	} else {
		// SECURE MODE:
		// 1. Read first 261 bytes to check Magic Bytes
		head := make([]byte, 261)
		_, err = file.Read(head)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "Unable to read file head"})
			return
		}
		// Reset file read pointer after reading head
		if _, err = file.Seek(0, 0); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "File seek error"})
			return
		}

		// Verify if it is an audio file using magic bytes
		if !filetype.IsAudio(head) {
			w.WriteHeader(http.StatusUnsupportedMediaType)
			json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "Security Error: Uploaded file is not a valid audio file!"})
			return
		}

		// 2. Verify file extension
		ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if ext != ".mp3" && ext != ".wav" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "Security Error: Only .mp3 and .wav files are allowed!"})
			return
		}

		// 3. Rename file to UUID to prevent Path Traversal
		savedFileName = uuid.New().String() + ext
		savePath = filepath.Join(uploadDir, savedFileName)
		fmt.Printf("[SECURE_MODE: ACTIVE] Safe upload. Renamed to: %s\n", savedFileName)
	}

	// Create destination file
	out, err := os.Create(savePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: fmt.Sprintf("Failed to create file: %s", err.Error())})
		return
	}
	defer out.Close()

	// Copy uploaded file content
	_, err = io.Copy(out, file)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(UploadResponse{Status: "error", Message: "Failed to write file on server"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(UploadResponse{
		Status:   "success",
		Message:  "File uploaded successfully",
		FileName: savedFileName,
	})
}
