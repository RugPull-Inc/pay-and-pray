package edu.faculty.aseca.pay_and_pray_api.user

interface UserService {
    fun createUser(email: String, plainPassword: String): User
    fun findByEmail(email: String): User?
}