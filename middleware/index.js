const admin = require('../config/firebase-config');

const {
	OAuth2Client
} = require('google-auth-library');
// const app = express();

// app.use(cors());
// app.use(middleware.decodeToken);


class Middleware {

	async verify(token) {
		const client = new OAuth2Client("1234567890-abc123def456.apps.googleusercontent.com");
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID
		});
		const payload = ticket.getPayload();
		const userid = payload['sub'];
		// If request specified a G Suite domain:
		// const domain = payload['hd'];
	}

	async decodeToken(req, res, next) {
		const token = req.headers.authorization.split(' ')[1];
		try {
			const decodeValue = await admin.auth().verifyIdToken(token);
			if (decodeValue) {
				return decodeValue;
			}
			return res.json({
				message: 'Un authorize'
			});
		} catch (e) {
			return res.json({
				message: e
			});
		}
	}

	// async parseJwt(req, res, next) {
	// 	try {
	// 		var decoded = jwtDecode(token)
	// 		if (decoded) {
	// 			return decoded;
	// 		}
	// 		return res.json({
	// 			message: 'Un authorize'
	// 		});
	// 	} catch (e) {
	// 		return res.json({
	// 			message: e
	// 		});
	// 	}
	// }


}

module.exports = new Middleware();