package com.statuspulse.utilities;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigReader {

    private static Properties properties;

    static {
        try{
            String path = "src/test/resources/config.properties";
            FileInputStream input = new FileInputStream(path);
            properties = new Properties();
            properties.load(input);
            input.close();
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config.properties"+ e.getMessage());
        }
    }

    public static String get(String key){
        return properties.getProperty(key);
    }
    public static int getInt(String key){
        return Integer.parseInt(properties.getProperty(key));
    }
    public static boolean getBoolean(String key){
        return Boolean.parseBoolean(properties.getProperty(key));
    }
}