package search_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import search_service.service.SearchService;
import search_service.model.UserResult;
import search_service.model.TweetResult;
import java.util.*;

@RestController
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String query) {
        List<Map<String, Object>> users = searchService.searchUsers(query);
        List<TweetResult> tweets = searchService.searchTweets(query);
        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("tweets", tweets);
        return result;
    }
}
