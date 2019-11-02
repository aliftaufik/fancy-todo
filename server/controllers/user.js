const { User } = require('../models');
const passwordHandler = require('../helpers/passwordHandler');
const tokenHandler = require('../helpers/tokenHandler');
const googleVerify = require('../helpers/googleVerify');

class UserController {
	static verifyToken(req, res, next) {
		try {
			const payload = tokenHandler.decode(req.body.jwt_token);
			User.findById(payload.id)
				.then(user => {
					if (user) {
						res.status(200).json({});
					} else {
						throw 'tokenFailed';
					}
				})
				.catch(next);
		} catch (err) {
			next('tokenFailed');
		}
	}

	static getUser(req, res, next) {
		User.findById(req.body.id)
			.populate('todos')
			.then(user => {
				if (user) res.status(200).json(user);
				else throw 'userNotFound';
			})
			.catch(next);
	}

	static signin(req, res, next) {
		User.findOne({ username: req.body.username }).then(user => {
			if (user) {
				if (passwordHandler.verify(req.body.password, user.password)) {
					const token = tokenHandler.encode({
						id: user.id,
						username: user.username
					});
					res.status(200).json({
						jwt_token: token
					});
				} else {
					next('invalidSignin');
				}
			} else {
				next('invalidSignin');
			}
		});
	}

	static register(req, res, next) {
		User.create({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			todos: []
		})
			.then(user => {
				res.status(201).json(user);
			})
			.catch(next);
	}

	static googleSigning(req, res, next) {
		googleVerify(req.body.token)
			.then(payload => {
				console.log(payload);
			})
			.catch(next);
	}
}

module.exports = UserController;
