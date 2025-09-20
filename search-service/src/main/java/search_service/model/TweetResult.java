package search_service.model;

public class TweetResult {
    private String content;
    private String author;

    public TweetResult(String content, String author) {
        this.content = content;
        this.author = author;
    }

    public String getContent() { return content; }
    public String getAuthor() { return author; }
}
