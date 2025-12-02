"use strict";
/**
 * Serverless handler for Yandex Cloud Functions
 * Wraps Express app for serverless deployment using serverless-http
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const serverless_http_1 = __importDefault(require("serverless-http"));
const logger_1 = require("./logger");
// Set serverless mode
process.env.SERVERLESS = 'true';
// Import app (this will initialize everything)
// Using dynamic import to avoid circular dependencies and ensure serverless mode is set
let serverlessHandler = null;
let appPromise = null;
/**
 * Get or create serverless handler
 */
async function getServerlessHandler() {
    if (serverlessHandler) {
        return serverlessHandler;
    }
    // Lazy load app to ensure SERVERLESS env is set first
    if (!appPromise) {
        appPromise = Promise.resolve().then(() => __importStar(require('./index')));
    }
    const { default: app } = await appPromise;
    // Wrap Express app with serverless-http
    serverlessHandler = (0, serverless_http_1.default)(app, {
        binary: ['image/*', 'application/octet-stream'],
    });
    return serverlessHandler;
}
/**
 * Serverless handler function
 * This is the entry point for Yandex Cloud Functions
 */
async function handler(event, context) {
    try {
        const handlerInstance = await getServerlessHandler();
        // Yandex Cloud Functions uses AWS Lambda-compatible format
        // serverless-http will handle the conversion
        const result = await handlerInstance(event, context);
        return result;
    }
    catch (error) {
        logger_1.logger.error({ error, type: 'handler_error' });
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                },
            }),
            isBase64Encoded: false,
        };
    }
}
