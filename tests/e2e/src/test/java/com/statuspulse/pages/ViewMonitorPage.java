package com.statuspulse.pages;

import com.statuspulse.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class ViewMonitorPage {
    private final WebDriver driver;
    private final WaitUtils wait;

    private final By statusButton = By.cssSelector("[data-testid=\"monitor-detail-toggle\"]");
    private final By deleteButton = By.cssSelector("[data-testid=\"monitor-detail-delete\"]");
    private final By clearHistoryButton = By.cssSelector("[data-testid=\"monitor-detail-clear-history\"]");
    private final By editButton = By.cssSelector("[data-testid=\"monitor-detail-edit\"]");
    private final By editNameInput = By.cssSelector("[data-testid=\"monitor-edit-name\"]");
    private final By editUrlInput = By.cssSelector("[data-testid=\"monitor-edit-url\"]");
    private final By editSaveButton = By.cssSelector("[data-testid=\"monitor-edit-save\"]");
    private final By detailName = By.cssSelector("[data-testid=\"monitor-detail-name\"]");
    private final By detailUrl = By.cssSelector("[data-testid=\"monitor-detail-url\"]");
    private final By uptimeCard = By.cssSelector("[data-testid=\"summary-card\"][data-summary-label=\"Uptime\"]");

    public ViewMonitorPage(WebDriver driver){
        this.driver = driver;
        this.wait = new WaitUtils(driver, 10);
    }

    public void waitUntilLoaded(){
        wait.waitForVisible(statusButton);
    }

    public void clickStatusButton(){
        wait.waitForVisible(statusButton);
        driver.findElement(statusButton).click();
    }

    public void clickDelete(){
        wait.waitForVisible(deleteButton);
        driver.findElement(deleteButton).click();
    }

    public void clickClearHistory(){
        wait.waitForVisible(clearHistoryButton);
        driver.findElement(clearHistoryButton).click();
    }

    public void waitForHistoryToBeCleared(){
        wait.waitForCondition(d ->
                d.findElement(uptimeCard).getText().contains("N/A")
        );
    }

    public String getUptimeCardText(){
        return driver.findElement(uptimeCard).getText();
    }

    public String getStatusButtonText() {
        return driver.findElement(statusButton).getText();
    }

    public void waitForStatusButtonText(String expectedText) {
        wait.waitForCondition(d ->
                d.findElement(statusButton).getText().contains(expectedText)
        );
    }

    public void clickEdit(){
        wait.waitForVisible(editButton);
        driver.findElement(editButton).click();
    }

    public void updateName(String name){
        wait.waitForVisible(editNameInput);
        driver.findElement(editNameInput).clear();
        driver.findElement(editNameInput).sendKeys(name);
    }

    public void updateUrl(String url){
        wait.waitForVisible(editUrlInput);
        driver.findElement(editUrlInput).clear();
        driver.findElement(editUrlInput).sendKeys(url);
    }

    public void clickSaveEdit(){
        driver.findElement(editSaveButton).click();
    }

    public void waitForMonitorName(String expectedName){
        wait.waitForCondition(d ->
                d.findElement(detailName).getText().contains(expectedName)
        );
    }

    public String getMonitorName(){
        return driver.findElement(detailName).getText();
    }

    public String getMonitorUrl(){
        return driver.findElement(detailUrl).getText();
    }
}
