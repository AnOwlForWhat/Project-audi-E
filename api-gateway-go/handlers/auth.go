package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"project-audi-e/api-gateway/db"
	"sync"

	"golang.org/x/crypto/bcrypt"
)

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	User    string `json:"user,omitempty"`
}

var (
	pentestModeMutex   sync.RWMutex
	pentestModeEnabled bool = os.Getenv("PENTEST_MODE") == "true"
)

func IsPentestMode() bool {
	pentestModeMutex.RLock()
	defer pentestModeMutex.RUnlock()
	return pentestModeEnabled
}

func SetPentestMode(enabled bool) {
	pentestModeMutex.Lock()
	pentestModeEnabled = enabled
	pentestModeMutex.Unlock()
}

// RegisterHandler handles user registration
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
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

	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Invalid request body"})
		return
	}

	if req.Username == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Username and password are required"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Failed to hash password"})
		return
	}

	// Insert into DB (Standard safe parameterized insert)
	query := "INSERT INTO users (username, password) VALUES (?, ?)"
	_, err = db.DB.Exec(query, req.Username, string(hashedPassword))
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Username already exists"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{Status: "success", Message: "User registered successfully"})
}

// LoginHandler handles user authentication. Supports SQL Injection in Pentest Mode.
func LoginHandler(w http.ResponseWriter, r *http.Request) {
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

	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Invalid request body"})
		return
	}

	var dbUsername, dbPassword string
	var err error

	if IsPentestMode() {
		// VULNERABLE: Direct string concatenation -> SQL Injection vulnerability
		query := fmt.Sprintf("SELECT username, password FROM users WHERE username = '%s'", req.Username)
		fmt.Printf("[PENTEST_MODE: ACTIVE] Running vulnerable query: %s\n", query)

		// Note: We use DB.Query instead of QueryRow to handle multiple results if payload returns multiple rows
		rows, errQuery := db.DB.Query(query)
		if errQuery != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: fmt.Sprintf("Database error: %s", errQuery.Error())})
			return
		}
		defer rows.Close()

		if rows.Next() {
			err = rows.Scan(&dbUsername, &dbPassword)
		} else {
			err = sql.ErrNoRows
		}
	} else {
		// SECURE: Parameterized query
		query := "SELECT username, password FROM users WHERE username = ?"
		err = db.DB.QueryRow(query, req.Username).Scan(&dbUsername, &dbPassword)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Invalid credentials"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Internal server error"})
		return
	}

	// Verify password (in pentest mode, we bypass bcrypt verification if password is empty - common for SQLi union payloads)
	if IsPentestMode() && req.Password == "" {
		// If SQLi successfully bypassed check and username is populated, allow log in
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(AuthResponse{Status: "success", Message: "Logged in via SQL Injection bypass!", User: dbUsername})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(req.Password))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(AuthResponse{Status: "error", Message: "Invalid credentials"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(AuthResponse{Status: "success", Message: "Logged in successfully", User: dbUsername})
}

// ModeHandler gets or sets the dynamic pentest mode
func ModeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodGet {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"pentest_mode": IsPentestMode()})
		return
	}

	if r.Method == http.MethodPost {
		var req struct {
			PentestMode bool `json:"pentest_mode"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Invalid request body"})
			return
		}

		SetPentestMode(req.PentestMode)
		fmt.Printf("[SYSTEM] Dynamic Pentest Mode set to: %v\n", req.PentestMode)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "success",
			"pentest_mode": IsPentestMode(),
		})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
