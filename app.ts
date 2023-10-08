import { ServerApi, ParamHandler } from './src/routeLib/';
import {ServerResponse} from "http"; // Предполагается, что ServerApi находится в файле 'server-api.ts' или 'server-api.js'

const server = new ServerApi();

server.get('/', { params: [{ name: "name", type: "string", required: true }], body: [] }, (params: ParamHandler, body: ParamHandler, res: ServerResponse) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Привет, ' + params.name + ' Это корневой путь.')
});

server.post('/', { params: [], body: [] }, (params: ParamHandler, body: ParamHandler, res: ServerResponse) => {

})

server.listen(3000); // Начнем прослушивать порт 3000
