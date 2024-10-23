import { GraphQLObjectType, GraphQLSchema, GraphQLFloat, GraphQLString, GraphQLList, GraphQLInt, GraphQLInputObjectType, GraphQLBoolean } from 'graphql';
import mysql from 'mysql2';

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Abf191005',
    database: 'radix'
});

// Definição do tipo para o maior valor
const MaxValueType = new GraphQLObjectType({
    name: 'MaxValue',
    fields: () => ({
        max_value: { type: GraphQLFloat },
    }),
});

// Definição do tipo para o menor valor
const MinValueType = new GraphQLObjectType({
    name: 'MinValue',
    fields: () => ({
        minValue: { type: GraphQLFloat },
    }),
});

// Definição do tipo para a média geral
const MediaType = new GraphQLObjectType({
    name: 'Media',
    fields: () => ({
        media: { type: GraphQLFloat },
    }),
});

// Definição do tipo para o sensor com maior média
const SensorWithMaxAvgType = new GraphQLObjectType({
    name: 'SensorWithMaxAvg',
    fields: () => ({
        equipment_id: { type: GraphQLString },
        avgValue: { type: GraphQLFloat },
    }),
});

// Definição do tipo para as leituras por hora (gráfico de linha)
const SensorReadingsByHourType = new GraphQLObjectType({
    name: 'SensorReadingsByHour',
    fields: () => ({
        hour: { type: GraphQLString },
        avgValue: { type: GraphQLFloat },
    }),
});

// Definição do tipo para a média da hora atual (gauge)
const MediaCurrentHourType = new GraphQLObjectType({
    name: 'MediaCurrentHour',
    fields: () => ({
        media: { type: GraphQLFloat },
    }),
});

// Definição do tipo para as leituras de sensores
const SensorReadingsType = new GraphQLObjectType({
    name: 'SensorReadings',
    fields: () => ({
        equipment_id: { type: GraphQLString },
        timestamp: { type: GraphQLString },
        value: { type: GraphQLFloat },
    }),
});

// Definição do tipo de input para upload de CSV
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
        // Maior valor com período
        maxValueSensor: {
            type: MaxValueType,
            args: { period: { type: GraphQLString } },
            resolve(parent, args) {
                let interval;
                switch (args.period) {
                    case '24h': interval = '1 DAY'; break;
                    case '48h': interval = '2 DAY'; break;
                    case '7d': interval = '7 DAY'; break;
                    case '1m': interval = '1 MONTH'; break;
                    default: interval = '1 DAY';  // Padrão 24 horas
                }
                return new Promise((resolve, reject) => {
                    const query = `SELECT MAX(value) AS max_value FROM sensor_readings WHERE timestamp >= NOW() - INTERVAL ${interval}`;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results[0]);
                    });
                });
            }
        },
        // Menor valor com período
        minValueSensor: {
            type: MinValueType,
            args: { period: { type: GraphQLString } },
            resolve(parent, args) {
                let interval;
                switch (args.period) {
                    case '24h': interval = '1 DAY'; break;
                    case '48h': interval = '2 DAY'; break;
                    case '7d': interval = '7 DAY'; break;
                    case '1m': interval = '1 MONTH'; break;
                    default: interval = '1 DAY';  // Padrão 24 horas
                }
                return new Promise((resolve, reject) => {
                    const query = `SELECT MIN(value) AS minValue FROM sensor_readings WHERE timestamp >= NOW() - INTERVAL ${interval}`;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results[0]);
                    });
                });
            }
        },
        // Média geral com período
        mediaSensor: {
            type: MediaType,
            args: { period: { type: GraphQLString } },
            resolve(parent, args) {
                let interval;
                switch (args.period) {
                    case '24h': interval = '1 DAY'; break;
                    case '48h': interval = '2 DAY'; break;
                    case '7d': interval = '7 DAY'; break;
                    case '1m': interval = '1 MONTH'; break;
                    default: interval = '1 DAY';  // Padrão 24 horas
                }
                return new Promise((resolve, reject) => {
                    const query = `SELECT ROUND(AVG(value), 2) AS media FROM sensor_readings WHERE timestamp >= NOW() - INTERVAL ${interval}`;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results[0]);
                    });
                });
            }
        },
        // Sensor com maior média com período
        sensorWithMaxAvg: {
            type: SensorWithMaxAvgType,
            args: { period: { type: GraphQLString } },
            resolve(parent, args) {
                let interval;
                switch (args.period) {
                    case '24h': interval = '1 DAY'; break;
                    case '48h': interval = '2 DAY'; break;
                    case '7d': interval = '7 DAY'; break;
                    case '1m': interval = '1 MONTH'; break;
                    default: interval = '1 DAY';  // Padrão 24 horas
                }
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT equipment_id, ROUND(AVG(value), 2) AS avgValue
                        FROM sensor_readings
                        WHERE timestamp >= NOW() - INTERVAL ${interval}
                        GROUP BY equipment_id
                        ORDER BY avgValue DESC
                        LIMIT 1
                    `;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results[0]);
                    });
                });
            }
        },
        // Leitura por período para download de arquivos
        sensorReadingsByPeriod: {
            type: new GraphQLList(SensorReadingsType),
            args: { period: { type: GraphQLString } },
            resolve(parent, args) {
                let interval;
                switch (args.period) {
                    case '24h': interval = '1 DAY'; break;
                    case '48h': interval = '2 DAY'; break;
                    case '7d': interval = '7 DAY'; break;
                    case '1m': interval = '1 MONTH'; break;
                    default: interval = '1 DAY';  // Padrão 24 horas
                }
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT equipment_id, DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp, value
                        FROM sensor_readings
                        WHERE timestamp >= NOW() - INTERVAL ${interval}
                    `;
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            }
        },
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
        }
    }
});

// Mutação para Upload de CSV
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
                return new Promise((resolve, reject) => {
                    const values = args.input.map(sensor => [
                        sensor.equipment_id,
                        sensor.timestamp,
                        sensor.value
                    ]);

                    const query = 'INSERT INTO sensor_readings (equipment_id, timestamp, value) VALUES ?';
                    db.query(query, [values], (err) => {
                        if (err) reject(err);
                        resolve({ success: true });
                    });
                });
            }
        }
    }
});

// Exportar o Schema
export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
