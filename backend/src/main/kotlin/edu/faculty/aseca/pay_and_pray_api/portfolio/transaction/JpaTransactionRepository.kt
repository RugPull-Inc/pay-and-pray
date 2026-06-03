package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface JpaTransactionRepository : JpaRepository<Transaction, UUID>
