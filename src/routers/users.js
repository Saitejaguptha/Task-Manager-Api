const express = require("express");
const User = require("../models/users.js");
const auth = require("../middleware/auth.js");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const { sendmail } = require("../Emails/accounts.js");

const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
      return cb(new Error("Please upload a jpg/jpeg format file."));
    }
    cb(null, true);
  },
});

const errorMiddleWare = (req, res, next) => {
  throw new Error("From the Middleware");
};

router.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  const Subject = "Created A New Users";
  const body = "Created A New user Successfully";

  try {
    await user.save();
    try {
      await sendmail(user.email, user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const Subject = `Logged In ${user.name}`;
    const body = `Logged In the ${user.name} user Successfully`;

    try {
      await sendmail(user.email, user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    const Subject = `Logged out ${req.user.name}`;
    const body = `Logged out ${req.user.name} successfully.`;

    try {
      await sendmail(req.user.email, req.user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    res.send();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    const Subject = `Logged out All Logins ${req.user.name}`;
    const body = `Logged out All Instances for ${req.user.name} successfully.`;

    try {
      await sendmail(req.user.email, req.user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    res.send();
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    const Subject = `Deleted The User ${req.user.name}`;
    const body = `Deleted the ${req.user.name} user Successfully from the Task Manager API`;

    try {
      await sendmail(req.user.email, req.user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const Subject = `Added A Avatar For User ${req.user.name}`;
      const body = `Added The Avatar  For ${req.user.name} user Successfully`;

      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.status(200).send("Upload Done");
      try {
        await sendmail(req.user.email, req.user.name, Subject, body);
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    const Subject = `Deleted A Avatar For User ${req.user.name}`;
    const body = `Deleted The Avatar  For ${req.user.name} user Successfully`;
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
    try {
      await sendmail(req.user.email, req.user.name, Subject, body);
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }
  } catch (e) {
    res.status(404).send({ error: e.message });
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      return res.status(404).send({ error: "No avatar found" });
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send({ error: e.message });
  }
});

module.exports = router;
