import { ServerApi, ParamHandler } from './src/routeLib/';
import {ServerResponse} from "http"; // Предполагается, что ServerApi находится в файле 'server-api.ts' или 'server-api.js'

const server = new ServerApi();

server.get('/', { params: [], body: [] }, (params: ParamHandler, body: ParamHandler, res: ServerResponse) => {
    // Обработка GET-запроса на корневой путь '/'
    return 'Привет, мир! Это корневой путь.';
});

server.listen(3000); // Начнем прослушивать порт 3000
