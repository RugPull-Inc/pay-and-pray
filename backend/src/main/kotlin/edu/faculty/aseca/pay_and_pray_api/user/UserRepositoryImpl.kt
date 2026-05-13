package edu.faculty.aseca.pay_and_pray_api.user

import org.springframework.stereotype.Component

@Component
class UserRepositoryImpl(private val jpa: JpaUserRepository) : UserRepository {
    override fun save(user: User): User = jpa.save(user)
    override fun findByEmail(email: String): User? = jpa.findByEmail(email)
}