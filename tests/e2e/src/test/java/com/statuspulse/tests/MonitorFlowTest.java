package com.statuspulse.tests;

import com.aventstack.extentreports.ExtentTest;
import com.statuspulse.base.BaseTest;
import com.statuspulse.pages.AddMonitorPage;
import com.statuspulse.pages.DashboardPage;
import com.statuspulse.pages.ViewMonitorPage;
import com.statuspulse.reports.ExtentReportManager;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import javax.management.monitor.Monitor;

public class MonitorFlowTest extends BaseTest {

    @BeforeClass
    public void setupReport() {
        ExtentReportManager.getInstance();
    }
    @AfterClass
    public void tearDownReport() {
        ExtentReportManager.flush();
    }

    @Test(priority = 1, description = "Adding a new monitor makes it appear on the dashboard")
    public void addMonitor_appearOnDashboard() {
        ExtentTest extentTest = ExtentReportManager.createTest("addMonitor_appearsOnDashboard");

        try {


            String monitorName = "E2E Test Monitor" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);

            Assert.assertTrue(
                    dashboard.hasMonitorWithName(monitorName),
                    "Newly created monitor should appear on the dashboard"
            );

            extentTest.pass("Newly created monitor should appear on the dashboard");

        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 2, description = "Submitting the add form with an invalid URL shows an error")
        public void addMonitor_invalidUrlShowsError() {
            ExtentTest extentTest = ExtentReportManager.createTest("addMonitor_invalidUrlShowsError");
            try {
                DashboardPage dashboard = new DashboardPage(driver);
                dashboard.open(baseUrl);
                dashboard.clickAddMonitor();

                AddMonitorPage addPage = new AddMonitorPage(driver);
                addPage.waitUntilLoaded();
                addPage.enterName("Bad URL Test");
                addPage.enterUrl("not A URL");
                addPage.clickCreate();

                Assert.assertTrue(
                        addPage.isErrorDisplayed(),
                        "Error message should be visible");

                extentTest.pass("Error message should be visible");
            }catch (Exception e){
                extentTest.fail("Test Failed : " + e.getMessage());
                throw e;
            }

        }
    @Test(priority = 3, description ="Pausing a monitor updates its status on the dashboard")
        public void pauseMonitor_updatesStatus(){
        ExtentTest extentTest = ExtentReportManager.createTest("pauseMonitor_updatesStatus");
        try {
            String monitorName = "Pause Test" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");
            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);

            dashboard.clickPausedOnCard(monitorName);

            dashboard.open(baseUrl);


            var card = dashboard.getMonitorCardByName(monitorName);

            Assert.assertTrue(
                    card.getText().contains("Resume"),
                    "Card should have 'Resume' button after pausing"
                    );

            extentTest.pass("Card should have 'Resume' button after pausing");

        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 4, description = "Deleting a monitor removes it from the dashboard")
    public void deleteMonitor_removesFromDashboard(){
        ExtentTest extentTest = ExtentReportManager.createTest("deleteMonitor_removesFromDashboard");
        String monitorName = "Delete Test" + System.currentTimeMillis();
        try {
            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");
            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);
            dashboard.clickDeleteOnCard(monitorName);

            driver.switchTo().alert().accept();

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToDisappear(monitorName);

            Assert.assertFalse(
                    dashboard.hasMonitorWithName(monitorName),
                    "Deleted monitor should not appear on the dashboard"
            );

            extentTest.pass("Deleted monitor should not appear on the dashboard");

        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 5, description = "Refreshing Add Monitor page keeps frontend UI")
    public void refreshingAddMonitorPageKeepsUI() {
        ExtentTest extentTest = ExtentReportManager.createTest("refreshingAddMonitorPageKeepsUI");
        try {
            driver.get(baseUrl + "/monitors/add");
            driver.navigate().refresh();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.waitUntilLoaded();

            Assert.assertTrue(
                    driver.findElement(By.cssSelector("[data-testid=\"add-monitor-page\"]")).isDisplayed()
                    , "Add Monitor page should be displayed"
            );

            extentTest.pass("Add Monitor page should be displayed");
        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 6, description = "Refreshing View Monitor page keeps frontend UI")
    public void refreshingViewMonitorPageKeepsUI(){
        ExtentTest extentTest= ExtentReportManager.createTest("refreshingViewMonitorPageKeepsUI");
        try {
            String monitorName = "Refresh Detail Page Test" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);
            dashboard.clickViewOnCard(monitorName);

            driver.navigate().refresh();

            Assert.assertTrue(
                    driver.findElement(By.cssSelector("[data-testid=\"monitor-detail-page\"]")).isDisplayed(),
                    "Monitor Detail UI should still be visible after refresh"
            );
            extentTest.pass("Monitor Detail UI should still be visible after refresh");
        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 7, description = "Clearing history on View Monitor page removes history")
    public void clearingHistoryOnViewPageRemovesHistory() {
        ExtentTest extentTest = ExtentReportManager.createTest("clearingHistoryOnViewMonitorPageRemovesHistory");
        try {
            String monitorName = "Clear History Test" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);
            dashboard.clickViewOnCard(monitorName);

            ViewMonitorPage viewPage = new ViewMonitorPage(driver);
            viewPage.waitUntilLoaded();

            viewPage.clickClearHistory();

            driver.switchTo().alert().accept();

            viewPage.waitForHistoryToBeCleared();

            Assert.assertTrue(
                    viewPage.getUptimeCardText().contains("N/A"),
                    "Uptime should show N/A after clearing history"
            );

            extentTest.pass("Uptime shows N/A after clearing history");
        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 8, description = "Deleting monitor on View Monitor page removes monitor")
    public void deleteMonitorOnViewPageRemovesMonitor (){
        ExtentTest extentTest = ExtentReportManager.createTest("deleteMonitorOnViewPageRemovesMonitor");
        try {
            String monitorName = "Delete Monitor Test From ViewPage" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);
            dashboard.clickViewOnCard(monitorName);

            ViewMonitorPage viewPage = new ViewMonitorPage(driver);
            viewPage.waitUntilLoaded();

            viewPage.clickDelete();

            driver.switchTo().alert().accept();

            dashboard.waitForMonitorToDisappear(monitorName);

            Assert.assertFalse(
                    dashboard.hasMonitorWithName(monitorName),
                    "Monitor should be deleted"
            );
            extentTest.pass("Monitor should be deleted");
        }catch (Exception e){
            extentTest.fail("Test Failed : " + e.getMessage());
            throw e;
        }
    }

