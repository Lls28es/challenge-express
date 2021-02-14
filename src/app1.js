var express = require("express");
var server = express();
var bodyParser = require("body-parser");


const { reporters } = require('mocha');
server.use(bodyParser.json());


var model = {clients: {},
    reset: function(){

       model.clients ={};
    },
    addAppointment: function(name, date){
        date = {
            ...date,
            status: 'pending',
        }
        if (!model.clients.hasOwnProperty(name)){
            model.clients = {
                ...model.clients,
                [name]: [],
            };
        }                
        model.clients[name].push(date);
        
    },
    attend: function(name, date){
        let i = model.clients[name].findIndex(d => d.date === date);
        if (i !== -1) {
            model.clients[name][i].status = 'attended';
        }
    },
    expire: function(name, date){
        let i = model.clients[name].findIndex(d => d.date === date);
        if (i !== -1) {
            model.clients[name][i].status = 'expired';
        }

    },
    cancel: function(name, date){
        let i = model.clients[name].findIndex(d => d.date === date);
        if (i !== -1) {
            model.clients[name][i].status = 'cancelled';
        }
    },

};



server.listen(3000);
module.exports = { model, server };
