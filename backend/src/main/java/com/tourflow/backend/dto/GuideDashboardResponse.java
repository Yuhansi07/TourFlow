package com.tourflow.backend.dto;

import java.util.List;

public record GuideDashboardResponse(
        long newRequests,
        long acceptedTours,
        long rejectedRequests,
        List<GuideRequestResponse> requests
) {}
