package com.tourflow.backend.service;

import com.tourflow.backend.entity.TouristSite;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TouristSiteService {

    private final TouristSiteRepository touristSiteRepository;

    public TouristSiteService(
            TouristSiteRepository touristSiteRepository) {

        this.touristSiteRepository = touristSiteRepository;
    }

    public TouristSite createSite(TouristSite touristSite) {
        validateVisitorCapacity(touristSite);

        touristSite.setId(null);

        return touristSiteRepository.save(touristSite);
    }

    public List<TouristSite> getAllSites() {
        return touristSiteRepository.findAll(
                Sort.by(Sort.Direction.ASC, "name")
        );
    }

    public TouristSite getSiteById(Long id) {
        return touristSiteRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tourist site not found with ID: " + id
                        )
                );
    }

    public TouristSite updateSite(
            Long id,
            TouristSite newSiteDetails) {

        validateVisitorCapacity(newSiteDetails);

        TouristSite existingSite = getSiteById(id);

        existingSite.setName(newSiteDetails.getName());
        existingSite.setDistrict(newSiteDetails.getDistrict());
        existingSite.setDescription(newSiteDetails.getDescription());
        existingSite.setDailyCapacity(
                newSiteDetails.getDailyCapacity()
        );
        existingSite.setCurrentVisitors(
                newSiteDetails.getCurrentVisitors()
        );
        existingSite.setStatus(newSiteDetails.getStatus());
        existingSite.setImageUrl(newSiteDetails.getImageUrl());

        return touristSiteRepository.save(existingSite);
    }

    public void deleteSite(Long id) {
        TouristSite existingSite = getSiteById(id);

        touristSiteRepository.delete(existingSite);
    }

    private void validateVisitorCapacity(TouristSite touristSite) {
        if (touristSite.getDailyCapacity() != null
                && touristSite.getCurrentVisitors() != null
                && touristSite.getCurrentVisitors()
                > touristSite.getDailyCapacity()) {

            throw new IllegalArgumentException(
                    "Current visitors cannot exceed daily capacity"
            );
        }
    }
}