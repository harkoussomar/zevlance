package com.freelancehub.freelancehub.admin.dto;

import java.time.LocalDate;

public record UserGrowthDataPoint(
        LocalDate date,
        long users
) {}
