package edu.kit.datamanager.takita.thesaurus;

import java.io.IOException;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;


/**
 * Interface for accessing any kind of conceptual thesaurus.
 */

public interface IThesaurusService {

    /**
     * Get the URL which is used to query this service.
     * 
     * In practice, this kind of information will be configured via the
     * application properties, but we could imagine having multiple
     * Thesauri, or dummy ones for testing, so the implementing classes
     * should keep track of this and then no longer rely on global
     * settings.
     *  
     * @return
     */
    String getQueryUrl();

    /**
     * Get a list of concepts using the "standard" search procedure
     * for the particular thesaurus. This can be whatever the implementor
     * deems reasonable – specifically it will probably correspond to 
     * one of the other kinds of search, which are part of this
     * interface.
     * 
     * @param term query term as String
     * @return list of concepts as JSONObject
     * @throws IOException
     * @throws InterruptedException
     * @throws JSONException
     */
    JSONObject search(String term) 
        throws IOException, InterruptedException, JSONException;


    /**
     * Gets a list of concepts which excactly match the query term.
     *
     * @param term query term as String
     * @return list of concepts as JSONObject
     * @throws JSONException if the response body could not be parsed to JSON
     * @throws IOException if an error occurs while sending or receiving
     * @throws InterruptedException if the get request is interrupted
     */
    JSONObject searchExact(String term)
        throws IOException, InterruptedException, JSONException;

    /**
     * Gets a list of concepts whose labels contain the query term.
     * 
     * @param term query term as String
     * @return list of concepts as JSONObject
     * @throws JSONException if the response body could not be parsed to JSON
     * @throws IOException if an error occurs while sending or receiving
     * @throws InterruptedException if the get request is interrupted
     */
    JSONObject searchFuzzy(String term) throws InterruptedException, IOException, JSONException;

    /**
     * TODO: Do we need methods to query for parent and/or child concepts of a given concept?
     */
}
