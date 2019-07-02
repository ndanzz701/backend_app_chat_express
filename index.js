const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
require('express-group-routes');
const app=express()
app.use(express.static('public'));
app.use(bodyParser.json())
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat'
})

const env='haysayang'

app.group("/api", (router) => {

    router.post('/login',(req,res)=>{
        const username = req.body.username
        const password = req.body.password
    
        connection.query(`SELECT * from login WHERE username="${username}" AND password="${password}"`, function (err, rows, fields) {
            if (err) throw err
            if(rows.length > 0){
              const id = rows[0].id
                const token = jwt.sign({id:id,username:username},env)
                res.send({id,"status":"success",username,token})
            }else{
                res.send({"status":"failed"})
            }
          })
        })
        
        router.get('/chats',expressJwt({secret:env}),(req,res)=>{
            connection.query(`SELECT list_chat.id,list_chat.message,login.username,list_chat.from_id FROM list_chat INNER JOIN login ON list_chat.from_id = login.id
            `, function (err, rows, fields) {
              if (err) throw err
              res.send(rows)
            })
        })
        router.post('/chats',expressJwt({secret:env}),(req,res)=>{
          const message = req.body.message
          const from_id = req.body.from_id
            connection.query(`INSERT INTO list_chat (message,from_id) VALUES ("${message}","${from_id}")`, function (err, rows, fields) {
              if (err) throw err
              res.send(rows)
            })
        })
        router.patch('/chats',expressJwt({secret:env}),(req,res)=>{
          const message = req.body.message
          const id = req.body.id
            connection.query(`UPDATE list_chat SET message="${message}" WHERE id=${id}`, function (err, rows, fields) {
              if (err) throw err
              res.send(rows)
            })
        })
        router.delete('/chats',expressJwt({secret:env}),(req,res)=>{
          const id = req.body.id
            connection.query(`DELETE FROM list_chat WHERE id=${id}`, function (err, rows, fields) {
              if (err) throw err
              res.send(rows)
            })
        })
  
});



app.listen('5000',()=>console.log("app running"))