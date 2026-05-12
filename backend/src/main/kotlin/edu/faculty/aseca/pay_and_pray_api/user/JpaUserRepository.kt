package edu.faculty.aseca.pay_and_pray_api.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface JpaUserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
}