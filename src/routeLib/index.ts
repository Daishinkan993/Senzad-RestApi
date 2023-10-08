import { IncomingMessage, ServerResponse } from 'http';
import * as http from 'http';
import * as querystring from 'querystring';

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
  routeDef: RouteDefinition;
};

export class ServerApi {
  private routes: routeConfig[] = [];

  public get(
    path: string,
    routeDef: RouteDefinition,
    handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void
  ): this {
    this.routes.push({ method: 'GET', path, handler, routeDef });
    return this;
  }

  public post(
    path: string,
    routeDef: RouteDefinition,
    handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void
  ): this {
    this.routes.push({ method: 'POST', path, handler, routeDef });
    return this;
  }

  public put(
    path: string,
    routeDef: RouteDefinition,
    handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void
  ): this {
    this.routes.push({ method: 'PUT', path, handler, routeDef });
    return this;
  }

  public delete(
    path: string,
    routeDef: RouteDefinition,
    handler: (params: ParamHandler, body: ParamHandler, res: ServerResponse) => void
  ): this {
    this.routes.push({ method: 'DELETE', path, handler, routeDef });
    return this;
  }

  public listen(port: number): void {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const reqUrl = req.url?.split('?')[0];
      const matchedRoute = this.routes.find((route) => route.method === req.method && route.path === reqUrl);
      if (matchedRoute) {
        let params = getParams(req);
        let body = matchedRoute.method !== 'GET' ? await getBodyParams(req) : {};

        // Проверка наличия обязательных параметров в params
        const missingParams = matchedRoute.routeDef.params.filter((param) => param.required && !(param.name in params));
        if (missingParams.length > 0) {
          res.statusCode = 400;
          res.end(`Missing required params: ${missingParams.map((param) => param.name).join(', ')}`);
          return;
        }

        // Проверка наличия обязательных параметров в body
        const missingBodyParams = matchedRoute.routeDef.body.filter((param) => param.required && !(param.name in body));
        if (missingBodyParams.length > 0) {
          res.statusCode = 400;
          res.end(`Missing required body params: ${missingBodyParams.map((param) => param.name).join(', ')}`);
          return;
        }

        matchedRoute.handler(params, body, res);
      } else {
        res.statusCode = 404;
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log('Server run http://localhost:' + port);
    });
  }
}

function getParams(req: IncomingMessage): ParamHandler {
  const parsedUrl = new URL(`http://${req.headers.host}${req.url}`);
  const queryParams = parsedUrl.searchParams;

  // Преобразование параметров в объект
  const paramsObject: ParamHandler = {};
  queryParams.forEach((value, param) => {
    paramsObject[param] = parseParamValue(value);
  });

  return paramsObject;
}

function parseParamValue(value: string): string | boolean | number {
  if (value === 'true' || value === 'false' || value === '') {
    return value === 'true' || '' === value;
  }
  if (/^-?\d+$/.test(value)) {
    return parseInt(value);
  }
  return value;
}

function getBodyParams(req: IncomingMessage): Promise<ParamHandler> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'];
        let paramsObject: ParamHandler;

        if (contentType === 'application/json') {
          paramsObject = JSON.parse(body);
        } else if (contentType === 'application/x-www-form-urlencoded') {
          const parsedParams = querystring.parse(body);
          paramsObject = {};
          for (const key in parsedParams) {
            if (Object.prototype.hasOwnProperty.call(parsedParams, key)) {
              const value = parsedParams[key];
              if (Array.isArray(value)) {
                throw new Error('Array of strings is not supported');
              }
              paramsObject[key] = parseParamValue(value);
            }
          }
        } else {
          throw new Error('Unsupported content type');
        }

        resolve(paramsObject);
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}