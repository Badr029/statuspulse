package com.statuspulse.pages;

import com.statuspulse.utilities.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class DashboardPage {

    private final WebDriver driver;
    private final WaitUtils wait;

    private final By monitorCards = By.cssSelector("[data-testid=\"monitor-card\"]");
    private final By addMonitorButton = By.linkText("+ Add Monitor");

    public DashboardPage(WebDriver driver   ){
        this.driver = driver;
        this.wait = new WaitUtils(driver, 10);
    }

    public void open (String baseUrl){
        driver.get(baseUrl+"/dashboard");
        wait.waitForVisible(addMonitorButton);
    }

    public void clickAddMonitor(){
        wait.waitForVisible(addMonitorButton);
        driver.findElement(addMonitorButton).click();
    }

    public List<WebElement> getMonitorCards(){
        return driver.findElements(monitorCards);
    }

    public boolean hasMonitorWithName(String name){
     return getMonitorCards().stream().anyMatch(card -> card.getText().contains(name));
    }

    public WebElement getMonitorCardByName(String name){
        return getMonitorCards().stream()
                .filter(card -> card.getText().contains(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Monitor card not found: " + name));
    }

    public void clickPausedOnCard(String monitorName){
        WebElement card = getMonitorCardByName(monitorName);
        card.findElement(By.cssSelector("[data-testid=\"monitor-card-toggle\"]")).click();
    }

    public void clickDeleteOnCard(String monitorName){
        WebElement card = getMonitorCardByName(monitorName);
        card.findElement(By.cssSelector("[data-testid=\"monitor-card-delete\"]")).click();
    }

    public void clickViewOnCard(String monitorName){
        WebElement card = getMonitorCardByName(monitorName);
        card.findElement(By.cssSelector("[data-testid=\"monitor-card-view\"]")).click();
    }

    public void waitForMonitorToAppear(String name){
        wait.waitForCondition(d -> hasMonitorWithName(name));
    }

    public void waitForMonitorToDisappear(String name){
        wait.waitForCondition(d -> !hasMonitorWithName(name));
    }


}