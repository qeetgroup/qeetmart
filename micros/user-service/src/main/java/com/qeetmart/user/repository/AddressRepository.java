package com.qeetmart.user.repository;

import com.qeetmart.user.entity.Address;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByIdAsc(Long userId);

    Optional<Address> findByIdAndUserId(Long id, Long userId);

    Optional<Address> findFirstByUserIdOrderByIdAsc(Long userId);

    long countByUserId(Long userId);

    void deleteByUserId(Long userId);

    @Modifying
    @Query("update Address a set a.isDefault = false where a.userId = :userId")
    void clearDefaultForUser(@Param("userId") Long userId);

    @Modifying
    @Query("update Address a set a.isDefault = false where a.userId = :userId and a.id <> :addressId")
    void clearDefaultForUserExcluding(@Param("userId") Long userId, @Param("addressId") Long addressId);
}
