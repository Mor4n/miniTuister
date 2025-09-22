package search_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import search_service.model.TweetResult;
import java.util.*;

@Service
public class SearchService {

    @Autowired
    private SupabaseClient supabaseClient;

    public List<Map<String, Object>> searchUsers(String query) {
        Map<String, Map<String, Object>> userMap = new LinkedHashMap<>();
        // Buscar en tabla users por username
        List<Map<String, Object>> userResults = supabaseClient.searchTable("users", "username", query);
        System.out.println("[DEBUG] Resultados users: " + userResults);
        for (Map<String, Object> u : userResults) {
            String username = (String)u.get("username");
            String id = (String)u.get("id");
            if (username != null && id != null && !userMap.containsKey(username)) {
                Map<String, Object> userObj = new HashMap<>();
                userObj.put("user_id", id);
                userObj.put("username", username);
                userObj.put("avatar", u.getOrDefault("avatar", null));
                userMap.put(username, userObj);
            }
        }
        // Buscar en tabla profiles por username
        List<Map<String, Object>> profileResults = supabaseClient.searchTable("profiles", "username", query);
        System.out.println("[DEBUG] Resultados profiles: " + profileResults);
        for (Map<String, Object> p : profileResults) {
            String username = (String)p.get("username");
            String id = (String)p.get("id");
            if (username != null && id != null && !userMap.containsKey(username)) {
                Map<String, Object> userObj = new HashMap<>();
                userObj.put("user_id", id);
                userObj.put("username", username);
                userObj.put("avatar", p.getOrDefault("avatar_url", null));
                userMap.put(username, userObj);
            }
        }
        System.out.println("[DEBUG] Resultados finales: " + userMap.values());
        return new ArrayList<>(userMap.values());
    }

    public List<Map<String, Object>> searchTweets(String query) {
        System.out.println("[DEBUG] Query de búsqueda de tweets: '" + query + "'");
        if (query == null || query.trim().isEmpty()) {
            System.out.println("[DEBUG] Query vacío, devolviendo lista vacía");
            return new ArrayList<>();
        }
        
        // Usar el SupabaseClient para buscar tweets con JOIN de profiles
        List<Map<String, Object>> tweetResults = supabaseClient.searchTweetsWithUsernames(query);
        System.out.println("[DEBUG] Resultados de búsqueda de tweets: " + tweetResults);
        return tweetResults;
    }
}
