package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JpaPriceRepository : JpaRepository<Price, String>
