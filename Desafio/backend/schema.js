import { GraphQLObjectType, GraphQLSchema, GraphQLFloat, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLBoolean } from 'graphql';
import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Abf191005',
    database: 'radix'
});

// maior valor
const MaxValueType = new GraphQLObjectType({
    name: 'MaxValue',
    fields: () => ({
        max_value: { type: GraphQLFloat },
    }),
});

// menor valor
const MinValueType = new GraphQLObjectType({
    name: 'MinValue',
    fields: () => ({
        minValue: { type: GraphQLFloat },
    }),
});

// média geral
const MediaType = new GraphQLObjectType({
    name: 'Media',
    fields: () => ({
        media: { type: GraphQLFloat },
    }),
});

// sensor com maior média
const SensorWithMaxAvgType = new GraphQLObjectType({
    name: 'SensorWithMaxAvg',
    fields: () => ({
        equipment_id: { type: GraphQLString },
        avgValue: { type: GraphQLFloat },
    }),
});

// medias das ultimas 5 horas
const SensorReadingsByHourType = new GraphQLObjectType({
    name: 'SensorReadingsByHour',
    fields: () => ({
        hour: { type: GraphQLString },
        avgValue: { type: GraphQLFloat },
    }),
});

// média da hora atual
const MediaCurrentHourType = new GraphQLObjectType({
    name: 'MediaCurrentHour',
    fields: () => ({
        media: { type: GraphQLFloat },
    }),
});

// download pdf, xlsx, csv
const SensorReadingsType = new GraphQLObjectType({
    name: 'SensorReadings',
    fields: () => ({
        equipment_id: { type: GraphQLString },
        timestamp: { type: GraphQLString },
        value: { type: GraphQLFloat },
    }),
});

// insert CSV
const SensorInputType = new GraphQLInputObjectType({
    name: 'SensorInput',
    fields: {
        equipment_id: { type: GraphQLString },
        timestamp: { type: GraphQLString },
        value: { type: GraphQLFloat },
    }
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // maior valor
        maxValueSensor: {
            type: MaxValueType,
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = 'SELECT MAX(value) AS max_value FROM sensor_readings';
                    db.query(query, (err, results) => {
                        if (err) reject(err);  // Erro
                        resolve(results[0]);  // resultado
                    });
                });
            }
        },
        // menor valor
        minValueSensor: {
            type: MinValueType,
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = 'SELECT MIN(value) AS minValue FROM sensor_readings';
                    db.query(query, (err, results) => {
                        if (err) reject(err);  // Erro
                        resolve(results[0]);  // resultado
                    });
                });
            }
        },
        // média geral
        mediaSensor: {
            type: MediaType,
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = 'SELECT ROUND(AVG(value), 2) AS media FROM sensor_readings';
                    db.query(query, (err, results) => {
                        if (err) reject(err);  // Erro
                        resolve(results[0]);  // resultado
                    });
                });
            }
        },
        // sensor com maior média
        sensorWithMaxAvg: {
            type: SensorWithMaxAvgType,
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT equipment_id, ROUND(AVG(value), 2) AS avgValue
                        FROM sensor_readings
                        GROUP BY equipment_id
                        ORDER BY avgValue DESC
                        LIMIT 1
                    `;
                    db.query(query, (err, results) => {
                        if (err) reject(err);  // Erro
                        resolve(results[0]);  // resultado
                    });
                });
            }
        },
        // média por hora (gráfico de linha)
        sensorReadingsByHour: {
            type: new GraphQLList(SensorReadingsByHourType),
            args: {
                limit: { type: GraphQLInt }
            },
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT 
                            DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour, 
                            ROUND(AVG(value), 2) AS avgValue 
                        FROM sensor_readings
                        GROUP BY hour
                        ORDER BY hour DESC
                        LIMIT ?
                    `;
                    db.query(query, [args.limit], (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            }
        },
        // média da hora atual (gauge)
        mediaSensorCurrentHour: {
            type: MediaCurrentHourType,
            resolve(parent, args) {
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT ROUND(AVG(value), 2) AS media
                        FROM sensor_readings
                        WHERE timestamp >= NOW() - INTERVAL 1 HOUR
                    `;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results[0]);
                    });
                });
            }
        },
        // download arquivos
        sensorReadingsByPeriod: {
            type: new GraphQLList(SensorReadingsType),
            args: {
                period: { type: GraphQLString }
            },
            resolve(parent, args) {
                let interval;

                // Define o intervalo
                switch (args.period) {
                    case '24h':
                        interval = '1 DAY';
                        break;
                    case '48h':
                        interval = '2 DAY';
                        break;
                    case '7d':
                        interval = '7 DAY';
                        break;
                    case '1m':
                        interval = '1 MONTH';
                        break;
                    default:
                        throw new Error('Período inválido');
                }

                const query = `
                    SELECT equipment_id, DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp, value
                    FROM sensor_readings
                    WHERE timestamp >= NOW() - INTERVAL ${interval}
                `;

                return new Promise((resolve, reject) => {
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results);  // resultados
                    });
                });
            }
        },
    }
});

        // Upload CSV
        const RootMutation = new GraphQLObjectType({
            name: 'Mutation',
            fields: {
                insertSensorReadings: {
                    type: new GraphQLObjectType({
                        name: 'InsertResponse',
                        fields: {
                            success: { type: GraphQLBoolean }
                        }
                    }),
                    args: {
                        input: { type: new GraphQLList(SensorInputType) }
                    },
                    resolve(parent, args) {
                        console.log('Dados recebidos para inserção:', args.input);  // log com os dados

                        return new Promise((resolve, reject) => {
                            const values = args.input.map(sensor => [
                                sensor.equipment_id,
                                sensor.timestamp,
                                sensor.value
                            ]);

                            const query = 'INSERT INTO sensor_readings (equipment_id, timestamp, value) VALUES ?';

                            db.query(query, [values], (err, result) => {
                                if (err) {
                                    console.error('Erro ao inserir no banco de dados:', err);  // log de erro
                                    reject(err);
                                } else {
                                    resolve({ success: true });
                                }
                            });
                        });
                    }
                }
            }
        });

// Exportar o Schema com as queries e as mutações que o usuario pode fazer
export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
