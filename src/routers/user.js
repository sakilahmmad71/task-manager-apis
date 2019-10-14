const express = require("express");
const multer = require('multer');
const sharp = require('sharp');
const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeMail, sendCancelMail } = require('../emails/account');

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);  
  try {
    await user.save();
    sendWelcomeMail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token != req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return !token.token
      })
      await req.user.save()
      res.send()
    } catch (error) {
      res.status(500).send(error)
    }
})

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
  //   try {
  //     const users = await User.findOne({});
  //     res.send(users);
  //   } catch (error) {
  //     res.status(500).send(error);
  //   }
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["name", "email", "password", "age"];
  const isValidUpdate = updates.every(update => allowedUpdate.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid Update Property!" });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    // const user = await User.findByIdAndUpdate(_id, req.body, { new : true, runValidators : true })
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove()
    sendCancelMail(req.user.email, req.user.name)
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// file upload handeling
const upload = multer({
  limits : {
    fileSize : 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a image file'))
    } 
    cb(undefined, true)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width : 300, height : 300 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error : error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
      const user = await User.findById(req.params.id)

      if(!user || !user.avatar) {
          return new Error()
      }

      res.set('Content-Type', 'image/png')
      res.send(user.avatar)
    } catch (error) {
      res.status(404).send()
    }
})


module.exports = router;