    @Test(priority = 9, description = "Pausing/Resuming monitor on View Monitor page pauses/resumes monitor")
    public void pauseMonitorOnViewPagePauses(){
        ExtentTest extentTest = ExtentReportManager.createTest("pauseMonitorOnViewPagePauses");

        try {
            String monitorName = "Pause Monitor Test From ViewPage" + System.currentTimeMillis();

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(monitorName, "https://www.google.com");

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(monitorName);
            dashboard.clickViewOnCard(monitorName);

            ViewMonitorPage viewPage = new ViewMonitorPage(driver);
            viewPage.waitUntilLoaded();

            viewPage.clickStatusButton();
            viewPage.waitForStatusButtonText("Resume");

            Assert.assertTrue(
                    viewPage.getStatusButtonText().contains("Resume"),
                    "Status should be paused"
            );

            viewPage.clickStatusButton();
            viewPage.waitForStatusButtonText("Pause");
            Assert.assertTrue(
                    viewPage.getStatusButtonText().contains("Pause"),
                    "Status should be resumed"
            );

            extentTest.pass("Status button toggled between Pause and Resume");

        } catch (Throwable e) {
            extentTest.fail("Test Failed: " + e.getMessage());
            throw e;
        }

    }

    @Test(priority = 9, description = "Editing a monitor updates its details")
    public void editMonitor_updatesMonitorDetails() {
        ExtentTest extentTest = ExtentReportManager.createTest("editMonitor_updatesMonitorDetails");

        try {
            String originalName = "Edit Test " + System.currentTimeMillis();
            String updatedName = originalName + " Updated";
            String originalUrl = "https://www.google.com";
            String updatedUrl = "https://www.github.com";

            DashboardPage dashboard = new DashboardPage(driver);
            dashboard.open(baseUrl);
            dashboard.clickAddMonitor();

            AddMonitorPage addPage = new AddMonitorPage(driver);
            addPage.createMonitor(originalName, originalUrl);

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(originalName);
            dashboard.clickViewOnCard(originalName);

            ViewMonitorPage viewPage = new ViewMonitorPage(driver);
            viewPage.waitUntilLoaded();

            viewPage.clickEdit();
            viewPage.updateName(updatedName);
            viewPage.updateUrl(updatedUrl);
            viewPage.clickSaveEdit();

            viewPage.waitForMonitorName(updatedName);

            Assert.assertEquals(
                    viewPage.getMonitorName(),
                    updatedName,
                    "Monitor name should update on detail page"
            );

            Assert.assertEquals(
                    viewPage.getMonitorUrl(),
                    updatedUrl,
                    "Monitor URL should update on detail page"
            );

            dashboard.open(baseUrl);
            dashboard.waitForMonitorToAppear(updatedName);

            Assert.assertTrue(
                    dashboard.hasMonitorWithName(updatedName),
                    "Updated monitor name should appear on dashboard"
            );

            extentTest.pass("Editing a monitor updates detail page and dashboard");

        } catch (Throwable e) {
            extentTest.fail("Test Failed: " + e.getMessage());
            throw e;
        }
    }
}