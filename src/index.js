const express = require('express')
require('./db/mongoose')
const app = express()
const mongodb = require('mongodb')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const port = process.env.PORT || 3000
const Task = require('./models/task')
const User = require('./models/user')
// app.use((req, res, next) => {
//     res.status(503).send('Server is under maintenance')
// })
const id = new mongodb.ObjectId("5dbb166fc56c989de0cf90e9")
console.log(id.getTimestamp())
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('server on ', port)
})

// const main = async () => {
//     // const tasks = await Task.findById('5dba3cd380c1581c740f4a6a')
//     // await tasks.populate('owner').execPopulate()
//     // console.log(tasks.owner)
//     const user = await User.findById('5dba3bf87e8c8f397cd1bdcc')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()







// const pet = {
//     name: 'asdas'
// }

// pet.toJSON = function () {
//     console.log(this)
//     return this
// }

// console.log(JSON.stringify(pet))