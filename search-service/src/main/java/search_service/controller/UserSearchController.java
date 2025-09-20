
package search_service.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import search_service.service.SearchService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
public class UserSearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping("/users")
    public List<Map<String, Object>> searchUsers(@RequestParam String query) {
        return searchService.searchUsers(query);
    }

    @GetMapping("/tweets")
    public List<Map<String, Object>> searchTweets(@RequestParam String query) {
        return searchService.searchTweets(query);
    }
}
