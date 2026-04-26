package com.example.pinkylab.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    Optional<Address> findByCountryAndStateAndStreetAddressAndCompanyNameAndZipCode(String country,
            String state, String streetAddress, String companyName, int zipCode);

}
