import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  username: string;
  password: string;
}

interface DbSchema {
  users: User[]
}

interface User {
  username: string
  password: string
  firstname: string
  lastname: string
  balance: number
}

type LoginArgs = Pick<User, 'username' | 'password'>

app.post<any, any, LoginArgs>('/login',
  (req, res) => {

    const { username, password } = req.body
    // Use username and password to create token.
    const raw = fs.readFileSync('db.json', 'utf8')
    const db: DbSchema = JSON.parse(raw)
    const user = db.users.find(user => user.username === username)
    if (!user) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }

    const token = jwt.sign({ username: user.username }, SECRET)
    return res.status(200).json({
      message: 'Login succesfully',
      token: ({token})
    })
  })

app.post('/register',
  (req, res) => {

    const { username, password, firstname, lastname, balance } = req.body
    const raw = fs.readFileSync('db.json', 'utf8')
    const db: DbSchema = JSON.parse(raw)
    const hashPassword = bcrypt.hashSync(password, 10)
    const user = db.users.find(user => user.username === username)
    if(user){
      res.status(400)
      res.json({message:'Username is already in used'})
      return
    }
    db.users.push({
      username,
      password: hashPassword,
      firstname,
      lastname,
      balance,
    })
    fs.writeFileSync('db.json', JSON.stringify(db))
    res.json({ message: 'Register successfully' })



  })

app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const raw = fs.readFileSync('db.json', 'utf8')
      const db: DbSchema = JSON.parse(raw)
      //console.log(username)
      const user = db.users.find(user => user.username === username)
      const balance = user?.balance;
      res.status(200).json({
        name:({username}),
        balance:({balance})
      })
      
      //const balance = db.users[username] || []
    }
    catch (e) {
      //response in case of invalid token
      res.status(401)
      res.json({ message: 'Invalid token' })
    }
  })

type DepositArgs = Pick<User, 'balance'>

app.post<any,any,DepositArgs>('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {
    const token = req.query.token as string
    const {balance} = req.body 
    console.log(balance)
    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
    
    try{
      const { username } = jwt.verify(token, SECRET) as JWTPayload 
      const raw = fs.readFileSync('db.json', 'utf8')
      const db: DbSchema = JSON.parse(raw)
     
      // console.log(username)
      // console.log(balance)
      db.users.map(user => {
        if(user.username === username){
          // console.log(user.balance)
          // console.log(amount)
          //user.balance += amount

        }
      })
      const user = db.users.find(user => user.username === username)
      const balance = user?.balance
      //console.log(balance)
      // res.status(200).json({
      //   message:'Deposit successfully',
      //   balance:({balance})
      // })
      //fs.writeFileSync('db.json', JSON.stringify(db))
      // console.log(amount)
    }catch(e){
      res.status(401)
      res.json({ message: 'Invalid token' })
    }
    
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  const db = 
  fs.writeFileSync('db.json', JSON.stringify({"users": []}))
  
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  return res.status(200).json({
    firstname: 'Wisarud',
    lastname: 'Wongta',
    code: 620610808,
    gpa: 3.33
  })
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))