# express
Express server

Server in express (framework pentru backend in js).
Am folost o baza de date ne relationala: Mongo DB.

Pentru cine se intreaba care e diferenta dinter node js simplu si express:

singura diferenta intervine la cum facem manage la request-uri, in rest e cam acelasi lucru. Ex:

Node Js simplu:

if(request.method === 'POST' && request.url === '/') {
    //Do stuff
}

Express:

app.post('/') {
    //Do stuff
}