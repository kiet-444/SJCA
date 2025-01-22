const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../controllers/User.controller'); // Model User của bạn
const jwt = require('jsonwebtoken');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    user = new User({
                        username: profile.displayName,
                        email,
                        isVerified: true, 
                        password: null,
                    });
                    await user.save();
                }

                const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

                return done(null, { user, token });
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
