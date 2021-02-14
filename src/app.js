var express = require("express");
var server = express();
var bodyParser = require("body-parser");


const { reporters } = require('mocha');
server.use(bodyParser.json());

const regExpDate = /^([1-9]|([012][0-9])|(3[01]))\/([0]{0,1}[1-9]|1[012])\/\d\d\d\d [012]{0,1}[0-9]:[0-6][0-9]$/ 


 
var model = {clients: {},
            reset: function(){
                model.clients = {};
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
            erase: function(name, toDelete){
                if (toDelete === 'cancelled' || toDelete === 'pending' || toDelete === 'expired' || toDelete === 'attended'){
                    model.clients[name] = model.clients[name].filter(ap => ap.status !== toDelete);
                } else if (regExpDate.test(toDelete)) { 
                    model.clients[name] = model.clients[name].filter(ap => ap.date !== toDelete);
                }
            },
            getAppointments: function(name, status = ''){
                if (status) {
                    return model.clients[name].filter(ap => ap.status === status);
                }
                return model.clients[name]
            },
            getClients: function(){
                return Object.keys(model.clients);
            },
        };

var server = express();

server.use(express.json());

server.get('/api', (req, res) => {
    res.send(model.clients);
})

server.get('/api/appointments/clients', (req,res) => {
    const clients = model.getClients()
    res.send(clients);
});

server.post('/api/appointments', (req,res) => {
    const {client, appointment} = req.body;
    if (!client) {
        res.status(400).send('the body must have a client property');
    } else if (typeof client !== 'string') {
        res.status(400).send('client must be a string');
    } else {
        model.addAppointment(client, appointment);
        res.send(model.clients[client][model.clients[client].length - 1]);
    }
});

server.get('/api/Appointments/:name', (req, res) => {
    const {name} = req.params;
    const {date, option} = req.query;

    if (!model.clients.hasOwnProperty(name)) {
        res.status(400).send('the client does not exist');
    } else if (!model.clients[name].filter(ap => ap.date === date).length) {
        res.status(400).send('the client does not have a appointment for that date');
    } else if (!(option === 'expire' || option === 'attend' || option === 'cancel')){
        res.status(400).send('the option must be attend, expire or cancel');
    } else {
        switch (option) {
            case 'attend':
                model.attend(name, date);
                res.send(model.clients[name].find(ap => ap.date === date));
                break
            case 'expire':
                model.expire(name, date);
                res.send(model.clients[name].find(ap => ap.date === date));
                break
            case 'cancel':
                model.cancel(name, date)
                res.send(model.clients[name].find(ap => ap.date === date));
                break
            default:
                res.send('lalala');
                break;
        }
    }
})

server.get('/api/appointments/:name/erase', (req, res) => {
    const {name} = req.params;
    const {date} = req.query
    if (!model.clients.hasOwnProperty(name)) {
        return res.status(400).send('the client does not exist');
    } 
    const erased = model.clients[name].filter(ap => ap.status == date);
    model.erase(name, date);
    res.send(erased);
})

server.get('/api/appointments/getappointments/:name', (req,res) => {
    const {name} = req.params;
    if (!model.clients.hasOwnProperty(name)) {
        return res.status(400).send('the client does not exist');
    } 
    const getted = model.getAppointments(name);
    res.send(getted);
});

server.listen(4000);

module.exports = {model, server}