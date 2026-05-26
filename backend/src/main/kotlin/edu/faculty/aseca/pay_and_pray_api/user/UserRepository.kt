package edu.faculty.aseca.pay_and_pray_api.user

interface UserRepository {
    fun save(user: User): User

    fun findByEmail(email: String): User?
}
