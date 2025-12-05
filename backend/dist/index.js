"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
};
// apply CORS for all routes (this handles preflight too)
app.use((0, cors_1.default)(corsOptions));
// NOTE: removed app.options('*' / '/*') due to path-to-regexp incompatibility in some environments
// mount authentication routes on both paths
app.use(["/auth", "/api/auth"], auth_1.default);
// health check endpoint
app.get(["/health", "/api/health"], (req, res) => {
    res.json({ status: "ok" });
});
exports.default = app;
//# sourceMappingURL=index.js.map