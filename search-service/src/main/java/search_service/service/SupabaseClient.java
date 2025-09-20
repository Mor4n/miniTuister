package search_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.util.*;

@Component
public class SupabaseClient {
    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

        private final RestTemplate restTemplate;

        public SupabaseClient() {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(3000); // 3 segundos
            factory.setReadTimeout(3000);    // 3 segundos
            this.restTemplate = new RestTemplate(factory);
        }
    public List<Map<String, Object>> searchTable(String table, String column, String query) {
    // Usuarios cuyo username CONTENGA el texto buscado
    String url = supabaseUrl + "/rest/v1/" + table
    + "?select=*"
    + "&" + column + "=ilike." + query + "%";

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("Accept", "application/json");
        HttpEntity<String> entity = new HttpEntity<>(headers);
        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<?> rawList = response.getBody();
            List<Map<String, Object>> result = new ArrayList<>();
            if (rawList != null) {
                for (Object obj : rawList) {
                    if (obj instanceof Map) {
                        result.add((Map<String, Object>) obj);
                    }
                }
            }
            return result;
        } catch (Exception e) {
            System.err.println("[ERROR] Supabase request failed: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}
