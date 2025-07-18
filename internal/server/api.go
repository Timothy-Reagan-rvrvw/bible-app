package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type ApiResponse struct {
	Query       string  `json:"query"`
	Canonical   string  `json:"canonical"`
	Parsed      [][]int `json:"parsed"`
	PassageMeta []struct {
		Canonical    string `json:"canonical"`
		ChapterStart []int  `json:"chapter_start"`
		ChapterEnd   []int  `json:"chapter_end"`
		PrevVerse    int    `json:"prev_verse"`
		NextVerse    int    `json:"next_verse"`
		PrevChapter  []int  `json:"prev_chapter"`
		NextChapter  []int  `json:"next_chapter"`
	} `json:"passage_meta"`
	Passages []string `json:"passages"`
}

type SearchResponse struct {
	Page    int `json:"page"`
	Total   int `json:"total_results"`
	Results []struct {
		Referance string `json:"reference"`
		Content   string `json:"content"`
	} `json:"results"`
}

type Verse struct {
	Reference string `json:"reference"`
	Color     string `json:"color"`
}

type HighlightedVersesResponce struct {
	Verses []Verse `json:"verses"`
} // {verses: [{"reference": "v43003016","color": "bg-red-500"}]}

func HighlightedVersesHandler(w http.ResponseWriter, r *http.Request) {

	result := HighlightedVersesResponce{
		Verses: []Verse{
			Verse{Reference: "v43003016", Color: "bg-red-500"}},
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)

}

func SearchRequestHandler(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query()
	search := p.Get("search")
	page := 1
	pageSize := 20
	params := url.Values{}
	params.Add("q", search)
	params.Add("page", fmt.Sprintf("%d", page))
	params.Add("page-size", fmt.Sprintf("%d", pageSize))
	api_key := os.Getenv("API_KEY")
	baseURL := "https://api.esv.org/v3/passage/search/"
	urlWithParams := baseURL + "?" + params.Encode()

	// log.Println(urlWithParams)
	req, err := http.NewRequest("GET", urlWithParams, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	req.Header.Add("Authorization", "Token "+api_key)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	var result SearchResponse
	if err := json.Unmarshal(body, &result); err != nil { // Parse []byte to go struct pointer
		fmt.Println("Can not unmarshal JSON")
	}
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)

}

func ApiRequestHandler(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Query()
	verse := "John+3:16-21"
	numbers := "false"
	headings := "false"
	extras := "false"

	params := url.Values{}
	if len(p.Get("verse")) > 0 {
		verse = p.Get("verse")
	}
	if p.Get("numbers") == "true" {
		numbers = "true"
	}
	if p.Get("headings") == "true" {
		headings = "true"
	}
	if p.Get("extras") == "true" {
		extras = "true"
	}
	baseURL := "https://api.esv.org/v3/passage/html/"
	api_key := os.Getenv("API_KEY")
	params.Add("q", verse)
	params.Add("include-passage-references", "true")
	params.Add("include-verse-anchors", "true")
	params.Add("include-chapter-numbers", numbers)
	params.Add("include-verse-numbers", numbers)
	params.Add("include-headings", headings)
	params.Add("include-subheadings", headings)
	params.Add("include-footnotes", extras)
	params.Add("include-audio-link", extras)
	// Encode the query parameters and append them to the base URL

	urlWithParams := baseURL + "?" + params.Encode()

	// log.Println(urlWithParams)
	req, err := http.NewRequest("GET", urlWithParams, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	req.Header.Add("Authorization", "Token "+api_key)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	var result ApiResponse
	if err := json.Unmarshal(body, &result); err != nil { // Parse []byte to go struct pointer
		fmt.Println("Can not unmarshal JSON")
	}
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
	//w.Write([]byte("<html><head><meta charset=\"UTF-8\"></head><body>"))
	//for _, str := range result.Passages {
	//_, err := w.Write([]byte(str + "\n")) // Add newline for separation
	//if err != nil {
	//	http.Error(w, "Error writing to response", http.StatusInternalServerError)
	//	return
	//}
	// log.Println(str)
	//}
	//w.Write([]byte("</body></html>"))

}
