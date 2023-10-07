import {IncomingMessage, ServerResponse} from 'http';
import * as http from 'http';
import {URLSearchParams} from 'url';

type ParamDefinition = {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
};

export type ParamHandler = {
    [key: string]: string | number | boolean;
};

type RouteDefinition = {
    params: ParamDefinition[];
    body: ParamDefinition[];
};

type routeConfig = {
    method: string;
    path: string;
    handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void;
    routeDef: RouteDefinition
}

export class ServerApi {
    private routes: routeConfig[] = [];

    public get(path: string, routeDef: RouteDefinition, handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void): this {
        this.routes.push({method: 'GET', path, handler, routeDef});
        return this;
    }

    public post(path: string, routeDef: RouteDefinition, handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void): this {
        this.routes.push({method: 'POST', path, handler, routeDef});
        return this;
    }

    public put(path: string, routeDef: RouteDefinition, handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void): this {
        this.routes.push({method: 'PUT', path, handler, routeDef});
        return this;
    }

    public delete(path: string, routeDef: RouteDefinition, handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void): this {
        this.routes.push({method: 'DELETE', path, handler, routeDef});
        return this;
    }

    public listen(port: number): void {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
                const reqUrl = req.url?.split("?")[0];
                const matchedRoute = this.routes.find(route => route.method === req.method && route.path === reqUrl);
                if (matchedRoute) {
                    let params = getParams(req)
                    let body = {}
                    console.log(params)
                    res.end("OK")
                } else {
                    res.statusCode = 404;
                    res.end("Not found");
                }
            }
        );

        server.listen(port, () => {
            console.log("Server run http://localhost:" + port);
        });
    }
}

function getParams(req: IncomingMessage): object {
    const parsedUrl = new URL(`http://${req.headers.host}${req.url}`);
    const queryParams = parsedUrl.searchParams;

    // Преобразование параметров в объект
    const paramsObject: { [key: string]: string | boolean | number } = {};
    queryParams.forEach((value, param) => {
        paramsObject[param] = parseParamValue(value);
    });

    return paramsObject;
}

function parseParamValue(value: string): string | boolean | number {
    if (value === 'true' || value === 'false' || value === "") {
        return value === 'true' || '' === value;
    }
    if (/^-?\d+$/.test(value)) {
        return parseInt(value);
    }
    return value;
}