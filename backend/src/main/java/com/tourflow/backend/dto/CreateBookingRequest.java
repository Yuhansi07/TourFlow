package com.tourflow.backend.dto;

import jakarta.validation.constraints.*;
import java.time.*;

public record CreateBookingRequest(
    @NotNull Long siteId,
    @NotNull @FutureOrPresent LocalDate visitDate,
    @NotNull LocalTime visitTime,
    @NotNull @Min(1) Integer visitorCount
) {}
