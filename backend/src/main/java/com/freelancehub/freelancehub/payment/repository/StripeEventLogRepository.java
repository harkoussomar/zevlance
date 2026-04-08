package com.freelancehub.freelancehub.payment.repository;

import com.freelancehub.freelancehub.payment.domain.StripeEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StripeEventLogRepository extends JpaRepository<StripeEventLog, String> {}