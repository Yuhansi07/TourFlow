package com.tourflow.backend.repository;

import com.tourflow.backend.entity.SiteStatus;
import com.tourflow.backend.entity.TouristSite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TouristSiteRepository
        extends JpaRepository<TouristSite, Long> {

    List<TouristSite> findByDistrictIgnoreCase(String district);

    List<TouristSite> findByStatus(SiteStatus status);
}