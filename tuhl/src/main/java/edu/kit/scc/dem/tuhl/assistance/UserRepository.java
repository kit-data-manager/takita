package edu.kit.scc.dem.tuhl.assistance;

import org.springframework.data.repository.CrudRepository;

/**
 * Stores User information in Repository, does not need an implementation.
 */
public interface UserRepository extends CrudRepository<User, String> {
//here you can create your own Queries, not necessary for us because the Queries
// we need already exist through Spring data JPA

}
