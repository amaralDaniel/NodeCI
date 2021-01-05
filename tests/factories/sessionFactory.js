const Keygrip = require("keygrip");
const Buffer = require("safe-buffer").Buffer;

//require the keys
const keys = require("../../config/keys");

//generate a new keygrip instance
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id,
    },
  };

  //generate the session
  const session = Buffer.from(JSON.stringify(sessionObject)).toString(
    "base64"
  );

  //sign against the session
  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
