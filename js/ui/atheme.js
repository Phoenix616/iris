/**
 * Provides handling of Atheme login state in the client interface.
 * Configures the client when the user changes between logged in and out, and
 * provides checks to determine whether which it is in.
 */
 
qwebirc.ui.Atheme = {};

/* Records whether we're logged in (true), logged out (false), or our state is
 * unknown (null). We can't just check the cookie, as we need to handle the
 * case in which the results of checking the cookie for validity have not yet
 * come through. */
qwebirc.ui.Atheme.state = null;

/* Records our login credentials. */
qwebirc.ui.Atheme.user = null;
qwebirc.ui.Atheme.token = null;

/**
 * Handles an Atheme login.
 *
 * \param user The provided username.
 * \param token The user's given token.
 */
qwebirc.ui.Atheme.handleLogin = function(user, token) {

	/* Update state. */
	this.state = true;
	this.user = user;
	this.token = token;

	/* Set cookies. */
	Cookie.write("ircaccount", user, { duration: 0 });
	Cookie.write("ircauthcookie", token, { duration: 0 });
}

/**
 * Handle an Atheme logout.
 */
qwebirc.ui.Atheme.handleLogout = function() {
  
	/* Update state. */
	this.state = false;

	/* Delete cookies. */
	Cookie.dispose("ircaccount");
	Cookie.dispose("ircauthcookie");
}

/**
 * Check whether the user is currently logged in, and set the client up
 * accordingly.
 */
qwebirc.ui.Atheme.check = function() {

	/* If we have no previous state, try to get a user and token from
	 * cookies. */
        if (this.state == null) {
		this.user = Cookie.read("ircaccount");
		this.token = Cookie.read("ircauthcookie");
	}

	/* If we have a user and token, check them for validity. Otherwise,
	 * we're definitely logged out. */
	if (this.user && this.token) {
		qwebirc.irc.AthemeQuery.checkLogin(function(valid) {
		if (valid == null)
			this.state = null;
		else if (valid)
			this.handleLogin(this.user, this.token);
		else
			this.handleLogout();
		}.bind(this), this.user, this.token);
	}
	else
		this.handleLogout();
}
