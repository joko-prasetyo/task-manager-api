const User = require('../models/user')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcome, sendGoodbye } = require('../emails/account')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload JPG, JPEG, OR PNG file"))
        }

        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        sendWelcome(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async(req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) return res.status(404).send()
        return res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['name', 'age', 'password', 'email']
    const isValid = updates.every(update => allowed.includes(update))

    if(!isValid) return res.status(400).send({ error: 'Invalid updates!' })
    try {
        updates.forEach(element => req.user[element] = req.body[element])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const user = req.user
    try {
        await req.user.delete()
        sendGoodbye(user.email, user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        await user.save()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    const user = await User.findById(req.params.id)
    try {
        if(!user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }


})

router.delete('/users/me/avatar', auth, async (req, res) => {
    if(!req.user.avatar) return res.status(404).send()
    req.user.avatar = undefined
    try {
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router