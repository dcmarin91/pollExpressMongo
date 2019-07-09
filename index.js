const express = require("express");
const mongoose = require('mongoose');
const cookieSession = require("cookie-session");
const app = express();

mongoose.connect("mongodb://localhost:27017/notes", { useNewUrlParser: true });

const PollSchema = mongoose.Schema({
    title: String,
    body: String
})

const Poll = mongoose.model("Poll", PollSchema);

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
    secret: "una_cadena_secreta",
    maxAge: 60*1000
}));

//Muestra la lista de encuestas
app.get("/", async (req, res) =>{
    const polls = await Poll.find();
    res.render("index",{ polls });
});

//Muestra el formulario para crear una encuesta
app.get("/polls/new",(req,res)=>{
    res.render("new");
})

app.get("/polls/:id", async (req,res,next)=>{
    const id = req.params.id;
    const poll = await Poll.findById(id);

    poll.title = req.body.title;
    poll.body = req.body.body;

    try{
        await poll.deleteOne({_id: req.params.id});
        res.status(204).send({});
    }catch (e){
        return next(e);
    }
});

app.delete("/polls/:id", async(req, res, next) =>{
    try{
        await Poll.deleteOne({_id: req.params.id});
        res.status(204).send({});
    }catch(e){
        return next(e);
    }
})

//Permite crear una encuesta
app.post("/polls", async (req,res)=>{
    const data = {
        title: req.body.title,
        body: req.body.body
    };
    try{
        const poll =  new Poll(data);
        await poll.save();
    } catch(e){
        return next(e);
    }

    res.redirect("/")
})

app.listen(3000,()=>console.log("Listeningn on port 3000"));