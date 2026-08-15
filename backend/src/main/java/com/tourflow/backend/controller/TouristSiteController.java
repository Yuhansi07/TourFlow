package com.tourflow.backend.controller;

import com.tourflow.backend.entity.TouristSite;
import com.tourflow.backend.service.TouristSiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
public class TouristSiteController {

    private final TouristSiteService touristSiteService;

    public TouristSiteController(
            TouristSiteService touristSiteService) {

        this.touristSiteService = touristSiteService;
    }

    @PostMapping
    public ResponseEntity<TouristSite> createSite(
            @Valid @RequestBody TouristSite touristSite) {

        TouristSite createdSite =
                touristSiteService.createSite(touristSite);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdSite);
    }

    @GetMapping
    public ResponseEntity<List<TouristSite>> getAllSites() {
        return ResponseEntity.ok(
                touristSiteService.getAllSites()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TouristSite> getSiteById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                touristSiteService.getSiteById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TouristSite> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody TouristSite touristSite) {

        return ResponseEntity.ok(
                touristSiteService.updateSite(id, touristSite)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable Long id) {

        touristSiteService.deleteSite(id);

        return ResponseEntity.noContent().build();
    }
}
