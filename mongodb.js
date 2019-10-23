// CRUD create read update delete

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
    if (error) {
        console.log('Unable to connect to database!');
        return;
    }

    const db = client.db(databaseName);

    // db.collection('users').insertOne({
    //     name: 'Matthew',
    //     age: 22,
    // }, (error, result) => {
    //     if (error) {
    //         console.log('Unable to insert user');
    //         return;
    //     }

    //     console.log(result.ops);
    // });

    // db.collection('users').insertMany([
    //     {
    //         name: 'Jen',
    //         age: 28,
    //     }, {
    //         name: 'Bob',
    //         age: 42,
    //     },
    // ], (error, result) => {
    //     if (error) {
    //         console.log('Unable to insert documents!');
    //         return;
    //     }

    //     console.log(result.ops);
    // });

    db.collection('tasks').insertMany([
        {
            description: 'laundry',
            completed: false,
        }, {
            description: 'homework',
            completed: true,
        }, {
            description: 'video games',
            completed: false,
        },
    ], (error, result) => {
        if (error) {
            console.log('Unable to insert documents!');
            return;
        }

        console.log(result.ops);
    });
});
