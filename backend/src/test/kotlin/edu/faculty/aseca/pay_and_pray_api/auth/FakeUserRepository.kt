package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.user.User
import edu.faculty.aseca.pay_and_pray_api.user.UserRepository
import java.util.UUID

class FakeUserRepository : UserRepository {
    private val store = mutableListOf<User>()

    override fun save(user: User): User = user.copy(id = UUID.randomUUID()).also { store.add(it) }
    override fun findByEmail(email: String): User? = store.find { it.email == email }
}