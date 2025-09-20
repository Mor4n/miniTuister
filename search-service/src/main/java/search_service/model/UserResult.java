package search_service.model;

public class UserResult {
    private String username;
    private String bio;

    public UserResult(String username, String bio) {
        this.username = username;
        this.bio = bio;
    }

    public String getUsername() { return username; }
    public String getBio() { return bio; }
}
