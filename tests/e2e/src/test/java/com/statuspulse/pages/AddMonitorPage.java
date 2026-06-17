package com.statuspulse.pages;

import com.statuspulse.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AddMonitorPage {

    private final WebDriver driver;
    private final WaitUtils wait;

    private final By nameInput = By.name("name");
    private final By urlInput = By.name("url");
    private final By createButton = By.xpath("//button[contains(text(), 'Create Monitor')]");
    private final By errorMessage = By.cssSelector("[data-testid=\"add-monitor-error\"] ");

    public AddMonitorPage(WebDriver driver){
        this.driver = driver;
        this.wait = new WaitUtils(driver, 10);
    }

    public void waitUntilLoaded(){
        wait.waitForVisible(nameInput);
    }

    public void enterName(String name){
        driver.findElement(nameInput).clear();
        driver.findElement(nameInput).sendKeys(name);
    }

    public void enterUrl(String url){
        driver.findElement(urlInput).clear();
        driver.findElement(urlInput).sendKeys(url);
    }

    public void clickCreate(){
        driver.findElement(createButton).click();
    }
    public boolean isErrorDisplayed(){
        return !driver.findElements(errorMessage).isEmpty();
    }
    public String getErrorMessage(){
        return driver.findElement(errorMessage).getText();
    }

    public void createMonitor(String name, String url){
        waitUntilLoaded();
        enterName(name);
        enterUrl(url);
        clickCreate();
    }
}