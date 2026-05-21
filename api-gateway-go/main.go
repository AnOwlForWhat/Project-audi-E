package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/h2non/filetype"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	// limit file size to 10MB
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)

	file, _, err := r.FormFile("audio")
	if err != nil {
		http.Error(w, "large file or invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// check	 file type
	head := make([]byte, 261)
	file.Read(head)
	file.Seek(0, 0) // Reset file pointer

	if !filetype.IsAudio(head) {
		http.Error(w, "not a valid audio file!", http.StatusUnsupportedMediaType)
		return
	}

	// 3. send to AI Service (Python)
	// Resty \\ http.Post)
	fmt.Println("save file, sending to AI Service...")
	
	// return dummy response for now
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprintf(w, `{"message": "analysis complete", "file_status": "Clean"}`)
}

func main() {
	http.HandleFunc("/upload", uploadHandler)
	fmt.Println("Go Backend running on port 8080...")
	http.ListenAndServe(":8080", nil)
}