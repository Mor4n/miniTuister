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
        
        // Buscar en tabla profiles por username
        List<Map<String, Object>> profileResults = supabaseClient.searchTable("profiles", "username", query);
        System.out.println("[DEBUG] Resultados profiles por username: " + profileResults);
        for (Map<String, Object> p : profileResults) {
            String username = (String)p.get("username");
            String id = (String)p.get("id");
            if (username != null && id != null) {
                Map<String, Object> userObj = new HashMap<>();
                userObj.put("id", id);
                userObj.put("user_id", id);
                userObj.put("username", username);
                userObj.put("avatar_url", p.getOrDefault("avatar_url", null));
                userObj.put("full_name", p.getOrDefault("full_name", null));
                userObj.put("bio", p.getOrDefault("bio", null));
                userMap.put(id, userObj);
            }
        }
        
        // Buscar en tabla profiles por full_name
        List<Map<String, Object>> profileFullNameResults = supabaseClient.searchTable("profiles", "full_name", query);
        System.out.println("[DEBUG] Resultados profiles por full_name: " + profileFullNameResults);
        for (Map<String, Object> p : profileFullNameResults) {
            String username = (String)p.get("username");
            String id = (String)p.get("id");
            if (username != null && id != null && !userMap.containsKey(id)) {
                Map<String, Object> userObj = new HashMap<>();
                userObj.put("id", id);
                userObj.put("user_id", id);
                userObj.put("username", username);
                userObj.put("avatar_url", p.getOrDefault("avatar_url", null));
                userObj.put("full_name", p.getOrDefault("full_name", null));
                userObj.put("bio", p.getOrDefault("bio", null));
                userMap.put(id, userObj);
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
