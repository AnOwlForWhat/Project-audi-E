package main

import (
	"fmt"
	"net/http"
	"os"
	"project-audi-e/api-gateway/db"
	"project-audi-e/api-gateway/handlers"
)

func main() {
	// Initialize SQLite Database
	dbPath := "../data/audi-e.db"
	if err := db.InitDB(dbPath); err != nil {
		fmt.Printf("Error initializing database: %v\n", err)
		os.Exit(1)
	}

	// Register Handlers
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/upload", handlers.UploadHandler)
	http.HandleFunc("/mode", handlers.ModeHandler)

	// Display current mode
	if handlers.IsPentestMode() {
		fmt.Println("==================================================")
		fmt.Println("[SECURITY WARNING] PENTEST MODE IS ACTIVE!")
		fmt.Println("Vulnerabilities (SQLi, File Upload) are enabled.")
		fmt.Println("==================================================")
	} else {
		fmt.Println("==================================================")
		fmt.Println("[SECURITY INFO] SECURE MODE IS ACTIVE.")
		fmt.Println("Security checks are enabled.")
		fmt.Println("==================================================")
	}

	port := ":8080"
	fmt.Printf("Go Backend running on port %s...\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}