package com.freelancehub.freelancehub.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueDataPoint(
        LocalDate date,
        BigDecimal amount
) {}
