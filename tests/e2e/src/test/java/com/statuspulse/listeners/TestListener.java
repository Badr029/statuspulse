package com.statuspulse.listeners;

import com.fasterxml.jackson.core.JsonPointer;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

public class TestListener implements ITestListener {

    @Override
    public void onTestFailure(ITestResult result) {
        try {
            // Use reflection to grab the `driver` field from the failing test instance
            Object testInstance = result.getInstance();
            Field driverField = testInstance.getClass().getSuperclass().getDeclaredField("driver");
            driverField.setAccessible(true);
            WebDriver driver = (WebDriver) driverField.get(testInstance);

            if (driver == null) return;

            TakesScreenshot ts = (TakesScreenshot) driver;
            File source = ts.getScreenshotAs(OutputType.FILE);

            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String fileName = result.getName() + "_" + timestamp + ".png";

            Files.createDirectories(Paths.get("screenshots"));
            File destination = new File("screenshots/" + fileName);
            Files.copy(source.toPath(), destination.toPath());

            System.out.println("[TestListener] Screenshot saved: " + destination.getPath());

        } catch (NoSuchFieldException | IllegalAccessException | IOException e) {
            System.err.println("[TestListener] Failed to capture screenshot: " + e.getMessage());
        }
    }

    @Override
    public void onTestStart(ITestResult result) {
        System.out.println("[TestListener] Starting: " + result.getName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        System.out.println("[TestListener] PASSED: " + result.getName());
    }

    }
