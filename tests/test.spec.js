const { expect } = require('chai');
const session = require('supertest-session');
const {model, server} = require('../src/app.js');


describe('model ', function(){

    beforeEach(() => {
        if (model.reset) {
            model.reset();
        }
    });

    it('debe tener una propiedad `clients` como objeto', function(){
        expect(model).to.have.property('clients').and.to.be.an('object');
    })

    describe('debe tener un método de reinicio para reiniciar el modelo', function(){
        it('debe ser una función', function(){
            expect(model.reset).to.be.a('function');
        })
        it('debe restablecer clients a {}', function(){
            model.clients = {javier: 'https://github.com/JavierBalonga', comment: 'aca me podes heatear tranquilo ;)'}
            model.reset();
            expect(model.clients).to.be.deep.equal({});
        })
    })

    describe('debe tener un método addAppointment para agregar citas a ese cliente', function(){
        it('debe ser una función', function(){
            expect(model.addAppointment).to.be.a('function');
        })
        it('debe agregar clients como propiedades', function(){
            model.addAppointment('javier', {date:'22/10/2020 16:00'});
            expect(model.clients).to.have.property('javier')
        })
        it('debe agregar clients al array', function(){
            model.addAppointment('javier', {date:'22/10/2020 16:00'});
            expect(model.clients).to.have.property('javier');
            expect(model.clients.javier instanceof Array).to.be.true;
        })
        it('debe agregar varias appointments en el orden a medida que se agregan y debe manejar varios clients', function(){
            model.addAppointment('javier', {date:'22/10/2020 14:00'});
            expect(model.clients.javier[0]).to.have.property('date').to.be.equal('22/10/2020 14:00');
            model.addAppointment('javier', {date:'22/10/2020 16:00'});
            expect(model.clients.javier[1]).to.have.property('date').to.be.equal('22/10/2020 16:00');
            model.addAppointment('alejandro', {date:'22/10/2020 11:00'});
            expect(model.clients.alejandro[0]).to.have.property('date').to.be.equal('22/10/2020 11:00');
            model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
            expect(model.clients.alejandro[1]).to.have.property('date').to.be.equal('22/10/2020 12:00');
        })
        it('los appointments deben tener un estado inicial y estar `pending`', function(){
            model.addAppointment('javier', {date:'22/10/2020 14:00'});
            model.addAppointment('javier', {date:'22/10/2020 16:00'});
            model.addAppointment('alejandro', {date:'22/10/2020 11:00'});
            model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
            expect(model.clients.javier[0]).to.have.property('status').to.be.equal('pending');
            expect(model.clients.javier[1]).to.have.property('status').to.be.equal('pending');
            expect(model.clients.alejandro[0]).to.have.property('status').to.be.equal('pending');
            expect(model.clients.alejandro[1]).to.have.property('status').to.be.equal('pending');
        })
    })

    describe('Appointments debe poder cambiar de estado utilizando los métodos de asistencia `attend`, caducidad `expire` y cancelación `cancel`.', function(){
        
        beforeEach(() => {
            if (model.addAppointment) {
                model.addAppointment('javier',    {date:'22/10/2020 14:00'});
                model.addAppointment('javier',    {date:'22/10/2020 16:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 11:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
            }
        });

        xit('éstos deben ser funciones', function(){
            expect(model.attend).to.be.a('function');
            expect(model.expire).to.be.a('function');
            expect(model.cancel).to.be.a('function');
        })
        xit('`attend` debe recibir un nombre y una fecha, y cambiar el estado a `attended`', function(){
            model.attend('javier',    '22/10/2020 14:00');
            model.attend('javier',    '22/10/2020 16:00');
            model.attend('alejandro', '22/10/2020 11:00');
            model.attend('alejandro', '22/10/2020 12:00');
            expect(model.clients.javier[0]).to.have.property('status').to.be.equal('attended');
            expect(model.clients.javier[1]).to.have.property('status').to.be.equal('attended');
            expect(model.clients.alejandro[0]).to.have.property('status').to.be.equal('attended');
            expect(model.clients.alejandro[1]).to.have.property('status').to.be.equal('attended');
        })
        xit('`expire` debe recibir un nombre y una fecha, y cambiar el estado a `expired`', function(){
            model.expire('javier',    '22/10/2020 14:00');
            model.expire('javier',    '22/10/2020 16:00');
            model.expire('alejandro', '22/10/2020 11:00');
            model.expire('alejandro', '22/10/2020 12:00');
            expect(model.clients.javier[0]).to.have.property('status').to.be.equal('expired');
            expect(model.clients.javier[1]).to.have.property('status').to.be.equal('expired');
            expect(model.clients.alejandro[0]).to.have.property('status').to.be.equal('expired');
            expect(model.clients.alejandro[1]).to.have.property('status').to.be.equal('expired');
        })
        xit('`cancel` debe recibir un nombre y una fecha, y cambiar el estado a `cancelled`', function(){
            model.cancel('javier',    '22/10/2020 14:00');
            model.cancel('javier',    '22/10/2020 16:00');
            model.cancel('alejandro', '22/10/2020 11:00');
            model.cancel('alejandro', '22/10/2020 12:00');
            expect(model.clients.javier[0]).to.have.property('status').to.be.equal('cancelled');
            expect(model.clients.javier[1]).to.have.property('status').to.be.equal('cancelled');
            expect(model.clients.alejandro[0]).to.have.property('status').to.be.equal('cancelled');
            expect(model.clients.alejandro[1]).to.have.property('status').to.be.equal('cancelled');
        })
        xit('debe poder manejar múltiples citas con múltiples estados', function(){
            model.attend('javier',    '22/10/2020 16:00');
            model.expire('alejandro', '22/10/2020 11:00');
            model.cancel('alejandro', '22/10/2020 12:00');
            expect(model.clients.javier[0]).to.have.property('status').to.be.equal('pending');
            expect(model.clients.javier[1]).to.have.property('status').to.be.equal('attended');
            expect(model.clients.alejandro[0]).to.have.property('status').to.be.equal('expired');
            expect(model.clients.alejandro[1]).to.have.property('status').to.be.equal('cancelled');
        })
    })

    describe('debe tener un método de borrado para borrar appointments', function(){
        beforeEach(() => {
            if (model.addAppointment) {
                model.addAppointment('javier',    {date:'22/10/2020 14:00'});
                model.addAppointment('javier',    {date:'22/10/2020 16:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 11:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
                model.attend('javier',    '22/10/2020 16:00');
                model.cancel('alejandro', '22/10/2020 11:00');
                model.cancel('alejandro', '22/10/2020 12:00');
            }
        });

        xit('debe ser una función', function(){
            expect(model.erase).to.be.a('function');
        })
        xit('debe recibir un nombre y si recibe una fecha debe borrar el appointment con esa fecha', function(){
            model.erase('javier', '22/10/2020 14:00');
            expect(model.clients.javier).to.be.deep.equal([ { date: '22/10/2020 16:00', status: 'attended' } ]);
            model.erase('javier', '22/10/2020 16:00');
            expect(model.clients.javier).to.be.deep.equal([]);
            model.erase('alejandro', '22/10/2020 11:00');
            expect(model.clients.alejandro).to.be.deep.equal([ { date: '22/10/2020 12:00', status: 'cancelled' } ]);
            model.erase('alejandro', '22/10/2020 12:00');
            expect(model.clients.alejandro).to.be.deep.equal([]);
        })
        xit('debe recibir un nombre y si recibe un estado debe borrar todas los appointments con ese estado', function(){
            model.erase('javier', 'attended');
            expect(model.clients.javier).to.be.deep.equal([ { date: '22/10/2020 14:00', status: 'pending' } ]);
            model.erase('alejandro', 'cancelled');
            expect(model.clients.alejandro).to.be.deep.equal([]);
        })
    })

    describe('debe tener un método getAppointments, para ver los appointments de un cliente', function(){
        beforeEach(() => {
            if (model.addAppointment) {
                model.addAppointment('javier',    {date:'22/10/2020 14:00'});
                model.addAppointment('javier',    {date:'22/10/2020 16:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 11:00'});
                model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
                model.attend('javier',    '22/10/2020 16:00');
                model.expire('alejandro', '22/10/2020 11:00');
                model.cancel('alejandro', '22/10/2020 12:00');
            }
        });

        xit('debe ser una función', function(){
            expect(model.getAppointments).to.be.a('function');
        })
        xit('debe devolver un array con los appointmentslas del cliente', function(){
            let appointments = model.getAppointments('javier');
            expect(appointments).to.be.deep.equal(
                [{ date: '22/10/2020 14:00', status: 'pending' },
                { date: '22/10/2020 16:00', status: 'attended' }]
            );
        })
        xit('si se aprobó un estado, solo debe devolver los appointments con ese estado', function(){
            let appointmentsPending = model.getAppointments('javier', 'pending');
            let appointmentsAttended = model.getAppointments('javier', 'attended');
            let appointmentsExpired = model.getAppointments('alejandro', 'expired');
            let appointmentsCancelled = model.getAppointments('alejandro', 'cancelled');
            expect(appointmentsPending).to.be.deep.equal([ { date: '22/10/2020 14:00', status: 'pending' } ]);
            expect(appointmentsAttended).to.be.deep.equal([ { date: '22/10/2020 16:00', status: 'attended' } ]);
            expect(appointmentsExpired).to.be.deep.equal([ { date: '22/10/2020 11:00', status: 'expired' } ]);
            expect(appointmentsCancelled).to.be.deep.equal([ { date: '22/10/2020 12:00', status: 'cancelled' } ]);
        })
    })

    describe('debe tener un método getClients', function(){
        xit('debe ser una función', function(){
            expect(model.getClients).to.be.a('function');
        })
        xit('debe devolver un array con los nombres de los clientes', function(){
            model.addAppointment('javier', {date:'22/10/2020 14:00'});
            model.addAppointment('alejandro', {date:'22/10/2020 12:00'});
            let ret = model.getClients()
            expect(ret instanceof Array).to.be.true;
            expect(ret).to.be.deep.equal(['javier', 'alejandro']);
        })
    })
})

const agent = session(server);
describe('server', () => {
    beforeEach(() => {
        if (model.reset && model.addAppointment) {
            model.reset();
            model.addAppointment('javier', {date:'22/10/2020 14:00'});
            model.addAppointment('javier', {date:'22/10/2020 16:00'});
        }
    });

    describe('GET /api', function(){
        xit('responde con el objeto clients', () => {
            return agent.get('/api')
            .expect(200)
            .then((res) => {
                expect(res.body).to.be.deep.equal({
                    javier: [
                        { date: '22/10/2020 14:00', status: 'pending' },
                        { date: '22/10/2020 16:00', status: 'pending' }]
                });
            });
        });
    })

    describe('POST /api/Appointments', () => {
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de string, si el cliente no fue aprobado) and a string message', ()=>{
            return agent.post('/api/Appointments')
            .send({Appointment: {date:'22/10/2020 11:00'}})
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('the body must have a client property')
            });
        })
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de string, si el cliente no era una cadena', ()=>{
            return agent.post('/api/Appointments')
            .send({client: 5, appointment: {date:'22/10/2020 11:00'}})
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('client must be a string')
            });
        })
        xit('agrega un appointment a un cliente', () => {
            return agent.post('/api/Appointments')
            .send({client: 'alejandro', appointment: {date:'22/10/2020 11:00'}})
            .expect(200)
            .expect(() => {
                expect(model.clients.alejandro).to.be.deep.equal([ { date: '22/10/2020 11:00', status: 'pending' } ])
            });
        });
        xit('responde el appointment luego de la adicion', () => {
            return agent.post('/api/Appointments')
            .send({client: 'alejandro', appointment: {date:'22/10/2020 12:00'}})
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.be.deep.equal({ date: '22/10/2020 12:00', status: 'pending' })
            })
        });
    })

    describe('GET /api/Appointments/:name?date=xxx&option=xxx', () => {
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de string, si el cliente no existe', ()=>{
            return agent.get('/api/Appointments/pepe?date=22/10/2020%2014:00&option=attend')
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('the client does not exist')
            })
        })
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de string, si el cliente no tiene una cita para esta fecha', ()=>{
            return agent.get('/api/Appointments/javier?date=23/10/2020%2014:00&option=attend')
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('the client does not have a appointment for that date')
            })
        })
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de cadena, si la opción no es atender, expirar o cancelar', ()=>{
            return agent.get('/api/Appointments/javier?date=22/10/2020%2014:00&option=wrongOption')
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('the option must be attend, expire or cancel')
            })
        })
        xit('asistir a un appointment si la opción pasada por consulta es `attend`', ()=>{
            return agent.get('/api/Appointments/javier?date=22/10/2020%2014:00&option=attend')
            .expect(200)
            .expect((res) => {
                expect(model.clients.javier[0])
                .to.be.deep.equal({ date: '22/10/2020 14:00', status: 'attended' })
            })
        })
        xit('caducar un appointment si la opción pasada por consulta es`expire`', ()=>{
            return agent.get('/api/Appointments/javier?date=22/10/2020%2016:00&option=expire')
            .expect(200)
            .expect((res) => {
                expect(model.clients.javier[1])
                .to.be.deep.equal({ date: '22/10/2020 16:00', status: 'expired' })
            })
        })
        xit('cancelar un appointment si la opción pasada por consulta es `cancel`', ()=>{
            return agent.get('/api/Appointments/javier?date=22/10/2020%2014:00&option=cancel')
            .expect(200)
            .expect((res) => {
                expect(model.clients.javier[0])
                .to.be.deep.equal({ date: '22/10/2020 14:00', status: 'cancelled' })
            })
        })
        xit('responde al appointment modificado', ()=>{
            return agent.get('/api/Appointments/javier?date=22/10/2020%2014:00&option=cancel')
            .expect(200)
            .expect((res) => {
                expect(res.body).to.be.deep.equal({ date: '22/10/2020 14:00', status: 'cancelled' });
            })
        })
    })

    
    describe('GET /api/Appointments/:name/erase', function(){
        xit('responde con un estado 400 (solicitud incorrecta) y un mensaje de string, si el cliente no existe', ()=>{
            return agent.get('/api/Appointments/pepe/erase?date=22/10/2020%2014:00')
            .expect(400)
            .expect((res) => {
                expect(res.text).to.be.equal('the client does not exist')
            })
        })
        xit('borra un appointment', () => {
            return agent.get('/api/Appointments/javier/erase?date=22/10/2020%2014:00')
            .expect(200)
            .expect((res)=>{
                expect(model.clients.javier).to.be.deep.equal([ { date: '22/10/2020 16:00', status: 'pending' } ])
            })
        });
        xit('borrar todas los appointments de un cierto estado', () => {
            model.expire('javier', '22/10/2020 14:00');
            return agent.get('/api/Appointments/javier/erase?date=expired')
            .expect(200)
            .expect((res)=>{
                expect(model.clients.javier).to.be.deep.equal([ { date: '22/10/2020 16:00', status: 'pending' } ])
            })
        });
        xit('responde al conjunto de appointments borrados', () => {
            model.expire('javier', '22/10/2020 14:00');
            return agent.get('/api/Appointments/javier/erase?date=expired')
            .expect(200)
            .expect((res)=>{
                expect(res.body).to.be.deep.equal([ { date: '22/10/2020 14:00', status: 'expired' } ])
            })
        });
    })

    describe('GET /api/Appointments/getAppointments/:name', function(){
        xit('responde con un array de appointments con ese estado', () => {
            return agent.get('/api/Appointments/getAppointments/javier?status=pending')
            .expect(200)
            .then((res) => {
                expect(res.body).to.be.deep.equal([
                    { date: '22/10/2020 14:00', status: 'pending' },
                    { date: '22/10/2020 16:00', status: 'pending' }
                ])
            });
        });
    })

    describe('GET /api/Appointments/clients', function(){
        xit('responde con un array de la lista de clientes', () => {
            return agent.get('/api/Appointments/clients')
            .expect(200)
            .then((res) => {
                expect(res.body).to.be.deep.equal([ 'javier' ])
            });
        });
    })

})