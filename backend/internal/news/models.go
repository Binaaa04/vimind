package news

import "encoding/xml"

type NewsItem struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Link      string `json:"link"`
	Image     string `json:"image"`
	Source    string `json:"source"`
	Highlight string `json:"highlight"`
}

type RSS struct {
	XMLName xml.Name `xml:"rss"`
	Channel Channel  `xml:"channel"`
}

type Channel struct {
	Title string `xml:"title"`
	Items []Item `xml:"item"`
}

type Item struct {
	Title       string    `xml:"title"`
	Link        string    `xml:"link"`
	Description string    `xml:"description"`
	Content     string    `xml:"encoded"`
	PubDate     string    `xml:"pubDate"`
	Enclosure   Enclosure `xml:"enclosure"`
}

type Enclosure struct {
	URL string `xml:"url,attr"`
}
