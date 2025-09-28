package search_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import search_service.service.SearchService;
import search_service.model.TweetResult;
import java.util.*;

@RestController
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String query) {
        List<Map<String, Object>> users = searchService.searchUsers(query);
        List<Map<String, Object>> tweetMaps = searchService.searchTweets(query);
        List<TweetResult> tweets = new ArrayList<>();
        for (Map<String, Object> t : tweetMaps) {
            String content = t.get("content") != null ? t.get("content").toString() : "";
            String author = t.get("username") != null ? t.get("username").toString() : (t.get("author") != null ? t.get("author").toString() : "");
            tweets.add(new TweetResult(content, author));
        }
        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("tweets", tweets);
        return result;
    }

    @GetMapping("/search/users")
    public List<Map<String, Object>> searchUsers(@RequestParam String query) {
        System.out.println("[DEBUG] Búsqueda de usuarios con query: " + query);
        List<Map<String, Object>> users = searchService.searchUsers(query);
        System.out.println("[DEBUG] Usuarios encontrados: " + users);
        return users;
    }

    @GetMapping("/search/tweets")
    public List<Map<String, Object>> searchTweets(@RequestParam String query) {
        System.out.println("[DEBUG] Búsqueda de tweets con query: " + query);
        return searchService.searchTweets(query);
    }
}
