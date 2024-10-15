import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import cors from 'cors';
import schema from './schema.js';
import mysql from 'mysql2';

const app = express();

app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Abf191005',
    database: 'radix'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado ao MySQL');
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
