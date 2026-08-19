package io.clouddesk.dashboard.interfaces;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.clouddesk.dashboard.application.GetDashboardSummaryService;
import io.clouddesk.dashboard.application.GetStorageTrendService;
import io.clouddesk.dashboard.domain.StorageTrendPointResponse;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final GetDashboardSummaryService getDashboardSummaryService;
    private final GetStorageTrendService getStorageTrendService;

    public DashboardController(
            GetDashboardSummaryService getDashboardSummaryService, GetStorageTrendService getStorageTrendService) {
        this.getDashboardSummaryService = getDashboardSummaryService;
        this.getStorageTrendService = getStorageTrendService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return DashboardSummaryResponse.from(getDashboardSummaryService.getSummary());
    }

    @GetMapping("/storage-trend")
    public List<StorageTrendPointResponse> storageTrend(@RequestParam(defaultValue = "30") int days) {
        return getStorageTrendService.getTrend(days).stream().map(StorageTrendPointResponse::from).toList();
    }
}
